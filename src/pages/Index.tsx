import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { usePet } from "@/hooks/usePet";
import { PetDisplay } from "@/components/PetDisplay";
import { TaskList } from "@/components/TaskList";
import { CrystalCounter } from "@/components/CrystalCounter";
import { ShopPreview } from "@/components/ShopPreview";
import { ExplorationCard } from "@/components/ExplorationCard";
import { CreatePetForm } from "@/components/CreatePetForm";
import { AppMenu } from "@/components/AppMenu";
import { Button } from "@/components/ui/button";
import { Crown } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();
  const { session, profile, loading: authLoading, error, signInEmailPassword, signUpEmailPassword, signInGoogle } = useAuth();
  const { pet, loading: petLoading, updatePetStats } = usePet();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [creatingAccount, setCreatingAccount] = useState(false);

  const handleLogin = async () => {
    await signInEmailPassword(email, password);
  };

  const handleCreateAccount = async () => {
    setCreatingAccount(true);
    await signUpEmailPassword(email, password, username);
    setCreatingAccount(false);
  };

  const handleTaskComplete = async () => {
    if (!pet) return;
    const newEnergy = Math.min(100, pet.energy + 5);
    const newHappiness = Math.min(100, pet.happiness + 3);
    await updatePetStats({ energy: newEnergy, happiness: newHappiness });
  };

  if (authLoading) return <div>Carregando...</div>;
  if (!session)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="max-w-md w-full p-4 bg-card rounded-lg">
          <h1 className="text-center text-2xl font-bold mb-4">Mimo</h1>
          <input
            type="text"
            placeholder="Seu email"
            className="input mb-2 w-full"
            value={email}
            onChange={e => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Sua senha"
            className="input mb-2 w-full"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
          <input
            type="text"
            placeholder="Nome de usuário"
            className="input mb-2 w-full"
            value={username}
            onChange={e => setUsername(e.target.value)}
          />
          {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
          <Button onClick={handleLogin} disabled={creatingAccount} className="mb-2 w-full">
            Entrar
          </Button>
          <Button onClick={handleCreateAccount} disabled={creatingAccount} className="w-full">
            {creatingAccount ? "Criando conta..." : "Criar conta"}
          </Button>
          <Button onClick={signInGoogle} className="mt-2 w-full">
            Entrar com Google
          </Button>
        </div>
      </div>
    );

  if (petLoading) return <div>Carregando seu Mimo...</div>;

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 bg-card p-4 flex justify-between items-center">
        <AppMenu />
        <h1>Mimo</h1>
        <div className="flex gap-2 items-center">
          <CrystalCounter />
          <Button onClick={() => navigate("/premium")}>
            <Crown />
          </Button>
        </div>
      </header>

      <main className="p-4">
        {pet ? (
          <>
            <PetDisplay {...pet} />
            <TaskList onTaskComplete={handleTaskComplete} />
            <div className="grid md:grid-cols-2 gap-4">
              <ShopPreview />
              <ExplorationCard />
            </div>
          </>
        ) : (
          <CreatePetForm />
        )}
      </main>
    </div>
  );
};

export default Index;
