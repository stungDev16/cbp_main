import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { apps } from "@/constants";
import { ChevronDown, Info, RefreshCw, Search } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
export default function AppSection() {
  return (
    <div className="bg-white flex-1 size-full p-4 rounded-xl ">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="relative flex-1 max-w-[250px] border border-border rounded-lg bg-card">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input placeholder="Search by Name or IP" className="pl-10 pr-10" />
          </div>
          <Button size="sm">Upload APP</Button>
          <div className="flex items-center space-x-2">
            <Checkbox id="show-preinstalled" className="boder border-accent" />
            <label
              htmlFor="show-preinstalled"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-1"
            >
              Show Pre-installed APP
            </label>
            <Info className="w-4 h-4 text-muted-foreground" />
          </div>
        </div>
        <Button variant="outline" size="sm">
          <RefreshCw className="w-4 h-4" />
        </Button>
      </div>
      <div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 mt-4">
          {apps.map((app) => (
            <div
              key={app.id}
              className="flex items-center gap-4 p-4 border rounded-lg bg-card"
            >
              <img
                src={app.icon || "/placeholder.svg"}
                alt={app.name}
                className="w-10 h-10 rounded-lg"
              />

              <div className="flex-1">
                <h3 className="font-medium text-foreground">{app.name}</h3>
                <p className="text-sm text-muted-foreground">{app.version}</p>
              </div>

              <div className="flex items-end gap-2 flex-col">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      Batch Install
                      <ChevronDown className="w-4 h-4 ml-1" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem>Install to Selected</DropdownMenuItem>
                    <DropdownMenuItem>Install to All</DropdownMenuItem>
                    <DropdownMenuItem>Install to Group</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      Preinstall
                      <ChevronDown className="w-4 h-4 ml-1" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem>Add to Preinstall List</DropdownMenuItem>
                    <DropdownMenuItem>Remove from Preinstall</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
