/* eslint-disable @typescript-eslint/no-explicit-any */
import { fileUploadService } from '@/apis/services/file/file-service'
import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit'  
  
interface FileState {  
  files: string[]  
  apps: string[]  
  loading: boolean  
  error: string | null  
}  
  
const initialState: FileState = {  
  files: [],  
  apps: [],  
  loading: false,  
  error: null,  
}  
  
export const uploadFiles = createAsyncThunk(  
  'file/upload',  
  async ({ files, params = {} }: { files: File[], params?: any }) => {  
    const result = await fileUploadService.upload(files, params)  
    return result.data  
  }  
)  
  
export const fetchUploads = createAsyncThunk(  
  'file/fetchUploads',  
  async (params?: any) => {  
    const result = await fileUploadService.getUploads(params)  
    return result.data  
  }  
)  
  
export const fetchApps = createAsyncThunk(  
  'file/fetchApps',  
  async (params?: any) => {  
    const result = await fileUploadService.getApps(params)  
    return result.data  
  }  
)  
  
const fileSlice = createSlice({  
  name: 'file',  
  initialState,  
  reducers: {  
    setFiles: (state, action: PayloadAction<string[]>) => {  
      state.files = action.payload  
    },  
    setApps: (state, action: PayloadAction<string[]>) => {  
      state.apps = action.payload  
    },  
    clearError: (state) => {  
      state.error = null  
    },  
  },  
  extraReducers: (builder) => {  
    builder  
      // Upload files  
      .addCase(uploadFiles.pending, (state) => {  
        state.loading = true  
        state.error = null  
      })  
      .addCase(uploadFiles.fulfilled, (state, action) => {  
        state.loading = false  
        if (action.payload) {  
          state.files = action.payload as any  
        }  
      })  
      .addCase(uploadFiles.rejected, (state, action) => {  
        state.loading = false  
        state.error = action.error.message || 'Upload failed'  
      })  
      // Fetch uploads  
      .addCase(fetchUploads.fulfilled, (state, action) => {  
        if (action.payload) {  
          state.files = action.payload as any  
        }  
      })  
      // Fetch apps  
      .addCase(fetchApps.fulfilled, (state, action) => {  
        if (action.payload) {  
          state.apps = action.payload as any  
        }  
      })  
  },  
})  
  
export const { setFiles, setApps, clearError } = fileSlice.actions  
export default fileSlice.reducer