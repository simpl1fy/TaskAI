import { useEffect, useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import { Button } from "../ui/button";
import { Skeleton } from "../ui/skeleton";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogClose,
  } from "@/components/ui/dialog";
import { Input } from "../ui/input";
import { Trash } from "lucide-react";
import { useAuth } from "@clerk/clerk-react";
import { toast } from "sonner";
import { LoaderCircle } from "lucide-react";
import { capitalizeFirst } from "@/helpers/capitalizeFirst";

type PropTypes = {
  isUpdated: Dispatch<SetStateAction<boolean>>;
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  listTitle?: string;
  taskArray?: string[]
}

const CreateList = ({ isUpdated, open, setOpen, listTitle, taskArray }: PropTypes) => {

  type CategoryType = {
    id: number;
    name: string;
  }

  const { getToken } = useAuth();
  const [title, setTitle] = useState("");
  const [taskList, setTaskList] = useState<string[]>([""]);
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>({ id: -1, name: "Category" });
  const [categories, setCategories] = useState<CategoryType[]>();
  const [loading, setLoading] = useState(false);
  const [dialogLoading, setDialogLoading] = useState(false);
  const [titleError, setTitleError] = useState(false);
  const [categoryError, setCategoryError] = useState(false);

  useEffect(() => {
    if(listTitle && listTitle.trim() !== "") {
      setTitle(listTitle);
    }
    if(Array.isArray(taskArray) && taskArray.length > 0) {
      setTaskList(taskArray);
    }
  }, [listTitle, taskArray]);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if(titleError) {
      timer = setTimeout(() => {
        setTitleError(false);
      }, 2000);
    }
    if(categoryError) {
      timer = setTimeout(() => {
        setCategoryError(false);
      }, 2000);
    }
  
    return () => {
      clearTimeout(timer);
    }
  }, [titleError, categoryError]);
  

  useEffect(() => {
    const fetchCategories = async () => {
      setDialogLoading(true);
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
          setDialogLoading(false);
        } else {
          toast.error(data.message);
          setDialogLoading(false);
        }
      } catch (err) {
        console.error("An error occured while fetching categories", err);
        toast.error("Could not fetch categories. Please try again later!");
        setDialogLoading(false);
      }
    }
    
    if(open) {
      fetchCategories();
    }
    
  }, [open])
  

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

    const fetchedToken = await getToken();
    
    if(!fetchedToken) {
      alert("User not authenticated. Please login first");
      return;
    }

    console.log("Task List =", taskList);
    
    if(title.trim() === "") {
      setTitleError(true);
      toast.error("Title cannot be empty!");
      return;
    } else if(selectedCategory.id === -1) {
      setCategoryError(true);
      toast.error("Please select category!");
      return;
    } else if(taskList.length === 1 && taskList[0].trim() === "") {
      toast.error("Tasks cannot be empty. Atleast 1 task required!");
      return;
    }
    
    const baseUrl = import.meta.env.PUBLIC_BACKEND_URL;
    setLoading(true);
    try {
      const res = await fetch(`${baseUrl}/task/add_list`, {
        method: "POST",
        headers: {
          'Content-type': "application/json",
          'Authorization': `Bearer ${fetchedToken}`
        },
        body: JSON.stringify({ title: title, tasksArray: taskList, category: selectedCategory })
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

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = Number(e.target.value);
    console.log(selectedId);
    const selected = categories?.find(cat => cat.id === selectedId);
    if(selected) {
      setSelectedCategory(selected);
    } else {
      setSelectedCategory({
        id: -1,
        name: "Category"
      })
    }
  }

  return (
    <div>
      <Dialog open={open} onOpenChange={setOpen}>
        {!dialogLoading ?
          (<DialogContent className="max-h-128 overflow-y-auto">

            {/* Header Component */}
            <DialogHeader>
              <DialogTitle>Create your task list</DialogTitle>
              <DialogDescription>Create or edit your list of tasks</DialogDescription>
            </DialogHeader>

            {/* Body */}
            <div className="flex flex-col">
              <label htmlFor="title">Title</label>
              <Input type="text" placeholder="Title of this list" value={title} onChange={(e) => setTitle(e.target.value)} className={`selection:bg-blue-500 selection:text-white ${titleError ? "border-1 border-red-500":""}`} />
            </div>
            {/* <div className="flex flex-col">
              <label htmlFor="category">Category</label>
              <Input type="text" placeholder="Title of this list" value={category} onChange={(e) => setCategory(e.target.value)} className="selection:bg-blue-500 selection:text-white" />
            </div> */}
            <section className="flex justify-between items-center">
              <label htmlFor="category">Choose category</label>
              <select 
                name="category" 
                className={`border border-1 p-2 rounded-md text-sm ${selectedCategory.name==="Category"?"text-gray-700" : ""} ${categoryError?"border-red-500":""}`}
                value={selectedCategory.id}
                onChange={handleSelectChange}
              >
                <option value={-1} className="text-sm">Category</option>
                {categories && categories.map((value,_) => (
                  <option key={value.id} value={value.id} className="text-sm">
                    {capitalizeFirst(value.name)}
                  </option>
                ))}
              </select>
            </section>
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
          )
          :
          (
            <DialogContent>
              {/* Header Component */}
              <DialogHeader>
                <DialogTitle>Create your task list</DialogTitle>
                <DialogDescription>Create or edit your list of tasks</DialogDescription>
              </DialogHeader>

              {/* Skeleton */}
              <Skeleton className="h-4 w-full rounded-lg" />
              <div className="flex flex-col space-y-2">
                <Skeleton className="h-4 w-full rounded-md" />
                <Skeleton className="h-4 w-full rounded-md" />
                <Skeleton className="h-4 w-full rounded-md" />
                <Skeleton className="h-4 w-full rounded-md" />
              </div>

              {/* Footer */}
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="destructive" className="cursor-pointer" onClick={() => {setTaskList([""]); setTitle("")}}>Close</Button>
                </DialogClose>
              </DialogFooter>
            </DialogContent>
          )
        }
      </Dialog>
    </div>
  )
}

export default CreateList;