import { useMemo } from "react";
import { TimerTypes } from "../productivity";

type TimerProps = {
  workTime: number;
  breakTime: number;
  timerType: TimerTypes;
}; // time in seconds

export default function Timer({ workTime, breakTime, timerType }: TimerProps) {
  const display = useMemo(() => {
    const t = Math.max(0, Math.floor(timerType === TimerTypes.WORK ? workTime : breakTime));
    const minutes = Math.floor((t % 3600) / 60);
    const seconds = t % 60;

    const mm = String(minutes).padStart(2, "0");
    const ss = String(seconds).padStart(2, "0");

    return (
      <p className="text-9xl">
        {mm}:{ss}
      </p>
    );
  }, [workTime, breakTime, timerType]);

  return (
    <div aria-label="elapsed time" className="flex items-center">
      {display}
    </div>
  );
}
