import AITextArea from "./components/AITextArea";
import TaskList from "./components/TaskList";
import { useState } from "react";

export default function Home() {
  const [isUpdated, setIsUpdated] = useState(false);
  return (
    <div className="py-5 px-5">
      <header className="mb-5">
        <h3 className="text-2xl">Dashboard</h3>
        <p className="text-gray-700 text-md">
          Generate and manage your AI-powered tasks
        </p>
      </header>
      <section className="mb-5">
        <AITextArea setListUpdated={setIsUpdated} />
      </section>
      <section>
        <TaskList listUpdated={isUpdated} setListUpdated={setIsUpdated} />
      </section>
    </div>
  );
}
