import { createContext } from "react";
import type { DevicesContextType } from "./_interface/DevicesContextType";

export const DevicesContext = createContext<DevicesContextType | undefined>(undefined);
