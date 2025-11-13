import { Check, Plus } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { useDailyTasks } from "@/hooks/useDailyTasks";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";

interface TaskListProps {
  onTaskComplete: (crystals: number) => void; // Manter por enquanto para a lógica do PetDisplay
}

export const TaskList = ({ onTaskComplete }: TaskListProps) => {
  const { tasks, loading, completeTask } = useDailyTasks();
  const { profile, refetchProfile } = useAuth();

  const handleTaskToggle = async (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task || task.is_completed || !profile) return;

    // 1. Marcar a tarefa como completa no Supabase
    const completed = await completeTask(taskId);

    if (completed) {
      // 2. Atualizar os cristais do usuário no Supabase
      const newCrystals = profile.crystals + completed.crystals_reward;
      
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ crystals: newCrystals })
        .eq('id', profile.id);

      if (updateError) {
        console.error("Erro ao atualizar cristais:", updateError);
        toast.error("Erro ao creditar cristais.", {
          description: "Tente novamente mais tarde."
        });
        return;
      }

      // 3. Notificar o componente pai (Index.tsx) para atualizar o pet
      onTaskComplete(completed.crystals_reward);

      // 4. Atualizar o perfil localmente
      refetchProfile();

      toast.success(`Parabéns! +${completed.crystals_reward} cristais ✨`, {
        description: "Continue assim, você está indo muito bem!"
      });
    }
  };

  const completedCount = tasks.filter(t => t.is_completed).length;
  const totalTasks = tasks.length;

  if (loading) {
    return <Card className="p-6 text-center">Carregando tarefas...</Card>;
  }

  return (
    <Card className="gradient-card shadow-soft border-2 border-border/50 p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold">Tarefas de Hoje</h3>
          <p className="text-sm text-muted-foreground">
            {completedCount}/{totalTasks} completas
          </p>
        </div>
        <Button size="icon" variant="outline" className="rounded-full">
          <Plus className="w-4 h-4" />
        </Button>
      </div>

      <div className="space-y-3">
        {tasks.map((task) => (
          <div
            key={task.id}
            className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${
              task.is_completed
                ? "bg-primary/10 border-primary/30"
                : "bg-card border-border hover:border-primary/40"
            }`}
          >
            <Checkbox
              checked={task.is_completed}
              onCheckedChange={() => handleTaskToggle(task.id)}
              className="data-[state=checked]:bg-primary"
              disabled={task.is_completed}
            />
            <div className="flex-1">
              <p className={`font-medium ${task.is_completed ? "line-through text-muted-foreground" : ""}`}>
                {task.title}
              </p>
            </div>
            <div className="flex items-center gap-1 px-2 py-1 bg-energy/20 rounded-full">
              <span className="text-xs font-bold text-energy-foreground">+{task.crystals_reward}</span>
              <span className="text-xs">💎</span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};
