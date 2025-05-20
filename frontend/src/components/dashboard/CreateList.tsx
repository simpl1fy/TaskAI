import React, { useEffect, useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import { Button } from "../ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogClose,
  } from "@/components/ui/dialog";
import { Input } from "../ui/input";
import { Trash } from "lucide-react";
import { useAuth } from "@clerk/clerk-react";
import { toast } from "sonner";
import { LoaderCircle } from "lucide-react";

type PropTypes = {
  isUpdated: Dispatch<SetStateAction<boolean>>;
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  listTitle?: string;
  taskArray?: string[]
}

const CreateList = ({ isUpdated, open, setOpen, listTitle, taskArray }: PropTypes) => {

  const { getToken } = useAuth();
  const [title, setTitle] = useState("");
  const [taskList, setTaskList] = useState([""]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if(listTitle && listTitle.trim() !== "") {
      setTitle(listTitle);
    }
    if(Array.isArray(taskArray) && taskArray.length > 0) {
      setTaskList(taskArray);
    }
  }, [listTitle, taskArray]);

  const handleTaskChange = (index: number, value: string) => {
    const updatedTaskList = [...taskList];
    updatedTaskList[index] = value;
    setTaskList(updatedTaskList);
  }

  const addTask = () => {
    setTaskList([...taskList, ""]);
  }

  const deleteTask = (index: number) => {
    const updatedTaskList = taskList.filter((_, i) => i !== index);
    setTaskList(updatedTaskList);
  }

  const handleSubmit = async () => {

    setLoading(true);
    const fetchedToken = await getToken();

    if(!fetchedToken) {
      alert("User not authenticated. Please login first");
      return;
    }

    console.log(Array.isArray(taskList));
    console.log(taskList);
    const baseUrl = import.meta.env.PUBLIC_BACKEND_URL;
    try {
      const res = await fetch(`${baseUrl}/task/add_list`, {
        method: "POST",
        headers: {
          'Content-type': "application/json",
          'Authorization': `Bearer ${fetchedToken}`
        },
        body: JSON.stringify({ title: title, tasksArray: taskList })
      })
      const data = await res.json();
      if(!data.success) {
        toast.error(data.message);
      } else {
        toast.success(data.message);
        isUpdated((prev) => !prev);
        setOpen(false);
      }
      setLoading(false);
    } catch(err) {
      console.error(err);  
      toast.error("Failed to create list!");
      setLoading(false);
    }
  }

  return (
    <div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-128 overflow-y-auto">

          {/* Header Component */}
          <DialogHeader>
            <DialogTitle>Create your task list</DialogTitle>
            <DialogDescription>Create or edit your list of tasks</DialogDescription>
          </DialogHeader>

          {/* Body */}
          <div className="flex flex-col">
            <label htmlFor="title">Title</label>
            <Input type="text" placeholder="Title of this list" value={title} onChange={(e) => setTitle(e.target.value)} className="selection:bg-blue-500 selection:text-white" />
          </div>
          <h3 className="text-lg">Add Tasks</h3>
          {taskList.map((task, index) => (
            <div key={index} className="flex w-full gap-2">
              <Input
                type="text"
                placeholder={`Task ${index+1}`}
                value={task}
                onChange={(e) => handleTaskChange(index, e.target.value)}
                className="selection:bg-blue-500 selection:text-white"
              />
              {index === taskList.length-1 &&
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={addTask}
                >
                  +
                </Button>
              }
              {taskList.length > 1 &&
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => deleteTask(index)}
                >
                  <Trash />
                </Button>
              }
            </div>
          ))}

          {/* Footer */}
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="destructive" className="cursor-pointer" onClick={() => {setTaskList([""]); setTitle("")}}>Close</Button>
            </DialogClose>
            <Button type="button" variant="default" disabled={loading} className="bg-green-600 hover:bg-green-700 cursor-pointer" onClick={handleSubmit}>
              {loading ?
                (
                  <>
                    <LoaderCircle className="animate-spin" />
                  </>
                )
                :
                (
                  <>Save</>
                )
              }
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default CreateList;