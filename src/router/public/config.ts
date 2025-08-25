import DashboardLayout from "@/layout/DashboardLayout";
import HomePage from "@/pages/home/HomePage";
import type { RoutesMapInterface } from "@router/interface/routesMap.interface.ts";

const publicRoutesMap: RoutesMapInterface[] = [
  {
    link: "/about",
    title: "nav.HOME",
    Element: HomePage,
    Layout: DashboardLayout,
  },
];
export default publicRoutesMap;
