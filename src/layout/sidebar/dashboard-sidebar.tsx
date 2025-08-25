import Link from "@/components/common/Link";
import SidebarGroup from "@/layout/sidebar/sidebar-group";
import { Smartphone } from "lucide-react";

export function Sidebar() {
  return (
    <div className="w-64 bg-sidebar border-r border-sidebar-border flex flex-col h-full">
      <Link href="/" className="p-4 border-b border-sidebar-border cursor-pointer">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-lg flex items-center justify-center">
            <Smartphone className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-sidebar-foreground text-lg">
            CloudBoxPhone
          </span>
        </div>
      </Link>

      <SidebarGroup />

      <div className="p-4 bg-muted border-t border-sidebar-border">
        <div className="space-y-2 text-xs text-muted-foreground">
          <div className="flex justify-between items-center">
            <span>Cloud Phone</span>
            <span className="font-medium text-sidebar-foreground">0</span>
          </div>
          <div className="flex justify-between items-center">
            <span>Cloud Drive</span>
            <span className="font-medium text-sidebar-foreground">0 / 5GB</span>
          </div>
        </div>
      </div>
    </div>
  );
}
