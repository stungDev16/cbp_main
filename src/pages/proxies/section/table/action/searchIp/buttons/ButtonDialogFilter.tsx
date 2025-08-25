import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Filter } from "lucide-react";
import { useState } from "react";
export default function ButtonDialogFilter({
  handleSubmit,
  title,
  placeholder,
  icon = <Filter />,
}: {
  title: string;
  placeholder: string;
  handleSubmit: (id: string) => void;
  icon?: React.ReactNode;
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const handleCancel = () => {
    setSearchQuery("");
  };
  return (
    <Dialog>
      <DialogTrigger asChild>{icon}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">{title}</DialogTitle>
          <DialogClose onClick={handleCancel} />
        </DialogHeader>

        <div className="space-y-4">
          <Textarea
            placeholder={placeholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="min-h-[200px] resize-none"
          />
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                handleSubmit(searchQuery);
                handleCancel();
              }}
            >
              Sure
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
