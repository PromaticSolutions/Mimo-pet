import { Heart, Zap } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import mimoPet from "@/assets/mimo-pet.png";

interface PetDisplayProps {
  name: string;
  level: number;
  energy: number;
  happiness: number;
}

export const PetDisplay = ({ name, level, energy, happiness }: PetDisplayProps) => {
  return (
    <Card className="gradient-card shadow-float border-2 border-primary/20 overflow-hidden">
      {/* Sky Background */}
      <div className="gradient-sky h-48 relative flex items-center justify-center">
        {/* Floating Pet */}
        <div className="animate-float">
          <img 
            src={mimoPet} 
            alt={name}
            className="w-40 h-40 object-contain drop-shadow-lg"
          />
        </div>
        
        {/* Level Badge */}
        <div className="absolute top-4 right-4 bg-card/90 backdrop-blur-sm px-3 py-1 rounded-full shadow-soft">
          <span className="text-sm font-bold text-primary">Nível {level}</span>
        </div>
      </div>

      {/* Pet Info */}
      <div className="p-6 space-y-4">
        <h2 className="text-2xl font-bold text-center text-foreground">{name}</h2>
        
        {/* Stats */}
        <div className="space-y-3">
          {/* Energy */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-energy" fill="currentColor" />
                <span className="font-medium">Energia</span>
              </div>
              <span className="text-muted-foreground">{energy}/100</span>
            </div>
            <Progress 
              value={energy} 
              className="h-2 bg-muted"
              indicatorClassName="bg-energy"
            />
          </div>

          {/* Happiness */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <Heart className="w-4 h-4 text-love" fill="currentColor" />
                <span className="font-medium">Felicidade</span>
              </div>
              <span className="text-muted-foreground">{happiness}/100</span>
            </div>
            <Progress 
              value={happiness} 
              className="h-2 bg-muted"
              indicatorClassName="bg-love"
            />
          </div>
        </div>
      </div>
    </Card>
  );
};
