import type { UserContextType } from "@/context/user/_interface/UseruageContextType";
import { createContext } from "react";

export const UserContext = createContext<UserContextType | undefined>(
  undefined
);
