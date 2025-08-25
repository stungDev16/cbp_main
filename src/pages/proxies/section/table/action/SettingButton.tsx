import { Button } from "@/components/ui/button";
import { Settings, Grid3X3 } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
export default function SettingButton() {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm">
          <Settings className="w-4 h-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent side="bottom" className="w-80" align="end">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Column Settings</h3>

          {/* Column Visibility Controls */}
          <div className="space-y-4">
            {[
              { key: "id", label: "ID", icon: Grid3X3 },
              { key: "name", label: "Name", icon: Grid3X3 },
              { key: "outboundIp", label: "Outbound IP", icon: Grid3X3 },
              { key: "group", label: "Group", icon: Grid3X3 },
              {
                key: "relatedCloudPhone",
                label: "Related Cloud Phone",
                icon: Grid3X3,
              },
              {
                key: "proxyInformation",
                label: "Proxy Information",
                icon: Grid3X3,
              },
              { key: "ipChecker", label: "IP Checker", icon: Grid3X3 },
            ].map(({ key, label, icon: Icon }) => (
              <div key={key} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium">{label}</span>
                </div>
                <Switch />
              </div>
            ))}
          </div>

          {/* Sorting Controls */}
          <div className="space-y-4 pt-4 border-t">
            <div className="space-y-2">
              <label className="text-sm font-medium">Sorting Criteria</label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Please choose" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Default">Default</SelectItem>
                  <SelectItem value="ID">ID</SelectItem>
                  <SelectItem value="Name">Name</SelectItem>
                  <SelectItem value="Group">Group</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Sorting Method</label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Please choose" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Default">Default</SelectItem>
                  <SelectItem value="Ascending">Ascending</SelectItem>
                  <SelectItem value="Descending">Descending</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
