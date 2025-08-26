/* eslint-disable @typescript-eslint/no-explicit-any */
import { SERVER_URL } from "@/config/site.config";

import {
  getAccessFromLocalStorage,
  getRefreshFromLocalStorage,
  removeTokenFromLocalStorage,
  setAccessFromToLocalStorage,
  setRefreshFromToLocalStorage,
} from '@/lib/utils'
import axios, {
  AxiosError,
  type AxiosInstance,
  type AxiosRequestConfig,
} from 'axios'

export interface ApiResponse<T = any> {
  success: boolean
  message?: string
  data?: T
  errorCode?: string
  rawData?: any
}

// Queue để xử lý multiple requests trong lúc refresh
interface PendingRequest {
  resolve: (value: any) => void
  reject: (error: any) => void
  config: AxiosRequestConfig
}

class ApiClient {
  private instance: AxiosInstance
  static token: string | null = getAccessFromLocalStorage()
  private isRefreshing = false
  private pendingRequests: PendingRequest[] = []

  setToken(token: string) {
    ApiClient.token = token
    setAccessFromToLocalStorage(token)

    // Cập nhật default header cho instance
    this.instance.defaults.headers.common['Authorization'] = `Bearer ${token}`
  }

  clearToken() {
    ApiClient.token = null
    removeTokenFromLocalStorage()
    delete this.instance.defaults.headers.common['Authorization']
  }

