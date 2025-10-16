// Detection service for road hazard identification
// Uses TensorFlow.js COCO-SSD model for object detection

type AlertLevel = "safe" | "warning" | "danger";

interface DetectionResult {
  condition: string;
  confidence: number;
  severity: AlertLevel;
}

// Hazard classification mapping
const HAZARD_CONDITIONS = {
  danger: [
    "animal", "person", "dog", "cat", "horse", "cow", "sheep",
    "fallen tree", "accident", "flood", "roadblock"
  ],
  warning: [
    "car", "truck", "bus", "motorcycle", "bicycle",
    "traffic light", "stop sign", "construction",
    "pothole", "debris", "cone"
  ],
};

export class DetectionService {
  private model: any = null;
  private isModelLoaded = false;

  constructor() {
    this.loadModel();
  }

  private async loadModel() {
    try {
      // Dynamically import TensorFlow.js and COCO-SSD
      const [tf, cocoSsd] = await Promise.all([
        import("@tensorflow/tfjs"),
        import("@tensorflow-models/coco-ssd")
      ]);

      // Set backend to WebGL for better performance
      await tf.setBackend("webgl");
      await tf.ready();

      console.log("Loading COCO-SSD model...");
      this.model = await cocoSsd.load({
        base: "lite_mobilenet_v2" // Faster, lighter model
      });
      this.isModelLoaded = true;
      console.log("Model loaded successfully");
    } catch (error) {
      console.error("Error loading model:", error);
      this.isModelLoaded = false;
    }
  }

  async detectHazards(canvas: HTMLCanvasElement): Promise<DetectionResult | null> {
    if (!this.isModelLoaded || !this.model) {
      return null;
    }

    try {
      // Run detection on the canvas
      const predictions = await this.model.detect(canvas);

      // Filter out person/face detections to ignore humans
      const nonHumanPredictions = predictions.filter(
        (pred: any) => !["person"].includes(pred.class.toLowerCase())
      );

      // Filter predictions by confidence threshold
      const validPredictions = nonHumanPredictions.filter(
        (pred: any) => pred.score >= 0.65
      );

      console.log("Valid predictions:", validPredictions.map((p: any) => ({ class: p.class, score: p.score })));

      // Focus on larger objects (likely from phone screen, not background)
      // Get center 60% of the frame (phone screen area when held up)
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const zoneWidth = canvas.width * 0.6;
      const zoneHeight = canvas.height * 0.6;

      // Filter detections in center zone and with significant size
      const minObjectSize = (canvas.width * canvas.height) * 0.05; // At least 5% of frame
      
      const centerDetections = validPredictions.filter((pred: any) => {
        const [x, y, width, height] = pred.bbox;
        const objCenterX = x + width / 2;
        const objCenterY = y + height / 2;
        const objectArea = width * height;

        const inCenterZone = (
          Math.abs(objCenterX - centerX) < zoneWidth / 2 &&
          Math.abs(objCenterY - centerY) < zoneHeight / 2
        );

        return inCenterZone && objectArea > minObjectSize;
      });

      console.log("Center detections:", centerDetections.map((p: any) => ({ class: p.class, score: p.score })));

      // Check for road/traffic-related objects for "Road Clear"
      const roadObjects = ["traffic light", "stop sign"];
      const hasRoadMarkers = centerDetections.some((pred: any) => 
        roadObjects.some(obj => pred.class.toLowerCase().includes(obj))
      );

      if (centerDetections.length === 0) {
        // Only return "Road Clear" if road markers are visible
        if (hasRoadMarkers) {
          return {
            condition: "Road Clear",
            confidence: 0.85,
            severity: "safe"
          };
        }
        // Otherwise return null (no alert)
        return null;
      }

      // Find highest confidence detection
      const topDetection = centerDetections.reduce((prev: any, current: any) => 
        (current.score > prev.score) ? current : prev
      );

      // Classify severity
      const label = topDetection.class.toLowerCase();
      let severity: AlertLevel = "safe";
      let condition = topDetection.class;

      // Check if it's a danger condition
      if (HAZARD_CONDITIONS.danger.some(hazard => label.includes(hazard))) {
        severity = "danger";
        condition = this.mapConditionName(label, "danger");
      } 
      // Check if it's a warning condition
      else if (HAZARD_CONDITIONS.warning.some(hazard => label.includes(hazard))) {
        severity = "warning";
        condition = this.mapConditionName(label, "warning");
      }

      return {
        condition,
        confidence: topDetection.score,
        severity
      };

    } catch (error) {
      console.error("Detection error:", error);
      return null;
    }
  }

  private mapConditionName(label: string, severity: string): string {
    const conditionMap: Record<string, string> = {
      // Danger mappings
      "person": "Pedestrian Crossing",
      "animal": "Animal on Road",
      "dog": "Animal on Road",
      "cat": "Animal on Road",
      "horse": "Animal on Road",
      "cow": "Animal on Road",
      
      // Warning mappings
      "car": "Slow Moving Traffic",
      "truck": "Heavy Vehicle Ahead",
      "bus": "Large Vehicle Ahead",
      "motorcycle": "Two Wheeler Ahead",
      "bicycle": "Cyclist Ahead",
      "traffic light": "Traffic Signal Ahead",
      "stop sign": "Stop Sign",
    };

    return conditionMap[label] || this.capitalize(label);
  }

  private capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  isReady(): boolean {
    return this.isModelLoaded;
  }
}
