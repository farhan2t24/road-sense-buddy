import { Button } from "@/components/ui/button";
import { Car, Play, Gauge, AlertTriangle } from "lucide-react";

interface HomeScreenProps {
  onStartCar: () => void;
}

export const HomeScreen = ({ onStartCar }: HomeScreenProps) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-dashboard-bg to-background p-6">
      <div className="max-w-4xl w-full">
        {/* Header */}
        <div className="text-center mb-12 space-y-4">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-alert-danger to-alert-warning flex items-center justify-center shadow-[0_0_40px_hsl(0_100%_50%/0.4)]">
              <AlertTriangle className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-6xl font-bold tracking-tight bg-gradient-to-r from-primary via-alert-warning to-alert-danger bg-clip-text text-transparent">
            Smart Road Safety System
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            AI-powered driver assistance with real-time hazard detection and intelligent alerts
          </p>
        </div>

        {/* Main Control Panel */}
        <div className="bg-card border border-border rounded-2xl p-8 shadow-2xl">
          <div className="grid gap-6">
            {/* Start Car Button */}
            <Button
              onClick={onStartCar}
              size="lg"
              className="h-24 text-2xl font-bold bg-gradient-to-r from-alert-danger to-alert-warning hover:from-alert-danger-glow hover:to-alert-warning-glow shadow-[0_0_30px_hsl(0_100%_50%/0.3)] hover:shadow-[0_0_50px_hsl(0_100%_50%/0.5)] transition-all duration-300"
            >
              <Car className="w-8 h-8 mr-3" />
              Start Car
            </Button>

            {/* Feature Cards */}
            <div className="grid md:grid-cols-3 gap-4 mt-4">
              <div className="bg-dashboard-panel rounded-xl p-6 border border-border/50">
                <div className="w-12 h-12 rounded-lg bg-alert-danger/20 flex items-center justify-center mb-4">
                  <Play className="w-6 h-6 text-alert-danger" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Real-time Detection</h3>
                <p className="text-sm text-muted-foreground">
                  AI analyzes your road ahead using webcam feed
                </p>
              </div>

              <div className="bg-dashboard-panel rounded-xl p-6 border border-border/50">
                <div className="w-12 h-12 rounded-lg bg-alert-warning/20 flex items-center justify-center mb-4">
                  <AlertTriangle className="w-6 h-6 text-alert-warning" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Smart Alerts</h3>
                <p className="text-sm text-muted-foreground">
                  Color-coded warnings with voice guidance
                </p>
              </div>

              <div className="bg-dashboard-panel rounded-xl p-6 border border-border/50">
                <div className="w-12 h-12 rounded-lg bg-alert-safe/20 flex items-center justify-center mb-4">
                  <Gauge className="w-6 h-6 text-alert-safe" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Speed Control</h3>
                <p className="text-sm text-muted-foreground">
                  Automatic braking simulation for safety
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Info Footer */}
        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground">
            Privacy-first design • All processing happens in your browser • No data sent to servers
          </p>
        </div>
      </div>
    </div>
  );
};
