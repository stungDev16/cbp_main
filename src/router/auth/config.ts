import AuthLayout from "@/layout/AuthLayout";
import ForgotPassword from "@/pages/auth/ForgotPassword";
import LoginPage from "@/pages/auth/LoginPage";
import RegisterPage from "@/pages/auth/ResgiterPage";
import type { RoutesMapInterface } from "@router/interface/routesMap.interface.ts";

const authRoutesMap: RoutesMapInterface[] = [
  {
    link: "/auth/login",
    title: "nav.LOGIN",
    Element: LoginPage,
    Layout: AuthLayout,
  },
  {
    link: "/auth/register",
    title: "nav.LOGIN",
    Element: RegisterPage,
    Layout: AuthLayout,
  },
  {
    link: "/auth/forgot-password",
    title: "nav.LOGIN",
    Element: ForgotPassword,
    Layout: AuthLayout,
  },
];
export default authRoutesMap;