  constructor() {
    this.instance = axios.create({
      baseURL: `${SERVER_URL()}`,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    this.setupInterceptors()
  }

  private setupInterceptors(): void {
    // Request interceptor
    this.instance.interceptors.request.use(
      (config) => {
        // Thêm token vào header nếu đã đăng nhập
        if (ApiClient.token) {
          config.headers = config.headers || {}
          config.headers.Authorization = `Bearer ${ApiClient.token}`
				}
        return config
      },
      (error) => {
        return Promise.reject(error)
      },
    )

    // Response interceptor
    this.instance.interceptors.response.use(
      (response) => {
        return response
      },
      async (error: AxiosError) => {
        const originalRequest = error.config

        // Kiểm tra lỗi 401 và chưa retry
        if (
          error.response?.status === 401 &&
          originalRequest &&
          !originalRequest._retry
        ) {
          // Đánh dấu request đã retry để tránh infinite loop
          originalRequest._retry = true

          try {
            // Thử refresh token
            await this.handleTokenRefresh()

            // Retry request với token mới
            if (ApiClient.token) {
              originalRequest.headers = originalRequest.headers || {}
              originalRequest.headers.Authorization = `Bearer ${ApiClient.token}`
            }

            return this.instance(originalRequest)
          } catch (refreshError) {
            // Refresh thất bại, logout user
            this.handleRefreshFailure()
            return Promise.reject(refreshError)
          }
        }

        // Xử lý các lỗi khác
        return this.handleApiError(error)
      },
    )
  }

  private extractErrorCode(error: AxiosError): string | undefined {
    return error.response?.data &&
      typeof error.response.data === 'object' &&
      'errorCode' in error.response.data
      ? (error.response.data as any).errorCode
      : undefined
  }

  private async handleTokenRefresh(): Promise<void> {
    if (this.isRefreshing) {
      // Nếu đang refresh, đợi trong queue
      return new Promise((resolve, reject) => {
        this.pendingRequests.push({
          resolve: () => resolve(),
          reject: (error) => reject(error),
          config: {}, // Không cần config cho việc đợi refresh
        })
      })
    }

    this.isRefreshing = true

    try {
      console.log('🔄 Refreshing token...')
      const refreshToken = getRefreshFromLocalStorage()
      if (!refreshToken) {
        throw new Error('No refresh token available')
      }

      // Gọi API refresh token
      const response = await fetch(`${SERVER_URL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({refresh_token: refreshToken}),
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()

      // Kiểm tra structure của response
      if (data.success && data.data) {
        const newAccessToken = data.data.access_token
        const newRefreshToken = data.data.refresh_token

        if (!newAccessToken) {
          throw new Error('No access token in refresh response')
        }

        // Cập nhật token
        setAccessFromToLocalStorage(newAccessToken)
        if (newRefreshToken) {
          setRefreshFromToLocalStorage(newRefreshToken)
        }
        this.setToken(newAccessToken)

        console.log('✅ Token refreshed successfully')

        // Resolve tất cả pending requests
        this.processPendingRequests()
      } else {
        throw new Error(data.message || 'Invalid refresh token response')
      }
    } catch (error) {
      console.error('❌ Refresh token failed:', error)
      // Reject tất cả pending requests
      this.rejectPendingRequests(error)
      throw error
    } finally {
      this.isRefreshing = false
      this.pendingRequests = []
    }
  }

  private processPendingRequests(): void {
    this.pendingRequests.forEach(({resolve}) => {
      resolve(undefined)
    })
  }

  private rejectPendingRequests(error: any): void {
    this.pendingRequests.forEach(({reject}) => {
      reject(error)
    })
  }

  private handleRefreshFailure(): void {
    console.warn('🚨 Refresh failed - logging out user')

    // Clear tokens
    removeTokenFromLocalStorage()
    ApiClient.token = null

    // Dispatch event để các component khác có thể lắng nghe
    window.dispatchEvent(
      new CustomEvent('tokenExpired', {
        detail: {message: 'Phiên đăng nhập đã hết hạn'},
      }),
    )

    // Delay để đảm bảo events được xử lý trước khi redirect
    setTimeout(() => {
      if (window.location.pathname !== '/auth/login') {
				localStorage.removeItem('selectedWorkspace');
				window.location.href = '/auth/login'
      }
    }, 100)
  }

  private handleApiError(error: AxiosError): Promise<never> {
    const errorCode = this.extractErrorCode(error)

    // Trích xuất thông tin lỗi
    const status = error.response?.status
    const errorData = error.response?.data as any
    const errorMessage =
      errorData?.message || error.message || 'Unknown error occurred'

    // Xử lý các case đặc biệt tại tầng client
    switch (errorCode) {
      case 'TOKEN_INVALIDATED':
        this.handleUnauthorized()
        break

      default:
        // Log error details
        console.error('API error:', {
          status,
          message: errorMessage,
          code: errorCode,
          url: error.config?.url,
        })
    }

    // Dispatch event để GlobalErrorListener xử lý UI notification
    window.dispatchEvent(
      new CustomEvent('api-error', {
        detail: {
          status,
          message: errorMessage,
          code: errorCode,
          url: error.config?.url,
        },
      }),
    )

    // Reject promise với error đã được chuẩn hóa
    return Promise.reject({
      message: errorMessage,
      status,
      code: errorCode,
      data: errorData,
    })
  }

  private handleUnauthorized(): void {
    console.warn('🚨 Token invalidated - logging out user')
    removeTokenFromLocalStorage()

    // Dispatch event để GlobalErrorListener xử lý
    window.dispatchEvent(new CustomEvent('tokenExpired'))
  }

  public getToken(): string | null {
    return ApiClient.token
  }

  public isTokenExpired(token?: string): boolean {
    const tokenToCheck = token || ApiClient.token
    if (!tokenToCheck) return true

    try {
      // Decode JWT token để kiểm tra expiry
      const payload = JSON.parse(atob(tokenToCheck.split('.')[1]))
      const currentTime = Math.floor(Date.now() / 1000)

      // Kiểm tra nếu token sắp hết hạn trong 5 phút tới
      return payload.exp < currentTime + 300
    } catch {
      return true
    }
  }

  public async ensureValidToken(): Promise<void> {
    if (this.isTokenExpired()) {
      await this.handleTokenRefresh()
    }
  }

  // Các phương thức HTTP
  async get<T = any>(
    url: string,
    config?: AxiosRequestConfig,
  ): Promise<ApiResponse<T>> {
    const response = await this.instance.get<ApiResponse<T>>(url, config)
    return {
      ...response.data,
      rawData: response,
    }
  }

  async post<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
  ): Promise<ApiResponse<T>> {
    // Kiểm tra nếu data là FormData
    const isFormData = data instanceof FormData

    // Tạo config mới với headers phù hợp
    const configWithHeaders: AxiosRequestConfig = {
      ...config,
      headers: {
        ...config?.headers,
        ...(isFormData
          ? {'Content-Type': undefined}
          : {'Content-Type': 'application/json'}),
      },
    }

    const response = await this.instance.post<ApiResponse<T>>(
      url,
      data,
      configWithHeaders,
    )
    return {
      ...response.data,
      rawData: response.data,
    }
  }

  async put<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
  ): Promise<ApiResponse<T>> {
    const response = await this.instance.put<ApiResponse<T>>(url, data, config)
    return {
      ...response.data,
      rawData: response,
    }
  }

  async patch<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
  ): Promise<ApiResponse<T>> {
    const response = await this.instance.patch<ApiResponse<T>>(
      url,
      data,
      config,
    )
    return {
      ...response.data,
      rawData: response,
    }
  }

  async delete<T = any>(
    url: string,
    config?: AxiosRequestConfig,
  ): Promise<ApiResponse<T>> {
    const response = await this.instance.delete<ApiResponse<T>>(url, config)
    return {
      ...response.data,
      rawData: response,
    }
  }
}

// Extend AxiosRequestConfig để thêm _retry property
declare module 'axios' {
  interface AxiosRequestConfig {
    _retry?: boolean
  }
}

const Client = new ApiClient()
export default Client
