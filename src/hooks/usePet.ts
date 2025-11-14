import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from './useAuth';

interface Pet {
  id: string;
  user_id: string;
  name: string;
  level: number;
  energy: number;
  happiness: number;
  last_fed: string;
  last_played: string;
}

export const usePet = () => {
  const { user, loading: authLoading } = useAuth();
  const [pet, setPet] = useState<Pet | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const mounted = useRef(true);

  const fetchPet = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('pets')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw new Error(error.message);
      }

      if (!mounted.current) return;

      if (data) {
        setPet(data as Pet);
        console.log('🐾 Pet carregado:', data);
      } else {
        setPet(null);
        console.log('⚠️ Nenhum pet encontrado');
      }
    } catch (err) {
      console.error('Erro ao buscar pet:', err);
      if (mounted.current) setError('Erro ao buscar dados do pet.');
    } finally {
      if (mounted.current) setLoading(false);
    }
  };

  useEffect(() => {
    mounted.current = true;

    const init = async () => {
      if (!authLoading) {
        if (user) {
          console.log('🔍 User definido, buscando pet:', user.id);
          setLoading(true);
          await fetchPet(user.id);
        } else {
          console.log('⚠️ Nenhum usuário logado, resetando pet');
          setPet(null);
          setLoading(false);
        }
      }
    };

    init();

    return () => {
      mounted.current = false;
    };
  }, [user, authLoading]); // ✅ depende de user e authLoading

  const createPet = async (name: string) => {
    if (!user) {
      setError('Usuário não autenticado');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('pets')
        .insert([{ user_id: user.id, name }])
        .select()
        .single();

      if (error) throw new Error(error.message);
      setPet(data as Pet);
      console.log('🐾 Pet criado:', data);
    } catch (err) {
      console.error('Erro ao criar pet:', err);
      setError('Erro ao criar pet');
    } finally {
      setLoading(false);
    }
  };

  const updatePetStats = async (updates: Partial<Omit<Pet, 'id' | 'user_id'>>) => {
    if (!pet) return;

    try {
      const { data, error } = await supabase
        .from('pets')
        .update(updates)
        .eq('id', pet.id)
        .select()
        .single();

      if (error) throw new Error(error.message);
      setPet(data as Pet);
      console.log('🐾 Pet atualizado:', data);
    } catch (err) {
      console.error('Erro ao atualizar pet:', err);
      setError('Erro ao atualizar pet');
    }
  };

  return {
    pet,
    loading,
    error,
    fetchPet: () => user && fetchPet(user.id),
    createPet,
    updatePetStats,
  };
};
