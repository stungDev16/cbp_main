import { Button } from "@/components/ui/button";
import { Bell, ChevronDown, HelpCircle, Menu } from "lucide-react";

export default function HeaderDashboard() {
  return (
    <header className="h-14 bg-card border-b border-border flex items-center justify-between px-4 shadow-sm">
        <div className="flex items-center">
          <Button variant="ghost" size="sm" className="hover:bg-gray-200">
            <Menu className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" className="flex items-center gap-2 hover:bg-muted">
            <div className="w-4 h-3 bg-red-500 rounded-sm flex items-center justify-center">
              <span className="text-white text-xs">🇻🇳</span>
            </div>
            <span className="text-sm">VI</span>
            <ChevronDown className="w-3 h-3" />
          </Button>

          <Button variant="ghost" size="sm" className="relative hover:bg-muted">
            <Bell className="w-4 h-4" />
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></div>
          </Button>

          <Button variant="ghost" size="sm" className="hover:bg-muted" >
            <HelpCircle className="w-4 h-4" />
          </Button>

          <div className="flex items-center gap-2 pl-2 border-l border-border">
            <div className="text-right">
              <div className="text-sm font-medium">Khách</div>
            </div>
            <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center shadow-sm">
              <span className="text-white font-bold text-xs">?</span>
            </div>
          </div>
        </div>
      </header>
  );
}
