import { useContext } from "react";
import { DevicesContext } from "../Devices.context";

export function useDevices() {
  const ctx = useContext(DevicesContext);
  if (!ctx) throw new Error("useDevices must be used within DevicesProvider");
  return ctx;
}