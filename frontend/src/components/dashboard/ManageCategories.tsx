import { useState, useEffect } from "react";
import type { Dispatch, SetStateAction } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogTitle,
    DialogHeader,
    DialogTrigger
} from "@/components/ui/dialog";
import { Button } from "../ui/button";

type PropTypes = {
    open: boolean;
    setOpen: Dispatch<SetStateAction<boolean>>;
}

const ManageCategories = ({ open, setOpen }: PropTypes) => {

    useEffect(() => {
      const fetchCategories = async () => {
        try {
            
        } catch (err) {
            console.error("An error occured while fetching categories =", err);
        }
      }
    }, [])
    

  return (
    <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
            <Button>Manage Categories</Button>
        </DialogTrigger>
        <DialogContent>
            <DialogHeader>
                <DialogHeader>Manage Categories</DialogHeader>
                <DialogDescription>Create, Delete, Edit Categories</DialogDescription>
            </DialogHeader>

            <section>

            </section>
        </DialogContent>
    </Dialog>
  )
}

export default ManageCategories