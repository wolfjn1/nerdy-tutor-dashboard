import { AuthStorageAdapter } from './storage-adapter'

export interface AuthToken {
  access_token: string
  refresh_token: string
  expires_at: number
  token_type: string
}

export class TokenAuthManager {
  private storageAdapter: AuthStorageAdapter
  private readonly ACCESS_TOKEN_KEY = 'tutor_access_token'
  private readonly REFRESH_TOKEN_KEY = 'tutor_refresh_token'
  private readonly EXPIRES_AT_KEY = 'tutor_token_expires'

  constructor() {
    this.storageAdapter = new AuthStorageAdapter()
  }

  // Store tokens using the best available method
  async storeTokens(tokens: AuthToken): Promise<void> {
    await Promise.all([
      this.storageAdapter.set(this.ACCESS_TOKEN_KEY, tokens.access_token),
      this.storageAdapter.set(this.REFRESH_TOKEN_KEY, tokens.refresh_token),
      this.storageAdapter.set(this.EXPIRES_AT_KEY, tokens.expires_at.toString())
    ])
  }

  // Retrieve stored tokens
  async getTokens(): Promise<AuthToken | null> {
    const [accessToken, refreshToken, expiresAt] = await Promise.all([
      this.storageAdapter.get(this.ACCESS_TOKEN_KEY),
      this.storageAdapter.get(this.REFRESH_TOKEN_KEY),
      this.storageAdapter.get(this.EXPIRES_AT_KEY)
    ])

    if (!accessToken || !refreshToken || !expiresAt) {
      return null
    }

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      expires_at: parseInt(expiresAt),
      token_type: 'Bearer'
    }
  }

  // Clear stored tokens
  async clearTokens(): Promise<void> {
    await Promise.all([
      this.storageAdapter.remove(this.ACCESS_TOKEN_KEY),
      this.storageAdapter.remove(this.REFRESH_TOKEN_KEY),
      this.storageAdapter.remove(this.EXPIRES_AT_KEY)
    ])
  }

  // Check if tokens are expired
  async isTokenExpired(): Promise<boolean> {
    const tokens = await this.getTokens()
    if (!tokens) return true
    
    return Date.now() > tokens.expires_at * 1000
  }

  // Get authorization header
  async getAuthHeader(): Promise<string | null> {
    const tokens = await this.getTokens()
    if (!tokens) return null
    
    return `${tokens.token_type} ${tokens.access_token}`
  }

  // Get storage information
  getStorageInfo() {
    return {
      type: this.storageAdapter.getStorageType(),
      isPersistent: this.storageAdapter.isPersistent(),
      warning: this.getStorageWarning()
    }
  }

  private getStorageWarning(): string | null {
    const storageType = this.storageAdapter.getStorageType()
    
    switch (storageType) {
      case 'memory':
        return 'Authentication will be lost when you close this tab. Please enable cookies for a better experience.'
      case 'sessionStorage':
        return 'You will need to log in again when you close your browser.'
      case 'localStorage':
        return 'Authentication is stored locally. Be cautious on shared computers.'
      default:
        return null
    }
  }
} 