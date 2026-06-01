export const USERNAME_REGEX = /^[a-zA-Z0-9_]{3,30}$/;

export function normalizeUsername(username) {
  return username.trim().toLowerCase();
}

/** Match server: letters, numbers, underscore; min 3 chars from email if needed */
export function sanitizeUsername(raw, email) {
  let u = String(raw || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '');
  if (u.length < 3) {
    const fromEmail = String(email || '')
      .split('@')[0]
      .toLowerCase()
      .replace(/[^a-z0-9_]/g, '_');
    u = fromEmail.length >= 3 ? fromEmail : `user_${Date.now().toString().slice(-6)}`;
  }
  return u.slice(0, 30);
}

export function validateUsername(username) {
  const value = normalizeUsername(username);
  if (!value) return 'Username is required';
  if (!USERNAME_REGEX.test(value)) {
    return 'Username must be 3–30 characters (letters, numbers, underscore only)';
  }
  return null;
}

export function validateEmail(email) {
  const value = email.trim();
  if (!value) return 'Email is required';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Enter a valid email address';
  return null;
}

export function validatePassword(password) {
  if (!password) return 'Password is required';
  if (password.length < 6) return 'Password must be at least 6 characters';
  return null;
}

export function validateConfirmPassword(password, confirm) {
  if (password !== confirm) return 'Passwords do not match';
  return null;
}

export function validateName(name) {
  if (!name.trim()) return 'Full name is required';
  if (name.trim().length < 2) return 'Name must be at least 2 characters';
  return null;
}
