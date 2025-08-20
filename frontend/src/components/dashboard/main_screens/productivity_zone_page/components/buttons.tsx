import { Button } from "@/components/ui/button";
import { Timer } from "lucide-react";

interface PropTypes {
  handleStart: () => void;
  active: boolean;
  paused: boolean;
  handleStopPause: (type: String) => void; // accepted inputs -> "pause" / "stop"
}

export default function TimerButtons({
  handleStart,
  active,
  paused,
  handleStopPause
}: PropTypes) {

  return (
    <div className="flex justify-center">
      {!active && (
        <Button className="bg-green-600 hover:bg-green-700 cursor-pointer transition-colors duration-200" onClick={handleStart}>
          <Timer />
          Start Timer
        </Button>
      )}
      {active && (
        <div className="flex gap-4">
          <Button className="bg-red-600 hover:bg-red-700 transition-colors duration-200" onClick={() => handleStopPause("stop")}>
            Stop Timer
          </Button>
          {paused ? (
            <Button className="bg-yellow-600 hover:bg-yellow-700 cursor-pointer transition-colors duration-200" onClick={handleStart}>
              Resume Timer
            </Button>
          ) : (
            <Button className="bg-yellow-600 hover:bg-yellow-700 cursor-pointer transition-colors duration-200" onClick={() => handleStopPause("pause")}>
              Pause Timer
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
