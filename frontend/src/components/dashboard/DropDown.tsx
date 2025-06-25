import type { Dispatch, SetStateAction } from "react";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose
} from "@/components/ui/dialog"
import { Button } from "../ui/button";
import { EllipsisVertical } from "lucide-react";
import { Trash2, PenBoxIcon } from "lucide-react";
import { useAuth } from "@clerk/clerk-react";
import { toast } from "sonner";
import EditListDialog from "./EditListDialog";

const DropDown = ({ id, isUpdated }: { id: number, isUpdated: Dispatch<SetStateAction<boolean>> }) => {

  const [deleteDialog, setDeleteDialog] = useState(false);
  const [editDialog, setEditDialog] = useState(false);

  const { getToken } = useAuth();

  const handleDelete = async(id: number) => {

    console.log(id);
    console.log(typeof id);
    const token = await getToken();

    const baseUrl = import.meta.env.PUBLIC_BACKEND_URL;

    try {
      const response = await fetch(`${baseUrl}/task/delete_list`, {
        method: "DELETE",
        headers: {
          'Content-type': "application/json",
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ taskListId: id })
      });
      const data = await response.json();

      if(data.success) {
        toast.success(data.message);
        isUpdated((prev) => !prev);
      } else {
        toast.error(data.message);
      }
    } catch(err) {
      console.error(err);
    }
  }

  return (
    <>
    <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon"><EllipsisVertical /></Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem 
            className="cursor-pointer"
            onClick={() => setEditDialog(true)}
          >
            <PenBoxIcon />Edit
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => setDeleteDialog(true)} 
            className="text-white bg-red-500 focus:bg-red-600 focus:text-white cursor-pointer"
          >
            <Trash2 className="text-white" />Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <Dialog open={deleteDialog} onOpenChange={setDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Do you want to delete the list?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete the list.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="destructive" onClick={() => handleDelete(id)}>Yes, I am sure</Button>
            </DialogClose>
            <DialogClose asChild>
              <Button>Cancel</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <EditListDialog listId={id} open={editDialog} setOpen={setEditDialog} isUpdated={isUpdated}  />
    </>
  )
}

export default DropDown;
