import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { 
  Play, 
  Square, 
  Upload, 
  Camera, 
  Gauge,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Volume2,
  VolumeX,
  ArrowLeft
} from "lucide-react";
import { toast } from "sonner";
import { AlertDisplay } from "./AlertDisplay";
import { SpeedGauge } from "./SpeedGauge";
import { DetectionService } from "@/services/detectionService";

interface DashboardProps {
  onBack: () => void;
}

type AlertLevel = "safe" | "warning" | "danger";

interface AlertState {
  level: AlertLevel;
  condition: string;
  confidence: number;
  timeToImpact: number;
  suggestedSpeed: number;
}

export const Dashboard = ({ onBack }: DashboardProps) => {
  const [isActive, setIsActive] = useState(false);
  const [userSpeed, setUserSpeed] = useState(60);
  const [currentSpeed, setCurrentSpeed] = useState(0);
  const [distance, setDistance] = useState(200);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [alertState, setAlertState] = useState<AlertState>({
    level: "safe",
    condition: "Road Clear",
    confidence: 0,
    timeToImpact: 0,
    suggestedSpeed: 60,
  });

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const detectionServiceRef = useRef<DetectionService | null>(null);
  const animationFrameRef = useRef<number>();

  useEffect(() => {
    detectionServiceRef.current = new DetectionService();
    return () => {
      stopDetection();
    };
  }, []);

  const startWebcam = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: "user",
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
      });
      
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      setIsActive(true);
      setCurrentSpeed(userSpeed);
      toast.success("System Active", {
        description: "Camera initialized and detection started",
      });

      startDetection();
    } catch (error) {
      console.error("Camera access error:", error);
      toast.error("Camera Access Denied", {
        description: "Please allow camera permissions to use this feature",
      });
    }
  };

  const stopDetection = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    setIsActive(false);
    setCurrentSpeed(0);
    setAlertState({
      level: "safe",
      condition: "System Stopped",
      confidence: 0,
      timeToImpact: 0,
      suggestedSpeed: 0,
    });
  };

  const startDetection = () => {
    const detectFrame = async () => {
      if (!videoRef.current || !canvasRef.current || !detectionServiceRef.current) {
        return;
      }

      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");

      if (!ctx || video.readyState !== 4) {
        animationFrameRef.current = requestAnimationFrame(detectFrame);
        return;
      }

      // Set canvas dimensions
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Draw video frame
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Draw center detection zone
      const zoneWidth = canvas.width * 0.4;
      const zoneHeight = canvas.height * 0.6;
      const zoneX = (canvas.width - zoneWidth) / 2;
      const zoneY = (canvas.height - zoneHeight) / 2;

      ctx.strokeStyle = "rgba(34, 197, 94, 0.6)";
      ctx.lineWidth = 3;
      ctx.strokeRect(zoneX, zoneY, zoneWidth, zoneHeight);

      // Perform detection
      try {
        const result = await detectionServiceRef.current.detectHazards(canvas);
        
        if (result) {
          const timeToImpact = distance / ((currentSpeed * 1000) / 3600);
          
          let newAlertState: AlertState = {
            level: result.severity,
            condition: result.condition,
            confidence: result.confidence,
            timeToImpact,
            suggestedSpeed: result.severity === "danger" ? 0 : 
                           result.severity === "warning" ? Math.max(20, userSpeed * 0.5) : 
                           userSpeed,
          };

          setAlertState(newAlertState);

          // Adjust speed based on alert
          setCurrentSpeed(prev => {
            if (newAlertState.level === "danger") {
              return Math.max(0, prev - 5);
            } else if (newAlertState.level === "warning") {
              return Math.max(newAlertState.suggestedSpeed, prev - 2);
            } else {
              return Math.min(userSpeed, prev + 1);
            }
          });

          // Voice alert
          if (soundEnabled && result.confidence > 0.5) {
            speakAlert(newAlertState);
          }
        }
      } catch (error) {
        console.error("Detection error:", error);
      }

      animationFrameRef.current = requestAnimationFrame(detectFrame);
    };

    detectFrame();
  };

  const speakAlert = (alert: AlertState) => {
    if (!("speechSynthesis" in window)) return;

    const utterance = new SpeechSynthesisUtterance();
    
    if (alert.level === "danger") {
      utterance.text = `Stop immediately. ${alert.condition} ahead.`;
      utterance.rate = 1.2;
      utterance.pitch = 1.2;
    } else if (alert.level === "warning") {
      utterance.text = `Caution. ${alert.condition}. Reduce speed.`;
      utterance.rate = 1.0;
    } else {
      utterance.text = "Road clear. Proceed safely.";
      utterance.rate = 0.9;
    }

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    toast.info("File Upload", {
      description: "Processing uploaded file...",
    });

    // Handle image or video file
    const url = URL.createObjectURL(file);
    if (videoRef.current) {
      videoRef.current.src = url;
      await videoRef.current.play();
      startDetection();
      setIsActive(true);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-dashboard-bg to-background">
      {/* Header */}
      <div className="border-b border-border/50 bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={onBack}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-6 h-6 text-alert-danger" />
              <h1 className="text-2xl font-bold">Smart Road Safety System</h1>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              <Switch checked={soundEnabled} onCheckedChange={setSoundEnabled} />
              <span className="text-sm">Voice Alerts</span>
            </div>
            <div className="text-sm text-muted-foreground">
              {new Date().toLocaleTimeString()}
            </div>
          </div>
        </div>
      </div>

      {/* Main Dashboard */}
      <div className="container mx-auto px-6 py-6">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left: Video Feed */}
          <div className="lg:col-span-2 space-y-4">
            <AlertDisplay alert={alertState} />
            
            <Card className="p-4 bg-card/80 backdrop-blur-sm border-border/50">
              <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
                <video
                  ref={videoRef}
                  className="w-full h-full object-cover"
                  playsInline
                  muted
                />
                <canvas
                  ref={canvasRef}
                  className="absolute inset-0 w-full h-full"
                />
                {!isActive && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/80">
                    <div className="text-center space-y-4">
                      <Camera className="w-16 h-16 mx-auto text-muted-foreground" />
                      <p className="text-muted-foreground">Camera not active</p>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Right: Control Panel */}
          <div className="space-y-4">
            {/* Speed Gauge */}
            <Card className="p-6 bg-card/80 backdrop-blur-sm border-border/50">
              <SpeedGauge currentSpeed={currentSpeed} maxSpeed={userSpeed} />
            </Card>

            {/* Controls */}
            <Card className="p-6 bg-card/80 backdrop-blur-sm border-border/50 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="speed">Set Speed Cap (km/h)</Label>
                <Input
                  id="speed"
                  type="number"
                  value={userSpeed}
                  onChange={(e) => setUserSpeed(Number(e.target.value))}
                  min={0}
                  max={200}
                  disabled={isActive}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="distance">Distance to Obstacle (m)</Label>
                <Input
                  id="distance"
                  type="number"
                  value={distance}
                  onChange={(e) => setDistance(Number(e.target.value))}
                  min={10}
                  max={500}
                />
              </div>

              <div className="space-y-2">
                {!isActive ? (
                  <Button
                    onClick={startWebcam}
                    className="w-full h-12 bg-alert-safe hover:bg-alert-safe-glow"
                  >
                    <Play className="w-5 h-5 mr-2" />
                    Put on Drive
                  </Button>
                ) : (
                  <Button
                    onClick={stopDetection}
                    variant="destructive"
                    className="w-full h-12"
                  >
                    <Square className="w-5 h-5 mr-2" />
                    Stop System
                  </Button>
                )}

                <div className="relative">
                  <Input
                    type="file"
                    accept="image/*,video/*"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="file-upload"
                  />
                  <Button
                    onClick={() => document.getElementById("file-upload")?.click()}
                    variant="outline"
                    className="w-full"
                    disabled={isActive}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Image/Video
                  </Button>
                </div>
              </div>
            </Card>

            {/* Status Card */}
            <Card className="p-6 bg-card/80 backdrop-blur-sm border-border/50">
              <h3 className="font-semibold mb-4">Detection Status</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Condition:</span>
                  <span className="font-medium">{alertState.condition}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Confidence:</span>
                  <span className="font-medium">{(alertState.confidence * 100).toFixed(1)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Time to Impact:</span>
                  <span className="font-medium">{alertState.timeToImpact.toFixed(1)}s</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Suggested Speed:</span>
                  <span className="font-medium">{alertState.suggestedSpeed} km/h</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
