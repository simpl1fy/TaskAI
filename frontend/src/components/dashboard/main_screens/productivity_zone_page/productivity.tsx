import { useState, useRef, useEffect } from "react";
import Timer from "./components/timer";
import TimerButtons from "./components/buttons";

export enum TimerTypes {
  WORK = "work",
  BREAK = "break",
}

export default function Productivity() {
  const [workTime, setWorkTime] = useState<number>(1797);
  const [breakTime, setBreakTime] = useState<number>(0);
  const [timerType, setTimerType] = useState<TimerTypes>(TimerTypes.WORK);
  const [active, setActive] = useState<boolean>(false);
  const [paused, setPaused] = useState<boolean>(false);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if ((workTime % 3600) / 60 === 30 || workTime === 30 * 60) {
      // 30 minutes -> Maximum productivity time
      setTimerType(TimerTypes.BREAK);
      setWorkTime(0);

      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }

      intervalRef.current = setInterval(() => {
        setBreakTime((prev) => prev + 1);
      }, 1000);
      // Add a backend call to store the data
    }

    if ((workTime % 3600) / 60 === 5 || breakTime === 5 * 60) {
      setTimerType(TimerTypes.WORK);
      setBreakTime(0);

      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }

      intervalRef.current = setInterval(() => {
        setWorkTime((prev) => prev + 1);
      }, 1000);
    }
  }, [workTime, breakTime]);

  const handleStartTimer = () => {
    setActive(true);
    setPaused(false);

    if (intervalRef.current) return;

    if (timerType === TimerTypes.WORK) {
      intervalRef.current = setInterval(() => {
        setWorkTime((prev) => prev + 1);
      }, 1000);
    } else {
      intervalRef.current = setInterval(() => {
        setBreakTime((prev) => prev + 1);
      }, 1000);
    }
  };

  const handleStopPauseTimer = (type: String) => {
    if (type === "stop") {
      setActive(false);
      setPaused(false);
      setWorkTime(0);
      setBreakTime(0);
      setTimerType(TimerTypes.WORK);
    }
    if (type === "pause") {
      setActive(true);
      setPaused(true);
    }
    if (!intervalRef.current) return;

    clearInterval(intervalRef.current);

    intervalRef.current = null;
  };

  return (
    <div className="px-5 py-5">
      <header>
        <h3 className="text-2xl">Productivity Zone</h3>
        <p className="text-gray-700 text-md">
          Start studying and working with POMODORO technique and boost your
          productivity
        </p>
      </header>
      <section className="flex flex-col items-center gap-10 mt-10">
        <Timer
          workTime={workTime}
          breakTime={breakTime}
          timerType={timerType}
        />
        <TimerButtons
          handleStart={handleStartTimer}
          active={active}
          paused={paused}
          handleStopPause={handleStopPauseTimer}
        />
      </section>
    </div>
  );
}
