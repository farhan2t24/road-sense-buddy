import { AlertTriangle, CheckCircle2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

type AlertLevel = "safe" | "warning" | "danger";

interface AlertState {
  level: AlertLevel;
  condition: string;
  confidence: number;
  timeToImpact: number;
  suggestedSpeed: number;
}

interface AlertDisplayProps {
  alert: AlertState;
}

export const AlertDisplay = ({ alert }: AlertDisplayProps) => {
  const getAlertStyles = () => {
    switch (alert.level) {
      case "danger":
        return {
          bg: "bg-alert-danger",
          text: "text-white",
          icon: AlertTriangle,
          animation: "animate-pulse-danger",
          glow: "shadow-[0_0_60px_hsl(0_100%_50%/0.6)]",
        };
      case "warning":
        return {
          bg: "bg-alert-warning",
          text: "text-black",
          icon: AlertCircle,
          animation: "animate-pulse-warning",
          glow: "shadow-[0_0_40px_hsl(45_100%_51%/0.5)]",
        };
      case "safe":
      default:
        return {
          bg: "bg-alert-safe",
          text: "text-white",
          icon: CheckCircle2,
          animation: "animate-pulse-safe",
          glow: "shadow-[0_0_30px_hsl(142_76%_50%/0.4)]",
        };
    }
  };

  const styles = getAlertStyles();
  const Icon = styles.icon;

  const getMessage = () => {
    switch (alert.level) {
      case "danger":
        return `STOP IMMEDIATELY — ${alert.condition.toUpperCase()} AHEAD!`;
      case "warning":
        return `SLOW DOWN — ${alert.condition} Ahead!`;
      case "safe":
      default:
        return `ROAD CLEAR — Proceed Safely`;
    }
  };

  return (
    <div
      className={cn(
        "rounded-2xl p-8 transition-all duration-300 animate-slide-in",
        styles.bg,
        styles.text,
        styles.animation,
        styles.glow
      )}
    >
      <div className="flex items-center gap-4">
        <div className="flex-shrink-0">
          <div className={cn(
            "w-20 h-20 rounded-full flex items-center justify-center",
            alert.level === "danger" ? "bg-white/20" : "bg-black/10"
          )}>
            <Icon className="w-10 h-10" />
          </div>
        </div>
        <div className="flex-1">
          <h2 className="text-3xl font-bold mb-2 tracking-tight">
            {getMessage()}
          </h2>
          {alert.confidence > 0 && (
            <div className="flex items-center gap-6 text-sm font-medium opacity-90">
              <div>Confidence: {(alert.confidence * 100).toFixed(0)}%</div>
              <div>•</div>
              <div>Time to Impact: {alert.timeToImpact.toFixed(1)}s</div>
              <div>•</div>
              <div>Suggested: {alert.suggestedSpeed} km/h</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
