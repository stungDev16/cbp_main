import SidebarItem from "@/layout/sidebar/sidebar-item";
import {
  Smartphone,
  CreditCard,
  Link,
  FileText,
  Globe,
  Server,
  HardDrive,
  Zap,
  Bot,
  Code,
  Store,
  HeadphonesIcon,
} from "lucide-react";
export interface SidebarItemType {
  title: string;
  href?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  icon: any;
  hasSubmenu?: boolean;
  items?: SidebarItemType[];
}
const menuItems: SidebarItemType[] = [
  {
    title: "Cửa hàng",
    icon: Store,
    href: "/",
  },
  {
    title: "CloudPhone",
    icon: Smartphone,
    href: "/cloud-phone",
  },
  {
    title: "Proxies",
    icon: Globe,
    href: "/proxies",
  },
  {
    title: "APP",
    icon: Server,
    href: "/app",
  },
  {
    title: "Cloud Drive",
    icon: HardDrive,
    href: "/drive",
  },
  {
    title: "Automation",
    icon: Zap,
    hasSubmenu: true,
    items: [
      { title: "Synchronizer", icon: Zap, href: "/automation/synchronizer" },
      { title: "RPA", icon: Bot, href: "/automation/rpa" },
      { title: "API", icon: Code, href: "/automation/api" },
    ],
  },
  {
    title: "Nạp tiền",
    icon: CreditCard,
    href: "/topup",
  },
  {
    title: "Affiliate",
    icon: Link,
    href: "/affiliate",
  },
  {
    title: "Support",
    icon: HeadphonesIcon,
    href: "/support",
  },
  {
    title: "Document",
    icon: FileText,
    href: "/document",
  },
];
export default function SidebarGroup() {
  return (
    <nav className="flex-1 p-4 space-y-1 overflow-y-auto ">
      {menuItems.map((item) => (
        <SidebarItem key={item.title} item={item} />
      ))}
    </nav>
  );
}
