import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LogOut, User, Settings as SettingsIcon, Trash2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";

const Settings = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate(0); // Recarrega a página para limpar o estado
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-sm border-b border-border shadow-soft">
        <div className="container mx-auto px-4 py-4">
          <Button variant="ghost" onClick={() => navigate("/")} className="rounded-full">
            ← Voltar
          </Button>
          <h1 className="text-xl font-bold text-primary text-center">Configurações</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-8 max-w-xl">
        <Card className="p-6 space-y-4">
          <div className="flex items-center gap-4">
            <User className="w-8 h-8 text-primary" />
            <div>
              <h2 className="text-xl font-bold">Conta</h2>
              <p className="text-sm text-muted-foreground">Gerencie suas informações de perfil.</p>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                <span className="font-medium">Email</span>
                <span className="text-muted-foreground">{profile?.user?.email || 'Não disponível'}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                <span className="font-medium">Nome de Usuário</span>
                <span className="text-muted-foreground">{profile?.username || 'Não definido'}</span>
            </div>
          </div>
          <Button variant="outline" className="w-full">
            Editar Perfil
          </Button>
        </Card>

        <Card className="p-6 space-y-4">
          <div className="flex items-center gap-4">
            <SettingsIcon className="w-8 h-8 text-primary" />
            <div>
              <h2 className="text-xl font-bold">Geral</h2>
              <p className="text-sm text-muted-foreground">Opções de notificação e privacidade.</p>
            </div>
          </div>
          <Button variant="outline" className="w-full">
            Configurações de Notificação
          </Button>
        </Card>

        <Card className="p-6 space-y-4 bg-red-500/10 border-red-500/30">
          <div className="flex items-center gap-4">
            <Trash2 className="w-8 h-8 text-red-500" />
            <div>
              <h2 className="text-xl font-bold text-red-500">Zona de Perigo</h2>
              <p className="text-sm text-muted-foreground">Ações irreversíveis.</p>
            </div>
          </div>
          <Button variant="destructive" className="w-full">
            Excluir Conta
          </Button>
        </Card>

        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-lg h-12 text-red-500 hover:bg-red-500/10"
          onClick={handleSignOut}
        >
          <LogOut className="w-5 h-5" />
          Sair da Conta
        </Button>
      </main>
    </div>
  );
};

export default Settings;
