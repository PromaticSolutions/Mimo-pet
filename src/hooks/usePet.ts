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
    console.log('🔍 fetchPet chamado para userId:', userId);
    try {
      const { data, error } = await supabase
        .from('pets')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('❌ Erro ao buscar pet:', error);
        throw new Error(error.message);
      }

      if (!mounted.current) return;

      if (data) {
        console.log('✅ Pet encontrado:', data);
        setPet(data as Pet);
      } else {
        console.log('⚠️ Nenhum pet encontrado para este usuário');
        setPet(null);
      }
    } catch (err) {
      console.error('❌ Erro inesperado em fetchPet:', err);
      if (mounted.current) setError('Erro ao buscar dados do pet.');
    } finally {
      if (mounted.current) setLoading(false);
    }
  };

  useEffect(() => {
    mounted.current = true;

    const init = async () => {
      if (!authLoading && user) {
        console.log('🔍 Iniciando fetch do pet para user:', user.id);
        setLoading(true);
        await fetchPet(user.id);
      } else if (!authLoading && !user) {
        console.log('⚠️ Nenhum usuário logado, resetando pet');
        setPet(null);
        setLoading(false);
      }
    };

    init();

    return () => {
      mounted.current = false;
    };
  }, [user, authLoading]);

  const createPet = async (name: string) => {
    if (!user) {
      setError('Usuário não autenticado');
      return;
    }

    setLoading(true);
    try {
      console.log('🔍 Criando novo pet para user:', user.id);
      const { data, error } = await supabase
        .from('pets')
        .insert([{ user_id: user.id, name }])
        .select()
        .single();

      if (error) throw new Error(error.message);
      console.log('✅ Pet criado com sucesso:', data);
      if (mounted.current) setPet(data as Pet);
    } catch (err) {
      console.error('❌ Erro ao criar pet:', err);
      if (mounted.current) setError('Erro ao criar pet');
    } finally {
      if (mounted.current) setLoading(false);
    }
  };

  const updatePetStats = async (updates: Partial<Omit<Pet, 'id' | 'user_id'>>) => {
    if (!pet) return;

    try {
      console.log('🔍 Atualizando stats do pet:', updates);
      const { data, error } = await supabase
        .from('pets')
        .update(updates)
        .eq('id', pet.id)
        .select()
        .single();

      if (error) throw new Error(error.message);
      console.log('✅ Stats do pet atualizados:', data);
      if (mounted.current) setPet(data as Pet);
    } catch (err) {
      console.error('❌ Erro ao atualizar pet:', err);
      if (mounted.current) setError('Erro ao atualizar pet');
    }
  };

  return {
    pet,
    loading,
    error,
    fetchPet: async () => {
      if (user) await fetchPet(user.id);
    },
    createPet,
    updatePetStats,
  };
};
