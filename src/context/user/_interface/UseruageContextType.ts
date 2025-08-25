/* eslint-disable @typescript-eslint/no-explicit-any */
export interface UserContextType {
  user: any;
  setUser: (user: any) => void;
  loading: boolean;
  fetchUserData: () => Promise<void>;
  handleLogout: () => void;
  isAuth: boolean;
}
