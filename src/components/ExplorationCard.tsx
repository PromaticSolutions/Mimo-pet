import { Compass, Clock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const ExplorationCard = () => {
  return (
    <Card className="gradient-sunset shadow-float border-2 border-border/50 p-6">
      <div className="flex items-center gap-2 mb-3">
        <Compass className="w-5 h-5 text-foreground" />
        <h3 className="text-lg font-bold">Exploração</h3>
      </div>

      <p className="text-sm text-foreground/80 mb-4">
        Envie seu Mimo em uma aventura e receba recompensas incríveis!
      </p>

      <div className="bg-card/80 backdrop-blur-sm rounded-lg p-4 mb-4 space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Duração
          </span>
          <span className="font-bold">30 minutos</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span>Custo</span>
          <span className="font-bold text-primary">20💎</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span>Recompensas</span>
          <span className="text-xs">🎁 Surpresa!</span>
        </div>
      </div>

      <Button 
        className="w-full bg-accent hover:bg-accent/90 text-accent-foreground rounded-xl"
        disabled
      >
        Em breve! ✨
      </Button>
    </Card>
  );
};
