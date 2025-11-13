import { useNavigate } from "react-router-dom";
import { Menu, Settings, Users, Crown, LogOut, Home, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";

export const AppMenu = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate(0); // Recarrega a página para limpar o estado
  };

  const menuItems = [
    { icon: Home, title: "Início", path: "/" },
    { icon: Crown, title: "Premium", path: "/premium" },
    { icon: ShoppingBag, title: "Lojinha", path: "/shop" },
    { icon: Users, title: "Amigos", path: "/friends" },
    { icon: Settings, title: "Configurações", path: "/settings" },
  ];

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button size="icon" variant="ghost" className="rounded-full">
          <Menu className="w-5 h-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-3/4 sm:max-w-sm">
        <SheetHeader>
          <SheetTitle className="text-2xl font-bold text-primary">Mimo</SheetTitle>
          <p className="text-sm text-muted-foreground">
            Olá, {profile?.username || 'cuidador'}!
          </p>
        </SheetHeader>
        <div className="flex flex-col space-y-2 py-6">
          {menuItems.map((item) => (
            <Button
              key={item.title}
              variant="ghost"
              className="justify-start gap-3 text-lg h-12"
              onClick={() => navigate(item.path)}
            >
              <item.icon className="w-5 h-5" />
              {item.title}
            </Button>
          ))}
        </div>
        <div className="absolute bottom-4 left-4 right-4">
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 text-lg h-12 text-red-500 hover:bg-red-500/10"
            onClick={handleSignOut}
          >
            <LogOut className="w-5 h-5" />
            Sair
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};
