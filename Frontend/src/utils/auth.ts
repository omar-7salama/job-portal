export const getToken = (): string | null => {
  return localStorage.getItem('token');
};

export const setToken = (token: string): void => {
  localStorage.setItem('token', token);
};

export const removeToken = (): void => {
  localStorage.removeItem('token');
};

export const decodeToken = (token: string): any => {
  try {
    const payload = token.split('.')[1];
    const decoded = atob(payload);
    return JSON.parse(decoded);
  } catch (error) {
    console.error('Failed to decode token:', error);
    return null;
  }
};

export const getUserFromToken = (): { id: string; role: string } | null => {
  const token = getToken();
  if (!token) return null;
  const decoded = decodeToken(token);
  return decoded ? { id: decoded.sub, role: decoded.role } : null;
};

export const isAuthenticated = (): boolean => {
  return !!getToken();
};