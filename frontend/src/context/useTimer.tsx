import React, {
  createContext, useContext, useEffect, useMemo, useRef, useState
} from "react";
import {
  TimerTypes,
  breakNotifications,
  workNotifications,
  createNotification,
} from "@/helpers/helpers";
import { toast } from "sonner";
import { useAuth } from "@clerk/clerk-react";

type Status = "idle" | "running" | "paused";

type TimerContextValue = {
  status: Status;
  timerType: TimerTypes;
  workTime: number;                 // derived seconds (committed + live) in current WORK block
  breakTime: number;                // derived seconds in current BREAK block
  sessionIterations: number;        // +0.5 on each switch
  sessionTotalWorkTime: number;     // all WORK seconds this session (committed + live)
  start: () => void;
  pause: () => void;
  stop: () => void;
  toggle: () => void;
  formatHMS: (sec: number) => string;
};

const TimerContext = createContext<TimerContextValue | null>(null);

const WORK_LIMIT = 30 * 60; // 30:00
const BREAK_LIMIT = 5 * 60; // 05:00

const getNumber = (s: string | null, fallback: number) => {
  const n = Number(s);
  return Number.isFinite(n) && n >= 0 ? n : fallback;
};

const formatHMS = (sec: number) => {
  const t = Math.max(0, Math.floor(sec));
  const h = Math.floor(t / 3600);
  const m = Math.floor((t % 3600) / 60);
  const s = t % 60;
  const pad = (x: number) => String(x).padStart(2, "0");
  return `${pad(h)}:${pad(m)}:${pad(s)}`;
};

