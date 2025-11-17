import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from './useAuth';

export interface DailyTask {
  id: string;
  user_id: string;
  title: string;
  crystals_reward: number;
  is_completed: boolean;
  due_date: string;
}

// Tarefas padrão para serem geradas se não houver tarefas para o dia
const defaultTasks = [
  { title: "Beber 1 copo de água 💧", crystals_reward: 5 },
  { title: "Alongar por 2 minutos 🧘", crystals_reward: 10 },
  { title: "Agradecer por algo hoje 🙏", crystals_reward: 5 },
  { title: "Fazer uma pausa de 5 min 😌", crystals_reward: 10 },
  { title: "Escrever 3 coisas boas ✨", crystals_reward: 15 },
];

export const useDailyTasks = () => {
  const { user, loading: authLoading } = useAuth();
  const [tasks, setTasks] = useState<DailyTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = useCallback(async (userId: string) => {
    setLoading(true);
    setError(null);
    try {
      // Busca tarefas para o dia atual
      const today = new Date().toISOString().split('T')[0];
      
      let { data: fetchedTasks, error: fetchError } = await supabase
        .from('daily_tasks')
        .select('id, user_id, title, crystals_reward, is_completed, due_date') // CORRIGIDO: Seleção explícita de colunas
        .eq('user_id', userId)
        .eq('due_date', today);

      if (fetchError) {
        throw new Error(fetchError.message);
      }

      // Se não houver tarefas para hoje, gera as tarefas padrão
      if (!fetchedTasks || fetchedTasks.length === 0) {
        const tasksToInsert = defaultTasks.map(task => ({
          user_id: userId,
          title: task.title,
          crystals_reward: task.crystals_reward,
          due_date: today,
        }));

        const { data: newTasks, error: insertError } = await supabase
          .from('daily_tasks')
          .insert(tasksToInsert)
          .select();

        if (insertError) {
          throw new Error(insertError.message);
        }
        fetchedTasks = newTasks;
      }

      setTasks(fetchedTasks as DailyTask[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch tasks');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authLoading && user) {
      fetchTasks(user.id);
    } else if (!authLoading && !user) {
      setTasks([]);
      setLoading(false);
    }
  }, [user, authLoading]); // CORRIGIDO: Removida a dependência 'fetchTasks' para evitar loops desnecessários.

  const completeTask = async (taskId: string) => {
    if (!user) {
      setError('User not authenticated');
      return null;
    }
    setError(null);
    try {
      const { data: updatedTask, error: updateError } = await supabase
        .from('daily_tasks')
        .update({ is_completed: true })
        .eq('id', taskId)
        .eq('user_id', user.id)
        .select()
        .single();

      if (updateError) {
        throw new Error(updateError.message);
      }

      // Atualiza o estado local
      setTasks(prevTasks => prevTasks.map(task => 
        task.id === taskId ? updatedTask as DailyTask : task
      ));

      return updatedTask as DailyTask;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to complete task');
      return null;
    }
  };

  return { tasks, loading, error, fetchTasks: () => user && fetchTasks(user.id), completeTask };
};
