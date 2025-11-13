import { ShoppingBag } from "lucide-react";
import { ShopItem } from "./ShopItem";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export const ShopPreview = () => {
  const navigate = useNavigate();
  
  const items = [
    { id: 1, name: "Chapéu de Sol 🌞", price: 50, emoji: "🎩" },
    { id: 2, name: "Cachecol Fofo 🧣", price: 30, emoji: "🧣" },
    { id: 3, name: "Óculos de Star ⭐", price: 75, emoji: "🕶️" },
  ]; // Em um projeto real, estes itens viriam do Supabase

  return (
    <Card className="gradient-card shadow-soft border-2 border-border/50 p-6">
      <div className="flex items-center gap-2 mb-4">
        <ShoppingBag className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-bold">Lojinha do Mimo</h3>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {items.map((item) => (
          <ShopItem
            key={item.id}
            id={item.id}
            name={item.name}
            price={item.price}
            emoji={item.emoji}
          />
        ))}
      </div>

      <Button 
        onClick={() => navigate("/shop")}
        className="w-full mt-4 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl"
      >
        Ver Todos os Itens
      </Button>
    </Card>
  );
};
