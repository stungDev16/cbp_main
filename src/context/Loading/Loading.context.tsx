import { createContext } from 'react';
import type { LoadingContextType } from './_interface/LoadingContextType';


const defaultValue: LoadingContextType = {
  loading: false,
  setLoading: () => {
  }
};
const LoadingContext = createContext<LoadingContextType>(defaultValue);

export default LoadingContext;
