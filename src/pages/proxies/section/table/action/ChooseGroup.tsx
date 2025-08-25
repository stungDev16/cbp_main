import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronsUpDown, Plus, Search } from "lucide-react";
export default function ChooseGroup() {
  const [selectedGroup, setSelectedGroup] = useState("All Groups");
  const [groupSearch, setGroupSearch] = useState("");
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="w-40 justify-between bg-transparent"
        >
          {selectedGroup}
          <ChevronsUpDown className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="start">
        <div className="p-2">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Group Name"
              value={groupSearch}
              onChange={(e) => setGroupSearch(e.target.value)}
              className="pl-8 h-8"
            />
          </div>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuLabel className="text-xs text-muted-foreground font-normal">
          System Group
        </DropdownMenuLabel>
        <DropdownMenuItem
          onClick={() => setSelectedGroup("All Groups")}
          className={
            selectedGroup === "All Groups" ? "bg-blue-50 text-blue-600" : ""
          }
        >
          All Groups
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setSelectedGroup("Ungrouped")}>
          Ungrouped
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuLabel className="text-xs text-muted-foreground font-normal">
          Customize Group
        </DropdownMenuLabel>
        <DropdownMenuItem className="text-muted-foreground">
          <Plus className="w-4 h-4 mr-2" />
          Create Group
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
