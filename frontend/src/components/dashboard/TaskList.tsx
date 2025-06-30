import React, { useState, useEffect } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import { toast } from 'sonner';
import CreateList from './CreateList';
import ManageCategories from './ManageCategories';
import { useAuth } from '@clerk/clerk-react';
import DropDown from './DropDown';
import { Button } from '../ui/button';
import { Skeleton } from '../ui/skeleton';
import Masonry from "react-masonry-css";
import { Command } from 'lucide-react';
import { capitalizeFirst } from '@/helpers/capitalizeFirst';

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

type CategoryType = {
  id: number;
  name: string;
}

const TaskList = ({ listUpdated, setListUpdated }: PropTypes) => {

  const [data, setData] = useState<GroupedTaskList[]>([]);
  const [createModal, setCreateModal] = useState(false);
  const [manageCategoriesModal, setManageCategoriesModal] = useState(false);
  const [dataLoading, setDataLoading] = useState(false);
  const [categories, setCategories] = useState<CategoryType[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>({
    id: -1,
    name: "All"
  });

  const { getToken } = useAuth();
  
  useEffect(() => {
    const fetchTaskList = async () => {
      try {
        setDataLoading(true);
        const baseUrl = import.meta.env.PUBLIC_BACKEND_URL;
        const fetchedToken = await getToken();
        const response = await fetch(`${baseUrl}/task/all_lists/${selectedCategory.id}`, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${fetchedToken}`,
            'Content-type': "application/json"
          }
        });

        const data = await response.json();
        
        if(data.success) {
          setData(data.allTasks)
        } else {
          toast.error("Failed to fetch your tasks. Please try again later!");
        }
        setDataLoading(false);
      } catch(err) {
        console.error("An error occured while fetching tasks =", err);
        setDataLoading(false);
      }
    }
    fetchTaskList();
  }, [listUpdated, selectedCategory]);

  useEffect(() => {
      const fetchCategories = async () => {
        try {
          const token = await getToken();
          const baseURL = import.meta.env.PUBLIC_BACKEND_URL;
          const res = await fetch(`${baseURL}/category/get_all`, {
            method: "GET",
            headers: {
              "Content-type": "application/json",
              "Authorization": `Bearer ${token}`
            }
          });
          const data = await res.json();
          console.log("Categories received =", data);
          if(data.success) {
            setCategories(data.data);
          } else {
            toast.error(data.message);
          }
        } catch (err) {
          console.error("An error occured while fetching categories", err);
          toast.error("Could not fetch categories. Please try again later!");
        }
      }
      
      fetchCategories();
      
    }, [])

  const handleChange = async (listIndex:number, taskIndex:number, taskId: number) => {
    const newData = [...data];
    const task = newData[listIndex].tasks[taskIndex];
    const status = !task.taskStatus;
    task.taskStatus = status;
    setData(newData);

    try {

      const token = await getToken();
      
      const baseUrl = import.meta.env.PUBLIC_BACKEND_URL;
      const response = await fetch(`${baseUrl}/task/update_status`, {
        method: "PATCH",
        headers: {
          'Content-type': 'Application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ taskId: taskId, status: status })
      })

      const data = await response.json();
      if(data.success) {
        toast.success(data.message);
      } else {
        task.taskStatus = !task.taskStatus;
        setData(newData);
        toast.error("Failed to update task. Please try again later!");
      }
    } catch(err) {
      console.error(err);
    }
  }

  const handleKeyDown = (event: KeyboardEvent) => {
    if(event.ctrlKey && event.code === "KeyK") {
      event.preventDefault();
      setCreateModal(true);
    }
  }

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
  
    return () => {
      document.removeEventListener("keydown", handleKeyDown);

    }
  }, []);

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = Number(e.target.value);
    console.log(selectedId);
    if(selectedId === -2) {
      setManageCategoriesModal(true);
      return;
    }
    const selected = categories?.find(cat => cat.id === selectedId);
    if(selected) {
      setSelectedCategory(selected);
    } else {
      setSelectedCategory({ id: -1, name: "All" });
    }
  }

  const breakPointColumnsObj = {
    default: 4,
    1100: 3,
    700: 2,
    500: 1
  }

  return (
    <div className="shadow-lg p-4 sm:p-6 rounded-lg bg-white w-full shadow-md">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
        <h3 className="text-xl sm:text-2xl font-bold">Your Tasks</h3>
        <div>
          <select
            className="border border-1 p-2 rounded-md mr-3"
            value={selectedCategory?.id}
            onChange={handleSelectChange}
          >
            <option value={-1}>All tasks</option>
            {categories && categories.map((value,_) => (
              <option key={value.id} value={value.id}>{capitalizeFirst(value.name)}</option>
            ))}
            <hr/>
            <option value={-2}>Manage Categories</option>
          </select>
          <Button
            className="cursor-pointer bg-gray-200 hover:bg-gray-300 text-black w-full sm:w-auto"
            onClick={() => setCreateModal(true)}
          >
            <span className="flex items-center gap-4">Create your own List<kbd className='text-sm flex items-center'><Command className='size-3' /><span>+K</span></kbd></span>
          </Button>
        </div>
      </header>
  
      {dataLoading ?
        (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 p-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="rounded-2xl shadow-sm border p-4">
                <Skeleton className="w-full aspect-square rounded-xl" />
                <div className="space-y-2 mt-4">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        )
        :
        (
          <div>
            <Masonry
              breakpointCols={breakPointColumnsObj}
              className="flex w-auto -ml-4"
              columnClassName="pl-4 bg-clip-padding"
            >
              {data.length > 0 && data.map((value, index) => (
                <div
                  key={index}
                  className="border rounded-md p-4 bg-white overflow-y-auto min-h-fit max-h-90 min-w-50 shadow-md mb-5"
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
            </Masonry>
            {data.length === 0 && <p className='text-sm text-gray-700'>No task lists created yet. Create a list yourself or use AI to generate one.</p>}
          </div>
        )
      }
  
      <CreateList
        isUpdated={setListUpdated}
        open={createModal}
        setOpen={setCreateModal}
      />
      <ManageCategories
        open={manageCategoriesModal}
        setOpen={setManageCategoriesModal}
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
