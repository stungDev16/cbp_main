/* eslint-disable @typescript-eslint/no-explicit-any */
class StorageService {  
  setLocal(key: string, value: any): void {  
    try {  
      localStorage.setItem(key, JSON.stringify(value))  
    } catch (error) {  
      console.error('Error saving to localStorage:', error)  
    }  
  }  
  
  getLocal(key: string): any {  
    try {  
      const item = localStorage.getItem(key)  
      return item ? JSON.parse(item) : null  
    } catch (error) {  
      console.error('Error reading from localStorage:', error)  
      return null  
    }  
  }  
  
  removeLocal(key: string): void {  
    try {  
      localStorage.removeItem(key)  
    } catch (error) {  
      console.error('Error removing from localStorage:', error)  
    }  
  }  
  
  setSession(key: string, value: any): void {  
    try {  
      sessionStorage.setItem(key, JSON.stringify(value))  
    } catch (error) {  
      console.error('Error saving to sessionStorage:', error)  
    }  
  }  
  
  getSession(key: string): any {  
    try {  
      const item = sessionStorage.getItem(key)  
      return item ? JSON.parse(item) : null  
    } catch (error) {  
      console.error('Error reading from sessionStorage:', error)  
      return null  
    }  
  }  
  
  removeSession(key: string): void {  
    try {  
      sessionStorage.removeItem(key)  
    } catch (error) {  
      console.error('Error removing from sessionStorage:', error)  
    }  
  }  
}  
  
export const storage = new StorageService()