export function TimerProvider({ children }: { children: React.ReactNode }) {

  const { getToken } = useAuth();
  const baseUrl = import.meta.env.PUBLIC_BACKEND_URL;

  // Committed (accumulated) seconds for the *current* block
  const [workAccum, setWorkAccum]   = useState(() => getNumber(sessionStorage.getItem("work_time"), 0));
  const [breakAccum, setBreakAccum] = useState(() => getNumber(sessionStorage.getItem("break_time"), 0));

  // Session aggregates
  const [sessionWorkAccum, setSessionWorkAccum] =
    useState(() => getNumber(sessionStorage.getItem("session_total_work"), 0));
  const [sessionIterations, setSessionIterations] =
    useState(() => getNumber(sessionStorage.getItem("session_iterations"), 0));

  // State
  const [status, setStatus] = useState<Status>("idle");
  const [timerType, setTimerType] = useState<TimerTypes>(TimerTypes.WORK);

  // Timestamp for current live segment (null if paused/idle)
  const [startedAt, setStartedAt] = useState<number | null>(null);

  // Persist (optional—remove if you don’t want persistence)
  useEffect(() => sessionStorage.setItem("work_time", String(workAccum)), [workAccum]);
  useEffect(() => sessionStorage.setItem("break_time", String(breakAccum)), [breakAccum]);
  useEffect(() => sessionStorage.setItem("session_total_work", String(sessionWorkAccum)), [sessionWorkAccum]);
  useEffect(() => sessionStorage.setItem("session_iterations", String(sessionIterations)), [sessionIterations]);

  // 1s tick to refresh UI; time itself is derived from Date.now()
  const tickRef = useRef<number | null>(null);
  const [, force] = useState(0);
  useEffect(() => {
    if (status === "running" && !tickRef.current) {
      tickRef.current = window.setInterval(() => force(v => v + 1), 1000);
    }
    if (status !== "running" && tickRef.current) {
      clearInterval(tickRef.current);
      tickRef.current = null;
    }
    return () => {
      if (tickRef.current) {
        clearInterval(tickRef.current);
        tickRef.current = null;
      }
    };
  }, [status]);

  // Live seconds since start of current segment
  const liveSec = startedAt && status === "running"
    ? Math.floor((Date.now() - startedAt) / 1000)
    : 0;

  // Derived block times (committed + live)
  const workTime = useMemo(
    () => (timerType === TimerTypes.WORK ? workAccum + liveSec : workAccum),
    [timerType, workAccum, liveSec]
  );
  const breakTime = useMemo(
    () => (timerType === TimerTypes.BREAK ? breakAccum + liveSec : breakAccum),
    [timerType, breakAccum, liveSec]
  );

  // Session total (include live only during WORK)
  const sessionTotalWorkTime = useMemo(
    () => sessionWorkAccum + (timerType === TimerTypes.WORK ? liveSec : 0),
    [sessionWorkAccum, timerType, liveSec]
  );

  // Auto-switch logic
  useEffect(() => {
    if (status !== "running") return;

    // WORK -> BREAK
    if (timerType === TimerTypes.WORK && workTime >= WORK_LIMIT) {
      if (liveSec > 0) setSessionWorkAccum(v => v + liveSec); // commit live to session
      setWorkAccum(0);                                        // reset block
      setTimerType(TimerTypes.BREAK);
      setStartedAt(Date.now());                               // start break immediately
      setSessionIterations(i => i + 0.5);
      createNotification(breakNotifications[Math.floor(Math.random() * breakNotifications.length)]);
    }

    // BREAK -> WORK
    if (timerType === TimerTypes.BREAK && breakTime >= BREAK_LIMIT) {
      setBreakAccum(0);
      setTimerType(TimerTypes.WORK);
      setStartedAt(Date.now());                               // start work immediately
      setSessionIterations(i => i + 0.5);
      createNotification(workNotifications[Math.floor(Math.random() * workNotifications.length)]);
    }
  }, [status, timerType, workTime, breakTime, liveSec]);

  // Controls
  const start = () => {
  if (status === "running") return;
  const now = Date.now();
  setStatus("running");
  setStartedAt(now);
};

const pause = async () => {
  if (status !== "running" || !startedAt) {
    setStatus("paused");
    return;
  }

  const end = Date.now();

  // update local accumulators
  const sec = Math.floor((end - startedAt) / 1000);
  if (timerType === TimerTypes.WORK) {
    setWorkAccum(v => v + sec);
    setSessionWorkAccum(v => v + sec);
  } else {
    setBreakAccum(v => v + sec);
  }

  setStatus("paused");

  // call backend
  try {
    const token = await getToken();
    const payload = {
      startTime: startedAt,
      endTime: end,
    };
    const response = await fetch(`${baseUrl}/prod/add?type=stop`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    const resData = await response.json();
    if (!resData.success) toast.error("Error while saving time");
  } catch (err) {
    console.error("Pause error", err);
    toast.error("Error while saving time");
  }
  setStartedAt(null);
};

const stop = async () => {
  const end = Date.now();

  if (startedAt) {
    const sec = Math.floor((end - startedAt) / 1000);
    if (timerType === TimerTypes.WORK) {
      setSessionWorkAccum(v => v + sec);
    }
  }

  setStatus("idle");
  setTimerType(TimerTypes.WORK);
  setWorkAccum(0);
  setBreakAccum(0);

  try {
    const token = await getToken();
    const payload = {
      startTime: startedAt,
      endTime: end,
    };
    const response = await fetch(`${baseUrl}/prod/add?type=stop`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    const resData = await response.json();
    if (resData.success) toast.success("Work session saved!");
  } catch (err) {
    console.error("Stop error", err);
    toast.error("Error while saving time");
  }
  setStartedAt(null);
};

  const toggle = () => (status === "running" ? pause() : start());

  const value = useMemo<TimerContextValue>(() => ({
    status,
    timerType,
    workTime,
    breakTime,
    sessionIterations,
    sessionTotalWorkTime,
    start,
    pause,
    stop,
    toggle,
    formatHMS,
  }), [status, timerType, workTime, breakTime, sessionIterations, sessionTotalWorkTime]);

  return <TimerContext.Provider value={value}>{children}</TimerContext.Provider>;
}

export function useTimer() {
  const ctx = useContext(TimerContext);
  if (!ctx) throw new Error("useTimer must be used within <TimerProvider>");
  return ctx;
}
