import { Input } from "@/components/ui/input";
import { Filter, Search, TextSearch } from "lucide-react";
import { useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import ButtonDialogFilter from "./buttons/ButtonDialogFilter";
import FilterIpChecker from "./FilterIpChecker";

export default function SearchIP() {
  const [searchQuery, setSearchQuery] = useState("");
  return (
    <div className="relative flex-1 max-w-[250px] border border-border rounded-lg bg-card">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
      <Input
        placeholder="Search by Name or IP"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="pl-10 pr-10"
      />
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
          >
            <Filter className="w-4 h-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[600px] p-4" align="center">
          <div className="space-y-4">
            <div className="grid grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  ID
                </label>
                <div className="relative border border-border rounded-lg bg-card">
                  <Input
                    placeholder="Support batch se"
                    // value={filterValues.id}
                    // onChange={(e) => handleFilterChange("id", e.target.value)}
                    className="pr-8"
                  />
                  <ButtonDialogFilter
                    icon={
                      <TextSearch className="absolute right-2 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4 cursor-pointer" />
                    }
                    title="Batch Search ID"
                    handleSubmit={(id) => console.log(id)}
                    placeholder="One ID per line, supports up to 100 simultaneous exact searches"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Name
                </label>
                <div className="relative border border-border rounded-lg bg-card">
                  <Input
                    placeholder="Name"
                    //   value={filterValues.name}
                    //   onChange={(e) => handleFilterChange("name", e.target.value)}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  IP
                </label>
                <div className="relative border border-border rounded-lg bg-card">
                  <Input
                    placeholder="Support batch se"
                    // value={filterValues.ip}
                    // onChange={(e) => handleFilterChange("ip", e.target.value)}
                    className="pr-8"
                  />
                  <ButtonDialogFilter
                    icon={
                      <TextSearch className="absolute right-2 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4 cursor-pointer" />
                    }
                    title="Batch Search ID"
                    handleSubmit={(id) => console.log(id)}
                    placeholder="One ID per line, supports up to 100 simultaneous exact searches"
                  />
                </div>
              </div>
              <FilterIpChecker />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline">Reset</Button>
              <Button>Search</Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
