import { Filter, Search, X } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
const ipCheckerOptions = ["IP2Location", "Ip-Api"];
export default function FilterIpChecker() {
  const [selectedIpCheckers, setSelectedIpCheckers] = useState<string[]>([]);
  const [ipCheckerSearch, setIpCheckerSearch] = useState("");
  const handleRemoveIpChecker = (option: string) => {
    setSelectedIpCheckers((prev) => prev.filter((item) => item !== option));
  };
  const handleIpCheckerToggle = (option: string) => {
    setSelectedIpCheckers((prev) =>
      prev.includes(option)
        ? prev.filter((item) => item !== option)
        : [...prev, option]
    );
  };
  const handleCheckAllIpCheckers = () => {
    setSelectedIpCheckers(
      selectedIpCheckers.length === ipCheckerOptions.length
        ? []
        : [...ipCheckerOptions]
    );
  };
  return (
    <div>
      <label className="block text-sm font-medium text-foreground mb-2">
        IP Checker
      </label>
      <div className="relative">
        <div className="relative min-h-[40px] border border-input rounded-md px-3 py-2 bg-background">
          <div className="flex flex-wrap gap-1">
            {selectedIpCheckers.map((option) => (
              <Badge
                key={option}
                variant="secondary"
                className="text-xs px-2 py-1 bg-blue-100 text-blue-800 hover:bg-blue-200"
              >
                {option === "IP2Location" ? "IP2Location" : "ip-a"}
                <Button
                  variant="ghost"
                  size="sm"
                  className="ml-1 h-3 w-3 p-0 hover:bg-blue-300 rounded-full"
                  onClick={() => handleRemoveIpChecker(option)}
                >
                  <X className="h-2 w-2" />
                </Button>
              </Badge>
            ))}
            {selectedIpCheckers.length === 0 && (
              <span className="text-muted-foreground text-sm">IP Checker</span>
            )}
          </div>
        </div>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
            >
              <Filter className="w-4 h-4 text-muted-foreground" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-56 p-0" align="end">
            <div className="p-3 space-y-3">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="IP Checker"
                  value={ipCheckerSearch}
                  onChange={(e) => setIpCheckerSearch(e.target.value)}
                  className="pl-8 h-8"
                />
              </div>
              <div className="space-y-2">
                {ipCheckerOptions
                  .filter((option) =>
                    option.toLowerCase().includes(ipCheckerSearch.toLowerCase())
                  )
                  .map((option) => (
                    <div key={option} className="flex items-center space-x-2 p-1 rounded-md hover:bg-muted">
                      <Checkbox
                        id={option}
                        className="border-muted-foreground"
                        checked={selectedIpCheckers.includes(option)}
                        onCheckedChange={() => handleIpCheckerToggle(option)}
                      />
                      <label
                        htmlFor={option}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {option}
                      </label>
                    </div>
                  ))}
              </div>
              <div className="pt-2 border-t">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCheckAllIpCheckers}
                  className="w-full justify-center text-sm"
                >
                  {selectedIpCheckers.length === ipCheckerOptions.length
                    ? "Uncheck All"
                    : "Check All"}
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}
