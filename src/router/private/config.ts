import DashboardLayout from "@/layout/DashboardLayout";
import AppPage from "@/pages/app/AppPage";
import CloudPhonePage from "@/pages/cloud-phone/CloudPhonePage";
import DrivePage from "@/pages/drive/DrivePage";
import HomePage from "@/pages/home/HomePage";
import ProfilePage from "@/pages/profile/ProfilePage";
import ProxiesPage from "@/pages/proxies/ProxiesPage";
import SynchronizerPage from "@/pages/synchronizer/SynchronizerPage";
import type { RoutesMapInterface } from "@router/interface/routesMap.interface.ts";

const privateRoutesMap: RoutesMapInterface[] = [
  {
    link: "/profile",
    title: "nav.PROFILE",
    Element: ProfilePage,
  },
  {
    link: "/cloud-phone",
    title: "nav.CLOUD_PHONE",
    Element: CloudPhonePage,
    Layout: DashboardLayout,
  },
  {
    link: "/proxies",
    title: "nav.PROXIES",
    Element: ProxiesPage,
    Layout: DashboardLayout,
  },
  {
    link: "/app",
    title: "nav.PROXIES",
    Element: AppPage,
    Layout: DashboardLayout,
  },
  {
    link: "/drive",
    title: "nav.PROXIES",
    Element: DrivePage,
    Layout: DashboardLayout,
  },
  {
    link: "/automation/synchronizer",
    title: "nav.PROXIES",
    Element: SynchronizerPage,
    Layout: DashboardLayout,
  },
  {
    link: "/",
    title: "nav.HOME",
    Element: HomePage,
    Layout: DashboardLayout,
  },
];
export default privateRoutesMap;
