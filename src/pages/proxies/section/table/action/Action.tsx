import { Button } from "@/components/ui/button";

import { RefreshCw, Download } from "lucide-react";
import ChooseGroup from "./ChooseGroup";
import SearchIP from "./searchIp/SearchIP";
import SettingButton from "./SettingButton";
export default function Action() {
  return (
    <div className="p-4 border-b border-border">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 flex-1">
          {/* Group Selector */}
          <ChooseGroup />
          {/* Search Bar */}
          <SearchIP />
          <Button size="sm">Add</Button>
          <Button size="sm">Batch Add</Button>
          <Button variant="outline" size="sm">
            Save Filter
          </Button>
          <Button variant="outline" size="sm" disabled>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>

        <div className="flex items-center gap-2">
          {/* Action Buttons */}

          {/* Settings and Refresh */}
          <SettingButton />
          <Button variant="outline" size="sm">
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
