import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Share2, Gift, Copy } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { useState } from "react";
import { supabase } from "@/lib/supabase";

const Friends = () => {
  const navigate = useNavigate();
  const { profile, refetchProfile, loading: authLoading } = useAuth();
  const [referralCode, setReferralCode] = useState('');
  const [loading, setLoading] = useState(false);

  // O código de indicação será o próprio ID do usuário (UUID)
  const userReferralCode = authLoading 
    ? 'CARREGANDO...' 
    : profile?.id.substring(0, 8).toUpperCase() || 'ERRO';

  const handleCopy = () => {
    navigator.clipboard.writeText(userReferralCode);
    toast.success("Código copiado!", {
      description: "Compartilhe com seus amigos para ganhar recompensas."
    });
  };

  const handleRedeem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!referralCode || loading || !profile) return;

    setLoading(true);
    
    // 1. Verificar se o código é válido (se existe um usuário com o prefixo do ID)
    const codeToSearch = referralCode.toUpperCase();
    
    // Previne que o usuário use o próprio código
    if (codeToSearch === userReferralCode) {
        toast.error("Você não pode usar seu próprio código de indicação.");
        setLoading(false);
        return;
    }

    // Busca o perfil do indicador
    const { data: referrerProfile, error: referrerError } = await supabase
        .from('profiles')
        .select('id, ouros')
        .eq('id', codeToSearch) // Busca pelo ID completo
        .single();

    if (referrerError || !referrerProfile) {
        toast.error("Código de indicação inválido.", {
            description: "Verifique se o código está correto."
        });
        setLoading(false);
        return;
    }

    // 2. Lógica de Recompensa (50 diamantes para o novo usuário)
    const newDiamonds = (profile.diamonds || 0) + 50;
    
    const { error: updateError } = await supabase
        .from('profiles')
        .update({ ouros: newDiamonds }) // Atualiza a coluna 'ouros'
        .eq('id', profile.id);

    if (updateError) {
        console.error("Erro ao creditar diamantes:", updateError);
        toast.error("Erro ao creditar diamantes.", {
            description: "Tente novamente mais tarde."
        });
        setLoading(false);
        return;
    }

    // 3. Recompensa para o indicador (Opcional: 50 diamantes para o indicador)
    // const newReferrerDiamonds = (referrerProfile.ouros || 0) + 50;
    // await supabase.from('profiles').update({ ouros: newReferrerDiamonds }).eq('id', referrerProfile.id);

    // 4. Sucesso
    refetchProfile(); // Atualiza o perfil do usuário atual
    toast.success("Recompensa resgatada!", {
        description: "Você ganhou 50 diamantes! Seu amigo também foi recompensado.",
    });
    setReferralCode('');
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-sm border-b border-border shadow-soft">
        <div className="container mx-auto px-4 py-4">
          <Button variant="ghost" onClick={() => navigate("/")} className="rounded-full">
            ← Voltar
          </Button>
          <h1 className="text-xl font-bold text-primary text-center">Amigos</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-8 max-w-xl">
        <Card className="p-6 space-y-4 text-center">
          <Share2 className="w-8 h-8 text-primary mx-auto" />
          <h2 className="text-2xl font-bold">Convide um Amigo</h2>
          <p className="text-muted-foreground">
            Compartilhe seu código de indicação e ambos ganham **50 diamantes**!
          </p>
          
          <div className="flex items-center justify-center gap-2">
            <Input 
              type="text" 
              value={userReferralCode} 
              readOnly 
              className="text-center font-mono text-lg bg-muted/50"
              disabled={authLoading}
            />
            <Button size="icon" onClick={handleCopy}>
              <Copy className="w-5 h-5" />
            </Button>
          </div>
        </Card>

        <Card className="p-6 space-y-4">
          <Gift className="w-8 h-8 text-accent mx-auto" />
          <h2 className="text-2xl font-bold text-center">Resgatar Código</h2>
          <p className="text-muted-foreground text-center">
            Insira o código de indicação do seu amigo para ganhar 50 diamantes.
          </p>
          
          <form onSubmit={handleRedeem} className="flex gap-2">
            <Input 
              type="text" 
              placeholder="Código de Indicação"
              value={referralCode}
              onChange={(e) => setReferralCode(e.target.value)}
              className="uppercase"
              maxLength={8}
              disabled={loading}
            />
            <Button type="submit" disabled={loading}>
              {loading ? 'Resgatando...' : 'Resgatar'}
            </Button>
          </form>
        </Card>
      </main>
    </div>
  );
};

export default Friends;
