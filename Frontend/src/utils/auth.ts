export const getToken = (): string | null => {
  return localStorage.getItem('token');
};

export const setToken = (token: string): void => {
  localStorage.setItem('token', token);
};

export const removeToken = (): void => {
  localStorage.removeItem('token');
  localStorage.removeItem('userId');
  localStorage.removeItem('userRole');
  localStorage.removeItem('userFullName');
};

export const getUserFromToken = (): { id: string; role: string; fullName: string } | null => {
  const userId = localStorage.getItem('userId');
  const userRole = localStorage.getItem('userRole');
  const userFullName = localStorage.getItem('userFullName');
  if (!userId || !userRole) return null;
  return { id: userId, role: userRole, fullName: userFullName || '' };
};

export const isAuthenticated = (): boolean => {
  return !!getToken() && !!localStorage.getItem('userId');
};
