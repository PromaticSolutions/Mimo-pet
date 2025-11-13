// Este código deve ser implantado como uma Edge Function no Supabase
// Nome sugerido: 'create-checkout-session'

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.43.4";
import Stripe from "https://esm.sh/stripe@14.24.0?target=deno";

// Inicializa o Stripe com a chave secreta
// A chave deve ser configurada como uma variável de ambiente no Supabase
const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
  apiVersion: "2023-10-16",
});

// URLs de redirecionamento (também devem ser configuradas como variáveis de ambiente)
const SUCCESS_URL = Deno.env.get("SUCCESS_URL") || "http://localhost:3000/premium?success=true";
const CANCEL_URL = Deno.env.get("CANCEL_URL") || "http://localhost:3000/premium?canceled=true";

serve(async (req) => {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method Not Allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const { priceId, isSubscription } = await req.json();
    
    // 1. Autenticação do Usuário
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      {
        global: {
          headers: { Authorization: req.headers.get("Authorization")! },
        },
      }
    );

    const { data: { user } } = await supabaseClient.auth.getUser();

    if (!user) {
      return new Response(JSON.stringify({ error: "User not authenticated" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    // 2. Obter o Customer ID do Stripe (ou criar um novo)
    const { data: profile, error: profileError } = await supabaseClient
      .from("profiles")
      .select("stripe_customer_id")
      .eq("id", user.id)
      .single();

    if (profileError) {
      throw new Error("Failed to fetch user profile.");
    }

    let customerId = profile.stripe_customer_id;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: { supabase_user_id: user.id },
      });
      customerId = customer.id;

      // Atualiza o perfil do usuário no Supabase com o novo Customer ID
      await supabaseClient
        .from("profiles")
        .update({ stripe_customer_id: customerId })
        .eq("id", user.id);
    }

    // 3. Criar a Sessão de Checkout
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      billing_address_collection: "auto",
      customer: customerId,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: isSubscription ? "subscription" : "payment",
      success_url: SUCCESS_URL,
      cancel_url: CANCEL_URL,
      metadata: {
        user_id: user.id,
        is_subscription: isSubscription ? "true" : "false",
      },
    });

    return new Response(JSON.stringify({ sessionId: session.id, url: session.url }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});