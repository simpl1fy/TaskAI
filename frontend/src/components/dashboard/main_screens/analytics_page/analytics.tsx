import { useAuth } from "@clerk/clerk-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";

interface TaskData {
  total: number;
  completed: number;
  incomplete: number;
  work_in_progress: number;
}

export default function Analytics () {

  const { getToken, isSignedIn } = useAuth();

  const [data, setData] = useState<TaskData>();
  const [reload, setReload] = useState<boolean>(false);

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      const token = await getToken();
      const baseUrl = import.meta.env.PUBLIC_BACKEND_URL;
      try {
        const response = await fetch(`${baseUrl}/analytics/data`, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`
          }
        })
        const resData = await response.json();

        console.log("Received Data = " + resData);

        setData(resData);
      } catch (err) {
        console.error("An error occured while fetching tasks number = " + err);
        toast.error("An error occured while fetching data. Please try again later!");
      }
    }

    if(isSignedIn) {
      fetchAnalyticsData();
    }
  }, [reload]);

  return (
    <div className="px-5 py-5">
      <header className="mb-5">
        <h3 className="text-2xl">Analytics</h3>
        <p className="text-gray-700 text-md">
          View stats, check your progress of work completed.
        </p>
      </header>
      <section className="grid grid-cols-3 gap-4">
        <div className="rounded-lg shadow-sm bg-green-100 p-3 shadow-green-200">
          <h3 className="text-lg font-bold">Tasks Completed: </h3>
          <span className="text-xl text-green-800">{data?.completed}/{data?.total}</span>
        </div>
        <div className="rounded-lg shadow-sm bg-yellow-100 p-3 shadow-yellow-200">
          <h3 className="text-lg font-bold">Tasks In Progress: </h3>
          <span className="text-xl text-yellow-800">{data?.work_in_progress}/{data?.total}</span>
        </div>
        <div className="rounded-lg shadow-sm bg-red-100 p-3 shadow-red-200">
          <h3 className="text-lg font-bold">Tasks Incomplete: </h3>
          <span className="text-xl text-red-800">{data?.incomplete}/{data?.total}</span>
        </div>
      </section>
    </div>
  )
}