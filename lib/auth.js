// Simple password-based admin auth (tạm thời)
export const verifyAdminPassword = (password) => {
  return password === process.env.ADMIN_PASSWORD;
};

// Check localStorage token (client-side)
export const isAdminLoggedIn = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('adminToken') === 'authenticated';
  }
  return false;
};

// Login
export const adminLogin = (password) => {
  if (verifyAdminPassword(password)) {
    localStorage.setItem('adminToken', 'authenticated');
    return true;
  }
  return false;
};

// Logout
export const adminLogout = () => {
  localStorage.removeItem('adminToken');
};
