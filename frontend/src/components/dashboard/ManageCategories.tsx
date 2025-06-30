import { useState, useEffect } from "react";
import type { Dispatch, SetStateAction } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogHeader,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { useAuth } from "@clerk/clerk-react";
import { toast } from "sonner";
import { Skeleton } from "../ui/skeleton";
import { capitalizeFirst } from "@/helpers/capitalizeFirst";

type PropTypes = {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
};

type CategoryType = {
  id: number;
  name: string;
};

const ManageCategories = ({ open, setOpen }: PropTypes) => {
  const { getToken } = useAuth();
  const [categories, setCategories] = useState<CategoryType[]>([]);
  const [loading, setLoading] = useState(false);

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

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader className="mb-2">
          <DialogHeader>Manage Categories</DialogHeader>
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
                <span className="px-3 py-1 rounded-full bg-neutral-700 text-white cursor-pointer flex items-center"><Plus className="size-4" />Create Category</span>
              </div>
            )
          }
        </section>
      </DialogContent>
    </Dialog>
  );
};

export default ManageCategories;
