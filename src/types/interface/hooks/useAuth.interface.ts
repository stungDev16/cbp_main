export interface UseAuthReturnType {
  isAuth: boolean;
  userId: string;
  token: string;
  setAuth: (saveData: UseAuthSaveData) => void;
  getNextPath: () => string;
  logout: (callback: () => void) => void;
}
export interface UseAuthSaveData {
  userId: string;
  token: string;
}
