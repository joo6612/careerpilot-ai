const ENV_BASE_URL = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || '';

export interface ApiClientOptions extends RequestInit {
  params?: Record<string, string>;
}

export class ApiClient {
  private static getToken(): string {
    const storedToken =
      localStorage.getItem('auth_token') ||
      localStorage.getItem('token') ||
      sessionStorage.getItem('auth_token');

    if (storedToken && storedToken !== 'undefined' && storedToken !== 'null') {
      return storedToken;
    }

    return '';
  }

  public static normalizeEndpoint(endpoint: string): string {
    if (endpoint.startsWith('http')) return endpoint;
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const cleanBase = ENV_BASE_URL.replace(/\/+$/, '');

    if (cleanBase) {
      if (cleanBase.endsWith('/api')) {
        return cleanEndpoint.startsWith('/api/')
          ? `${cleanBase}${cleanEndpoint.slice(4)}`
          : `${cleanBase}${cleanEndpoint}`;
      }
      return cleanEndpoint.startsWith('/api')
        ? `${cleanBase}${cleanEndpoint}`
        : `${cleanBase}/api${cleanEndpoint}`;
    }

    return cleanEndpoint.startsWith('/api') ? cleanEndpoint : `/api${cleanEndpoint}`;
  }

  public static async request<T = any>(
    endpoint: string,
    options: ApiClientOptions = {}
  ): Promise<T> {
    const { params, headers = {}, ...customConfig } = options;
    let url = this.normalizeEndpoint(endpoint);

    if (params) {
      const searchParams = new URLSearchParams(params);
      url += (url.includes('?') ? '&' : '?') + searchParams.toString();
    }

    const token = this.getToken();
    const requestHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...(headers as Record<string, string>),
    };

    const response = await fetch(url, {
      ...customConfig,
      headers: requestHeaders,
    });

    // Read body stream once as text to avoid "body stream already read" TypeError
    const rawText = await response.text();

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        // Automatically evict stale/expired token to prevent corrupted state lock
        console.warn('[API-CLIENT] 401/403 Unauthorized received. Purging stale auth tokens.');
        localStorage.removeItem('auth_token');
        localStorage.removeItem('token');
        localStorage.removeItem('is_demo_mode');
        sessionStorage.removeItem('auth_token');
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('auth:expired'));
        }
      }

      let errorMessage = `HTTP Error ${response.status}`;
      if (rawText) {
        try {
          const errorJson = JSON.parse(rawText);
          errorMessage += `: ${JSON.stringify(errorJson)}`;
        } catch {
          errorMessage += `: ${rawText.slice(0, 200)}`;
        }
      }
      throw new Error(`[API-CLIENT] ${errorMessage}`);
    }

    if (response.status === 204 || !rawText) {
      return {} as T;
    }

    try {
      return JSON.parse(rawText) as T;
    } catch (err) {
      throw new Error(`[API-CLIENT] Invalid JSON response from ${url}: ${rawText.slice(0, 100)}`);
    }
  }

  public static get<T = any>(endpoint: string, options: ApiClientOptions = {}) {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  public static post<T = any>(endpoint: string, body?: any, options: ApiClientOptions = {}) {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  public static put<T = any>(endpoint: string, body?: any, options: ApiClientOptions = {}) {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  public static patch<T = any>(endpoint: string, body?: any, options: ApiClientOptions = {}) {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  public static delete<T = any>(endpoint: string, options: ApiClientOptions = {}) {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }
}

export default ApiClient;
