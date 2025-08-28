
import { TableDevice } from "@/components/tables/TableDevice"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Plus } from "lucide-react"
import { useState } from "react";
export default function AddDevice() {
    const [open,setOpen] = useState(false);
    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="sm" className="w-full bg-gradient-to-br from-emerald-500 to-emerald-700 text-white flex items-center justify-center gap-2">
                    <Plus className="w-4 h-4" /> Thêm thiết bị
                </Button>
            </DialogTrigger>
            <DialogContent className="!max-w-[800px]">
                <TableDevice setOpen={setOpen} open={open} />
            </DialogContent>
        </Dialog>
    )
}
