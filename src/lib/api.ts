type ApiError = {
  message: string;
  [key: string]: unknown;
};

export async function fetchWithAuth(input: string, init?: RequestInit) {
  const token = localStorage.getItem('token');
  
  const headers = new Headers(init?.headers);
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  
  const response = await fetch(`http://localhost:3000/api/v1${input}`, {
    ...init,
    headers,
  });

  if (response.status === 401) {
    // Token expired or invalid, clear it and redirect to login
    localStorage.removeItem('welink_auth_token');
    window.location.href = '/checkpoint/login';
    throw new Error('Session expired. Please log in again.');
  }

  if (!response.ok) {
    const error: ApiError = await response.json().catch(() => ({
      message: 'Request failed',
    }));
    throw new Error(error.message || 'Request failed');
  }

  return response;
}

export async function getJson<T>(url: string): Promise<T> {
  const response = await fetchWithAuth(url);
  return response.json() as Promise<T>;
}

export async function postJson<T, U = unknown>(
  url: string, 
  data: U
): Promise<T> {
  const response = await fetchWithAuth(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  return response.json() as Promise<T>;
}
