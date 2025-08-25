import { configureStore } from '@reduxjs/toolkit'  
import adbReducer from './slices/adb'  
import appReducer from './slices/app'  
import fileReducer from './slices/file'  
import progressReducer from './slices/progress'  
  
export const store = configureStore({  
  reducer: {  
    app: appReducer,  
    adb: adbReducer,  
    file: fileReducer,  
    progress: progressReducer,  
  },  
})  
  
export type RootState = ReturnType<typeof store.getState>  
export type AppDispatch = typeof store.dispatch