import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export const useStripeCheckout = () => {
  const startCheckout = async (priceId: string, isSubscription: boolean) => {
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      toast.error("Você precisa estar logado para realizar uma compra.");
      return;
    }

    try {
      toast.info("Iniciando checkout...", { duration: 5000 });

      // Chama a Edge Function para criar a sessão de checkout
      const response = await fetch('https://nzarhhxbbrcfoacrzitx.supabase.co/functions/v1/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ priceId, isSubscription }),
      });

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      // Redireciona o usuário para a página de checkout do Stripe
      window.location.href = data.url;

    } catch (error) {
      console.error('Stripe Checkout Error:', error);
      toast.error("Erro ao iniciar o pagamento.", {
        description: error instanceof Error ? error.message : "Tente novamente mais tarde."
      });
    }
  };

  return { startCheckout };
};
