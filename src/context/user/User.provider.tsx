/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useMemo, useCallback } from "react";
import { UserContext } from "./User.context";
import {
  getAccessFromLocalStorage,
  removeTokenFromLocalStorage,
} from "@/lib/utils";
import type { UserContextType } from "@/context/user/_interface/UseruageContextType";
import { userService } from "@/apis/services/auth/user-service";
import LoadingSystem from "@/components/lazy/loading/LoadingSystem";

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUserData = async () => {
    try {
      const { data, success } = await userService.me();
      if (!success) {
        setLoading(false);
        return;
      }
      setUser(data);
    } catch (error: any) {
      console.log("Error fetching user data:", error);

      handleLogout();
      return;
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = useCallback((callback?: () => void) => {
    removeTokenFromLocalStorage();
    setUser(null);
    callback?.();
  }, []);

  useEffect(() => {
    setLoading(true);
    const token = getAccessFromLocalStorage();
    if (token) {
      fetchUserData();
    } else {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const isAuth = useMemo(() => !!user && !!getAccessFromLocalStorage(), [user]);

  if (loading) return <LoadingSystem />


  const value: UserContextType = {
    user,
    setUser,
    loading,
    fetchUserData,
    handleLogout,
    isAuth,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};
