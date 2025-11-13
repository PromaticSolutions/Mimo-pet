import { Check, Sparkles, Crown, Gem } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useStripeCheckout } from "@/hooks/useStripeCheckout";
import { toast } from "sonner";
import { useEffect } from "react";

const Premium = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { startCheckout } = useStripeCheckout();

  // Lógica para verificar o status do pagamento após o redirecionamento do Stripe
  useEffect(() => {
    if (searchParams.get('success') === 'true') {
      toast.success("Pagamento realizado com sucesso!", {
        description: "Seu plano premium será ativado em breve."
      });
      // Limpa os parâmetros da URL
      navigate('/premium', { replace: true });
    } else if (searchParams.get('canceled') === 'true') {
      toast.info("Pagamento cancelado.", {
        description: "Você pode tentar novamente a qualquer momento."
      });
      // Limpa os parâmetros da URL
      navigate('/premium', { replace: true });
    }
  }, [searchParams, navigate]);

  const subscriptionPlans = [
    {
      name: "Mimo",
      price: "R$ 9,90",
      period: "/mês",
      color: "from-primary/20 to-accent/20",
      icon: Sparkles,
      priceId: "PRICE_ID_DO_PLANO_MIMO_AQUI", // MARCADOR
      features: [
        "Mais missões diárias",
        'Modo "Reflexão" (diário de humor)',
        "Pet não adoece se faltar 1 dia",
        "Bônus semanais (moedas + skins)",
      ],
    },
    {
      name: "Mimo Plus",
      price: "R$ 29,90",
      period: "/mês",
      color: "from-secondary/20 to-primary/20",
      icon: Crown,
      badge: "Melhor Custo-Benefício",
      priceId: "PRICE_ID_DO_PLANO_MIMO_PLUS_AQUI", // MARCADOR
      features: [
        "Tudo do plano anterior",
        "Roupas e acessórios ilimitados",
        "Função social completa",
        "Modo Terapia Leve",
        "Diamantes mensais inclusos",
      ],
    },
  ];

  const diamondPackages = [
    { amount: 10, price: "R$ 9,90", priceId: "PRICE_ID_DIAMONDS_10_AQUI" }, // MARCADOR
    { amount: 50, price: "R$ 39,90", priceId: "PRICE_ID_DIAMONDS_50_AQUI" }, // MARCADOR
    { amount: 150, price: "R$ 80,90", badge: "Popular", priceId: "PRICE_ID_DIAMONDS_150_AQUI" }, // MARCADOR
    { amount: 400, price: "R$ 99,90", priceId: "PRICE_ID_DIAMONDS_400_AQUI" }, // MARCADOR
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-sm border-b border-border shadow-soft">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => navigate("/")}
              className="rounded-full"
            >
              ← Voltar
            </Button>
            <h1 className="text-xl font-bold text-primary">Premium</h1>
            <div className="w-20"></div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 space-y-12 max-w-5xl">
        {/* Hero Section */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-primary/20 to-accent/20 px-6 py-3 rounded-full">
            <Crown className="w-6 h-6 text-primary animate-bounce-subtle" />
            <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
              Desbloqueie Todo o Potencial do Mimo
            </h2>
          </div>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Escolha o plano perfeito para você e transforme sua jornada de
            autocuidado em algo ainda mais especial! 💚
          </p>
        </div>

        {/* Subscription Plans */}
        <section className="space-y-6">
          <h3 className="text-2xl font-bold text-center">
            Planos de Assinatura
          </h3>
          <div className="grid md:grid-cols-2 gap-6">
            {subscriptionPlans.map((plan) => (
              <Card
                key={plan.name}
                className={`relative p-6 border-2 hover:border-primary/50 transition-all hover:shadow-float bg-gradient-to-br ${plan.color}`}
              >
                {plan.badge && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground">
                    {plan.badge}
                  </Badge>
                )}
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-card rounded-full">
                      <plan.icon className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h4 className="text-xl font-bold">{plan.name}</h4>
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-bold text-primary">
                          {plan.price}
                        </span>
                        <span className="text-muted-foreground">
                          {plan.period}
                        </span>
                      </div>
                    </div>
                  </div>

                  <ul className="space-y-3">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button 
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl"
                    onClick={() => startCheckout(plan.priceId, true)} // isSubscription = true
                  >
                    Assinar Agora
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* Diamond Packages */}
        <section className="space-y-6">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-2">
              <Gem className="w-6 h-6 text-primary" />
              <h3 className="text-2xl font-bold">Comprar Diamantes</h3>
              <Gem className="w-6 h-6 text-primary" />
            </div>
            <p className="text-muted-foreground">
              Use diamantes para desbloquear roupas, fundos e pets raros!
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {diamondPackages.map((pkg) => (
              <Card
                key={pkg.amount}
                className="relative p-6 text-center border-2 hover:border-primary/50 transition-all hover:scale-105 cursor-pointer bg-gradient-to-br from-primary/10 to-accent/10"
              >
                {pkg.badge && (
                  <Badge className="absolute -top-2 -right-2 bg-accent text-accent-foreground">
                    {pkg.badge}
                  </Badge>
                )}
                <div className="space-y-3">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full mx-auto">
                    <Gem className="w-8 h-8 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-primary">
                      {pkg.amount}
                    </p>
                    <p className="text-xs text-muted-foreground">diamantes</p>
                  </div>
                  <Button
                    size="sm"
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl"
                    onClick={() => startCheckout(pkg.priceId, false)} // isSubscription = false
                  >
                    {pkg.price}
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* Benefits */}
        <section className="bg-muted/50 border-2 border-border/50 rounded-2xl p-8">
          <h3 className="text-2xl font-bold text-center mb-6">
            Por que ser Premium?
          </h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center space-y-2">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/20 rounded-full mx-auto">
                <Sparkles className="w-8 h-8 text-primary" />
              </div>
              <h4 className="font-bold">Conteúdo Exclusivo</h4>
              <p className="text-sm text-muted-foreground">
                Acesso a roupas, acessórios e funcionalidades especiais
              </p>
            </div>
            <div className="text-center space-y-2">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/20 rounded-full mx-auto">
                <Crown className="w-8 h-8 text-primary" />
              </div>
              <h4 className="font-bold">Experiência Completa</h4>
              <p className="text-sm text-muted-foreground">
                Aproveite todos os recursos do Mimo sem limitações
              </p>
            </div>
            <div className="text-center space-y-2">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/20 rounded-full mx-auto">
                <Gem className="w-8 h-8 text-primary" />
              </div>
              <h4 className="font-bold">Suporte ao Desenvolvimento</h4>
              <p className="text-sm text-muted-foreground">
                Ajude a manter o Mimo crescendo e melhorando
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Premium;
