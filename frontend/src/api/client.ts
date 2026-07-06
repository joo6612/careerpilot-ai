import { authService } from '../auth/auth.service';

const API_URL = import.meta.env.VITE_API_URL || 'https://careerpilot-ai-ii4p.onrender.com';

/**
 * Reusable HTTP API Client.
 * Automatically fetches fresh Firebase ID tokens and attaches them as Bearer tokens to outbound requests.
 */
export class ApiClient {
  private static tokenResolver: (() => Promise<string | null>) | null = null;

  /**
   * Registers a token resolver callback (typically from AuthContext).
   */
  static registerTokenResolver(resolver: () => Promise<string | null>): void {
    this.tokenResolver = resolver;
  }

  private static async getHeaders(customHeaders: Record<string, string> = {}): Promise<HeadersInit> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...customHeaders
    };

    try {
      // Resolve token from AuthContext if registered, otherwise fallback to direct authService
      let token: string | null = null;
      if (this.tokenResolver) {
        token = await this.tokenResolver();
      } else {
        token = await authService.getIdToken();
      }

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    } catch (error) {
      console.warn('[API-CLIENT] Failed to retrieve auth token dynamically:', error);
    }

    return headers;
  }

  /**
   * Helper request builder executing the fetch pipeline.
   */
  private static async request<T>(
    path: string, 
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_URL}${path.startsWith('/') ? path : `/${path}`}`;
    const headers = await this.getHeaders((options.headers as Record<string, string>) || {});
    
    const response = await fetch(url, {
      ...options,
      headers
    });

    if (!response.ok) {
      const errMessage = await response.text().catch(() => 'Unknown API error');
      throw new Error(`[API-CLIENT] HTTP Error ${response.status}: ${errMessage}`);
    }

    return response.json() as Promise<T>;
  }

  static async get<T>(path: string, customHeaders?: Record<string, string>): Promise<T> {
    return this.request<T>(path, { method: 'GET', headers: customHeaders });
  }

  static async post<T>(path: string, body: any, customHeaders?: Record<string, string>): Promise<T> {
    return this.request<T>(path, {
      method: 'POST',
      headers: customHeaders,
      body: JSON.stringify(body)
    });
  }

  static async put<T>(path: string, body: any, customHeaders?: Record<string, string>): Promise<T> {
    return this.request<T>(path, {
      method: 'PUT',
      headers: customHeaders,
      body: JSON.stringify(body)
    });
  }

  static async patch<T>(path: string, body: any, customHeaders?: Record<string, string>): Promise<T> {
    return this.request<T>(path, {
      method: 'PATCH',
      headers: customHeaders,
      body: JSON.stringify(body)
    });
  }

  static async delete<T>(path: string, customHeaders?: Record<string, string>): Promise<T> {
    return this.request<T>(path, { method: 'DELETE', headers: customHeaders });
  }
}

export default ApiClient;
