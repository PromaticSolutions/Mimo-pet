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
import { CreatePetForm } from "@/components/CreatePetForm";
import { useState } from "react";

const Index = () => {
  const navigate = useNavigate();
  const { session, profile, loading: authLoading, refetchProfile } = useAuth();
  const { pet, loading: petLoading, createPet, updatePetStats } = usePet();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  console.log('=== DEBUG INDEX ===');
  console.log('authLoading:', authLoading);
  console.log('petLoading:', petLoading);
  console.log('session:', session);
  console.log('pet:', pet);
  console.log('===================');

  const handleTaskComplete = async (earnedCrystals: number) => {
    if (!pet) return;

    const newEnergy = Math.min(100, pet.energy + 5);
    const newHappiness = Math.min(100, pet.happiness + 3);

    await updatePetStats({ energy: newEnergy, happiness: newHappiness });
  };

  const handleEmailSignUp = async () => {
    setErrorMsg("");
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });
      if (error) throw error;
      alert("Conta criada com sucesso! Você está logado automaticamente.");
    } catch (err: any) {
      console.error("Erro ao criar conta:", err);
      setErrorMsg(err.message);
    }
  };

  const handleEmailSignIn = async () => {
    setErrorMsg("");
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
    } catch (err: any) {
      console.error("Erro ao entrar:", err);
      setErrorMsg(err.message);
    }
  };

  // Loading auth
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

  // Tela de login
  if (!session) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-card p-6 rounded-lg shadow-md">
          <h1 className="text-3xl font-bold text-center text-primary mb-4">Mimo</h1>
          <p className="text-center text-muted-foreground mb-4">
            Faça login para cuidar do seu pet de autocuidado.
          </p>

          {errorMsg && <p className="text-red-500 mb-2 text-sm">{errorMsg}</p>}

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 mb-2 border border-border rounded"
          />
          <input
            type="password"
            placeholder="Senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 mb-4 border border-border rounded"
          />

          <div className="flex gap-2 mb-4">
            <Button onClick={handleEmailSignIn} className="flex-1">
              Entrar
            </Button>
            <Button onClick={handleEmailSignUp} variant="secondary" className="flex-1">
              Criar conta
            </Button>
          </div>

          <div className="text-center mb-2">ou</div>

          <Button
            variant="outline"
            className="w-full"
            onClick={async () => {
              await supabase.auth.signInWithOAuth({ provider: "google" });
            }}
          >
            Entrar com Google
          </Button>
        </div>
      </div>
    );
  }

  // Loading pet
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
