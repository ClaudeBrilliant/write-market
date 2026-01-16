/**
 * Centralized API client for backend communication
 */

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

interface ApiResponse<T = any> {
  data?: T;
  message?: string;
  error?: string;
}

interface RequestOptions extends RequestInit {
  requireAuth?: boolean;
}

class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public data?: any,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

class ApiClient {
  private getAuthToken(): string | null {
    return localStorage.getItem('token');
  }

  private async request<T>(
    endpoint: string,
    options: RequestOptions = {},
  ): Promise<T> {
    const { requireAuth = true, ...fetchOptions } = options;

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...fetchOptions.headers,
    };

    if (requireAuth) {
      const token = this.getAuthToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    const url = `${API_URL}${endpoint}`;

    try {
      const response = await fetch(url, {
        ...fetchOptions,
        headers,
        credentials: 'include',
      });

      let data: ApiResponse<T>;
      const contentType = response.headers.get('content-type');

      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const text = await response.text();
        data = text ? { message: text } : {};
      }

      if (!response.ok) {
        throw new ApiError(
          data.message || data.error || `HTTP error! status: ${response.status}`,
          response.status,
          data,
        );
      }

      return (data.data ?? data) as T;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }

      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        throw new ApiError(
          'Unable to connect to the server. Please check your connection.',
          0,
        );
      }

      throw new ApiError(
        error instanceof Error ? error.message : 'An unexpected error occurred',
        0,
      );
    }
  }

  // Auth endpoints
  async login(email: string, password: string) {
    return this.request<{
      token: { accessToken: string };
      user: {
        id: string;
        email: string;
        firstName: string;
        lastName: string;
        role: 'ADMIN' | 'WRITER';
        status: string;
      };
    }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
      requireAuth: false,
    });
  }

  async register(data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role?: 'ADMIN' | 'WRITER';
  }) {
    return this.request<{ message: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
      requireAuth: false,
    });
  }

  async logout() {
    return this.request<{ message: string }>('/auth/logout', {
      method: 'POST',
    });
  }

  async verifyEmail(token: string) {
    return this.request<{ message: string }>(
      `/auth/verify-email?token=${encodeURIComponent(token)}`,
      {
        method: 'GET',
        requireAuth: false,
      },
    );
  }

  async resendVerification(email: string) {
    return this.request<{ message: string }>('/auth/resend-verification', {
      method: 'POST',
      body: JSON.stringify({ email }),
      requireAuth: false,
    });
  }

  async requestPasswordReset(email: string) {
    return this.request<{ message: string }>('/auth/request-password-reset', {
      method: 'POST',
      body: JSON.stringify({ email }),
      requireAuth: false,
    });
  }

  async resetPassword(token: string, newPassword: string) {
    return this.request<{ message: string }>('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, newPassword }),
      requireAuth: false,
    });
  }

  // Tasks endpoints
  async getTasks(params?: {
    status?: string;
  }) {
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.append('status', params.status);

    const query = queryParams.toString();
    return this.request<any[]>(`/tasks${query ? `?${query}` : ''}`, {
      method: 'GET',
    });
  }

  async getAvailableTasks() {
    return this.request<any[]>('/tasks/available', {
      method: 'GET',
    });
  }

  async getTask(id: string) {
    return this.request<any>(`/tasks/${id}`, {
      method: 'GET',
    });
  }

  async createTask(data: any) {
    return this.request<any>('/tasks', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateTask(id: string, data: any) {
    return this.request<any>(`/tasks/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteTask(id: string) {
    return this.request<{ message: string }>(`/tasks/${id}`, {
      method: 'DELETE',
    });
  }

  // Bids endpoints
  async getMyBids() {
    return this.request<any[]>('/bids/my-bids', {
      method: 'GET',
    });
  }

  async getTaskBids(taskId: string) {
    return this.request<any[]>(`/bids/task/${taskId}`, {
      method: 'GET',
    });
  }

  async createBid(data: { taskId: string; amount: number; proposal?: string }) {
    return this.request<any>('/bids', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async approveBid(id: string) {
    return this.request<any>(`/bids/${id}/approve`, {
      method: 'PATCH',
    });
  }

  async rejectBid(id: string) {
    return this.request<any>(`/bids/${id}/reject`, {
      method: 'PATCH',
    });
  }

  async withdrawBid(id: string) {
    return this.request<{ message: string }>(`/bids/${id}`, {
      method: 'DELETE',
    });
  }

  // Transactions endpoints
  async getTransactions(params?: {
    type?: string;
    status?: string;
  }) {
    const queryParams = new URLSearchParams();
    if (params?.type) queryParams.append('type', params.type);
    if (params?.status) queryParams.append('status', params.status);

    const query = queryParams.toString();
    return this.request<any[]>(`/transactions${query ? `?${query}` : ''}`, {
      method: 'GET',
    });
  }

  async getMyTransactions(params?: {
    type?: string;
    status?: string;
  }) {
    const queryParams = new URLSearchParams();
    if (params?.type) queryParams.append('type', params.type);
    if (params?.status) queryParams.append('status', params.status);

    const query = queryParams.toString();
    return this.request<any[]>(`/transactions/my-transactions${query ? `?${query}` : ''}`, {
      method: 'GET',
    });
  }

  // Users endpoints
  async getProfile() {
    return this.request<any>('/users/profile', {
      method: 'GET',
    });
  }

  async getDashboardStats() {
    return this.request<any>('/users/dashboard', {
      method: 'GET',
    });
  }

  async updateProfile(data: any) {
    return this.request<any>('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Admin endpoints
  async getAdminStats(params?: { startDate?: string; endDate?: string }) {
    const queryParams = new URLSearchParams();
    if (params?.startDate) queryParams.append('startDate', params.startDate);
    if (params?.endDate) queryParams.append('endDate', params.endDate);

    const query = queryParams.toString();
    return this.request<any>(`/admin/statistics${query ? `?${query}` : ''}`, {
      method: 'GET',
    });
  }

  async getAdminDashboard() {
    return this.request<any>('/admin/dashboard', {
      method: 'GET',
    });
  }

  async getUsers(params?: { status?: string }) {
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.append('status', params.status);

    const query = queryParams.toString();
    return this.request<any[]>(`/admin/users${query ? `?${query}` : ''}`, {
      method: 'GET',
    });
  }

  async updateUserStatus(userId: string, status: string) {
    return this.request<any>(`/admin/users/${userId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }
}

export const api = new ApiClient();
export { ApiError };
export type { ApiResponse };

