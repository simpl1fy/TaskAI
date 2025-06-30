import { useState, useEffect } from "react";
import type { Dispatch, SetStateAction } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogHeader,
} from "@/components/ui/dialog";
import { Input } from "../ui/input";
import { Plus, Loader2 } from "lucide-react";
import { useAuth } from "@clerk/clerk-react";
import { toast } from "sonner";
import { Skeleton } from "../ui/skeleton";
import { capitalizeFirst } from "@/helpers/capitalizeFirst";
import { Button } from "../ui/button";

type PropTypes = {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  setCategoriesUpdated: Dispatch<SetStateAction<boolean>>;
};

type CategoryType = {
  id: number;
  name: string;
};

const ManageCategories = ({ open, setOpen, setCategoriesUpdated }: PropTypes) => {
  const { getToken } = useAuth();
  const [categories, setCategories] = useState<CategoryType[]>([]);
  const [loading, setLoading] = useState(false);
  const [addButtonLoading, setAddButtonLoading] = useState(false);
  const [categoryName, setCategoryName] = useState("");
  const [createCategoryClicked, setCreateCategoryClicked] = useState(false);

  const handleDialogClose = () => {
    setCreateCategoryClicked(false);
    setOpen(false);
  }

  useEffect(() => {
    const fetchCategories = async () => {
      const token = await getToken();
      const baseUrl = import.meta.env.PUBLIC_BACKEND_URL;
      try {
        setLoading(true);
        const res = await fetch(`${baseUrl}/category/get_all`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
        if (data.success) {
          setCategories(data.data);
        } else {
          toast.error("An error occured while fetching categories!");
        }
        setLoading(false);
      } catch (err) {
        console.error("An error occured while fetching categories =", err);
        toast.error("An error occured while fetching categories");
      }
    };
    if (open) {
      fetchCategories();
    }
  }, [open]);

  const handleKeyDownEvent = (e: KeyboardEvent) => {
    if(createCategoryClicked && e.key === "Enter") {
      setCreateCategoryClicked(false);
    }
  }

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDownEvent);

    return () => {
      document.removeEventListener("keydown", handleKeyDownEvent);
    }
  }, [])

  const handleCreateCategory = () => {
    setCreateCategoryClicked(true);
  }

  const handleAddCategory = async () => {
    if(addButtonLoading) {
      return;
    }
    try {
      setAddButtonLoading(true);
      const token = await getToken();
      const baseUrl = import.meta.env.PUBLIC_BACKEND_URL;
      const res = await fetch(`${baseUrl}/category/create`, {
        method: "POST",
        body: JSON.stringify({ "categoryName": categoryName }),
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      const resData = await res.json();
      if(resData.success) {
        const newCategory = { id: resData.insertedCategoryId, name: categoryName };
        setCategories(prev => [...prev, newCategory]);
        setAddButtonLoading(false);
        setCategoriesUpdated(prev => !prev);
      } else {
        toast.error("Failed to add category. Please try again later!");
      }
      setAddButtonLoading(false);
      setCreateCategoryClicked(false);
    } catch (err) {
      console.error("An error occured while adding category =", err);
      toast.error("Failed to add category. Please try again later!");
      setAddButtonLoading(false);
      setCreateCategoryClicked(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleDialogClose}>
      <DialogContent>
        <DialogHeader className="mb-2">
          <DialogTitle>Manage Categories</DialogTitle>
          <DialogDescription>Create, Delete, Edit Categories</DialogDescription>
        </DialogHeader>

        <section>
          {loading ?
            (
              <>
                <Skeleton className="h-4 w-full rounded-lg" />
                <div className="flex flex-col space-y-2">
                  <Skeleton className="h-4 w-full rounded-md" />
                  <Skeleton className="h-4 w-full rounded-md" />
                  <Skeleton className="h-4 w-full rounded-md" />
                  <Skeleton className="h-4 w-full rounded-md" />
                </div>
              </>
            )
            :
            (
              <div className="flex items-center justify-center flex-wrap gap-3">
                {categories && categories.map((c,_) => (
                  <span key={c.id} className="px-3 py-1 rounded-full bg-gray-200 cursor-pointer">{capitalizeFirst(c.name)}</span>
                ))}
                {createCategoryClicked ?
                  (
                    <span className="rounded-full flex items-center relative">
                      <Input placeholder="Enter category name" value={categoryName} onChange={(e) => setCategoryName(e.target.value)} />
                      <div className="absolute right-2 p-1 bg-violet-700 rounded-full cursor-pointer" onClick={handleAddCategory}>
                        {addButtonLoading ?
                          (<Loader2 className=" size-4 text-white animate-spin" />)
                          :
                          (<Plus className="size-4 text-white" />)
                        }
                      </div>
                    </span>
                  )
                  :
                  (
                    <span className="px-3 py-1 rounded-full bg-neutral-700 text-white cursor-pointer flex items-center" onClick={handleCreateCategory}><Plus className="size-4" />Create Category</span>
                  )
                }
              </div>
            )
          }
        </section>
      </DialogContent>
    </Dialog>
  );
};

export default ManageCategories;
