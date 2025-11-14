import { PetDisplay } from "@/components/PetDisplay";
import { TaskList } from "@/components/TaskList";
import { CrystalCounter } from "@/components/CrystalCounter";
import { ShopPreview } from "@/components/ShopPreview";
import { ExplorationCard } from "@/components/ExplorationCard";
import { Button } from "@/components/ui/button";
import { AppMenu } from "@/components/AppMenu";
import { Menu, Settings, Users, Crown, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { usePet } from "@/hooks/usePet";
import { supabase } from "@/lib/supabase";
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { CreatePetForm } from '@/components/CreatePetForm';

const Index = () => {
  const navigate = useNavigate();
  const { session, profile, loading: authLoading } = useAuth();
  const { pet, loading: petLoading, updatePetStats } = usePet();

  const handleTaskComplete = async (earnedCrystals: number) => {
    if (!pet) return;

    const newEnergy = Math.min(100, pet.energy + 5);
    const newHappiness = Math.min(100, pet.happiness + 3);

    await updatePetStats({ energy: newEnergy, happiness: newHappiness });
  };

  // Mostra loading apenas enquanto verifica auth inicial
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  // Se não tem sessão, mostra tela de login
  if (!session) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <h1 className="text-3xl font-bold text-center text-primary mb-4">Mimo</h1>
          <p className="text-center text-muted-foreground mb-8">
            Faça login para cuidar do seu pet de autocuidado.
          </p>
          <Auth
            supabaseClient={supabase}
            appearance={{ theme: ThemeSupa }}
            providers={['google']}
            redirectTo={window.location.origin}
            localization={{
              variables: {
                sign_in: {
                  email_label: 'Seu email',
                  password_label: 'Sua senha',
                  button_label: 'Entrar',
                  social_provider_text: 'Entrar com {{provider}}',
                },
                sign_up: {
                  email_label: 'Seu email',
                  password_label: 'Crie uma senha',
                  button_label: 'Criar conta',
                  social_provider_text: 'Cadastrar com {{provider}}',
                }
              }
            }}
          />
        </div>
      </div>
    );
  }

  // Mostra loading do pet apenas se auth já carregou
  if (petLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando seu Mimo...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-sm border-b border-border shadow-soft">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AppMenu />
              <h1 className="text-xl font-bold text-primary">Mimo</h1>
            </div>
            
            <div className="flex items-center gap-2">
              <CrystalCounter />
              <Button 
                size="icon" 
                variant="ghost" 
                className="rounded-full"
                onClick={() => navigate("/premium")}
              >
                <Crown className="w-5 h-5 text-primary" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6 max-w-5xl">
        {pet ? (
          <>
            <div className="text-center space-y-2">
              <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
                Bem-vindo de volta, {profile?.username || 'cuidador'}! 🌸
              </h2>
              <p className="text-muted-foreground">
                Seu Mimo está te esperando com carinho!
              </p>
            </div>

            <PetDisplay 
              name={pet.name}
              level={pet.level}
              energy={pet.energy}
              happiness={pet.happiness}
            />

            <TaskList onTaskComplete={handleTaskComplete} />

            <div className="grid md:grid-cols-2 gap-6">
              <ShopPreview />
              <ExplorationCard />
            </div>
          </>
        ) : (
          <div className="py-16">
            <CreatePetForm />
          </div>
        )}

        <div className="bg-muted/50 border-2 border-border/50 rounded-2xl p-6 text-center">
          <p className="text-sm text-muted-foreground">
            💡 <span className="font-medium">Dica:</span> Complete tarefas diárias para ganhar cristais e fazer seu Mimo crescer feliz e saudável!
          </p>
        </div>
      </main>

      <footer className="mt-12 py-8 border-t border-border">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm text-muted-foreground">
            Feito com 💚 para seu bem-estar
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;