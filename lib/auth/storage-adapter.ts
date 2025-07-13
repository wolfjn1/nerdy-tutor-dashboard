// Storage adapter for authentication - handles cookie failures gracefully
export class AuthStorageAdapter {
  private storageType: 'cookie' | 'localStorage' | 'sessionStorage' | 'memory' = 'cookie'
  private memoryStorage: Map<string, string> = new Map()

  constructor() {
    this.detectBestStorage()
  }

  private detectBestStorage() {
    // Check if cookies are available
    if (this.testCookies()) {
      this.storageType = 'cookie'
      return
    }

    // Check if localStorage is available
    if (this.testLocalStorage()) {
      this.storageType = 'localStorage'
      console.warn('Cookies unavailable, falling back to localStorage')
      return
    }

    // Check if sessionStorage is available
    if (this.testSessionStorage()) {
      this.storageType = 'sessionStorage'
      console.warn('Cookies and localStorage unavailable, falling back to sessionStorage')
      return
    }

    // Fall back to memory storage
    this.storageType = 'memory'
    console.warn('All storage methods unavailable, using memory storage (will not persist)')
  }

  private testCookies(): boolean {
    try {
      document.cookie = 'test=1; SameSite=Strict'
      const cookieEnabled = document.cookie.includes('test=1')
      // Clean up
      document.cookie = 'test=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
      return cookieEnabled
    } catch {
      return false
    }
  }

  private testLocalStorage(): boolean {
    try {
      const test = '__localStorage_test__'
      localStorage.setItem(test, test)
      localStorage.removeItem(test)
      return true
    } catch {
      return false
    }
  }

  private testSessionStorage(): boolean {
    try {
      const test = '__sessionStorage_test__'
      sessionStorage.setItem(test, test)
      sessionStorage.removeItem(test)
      return true
    } catch {
      return false
    }
  }

  // Generic get method
  async get(key: string): Promise<string | null> {
    switch (this.storageType) {
      case 'cookie':
        return this.getCookie(key)
      case 'localStorage':
        return localStorage.getItem(key)
      case 'sessionStorage':
        return sessionStorage.getItem(key)
      case 'memory':
        return this.memoryStorage.get(key) || null
    }
  }

  // Generic set method
  async set(key: string, value: string, options?: { expires?: number }): Promise<void> {
    switch (this.storageType) {
      case 'cookie':
        this.setCookie(key, value, options)
        break
      case 'localStorage':
        localStorage.setItem(key, value)
        break
      case 'sessionStorage':
        sessionStorage.setItem(key, value)
        break
      case 'memory':
        this.memoryStorage.set(key, value)
        break
    }
  }

  // Generic remove method
  async remove(key: string): Promise<void> {
    switch (this.storageType) {
      case 'cookie':
        this.removeCookie(key)
        break
      case 'localStorage':
        localStorage.removeItem(key)
        break
      case 'sessionStorage':
        sessionStorage.removeItem(key)
        break
      case 'memory':
        this.memoryStorage.delete(key)
        break
    }
  }

  private getCookie(name: string): string | null {
    const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'))
    return match ? match[2] : null
  }

  private setCookie(name: string, value: string, options?: { expires?: number }) {
    let cookie = `${name}=${value}; path=/; SameSite=Strict`
    
    if (options?.expires) {
      const date = new Date()
      date.setTime(date.getTime() + options.expires)
      cookie += `; expires=${date.toUTCString()}`
    }
    
    document.cookie = cookie
  }

  private removeCookie(name: string) {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`
  }

  // Get current storage type
  getStorageType() {
    return this.storageType
  }

  // Check if storage is persistent
  isPersistent() {
    return this.storageType !== 'memory' && this.storageType !== 'sessionStorage'
  }
} 