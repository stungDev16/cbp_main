import { createSlice, type PayloadAction } from '@reduxjs/toolkit'  
  
interface ProgressState {  
  progress: number  
}  
  
const initialState: ProgressState = {  
  progress: 0,  
}  
  
const progressSlice = createSlice({  
  name: 'progress',  
  initialState,  
  reducers: {  
    setProgress: (state, action: PayloadAction<number>) => {  
      state.progress = action.payload  
    },  
    resetProgress: (state) => {  
      state.progress = 0  
    },  
  },  
})  
  
export const { setProgress, resetProgress } = progressSlice.actions  
export default progressSlice.reducer