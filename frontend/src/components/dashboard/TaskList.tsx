import React, { useState, useEffect } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import { toast } from 'sonner';
import CreateList from './CreateList';
import { useAuth } from '@clerk/clerk-react';
import DropDown from './DropDown';
import { Button } from '../ui/button';

type TaskItem = {
  taskId: number;
  taskTitle: string;
  taskStatus: boolean | undefined;
}

type GroupedTaskList = {
  listId: number;
  listTitle: string;
  createdAt: string;
  tasks: TaskItem[];
}

type PropTypes = {
  listUpdated: boolean;
  setListUpdated: Dispatch<SetStateAction<boolean>>
}

const TaskList = ({ listUpdated, setListUpdated }: PropTypes) => {

  const [data, setData] = useState<GroupedTaskList[]>([]);
  const [createModal, setCreateModal] = useState(false);

  const { getToken } = useAuth();

  useEffect(() => {
    const fetchTaskList = async () => {
      const fetchedToken = await getToken();
      const response = await fetch("http://localhost:3000/task/all_lists", {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${fetchedToken}`,
          'Content-type': "application/json"
        }
      });

      const data = await response.json();

      if(data.success) {
        setData(data.allTasks)
      }
    }
    fetchTaskList();
  }, [listUpdated])

  const handleChange = async (listIndex:number, taskIndex:number, taskId: number) => {
    const newData = [...data];
    const task = newData[listIndex].tasks[taskIndex];
    const status = !task.taskStatus;
    task.taskStatus = status;
    setData(newData);

    try {

      const token = await getToken();

      const response = await fetch("http://localhost:3000/task/update_status", {
        method: "PATCH",
        headers: {
          'Content-type': 'Application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ taskId: taskId, status: status })
      })

      const data = await response.json();
      if(data.success) {
        toast(data.message);
      } else {
        task.taskStatus = !task.taskStatus;
        setData(newData);
        alert(data.message);
      }
    } catch(err) {
      console.error(err);
    }
  }

  return (
    <div className="shadow-lg p-4 sm:p-6 rounded-lg bg-white w-full max-w-6xl mx-auto">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
        <h3 className="text-xl sm:text-2xl font-bold">Your Tasks</h3>
        <Button
          className="cursor-pointer bg-gray-200 hover:bg-gray-300 text-black w-full sm:w-auto"
          onClick={() => setCreateModal(true)}
        >
          Create your own List
        </Button>
      </header>
  
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {data.map((value, index) => (
          <div
            key={index}
            className="border border-gray-300 rounded-md p-4 bg-white overflow-y-auto min-h-64 max-h-64"
          >
            <header className="flex justify-between mb-2">
              <h4 className="text-base sm:text-lg font-semibold">
                {value.listTitle}
              </h4>
              <DropDown id={value.listId} isUpdated={setListUpdated} />
            </header>
            {value.tasks.map((tValue, tIndex) => (
              <label
                key={tIndex}
                className="flex items-center gap-2 mb-2 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={tValue.taskStatus}
                  onChange={() => handleChange(index, tIndex, tValue.taskId)}
                />
                <span
                  className={`text-sm sm:text-base ${
                    tValue.taskStatus ? 'line-through text-gray-400' : 'text-gray-800'
                  }`}
                >
                  {tValue.taskTitle}
                </span>
              </label>
            ))}
          </div>
        ))}
      </section>
  
      <CreateList
        isUpdated={setListUpdated}
        open={createModal}
        setOpen={setCreateModal}
      />
    </div>
  )  
}

export default TaskList;

// {
//   "success": true,
//   "allTasks": [
//       {
//           "listId": 2,
//           "listTitle": "Title",
//           "createdAt": "2025-05-17T13:07:03.951Z",
//           "tasks": [
//               {
//                   "taskId": 1,
//                   "taskTitle": "Task 1",
//                   "taskStatus": false
//               },
//               {
//                   "taskId": 2,
//                   "taskTitle": "Task 2",
//                   "taskStatus": false
//               }
//           ]
//       },
//       {
//           "listId": 3,
//           "listTitle": "New Task List",
//           "createdAt": "2025-05-17T14:21:31.436Z",
//           "tasks": [
//               {
//                   "taskId": 3,
//                   "taskTitle": "Task 2",
//                   "taskStatus": false
//               }
//           ]
//       }
//   ]
// }
