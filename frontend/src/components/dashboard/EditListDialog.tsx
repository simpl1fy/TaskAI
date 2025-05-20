import { useState, useEffect } from "react";
import type { Dispatch, SetStateAction } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { useAuth } from "@clerk/clerk-react";
import { toast } from "sonner";
import { CirclePlus, LoaderCircle, Trash2 } from "lucide-react";
import { Skeleton } from "../ui/skeleton";

type PropTypes = {
  listId: number;
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  isUpdated: Dispatch<SetStateAction<boolean>>;
};

type Task = {
  taskId: number | null | undefined;
  taskTitle: string;
  taskStatus: boolean;
}

type TaskList = {
  listId: number;
  listTitle: string;
  listCreatedAt: string;
  tasks: Task[];
}

const EditListDialog = ({ listId, open, setOpen, isUpdated}: PropTypes) => {

  const { getToken } = useAuth();

  const [data, setData] = useState<TaskList>();
  const [saveLoading, setSaveLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(false);

  useEffect(() => {
    
    const fetchData = async () => {
      setDataLoading(true);
      const token = await getToken();

      const baseUrl = import.meta.env.PUBLIC_BACKEND_URL;

      try {
        const response = await fetch(`${baseUrl}/task/task_list/${listId}`, {
          method: "GET",
          headers: {
            'Content-type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await response.json();
        if(data.success) {
          // console.log(data.data);
          setData(data.data);
        } else {
          toast.error("Failed to fetch list. Please try again later");
        }
        setDataLoading(false);
      } catch(err) {
        console.error(err);
        setDataLoading(false);
      }
    }
    if(open && listId) {
      fetchData();
    }
  }, [open]);

  const handleTitleChange = (value: string) => {
    setData(prev => prev ? {...prev, listTitle: value} : prev);
  }

  const handleTaskTitleChange = (index: number, value: string) => {
    setData(prev => {
      if(!prev) return prev;
      const updatedTasks = [...prev.tasks];
      updatedTasks[index].taskTitle = value;
      return { ...prev, updatedTasks };
    });
  }

  const handleAddTask = (index: number) => {
    setData(prev => {
      if(!prev) return prev;

      const newTask: Task = {
        taskId: null,
        taskTitle: "",
        taskStatus: false,
      };

      const updatedTasks = [...prev.tasks];
      updatedTasks.splice(index+1,0, newTask);

      return {
        ...prev,
        tasks: updatedTasks
      }
    })
  }

  const handleDelete = async (index: number, taskId: number | null | undefined) => {
    if(taskId === null) {
      setData(prev => {
        if(!prev) return prev;
        const updatedTasks = [...prev.tasks];
        updatedTasks.splice(index, 1);

        return {
          ...prev,
          tasks: updatedTasks
        };
      })
    } else {
      setDeleteLoading(true);
      try {
        const baseUrl = import.meta.env.PUBLIC_BACKEND_URL;
        const token = await getToken();

        const response = await fetch(`${baseUrl}/task/delete_task/${taskId}`, {
          method: "DELETE",
          headers: {
            'Content-type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });

        const data = await response.json();

        if(data.success) {
          isUpdated(prev => !prev);
          setData(prev => {
            if(!prev) return prev;
            const updatedTasks = [...prev.tasks];
            updatedTasks.splice(index, 1);

            return {
              ...prev,
              tasks: updatedTasks
            };
          })
          toast.success(data.message);
        } else {
          toast.error("Failed to delete. Please try again later!");
        }
        setDeleteLoading(false);
      } catch(err) {
        console.error("An error occured while deleting tasks =", err);
        setDeleteLoading(false);
        return;
      }
    }
  }

  const handleSave = async (taskListId: number) => {
    setSaveLoading(true);
    try {
      const token = await getToken();
      const baseUrl = import.meta.env.PUBLIC_BACKEND_URL;
      const response = await fetch(`${baseUrl}/task/update/${taskListId}`, {
        method: "PUT",
        headers: {
          'Content-type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ listTitle: data?.listTitle, newTasks: data?.tasks })
      });
      const resData = await response.json();
      if(resData.success) {
        toast.success(resData.message);
        isUpdated(prev => !prev);
        setOpen(false);
      } else {
        toast.error("Failed to update list!");
      }
      setSaveLoading(false);
    } catch(err) {
      console.error("An error occured while saving =", err);
      setSaveLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-h-128 overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit your task</DialogTitle>
          <DialogDescription>Edit your task, add more or change the content</DialogDescription>
        </DialogHeader>
        {dataLoading ?
          (
            <>
              <div>
                <Skeleton className="h-4 w-full rounded-lg" />
                <div className="flex flex-col space-y-2">
                  <Skeleton className="h-4 w-full rounded-md" />
                  <Skeleton className="h-4 w-full rounded-md" />
                  <Skeleton className="h-4 w-full rounded-md" />
                  <Skeleton className="h-4 w-full rounded-md" />
                </div>
              </div>
            </>
          )
          :
          (
            <>
              <section className="flex flex-col">
                <h4 className="text-lg font-semibold">Title</h4>
                <Input type="text" className="selection:bg-blue-500 selection:text-white" value={data?.listTitle} onChange={(e) => handleTitleChange(e.target.value)} />
              </section>
              <section>
                <h4 className="text-lg font-semibold">Tasks</h4>
                {data?.tasks.map((value, index) => (
                  <span key={index} className="flex w-full gap-2 mb-2">
                    <Input type="text" className="selection:bg-blue-500 selection:text-white" value={value.taskTitle} onChange={(e) => handleTaskTitleChange(index, e.target.value)} placeholder="Enter task" />
                    <Button
                      size="icon"
                      variant="ghost"
                      className="cursor-pointer"
                      onClick={() => handleAddTask(index)}
                      disabled={deleteLoading}
                    >
                      <CirclePlus />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="cursor-pointer"
                      onClick={() => handleDelete(index, value.taskId)}
                      disabled={deleteLoading}
                    >
                      <Trash2 className="text-red-600" />
                    </Button>
                  </span>
                ))}
              </section>
            </>
          )
        }
        <DialogFooter>
          <DialogClose asChild>
            <Button className="bg-red-600 text-white hover:bg-red-700 cursor-pointer">Cancel</Button>
          </DialogClose>
          {data?.listId && 
            <Button className="bg-green-600 hover:bg-green-700 transition cursor-pointer" onClick={() => handleSave(data.listId)} disabled={saveLoading}>
              {saveLoading ? 
                (
                  <LoaderCircle className="animate-spin" />
                )
              : 
              (
                <span>Save</span>
              )}
            </Button>
          }
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default EditListDialog
