import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Card } from '@/components/ui/card';

const TestConnection = () => {
  const [status, setStatus] = useState('Testando conexão com Supabase...');
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const runTest = async () => {
      try {
        // 1. Testar a conexão e a sessão de autenticação
        setStatus('Verificando sessão de autenticação...');
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) {
          throw new Error(`Erro de Sessão: ${sessionError.message}`);
        }

        if (!session) {
          setStatus('Nenhuma sessão ativa. Tentando buscar dados públicos...');
          // 2. Tentar buscar dados de uma tabela que não requer autenticação (ex: profiles, mas sem RLS)
          // Como todas as nossas tabelas requerem RLS, vamos tentar buscar o perfil se houver um usuário
          
          // Se não houver sessão, o problema é na autenticação.
          setStatus('Usuário não logado. O app deve mostrar a tela de login.');
          return;
        }

        // 3. Se houver sessão, tentar buscar o perfil
        setStatus(`Sessão ativa para o usuário: ${session.user.id}. Tentando buscar perfil...`);
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (profileError) {
          throw new Error(`Erro ao buscar perfil (RLS?): ${profileError.message} (Código: ${profileError.code})`);
        }

        setStatus('Sucesso! Perfil do usuário carregado.');
        setData(profileData);

      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro desconhecido durante o teste.');
        setStatus('FALHA NO TESTE DE CONEXÃO.');
      }
    };

    runTest();
  }, []);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-lg p-6 space-y-4">
        <h1 className="text-2xl font-bold text-center">Diagnóstico de Conexão Supabase</h1>
        <p className={`text-lg font-medium ${error ? 'text-red-500' : 'text-green-500'}`}>{status}</p>
        
        {error && (
          <div className="bg-red-100 p-4 rounded-lg text-red-700">
            <h2 className="font-bold">Detalhes do Erro:</h2>
            <pre className="whitespace-pre-wrap text-sm">{error}</pre>
          </div>
        )}

        {data && (
          <div className="bg-green-100 p-4 rounded-lg text-green-700">
            <h2 className="font-bold">Dados do Perfil (Sucesso):</h2>
            <pre className="whitespace-pre-wrap text-sm">{JSON.stringify(data, null, 2)}</pre>
          </div>
        )}
      </Card>
    </div>
  );
};

export default TestConnection;
