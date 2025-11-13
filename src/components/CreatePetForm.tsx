import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { usePet } from "@/hooks/usePet";
import { toast } from "sonner";

export const CreatePetForm = () => {
  const [name, setName] = useState("");
  const { createPet, loading } = usePet();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Por favor, dê um nome ao seu Mimo.");
      return;
    }

    const newPet = await createPet(name.trim());

    if (newPet) {
      toast.success(`Bem-vindo, ${newPet.name}! ✨`, {
        description: "Sua jornada de autocuidado começou!",
      });
    } else {
      toast.error("Não foi possível criar seu Mimo.", {
        description: "Por favor, tente novamente mais tarde.",
      });
    }
  };

  return (
    <Card className="p-8 max-w-md mx-auto text-center">
      <h2 className="text-2xl font-bold mb-4">Crie seu primeiro Mimo!</h2>
      <p className="text-muted-foreground mb-6">Dê um nome para seu novo amigo de autocuidado.</p>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          type="text"
          placeholder="Nome do seu Mimo"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="text-center"
          maxLength={20}
        />
        <Button type="submit" disabled={loading}>
          {loading ? "Criando..." : "Criar meu Mimo"}
        </Button>
      </form>
    </Card>
  );
};
