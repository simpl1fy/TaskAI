import { useAuth } from "@clerk/clerk-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Gauge, gaugeClasses } from "@mui/x-charts/Gauge";

interface TaskData {
  total: number;
  completed: number;
  incomplete: number;
  work_in_progress: number;
}

export default function Analytics() {
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
            Authorization: `Bearer ${token}`,
          },
        });
        const resData = await response.json();

        console.log("Received Data = " + resData);

        setData(resData);
      } catch (err) {
        console.error("An error occured while fetching tasks number = " + err);
        toast.error(
          "An error occured while fetching data. Please try again later!"
        );
      }
    };

    if (isSignedIn) {
      fetchAnalyticsData();
    }
  }, [reload]);

  if (!data) {
    return (
      <div className="p-5">
        <header className="mb-5">
          <h3 className="text-2xl">Analytics</h3>
          <p className="text-gray-700 text-md">
            View stats, check your progress of work completed.
          </p>
        </header>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="px-5 py-5">
      <header className="mb-5">
        <h3 className="text-2xl">Analytics</h3>
        <p className="text-gray-700 text-md">
          View stats, check your progress of work completed.
        </p>
      </header>
      <section className="grid grid-cols-2 gap-4">
        <div className="flex flex-col items-center">
          <h3 className="font-semibold font-lg">Completed Tasks</h3>
          <Gauge
            value={data?.completed}
            valueMax={data?.total}
            height={250}
            cornerRadius="50%"
            startAngle={-150}
            endAngle={150}
            text={({ value, valueMax }) => `${value}/${valueMax}`}
            sx={(theme) => ({
              [`& .${gaugeClasses.valueText}`]: {
                fontSize: 30,
              },
              [`& .${gaugeClasses.valueArc}`]: {
                fill: "#00c950",
              },
              [`& .${gaugeClasses.referenceArc}`]: {
                fill: '#f0fdf4',
              },
            })}
          />
        </div>
        <div className="flex flex-col items-center">
          <h3 className="font-semibold font-lg">In Progress</h3>
          <Gauge
            value={data.work_in_progress}
            valueMax={data?.total - data?.completed}
            height={250}
            cornerRadius="50%"
            startAngle={-150}
            endAngle={150}
            text={({ value, valueMax }) => `${value}/${valueMax}`}
            sx={(theme) => ({
              [`& .${gaugeClasses.valueText}`]: {
                fontSize: 30,
              },
              [`& .${gaugeClasses.valueArc}`]: {
                fill: "#f0b100",
              },
              [`& .${gaugeClasses.referenceArc}`]: {
                fill: '#fef9c2',
              },
            })}
          />
        </div>
        <div className="col-span-2 flex flex-col items-center">
          <h3 className="font-semibold font-lg">Incomplete</h3>
          <Gauge
            value={data.incomplete}
            valueMax={data?.total-data.completed}
            height={250}
            cornerRadius="50%"
            startAngle={-150}
            endAngle={150}
            text={({ value, valueMax }) => `${value}/${valueMax}`}
            sx={(theme) => ({
              [`& .${gaugeClasses.valueText}`]: {
                fontSize: 30,
              },
              [`& .${gaugeClasses.valueArc}`]: {
                fill: "#fb2c36",
              },
              [`& .${gaugeClasses.referenceArc}`]: {
                fill: '#ffe2e2',
              },
            })}
          />
        </div>
      </section>
    </div>
  );
}
