import { Gauge } from "lucide-react";
import { cn } from "@/lib/utils";

interface SpeedGaugeProps {
  currentSpeed: number;
  maxSpeed: number;
}

export const SpeedGauge = ({ currentSpeed, maxSpeed }: SpeedGaugeProps) => {
  const percentage = Math.min((currentSpeed / maxSpeed) * 100, 100);
  const rotation = (percentage / 100) * 180 - 90; // -90 to 90 degrees

  const getSpeedColor = () => {
    if (currentSpeed === 0) return "text-muted-foreground";
    if (percentage < 40) return "text-alert-safe";
    if (percentage < 70) return "text-alert-warning";
    return "text-alert-danger";
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Gauge className="w-5 h-5 text-muted-foreground" />
        <h3 className="font-semibold">Current Speed</h3>
      </div>

      {/* Circular Gauge */}
      <div className="relative w-full aspect-square max-w-[240px] mx-auto">
        {/* Background Circle */}
        <svg className="w-full h-full" viewBox="0 0 200 200">
          {/* Track */}
          <circle
            cx="100"
            cy="100"
            r="85"
            fill="none"
            stroke="hsl(var(--gauge-track))"
            strokeWidth="12"
            strokeDasharray="267 267"
            strokeDashoffset="0"
            transform="rotate(-90 100 100)"
          />
          
          {/* Progress */}
          <circle
            cx="100"
            cy="100"
            r="85"
            fill="none"
            stroke={
              percentage < 40 ? "hsl(var(--alert-safe))" :
              percentage < 70 ? "hsl(var(--alert-warning))" :
              "hsl(var(--alert-danger))"
            }
            strokeWidth="12"
            strokeDasharray="267 267"
            strokeDashoffset={267 - (267 * percentage) / 100}
            strokeLinecap="round"
            transform="rotate(-90 100 100)"
            className="transition-all duration-500 ease-out"
          />
        </svg>

        {/* Speed Display */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className={cn("text-5xl font-bold tabular-nums transition-colors", getSpeedColor())}>
            {Math.round(currentSpeed)}
          </div>
          <div className="text-sm text-muted-foreground mt-1">km/h</div>
          <div className="text-xs text-muted-foreground mt-2">
            Max: {maxSpeed} km/h
          </div>
        </div>

        {/* Needle */}
        <div 
          className="absolute top-1/2 left-1/2 w-1 h-20 bg-foreground origin-bottom transition-transform duration-300 ease-out"
          style={{
            transform: `translate(-50%, -100%) rotate(${rotation}deg)`,
          }}
        >
          <div className="w-3 h-3 rounded-full bg-foreground absolute -top-1 left-1/2 -translate-x-1/2" />
        </div>
      </div>

      {/* Speed Bar */}
      <div className="space-y-2">
        <div className="h-3 bg-dashboard-gauge rounded-full overflow-hidden">
          <div
            className={cn(
              "h-full transition-all duration-500 ease-out",
              percentage < 40 ? "bg-alert-safe" :
              percentage < 70 ? "bg-alert-warning" :
              "bg-alert-danger"
            )}
            style={{ width: `${percentage}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>0</span>
          <span>{maxSpeed / 2}</span>
          <span>{maxSpeed}</span>
        </div>
      </div>
    </div>
  );
};
