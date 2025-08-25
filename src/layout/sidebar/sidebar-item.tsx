import useNavigate from "@/hooks/useNavigate";
import { useRouteProps } from "@/hooks/useRouteProps";
import type { SidebarItemType } from "@/layout/sidebar/sidebar-group";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";
import { memo, useMemo, useState } from "react";

function SidebarItem({ item }: { item: SidebarItemType }) {
  const [open, setOpen] = useState(false);
  const Icon = item.icon;
  const navigate = useNavigate();
  const { location } = useRouteProps();
  const isActive = useMemo(() => {
    if (!item.href) return false;

    // Normalize paths (remove trailing slashes, keep '/' as root)
    const normalize = (p: string) => {
      const v = p.replace(/\/+$/, "");
      return v === "" ? "/" : v;
    };

    const path = normalize(location.pathname);
    const href = normalize(item.href);

    if (href === "/") {
      return path === "/";
    }

    return path === href || path.startsWith(href + "/");
  }, [location.pathname, item.href]);

  return (
    <div>
      <button
        onClick={() =>
          item.hasSubmenu ? setOpen(!open) : item.href && navigate(item.href)
        }
        className={cn(
          "w-full flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg transition-all duration-200 font-medium",
          isActive
            ? "bg-emerald-50 text-emerald-700 shadow"
            : "text-muted-foreground hover:bg-emerald-50 hover:text-emerald-700"
        )}
      >
        {Icon ? <Icon className={cn("w-4 h-4")} /> : null}
        <span className="flex-1 text-left">{item.title}</span>
        {item.hasSubmenu && (
          <ChevronDown
            className={cn(
              "w-4 h-4 transition-transform duration-200",
              open ? "rotate-180" : ""
            )}
          />
        )}
      </button>

      {item.hasSubmenu && item.items && open && (
        <div className="ml-6 mt-1 space-y-1 border-l border-sidebar-border pl-4">
          {item.items.map((subItem: SidebarItemType) => {
            const SubIcon = subItem.icon;
            return (
              <button
                onClick={() => {
                  if (subItem.href) {
                    navigate(subItem.href);
                  }
                }}
                key={subItem.title}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-all duration-200 font-medium",
                  isActive
                    ? "bg-emerald-50 text-emerald-700 shadow"
                    : "text-muted-foreground hover:bg-emerald-50 hover:text-emerald-700"
                )}
              >
                {SubIcon ? <SubIcon className={cn("w-4 h-4")} /> : null}
                <span>{subItem.title}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
export default memo(SidebarItem);
