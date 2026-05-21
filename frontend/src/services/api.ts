const BASE_URL = 'http://localhost:5000/api';

const getAuthHeaders = (): Record<string, string> => {
  const authData = localStorage.getItem('auth_user');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (authData) {
    try {
      const user = JSON.parse(authData);
      if (user.token) {
        headers['Authorization'] = `Bearer ${user.token}`;
      }
    } catch {
      // Invalid auth data, proceed without token
    }
  }

  return headers;
};

const handleResponse = async <T>(response: Response): Promise<T> => {
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || `HTTP error ${response.status}`);
  }

  return data;
};

export const api = {
  get: async <T>(endpoint: string): Promise<T> => {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'GET',
      headers: getAuthHeaders(),
      credentials: 'include',
    });
    return handleResponse<T>(response);
  },

  post: async <T>(endpoint: string, body: unknown): Promise<T> => {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(body),
      credentials: 'include',
    });
    return handleResponse<T>(response);
  },

  put: async <T>(endpoint: string, body?: unknown): Promise<T> => {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: body ? JSON.stringify(body) : undefined,
      credentials: 'include',
    });
    return handleResponse<T>(response);
  },

  delete: async <T>(endpoint: string): Promise<T> => {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
      credentials: 'include',
    });
    return handleResponse<T>(response);
  },
};

export interface Task {
  _id: string;
  title: string;
  description: string;
  status: 'pending' | 'completed';
  priority: 'Low' | 'Medium' | 'High';
  createdAt?: string;
  updatedAt?: string;
}

export interface TaskInput {
  title: string;
  description: string;
  priority: 'Low' | 'Medium' | 'High';
}

export const taskService = {
  getAll: async (): Promise<Task[]> => {
    return api.get<Task[]>('/tasks');
  },

  create: async (taskData: TaskInput): Promise<Task> => {
    return api.post<Task>('/tasks', taskData);
  },

  updateStatus: async (id: string, status: 'pending' | 'completed'): Promise<Task> => {
    return api.put<Task>(`/tasks/${id}`, { status });
  },

  delete: async (id: string): Promise<void> => {
    return api.delete<void>(`/tasks/${id}`);
  },
};

export interface AuthResponse {
  message: string;
  user: {
    _id: string;
    username: string;
    email: string;
  };
  token?: string;
}

export const authService = {
  login: async (email: string, password: string): Promise<AuthResponse> => {
    return api.post<AuthResponse>('/auth/login', { email, password });
  },

  register: async (username: string, email: string, password: string): Promise<AuthResponse> => {
    return api.post<AuthResponse>('/auth/register', { username, email, password });
  },

  logout: async (): Promise<void> => {
    return api.post<void>('/auth/logout', {});
  },

  getMe: async (): Promise<{ user: { _id: string; username: string; email: string; createdAt?: string; updatedAt?: string } }> => {
    return api.get<{ user: { _id: string; username: string; email: string; createdAt?: string; updatedAt?: string } }>('/auth/me');
  },
};