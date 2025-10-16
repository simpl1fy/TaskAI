import { useState, useMemo } from "react";
import Timer from "./components/timer";
import TimerButtons from "./components/buttons";
import { useTimer } from "@/context/useTimer";

export default function Productivity() {
  const {
    status,
    timerType,
    workTime,
    breakTime,
    start,
    pause,
    stop,
    sessionIterations,
    sessionTotalWorkTime,
    formatHMS,
  } = useTimer();

  const [pomodoroHover, setPomodoroHover] = useState(false);

  const active = status !== "idle";
  const paused = status === "paused";

  const handleStart = () => start();
  const handleStopPause = (type: "stop" | "pause") => {
    if (type === "pause") pause();
    else stop();
  };

  const timeDisplay = useMemo(
    () => formatHMS(sessionTotalWorkTime),
    [sessionTotalWorkTime]
  );

  return (
    <div className="px-5 py-5">
      <header>
        <h3 className="text-2xl">Productivity Zone</h3>
        <p className="text-gray-700 text-md">
          Start studying and working with{" "}
          <span
            className="underline bg-amber-100 text-black decoration-blue-500 relative"
            onPointerEnter={() => setPomodoroHover(true)}
            onPointerLeave={() => setPomodoroHover(false)}
          >
            <span className="cursor-pointer">POMODORO</span>
            {pomodoroHover && (
              <div className="absolute left-0 top-4 shadow-sm p-2 rounded-md min-w-sm">
                <p className="text-xs">
                  The Pomodoro Technique is a time-management method that uses a
                  timer to break work into 25-minute intervals, called
                  "pomodoros," separated by short 5-minute breaks.{" "}
                  <a
                    href="https://en.wikipedia.org/wiki/Pomodoro_Technique"
                    className="text-blue-500 cursor-pointer"
                    target="_blank"
                  >
                    Read More
                  </a>
                </p>
              </div>
            )}
          </span>{" "}
          technique and boost your productivity
        </p>
      </header>

      <div className="flex justify-center items-center">
        <section className="flex flex-col items-center gap-10 mt-10 mb-10">
          <Timer
            workTime={workTime}
            breakTime={breakTime}
            timerType={timerType}
          />
          <TimerButtons
            handleStart={handleStart}
            active={active}
            paused={paused}
            handleStopPause={handleStopPause}
          />
        </section>
      </div>

      <div className="shadow-sm rounded-lg p-4 max-h-fit max-w-fit">
        <div className="text-gray-700">
          Iterations this session:{" "}
          <span className="font-bold text-black">
            {Math.floor(sessionIterations)}
          </span>
        </div>
        <div className="text-gray-700">
          Time spent in session:{" "}
          <span className="font-bold text-black">{timeDisplay}</span>
        </div>
      </div>
    </div>
  );
}
