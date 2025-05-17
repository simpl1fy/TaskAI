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
import { useAuth } from "@clerk/clerk-react";

type PropTypes = {
  listId: number;
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  isUpdated?: Dispatch<SetStateAction<boolean>>;
  handleSubmit?: () => void;
};

const EditListDialog = ({ listId, open, setOpen, isUpdated, handleSubmit}: PropTypes) => {

  const { getToken } = useAuth();

  useEffect(() => {
    
    const fetchData = async () => {

      const token = await getToken();

      try {
        const response = await fetch(`http://localhost:3000/task/task_list/${listId}`, {
          method: "GET",
          headers: {
            'Content-type': 'applicaiton/json',
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await response.json();

        console.log(data);
      } catch(err) {
        console.error(err);
      }
    } 

    fetchData();
  }, []);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit your task</DialogTitle>
          <DialogDescription>Edit your task, add more or change the content</DialogDescription>
        </DialogHeader>
        

        <DialogFooter>
          <DialogClose asChild>
            <Button className="bg-red-600 text-white hover:bg-red-700 cursor-pointer">Cancel</Button>
          </DialogClose>
          <DialogClose asChild>
            <Button className="bg-green-600 hover:bg-green-700 transition cursor-pointer">Save</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default EditListDialog
