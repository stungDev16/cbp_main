/* eslint-disable @typescript-eslint/no-explicit-any */
import { createSlice, type PayloadAction } from '@reduxjs/toolkit'  
  
interface User {  
  username: string  
  display_name?: string  
  email?: string  
}  
  
interface Device {  
  devicename: string  
  org: { orgname: string }  
  owner: string  
}  
  
interface AuthState {  
  user: User | null  
  token: string | null  
  devices: Device[]  
  orgs: any[]  
}  
  
interface AppState {  
  theme: 'light' | 'dark'  
  leftDrawer: boolean  
  rightDrawer: boolean  
  auth: AuthState  
  nav: Array<{  
    name: string  
    icon: string  
    to: string  
  }>  
  navOpened: string[]  
}  
  
const initialState: AppState = {  
  theme: 'dark',  
  leftDrawer: false,  
  rightDrawer: false,  
  auth: {  
    user: null,  
    token: null,  
    devices: [],  
    orgs: [],  
  },  
  nav: [  
    {  
      name: 'Orgs',  
      icon: 'mdi-home-group',  
      to: 'orgs',  
    },  
    {  
      name: 'Users',  
      icon: 'mdi-account-group',  
      to: 'users',  
    },  
    {  
      name: 'Devices',  
      icon: 'mdi-tablet-cellphone',  
      to: 'devices',  
    },  
  ],  
  navOpened: [],  
}  
  
const appSlice = createSlice({  
  name: 'app',  
  initialState,  
  reducers: {  
    openLeftDrawer: (state) => {  
      state.leftDrawer = false  
    },  
    toggleLeftDrawer: (state, action: PayloadAction<boolean | null>) => {  
      state.leftDrawer = action.payload === null ? !state.leftDrawer : action.payload  
    },  
    toggleRightDrawer: (state, action: PayloadAction<boolean | null>) => {  
      state.rightDrawer = action.payload === null ? !state.rightDrawer : action.payload  
    },  
    toggleTheme: (state) => {  
      state.theme = state.theme === 'light' ? 'dark' : 'light'  
    },  
    setAuth: (state, action: PayloadAction<{  
      user: User | null  
      token: string | null  
      devices?: Device[]  
      orgs?: any[]  
    }>) => {  
      const { user, token, devices = [], orgs = [] } = action.payload  
      state.auth.user = user  
      state.auth.token = token  
      state.auth.devices = devices  
      state.auth.orgs = orgs  
    },  
    logout: (state) => {  
      state.auth.user = null  
      state.auth.token = null  
      state.auth.devices = []  
      state.auth.orgs = []  
    },  
    resetNav: (state) => {  
      state.navOpened = []  
    },  
  },  
})  
  
export const {  
  openLeftDrawer,  
  toggleLeftDrawer,  
  toggleRightDrawer,  
  toggleTheme,  
  setAuth,  
  logout,  
  resetNav,  
} = appSlice.actions  
  
export default appSlice.reducer  
  
// Selectors  
export const selectIsAuth = (state: { app: AppState }) => state.app.auth.user !== null  
export const selectInitials = (state: { app: AppState }) => {  
  const username = state.app.auth.user?.username || ''  
  return `${username.substring(0, 1)}${username.substring(1, 2)}`.toUpperCase()  
}  
export const selectDevicesActive = (state: { app: AppState }) =>   
  state.app.auth.devices?.filter((d) => !!d.org && !!d.owner) || []