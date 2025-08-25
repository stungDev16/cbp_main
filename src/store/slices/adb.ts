/* eslint-disable @typescript-eslint/no-explicit-any */
import { adbService } from '@/apis/services/adb/adb-service'
import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit'  
  

  
interface AdbState {  
  features: string[]  
  devices: any[]  
  device: string | null  
  display: string | null  
  audioEncoder: string  
  videoEncoder: string | null  
}  
  
const initialState: AdbState = {  
  features: [],  
  devices: [],  
  device: null,  
  display: null,  
  audioEncoder: 'raw',  
  videoEncoder: null,  
}  
  
export const fetchMetainfo = createAsyncThunk(  
  'adb/fetchMetainfo',  
  async () => {  
    const result = await adbService.metainfo()  
    return result.data  
  }  
)  
  
const adbSlice = createSlice({  
  name: 'adb',  
  initialState,  
  reducers: {  
    setDevice: (state, action: PayloadAction<string>) => {  
      state.device = action.payload  
    },  
    setDisplay: (state, action: PayloadAction<string>) => {  
      state.display = action.payload  
    },  
    setAudioEncoder: (state, action: PayloadAction<string>) => {  
      state.audioEncoder = action.payload  
    },  
    setVideoEncoder: (state, action: PayloadAction<string>) => {  
      state.videoEncoder = action.payload  
    },  
  },  
  extraReducers: (builder) => {  
    builder.addCase(fetchMetainfo.fulfilled, (state, action) => {  
      const data = action.payload as any  
      state.features = data?.features || []  
      state.devices = data?.devices || []  
        
      if (state.devices.length) {  
        const deviceInitial = state.devices[0]  
        state.device = deviceInitial.serial  
          
        if (deviceInitial.displays?.length) {  
          const displayInitial = deviceInitial.displays[0]  
          state.display = displayInitial.id  
        }  
      }  
    })  
  },  
})  
  
export const { setDevice, setDisplay, setAudioEncoder, setVideoEncoder } = adbSlice.actions  
export default adbSlice.reducer