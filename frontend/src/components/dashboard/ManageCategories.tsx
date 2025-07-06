import { useState, useEffect } from "react";
import type { Dispatch, SetStateAction, KeyboardEvent } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogHeader,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Input } from "../ui/input";
import { Plus, Loader2, Edit, Trash2, MoveRight } from "lucide-react";
import { useAuth } from "@clerk/clerk-react";
import { toast } from "sonner";
import { Skeleton } from "../ui/skeleton";
import { Button } from "../ui/button";
import { capitalizeFirst } from "@/helpers/capitalizeFirst";

type PropTypes = {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  setCategoriesUpdated: Dispatch<SetStateAction<boolean>>;
};

type CategoryType = {
  id: number;
  name: string;
};

const ManageCategories = ({ open, setOpen, setCategoriesUpdated, }: PropTypes) => {
  const { getToken } = useAuth();
  const [categories, setCategories] = useState<CategoryType[]>([]);
  const [loading, setLoading] = useState(false);
  const [addButtonLoading, setAddButtonLoading] = useState(false);
  const [categoryName, setCategoryName] = useState("");
  const [createCategoryClicked, setCreateCategoryClicked] = useState(false);
  const [editingId, setEditingId] = useState<number>(-1);
  const [editCategoryValue, setEditCategoryValue] = useState("");
  const [editCategoryLoading, setEditCategoryLoading] = useState(false);

  const handleDialogClose = () => {
    setCreateCategoryClicked(false);
    setCategoryName("");
    setEditingId(-1);
    setEditCategoryValue("");
    setEditCategoryLoading(false);
    setOpen(false);
  };

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

  const handleEditClick = (categoryId: number, categoryName: string) => {
    setEditingId(categoryId);
    setEditCategoryValue(categoryName);
  };

  const categoryEditBlur = () => {
    setEditingId(-1);
  };

  const handleCreateCategory = () => {
    setCreateCategoryClicked(true);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if(event.key === "Enter") {
      handleCategoryEdit(editingId);
    }
  }

  const handleAddCategory = async () => {
    if (addButtonLoading) {
      return;
    }
    try {
      setAddButtonLoading(true);
      const token = await getToken();
      const baseUrl = import.meta.env.PUBLIC_BACKEND_URL;
      const res = await fetch(`${baseUrl}/category/create`, {
        method: "POST",
        body: JSON.stringify({ categoryName: categoryName }),
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const resData = await res.json();
      if (resData.success) {
        const newCategory = {
          id: resData.insertedCategoryId,
          name: categoryName,
        };
        setCategories((prev) => [...prev, newCategory]);
        setAddButtonLoading(false);
        setCategoriesUpdated((prev) => !prev);
      } else {
        toast.error("Failed to add category. Please try again later!");
      }
      setCategoryName("");
      setAddButtonLoading(false);
      setCreateCategoryClicked(false);
    } catch (err) {
      console.error("An error occured while adding category =", err);
      toast.error("Failed to add category. Please try again later!");
      setAddButtonLoading(false);
      setCreateCategoryClicked(false);
      setCategoryName("");
    }
  };

  const handleCategoryEdit = async (categoryId: number) => {
    if(editCategoryLoading) {
      return;
    } else if(editCategoryValue.trim() === "") {
      toast.error("Category name cannot be empty!");
      return;
    }

    setEditCategoryLoading(true);
    try {
      const token = await getToken();
      const baseUrl = import.meta.env.PUBLIC_BACKEND_URL;
      const res = await fetch(`${baseUrl}/category/update/${categoryId}`, {
        method: "PATCH",
        body: JSON.stringify({ categoryName: editCategoryValue }),
        headers: {
          "Content-type": "application/json",
          "Authorization": `Bearer ${token}`
        }
      })
      const resData = await res.json();
      if(resData.success) {
        setCategories(prev => 
          prev.map(category =>
            category.id === categoryId
            ? { ...category, name: resData.updatedName }
            : category
          )
        )
        setCategoriesUpdated(prev => !prev);
        setEditingId(-1);
        setEditCategoryValue("");
        setEditCategoryLoading(false);
        toast.success(resData.message);
      } else {
        toast.error("An error occured while updating category. Please try again later!");
        setEditCategoryLoading(false);
      }
    } catch (err) {
      console.error("An error occured while updating category name =", err);
      setEditCategoryLoading(false);
      setEditCategoryValue("")
      setEditingId(-1);
      toast.error("An error occured while updating category. Please try again later!");
    }
  }

  const handleCategoryDelete = async (categoryId: number) => {
    try {
      const token = await getToken();
      const baseUrl = import.meta.env.PUBLIC_BACKEND_URL;
      const res = await fetch(`${baseUrl}/category/delete`, {
        method: "POST",
        body: JSON.stringify({ categoryId: categoryId }),
        headers: {
          "Content-type": "Application/json",
          "Authorization": `Bearer ${token}`
        }
      });
      const resData = await res.json();
      if(resData.success) {
        toast.success(resData.message || "Category deleted successfully!");
        setCategories(prev => prev.filter(c => c.id !== categoryId));
        setCategoriesUpdated(prev => !prev);
      } else {
        toast.error(resData.message);
      }
    } catch (err) {
      console.error("An error occured while deleting category =", err);
      toast.error("Failed to delete category!");
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
          {loading ? (
            <>
              <Skeleton className="h-4 w-full rounded-lg" />
              <div className="flex flex-col space-y-2">
                <Skeleton className="h-4 w-full rounded-md" />
                <Skeleton className="h-4 w-full rounded-md" />
                <Skeleton className="h-4 w-full rounded-md" />
                <Skeleton className="h-4 w-full rounded-md" />
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center flex-wrap gap-3">
              {categories &&
                categories.map((c, _) => (
                  <div key={c.id}>
                    {editingId === c.id ? (
                      <span className="flex items-center relative">
                        <Input
                          placeholder="Change category name"
                          value={editCategoryValue}
                          onChange={(e) => setEditCategoryValue(e.target.value)}
                          onBlur={categoryEditBlur}
                          onKeyDown={handleKeyDown}
                        />
                        <button 
                          className="absolute bg-violet-700 hover:bg-violet-800 p-2 rounded-full right-2 cursor-pointer text-white"
                          onClick={() => handleCategoryEdit(c.id)}
                        >
                          {editCategoryLoading ? 
                            (
                              <Loader2 className="animate-spin size-3" />
                            )
                            :
                            (
                              <MoveRight className="size-3" />
                            )
                          }
                        </button>
                      </span>
                    ) : (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          {c.name !== "default" && (
                            <span className="px-3 py-1 bg-gray-100 rounded-full cursor-pointer">
                              {c.name}
                            </span>
                          )}
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="w-full cursor-pointer"
                              onClick={() => handleEditClick(c.id, c.name)}
                            >
                              <Edit className="size-4 mr-1" />
                              Edit
                            </Button>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="w-full cursor-pointer"
                              onClick={() => handleCategoryDelete(c.id)}
                            >
                              <Trash2 className="size-4 mr-1 text-red-600 hover:text-red-700" />
                              <span className="text-red-600 hover:text-red-700">
                                Delete
                              </span>
                            </Button>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                ))}
              {createCategoryClicked ? (
                <span className="rounded-full flex items-center relative">
                  <Input
                    placeholder="Enter category name"
                    value={categoryName}
                    onChange={(e) => setCategoryName(e.target.value)}
                  />
                  <div
                    className="absolute right-2 p-1 bg-violet-700 rounded-full cursor-pointer"
                    onClick={handleAddCategory}
                  >
                    {addButtonLoading ? (
                      <Loader2 className=" size-4 text-white animate-spin" />
                    ) : (
                      <Plus className="size-4 text-white" />
                    )}
                  </div>
                </span>
              ) : (
                <span
                  className="px-3 py-1 rounded-full bg-neutral-700 text-white cursor-pointer flex items-center"
                  onClick={handleCreateCategory}
                >
                  <Plus className="size-4" />
                  Create Category
                </span>
              )}
            </div>
          )}
        </section>
      </DialogContent>
    </Dialog>
  );
};

export default ManageCategories;
