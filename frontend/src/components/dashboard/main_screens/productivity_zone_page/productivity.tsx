import { useState, useRef, useEffect, useMemo } from "react";
import Timer from "./components/timer";
import TimerButtons from "./components/buttons";
import { useTimer } from "@/context/useTimer";


const getNumber = (s: string | null, fallback: number) => {
  const n = Number(s);
  return Number.isFinite(n) && n >= 0 ? n : fallback;
};

export default function Productivity() {
  
  const {
    status, timerType, workTime, breakTime,
    start, pause, stop,
    sessionIterations, sessionTotalWorkTime, formatHMS
  } = useTimer();

  const active = status !== "idle";
  const paused = status === "paused";

  const handleStart = () => start();
  const handleStopPause = (type: "stop" | "pause") => {
    if (type === "pause") pause();
    else stop();
  };

  const timeDisplay = useMemo(() => formatHMS(sessionTotalWorkTime), [sessionTotalWorkTime]);

  return (
    <div className="px-5 py-5">
      <header>
        <h3 className="text-2xl">Productivity Zone</h3>
        <p className="text-gray-700 text-md">
          Start studying and working with POMODORO technique and boost your productivity
        </p>
      </header>

      <div className="grid grid-cols-4">
        <section className="flex flex-col items-center gap-10 mt-10 col-span-3">
          <Timer workTime={workTime} breakTime={breakTime} timerType={timerType} />
          <TimerButtons
            handleStart={handleStart}
            active={active}
            paused={paused}
            handleStopPause={handleStopPause}
          />
        </section>

        <div className="shadow-sm rounded-lg p-4 col-span-1">
          <div className="text-gray-700">
            Iterations this session: <span className="font-bold text-black">{Math.floor(sessionIterations)}</span>
          </div>
          <div className="text-gray-700">
            Time spent in session: <span className="font-bold text-black">{timeDisplay}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
