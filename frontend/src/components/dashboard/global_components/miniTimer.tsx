import { useTimer } from "@/context/useTimer";
import { useMemo } from "react";
import { TimerTypes } from "@/helpers/helpers";
import { Square, Pause, Play } from "lucide-react";

export default function MiniTimer() {
  const { status, workTime, breakTime, timerType, start, pause, stop } =
    useTimer();

  const active = status !== "idle";
  const paused = status === "paused";

  const handleStopPause = (type: "stop" | "pause") => {
    if (type === "stop") stop();
    else pause();
  };

  const display = useMemo(() => {
    const t = Math.max(
      0,
      Math.floor(timerType === TimerTypes.WORK ? workTime : breakTime)
    );
    const minutes = Math.floor((t % 3600) / 60);
    const seconds = t % 60;

    const mm = String(minutes).padStart(2, "0");
    const ss = String(seconds).padStart(2, "0");

    return (
      <p>
        {mm}:{ss}
      </p>
    );
  }, [workTime, breakTime, timerType]);

  // if timer is stopped do not show anything
  if (!active) {
    return;
  }

  return (
    <div className="bg-violet-100 rounded-full px-5 py-2 flex gap-4 items-center">
      <section>{display}</section>
      <section className="flex gap-2">
        <span
          title="Stop Timer"
          className="cursor-pointer"
          onClick={() => handleStopPause("stop")}
        >
          <Square strokeWidth={0} fill="#FF4C33" size={17} />
        </span>
        {paused ? (
          <span title="Reume Timer" className="cursor-pointer" onClick={start}>
            <Play fill="#00EB05" strokeWidth={0} size={17} />
          </span>
        ) : (
          <span
            title="Pause Timer"
            className="cursor-pointer"
            onClick={() => handleStopPause("pause")}
          >
            <Pause fill="#C9B900" strokeWidth={0} size={17} />
          </span>
        )}
      </section>
    </div>
  );
}
