/* eslint-disable @typescript-eslint/no-unused-expressions */

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
const isBrower = typeof window !== "undefined";
export const getAccessFromLocalStorage = () =>
  isBrower ? localStorage.getItem("accessToken") : null;
export const getRefreshFromLocalStorage = () =>
  isBrower ? localStorage.getItem("refreshToken") : null;
//
export const setAccessFromToLocalStorage = (value: string) =>
  isBrower && localStorage.setItem("accessToken", value);

//
export const setRefreshFromToLocalStorage = (value: string) =>
  isBrower && localStorage.setItem("refreshToken", value);
//
export const removeTokenFromLocalStorage = () => {
  isBrower && localStorage.removeItem("accessToken");
  isBrower && localStorage.removeItem("refreshToken");
  isBrower && localStorage.removeItem("Role");
  isBrower && localStorage.removeItem("userId");
};
