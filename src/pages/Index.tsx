import { useState } from "react";
import { HomeScreen } from "@/components/HomeScreen";
import { Dashboard } from "@/components/Dashboard";

const Index = () => {
  const [isStarted, setIsStarted] = useState(false);

  return (
    <div className="min-h-screen">
      {!isStarted ? (
        <HomeScreen onStartCar={() => setIsStarted(true)} />
      ) : (
        <Dashboard onBack={() => setIsStarted(false)} />
      )}
    </div>
  );
};

export default Index;
