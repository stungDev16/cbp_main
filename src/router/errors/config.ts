import Error404Page from "@/pages/error/404/page";
import type { RoutesMapInterface } from "@router/interface/routesMap.interface.ts";

const errorsRoutesMap: RoutesMapInterface[] = [
  {
    link: "/404",
    title: "nav.404",
    Element: Error404Page,
  },
  {
    link: "*",
    title: "nav.404",
    Element: Error404Page,
  },
];
export default errorsRoutesMap;
