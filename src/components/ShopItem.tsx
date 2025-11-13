import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";

interface ShopItemProps {
  id: number;
  name: string;
  price: number;
  emoji: string;
}

export const ShopItem = ({ id, name, price, emoji }: ShopItemProps) => {
  const { profile, refetchProfile } = useAuth();

  const handleBuy = async () => {
    if (!profile) {
      toast.error("Você precisa estar logado para comprar itens.");
      return;
    }

    if (profile.crystals < price) {
      toast.error("Cristais insuficientes.", {
        description: `Você precisa de mais ${price - profile.crystals} cristais para comprar ${name}.`
      });
      return;
    }

    // Lógica de compra (simulada, pois não temos a tabela de inventário ainda)
    // 1. Deduzir cristais
    const newCrystals = profile.crystals - price;
    
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ crystals: newCrystals })
      .eq('id', profile.id);

    if (updateError) {
      console.error("Erro ao deduzir cristais:", updateError);
      toast.error("Erro na transação.", {
        description: "Tente novamente mais tarde."
      });
      return;
    }

    // 2. Adicionar item ao inventário (Simulação: apenas notificação)
    // Aqui você adicionaria o item à tabela 'inventory' no Supabase.
    
    // 3. Atualizar o perfil localmente
    refetchProfile();

    toast.success(`Compra realizada!`, {
      description: `Você comprou ${name} por ${price} cristais.`,
    });
  };

  return (
    <button
      onClick={handleBuy}
      className="aspect-square bg-gradient-to-br from-secondary/20 to-accent/20 rounded-xl border-2 border-border hover:border-primary/50 hover:scale-105 transition-all flex flex-col items-center justify-center gap-2 p-3"
    >
      <span className="text-3xl">{emoji}</span>
      <div className="text-center">
        <p className="text-xs font-medium line-clamp-1">{name}</p>
        <p className="text-xs text-primary font-bold">{price}💎</p>
      </div>
    </button>
  );
};
