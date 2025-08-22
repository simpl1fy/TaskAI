export function capitalizeFirst(v: string) {
    const t = v.charAt(0).toUpperCase() + v.slice(1);
    return t; 
}

export function createNotification(body: string) {
    return new Notification("TaskAI", { body: body });
}

export const breakNotifications = [
  "🎉 Great job! You've completed 30 minutes of focused work. Time to take a short break!",
  "✅ 30 minutes done! Step away for a quick break and recharge.",
  "⏳ Half an hour of productivity completed! Treat yourself to a short break.",
  "👏 Well done! You’ve worked for 30 minutes straight. Take 5 minutes to relax.",
  "⚡ Awesome focus! 30 minutes logged — time for a quick stretch.",
  "🌿 30 minutes of work completed! Pause for a short refresh.",
  "💡 You’ve been working for 30 minutes. A short break will keep your energy up!",
  "⏰ Break time! 30 minutes of solid work achieved.",
  "✨ Focus session complete — 30 minutes done! Take a short break before resuming.",
  "🚀 Productivity boost: You’ve worked 30 minutes nonstop. Now, recharge with a break."
];

export const workNotifications = [
  "💪 Break’s over! Let’s get back to another 30 minutes of focused work.",
  "🚀 Ready to dive in? Start your next 30-minute session now!",
  "⏰ Time to get back on track. Begin your next focus block.",
  "✨ Refreshed? Let’s crush the next 30 minutes of work!",
  "🔥 Break complete! Jump back into your workflow.",
  "📚 Time to focus again. Start your next productive session!",
  "🌟 Let’s build momentum — your next 30 minutes of work starts now.",
  "✅ Recharged and ready? Continue with your next focus session.",
  "⚡ Back to work mode! Another 30-minute sprint begins.",
  "👏 You’re doing great! Time to start the next work session."
];

export enum TimerTypes {
  WORK = "work",
  BREAK = "break",
}