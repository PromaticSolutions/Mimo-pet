import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import { ShoppingBag, Sparkles, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const Shop = () => {
  const navigate = useNavigate();
  const { profile, user } = useAuth();
  const [shopItems, setShopItems] = useState<{ accessories: any[]; furniture: any[] }>({ accessories: [], furniture: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchShopItems = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('shop_items')
        .select('*')
        .eq('is_available', true);

      if (error) {
        console.error("Erro ao buscar itens da loja:", error);
        toast.error("Erro ao carregar a loja.");
        setLoading(false);
        return;
      }

      // Assumindo que 'type' no banco de dados é 'accessory' ou 'furniture'
      const accessories = data.filter(item => item.type === 'accessory');
      const furniture = data.filter(item => item.type === 'furniture');

      setShopItems({ accessories, furniture });
      setLoading(false);
    };

    fetchShopItems();
  }, []);

  const handlePurchase = async (item: any) => {
    if (!user || !profile) {
      toast.error("Você precisa estar logado para comprar itens.");
      return;
    }

    // Usa 'diamonds' ou 'crystals' com base no tipo de item
    const currency = item.type === "diamond" ? "diamonds" : "crystals";
    const userCurrency = profile[currency];

    if (userCurrency < item.price) {
      toast.error(`${currency === "diamonds" ? "Diamantes" : "Cristais"} insuficientes!`);
      return;
    }

    try {
      // 1. Inserir no inventário
      const { error: inventoryError } = await supabase
        .from('user_inventory')
        .insert([{ user_id: user.id, item_id: item.id }]);

      if (inventoryError) throw inventoryError;

      // 2. Atualizar o perfil do usuário (deduzir o custo)
      const newCurrencyValue = userCurrency - item.price;
      const { error: profileUpdateError } = await supabase
        .from('profiles')
        .update({ [currency]: newCurrencyValue })
        .eq('id', user.id);

      if (profileUpdateError) throw profileUpdateError;

      toast.success(`${item.name} comprado com sucesso! 🎉`);
      // O useAuth hook deve re-buscar o perfil e atualizar o estado global
    } catch (error) {
      console.error("Erro na compra:", error);
      toast.error("Erro ao finalizar a compra.");
    }
  };

  const ShopItemCard = ({ item }: { item: any }) => (
    <Card className="p-4 border-2 hover:border-primary/50 transition-all hover:scale-105">
      <div className="space-y-3">
        <div className="relative">
          <div className="aspect-square bg-gradient-to-br from-secondary/20 to-accent/20 rounded-xl flex items-center justify-center">
            <span className="text-5xl">{item.emoji || '✨'}</span> {/* Usando um fallback para emoji */}
          </div>
          {item.type === "diamond" && (
            <Badge className="absolute -top-2 -right-2 bg-primary text-primary-foreground">
              <Crown className="w-3 h-3 mr-1" />
              Premium
            </Badge>
          )}
        </div>
        <div className="text-center">
          <h4 className="font-bold text-sm mb-1">{item.name}</h4>
          <p className="text-primary font-bold">
            {item.price}
            {item.type === "diamond" ? "💠" : "💎"}
          </p>
        </div>
        <Button
          onClick={() => handlePurchase(item)}
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl"
          size="sm"
        >
          Comprar
        </Button>
      </div>
    </Card>
  );

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
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-primary" />
              <h1 className="text-xl font-bold">Lojinha do Mimo</h1>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 bg-primary/10 px-3 py-1 rounded-full">
                <span className="text-sm font-bold">{profile?.crystals ?? 0}</span>
                <span className="text-lg">💎</span>
              </div>
              <div className="flex items-center gap-1 bg-yellow-500/10 px-3 py-1 rounded-full">
                <span className="text-sm font-bold">{profile?.diamonds ?? 0}</span>
                <span className="text-lg">💠</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 max-w-5xl">
        <Tabs defaultValue="accessories" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto">
            <TabsTrigger value="accessories">Acessórios</TabsTrigger>
            <TabsTrigger value="furniture">Móveis</TabsTrigger>
          </TabsList>

          <TabsContent value="accessories" className="space-y-4">
            <div className="text-center space-y-2 mb-6">
              <h2 className="text-2xl font-bold">Acessórios para o Mimo</h2>
              <p className="text-muted-foreground">
                Vista seu Mimo com os acessórios mais fofos!
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {loading ? (
                <p>Carregando itens...</p>
              ) : (
                shopItems.accessories.map((item) => (
                  <ShopItemCard key={item.id} item={item} />
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="furniture" className="space-y-4">
            <div className="text-center space-y-2 mb-6">
              <h2 className="text-2xl font-bold">Móveis e Decoração</h2>
              <p className="text-muted-foreground">
                Deixe a casa do Mimo ainda mais aconchegante!
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {loading ? (
                <p>Carregando itens...</p>
              ) : (
                shopItems.furniture.map((item) => (
                  <ShopItemCard key={item.id} item={item} />
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* Premium CTA */}
        <Card className="mt-8 p-6 bg-gradient-to-br from-primary/10 to-accent/10 border-2 border-primary/30">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-primary/20 rounded-full">
                <Sparkles className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-bold">Quer mais itens exclusivos?</h3>
                <p className="text-sm text-muted-foreground">
                  Assine o Premium e desbloqueie itens especiais!
                </p>
              </div>
            </div>
            <Button
              onClick={() => navigate("/premium")}
              className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl"
            >
              Ver Premium
            </Button>
          </div>
        </Card>
      </main>
    </div>
  );
};

export default Shop;
