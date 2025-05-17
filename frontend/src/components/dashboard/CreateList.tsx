import React, { useEffect, useState } from "react";
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

const CreateList = () => {

  const [title, setTitle] = useState("");
  const [taskList, setTaskList] = useState([""]);

  const { getToken } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      const token = await getToken();
      console.log(token);
    }

    fetchData();
  }, []);

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

  return (
    <div>
      <Dialog>
        <DialogTrigger asChild>
            <Button className="cursor-pointer bg-gray-100 hover:bg-gray-300 text-black">Create your own List</Button>
        </DialogTrigger>
        <DialogContent>

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
            <div className="flex w-full gap-2">
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
            <Button type="button" variant="default" className="bg-green-600 hover:bg-green-700 cursor-pointer">Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default CreateList
