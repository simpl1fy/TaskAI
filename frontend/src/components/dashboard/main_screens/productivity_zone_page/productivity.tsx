import { useState, useRef, useEffect, useMemo } from "react";
import Timer from "./components/timer";
import TimerButtons from "./components/buttons";
import { breakNotifications, workNotifications, createNotification } from "@/helpers/helpers";

export enum TimerTypes {
  WORK = "work",
  BREAK = "break",
}

const getNumber = (s: string | null, fallback: number) => {
  const n = Number(s);
  return Number.isFinite(n) && n >= 0 ? n : fallback;
};

export default function Productivity() {
  const [workTime, setWorkTime]   = useState<number>(getNumber(localStorage.getItem("work_time"), 29 * 60));
  const [breakTime, setBreakTime] = useState<number>(getNumber(localStorage.getItem("break_time"), 4 * 60));

  const [timerType, setTimerType] = useState<TimerTypes>(TimerTypes.WORK);
  const [active, setActive] = useState<boolean>(false);
  const [paused, setPaused] = useState<boolean>(false);
  const [notificationGranted, setNotificationGranted] = useState(Notification.permission);
  const [sessionIterations, setSessionIterations] = useState<number>(0);
  const [sessionTotalWorkTime, setSessionTotalWorkTime] = useState<number>(0);

  const intervalRef = useRef<number | null>(null);
  const clearTick = () => {
    if (intervalRef.current !== null) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  useEffect(() => {
    localStorage.setItem("work_time", String(workTime));
  }, [workTime]);
  useEffect(() => {
    localStorage.setItem("break_time", String(breakTime));
  }, [breakTime]);

  // Ask for notifications once
  useEffect(() => {
    if (notificationGranted === "default" || notificationGranted === "denied") {
      Notification.requestPermission().then(setNotificationGranted).catch(() => {});
    }
  }, []);

  // Clean up on unmount
  useEffect(() => () => clearTick(), []);


  useEffect(() => {
    if (!active || paused) return;

    // Work (30:00) -> Break
    if ((workTime % 3600) / 60 === 30 || workTime === 30 * 60) {
      setTimerType(TimerTypes.BREAK);
      setWorkTime(0);
      clearTick();

      intervalRef.current = window.setInterval(() => {
        setBreakTime((prev) => prev + 1);
      }, 1000);

      const body = breakNotifications[Math.floor(Math.random() * breakNotifications.length)];
      createNotification(body);

      setSessionIterations((prev) => prev + 0.5);
    }

    if ((breakTime % 3600) / 60 === 5 || breakTime === 5 * 60) {
      setTimerType(TimerTypes.WORK);
      setBreakTime(0);
      clearTick();

      intervalRef.current = window.setInterval(() => {
        setWorkTime((prev) => prev + 1);
        setSessionTotalWorkTime((prev) => prev + 1);
      }, 1000);

      const body = workNotifications[Math.floor(Math.random() * workNotifications.length)];
      createNotification(body);

      setSessionIterations((prev) => prev + 0.5);
    }
  }, [active, paused, workTime, breakTime]);

  const handleStartTimer = () => {
    setActive(true);
    setPaused(false);

    // If a stale interval exists, clear it so we can start fresh
    clearTick();

    if (timerType === TimerTypes.WORK) {
      intervalRef.current = window.setInterval(() => {
        setWorkTime((prev) => prev + 1);
        setSessionTotalWorkTime((prev) => prev + 1);
      }, 1000);
    } else {
      intervalRef.current = window.setInterval(() => {
        setBreakTime((prev) => prev + 1);
      }, 1000);
    }
  };

  const handleStopPauseTimer = (type: string) => {
    if (type === "stop") {
      setActive(false);
      setPaused(false);
      setWorkTime(0);
      setBreakTime(0);
      setTimerType(TimerTypes.WORK);
      clearTick();
      return;
    }

    if (type === "pause") {
      setActive(true);
      setPaused(true);
      clearTick(); // important: allow Start to create a new interval
    }
  };

  // session time display
  const timeDisplay = useMemo(() => {
    const t = Math.max(0, Math.floor(sessionTotalWorkTime));
    const hours = Math.floor(t / 3600);
    const minutes = Math.floor((t % 3600) / 60);
    const seconds = t % 60;
    const hh = String(hours).padStart(2, "0");
    const mm = String(minutes).padStart(2, "0");
    const ss = String(seconds).padStart(2, "0");
    return <span>{hh}:{mm}:{ss}</span>;
  }, [sessionTotalWorkTime]);

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
            handleStart={handleStartTimer}
            active={active}
            paused={paused}
            handleStopPause={handleStopPauseTimer}
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
