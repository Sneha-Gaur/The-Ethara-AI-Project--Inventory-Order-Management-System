/**
 * Turn Axios / FastAPI errors into a single user-friendly string.
 */
export function getApiErrorMessage(error, fallback = 'Something went wrong. Please try again.') {
  if (!error) return fallback;

  if (!error.response) {
    if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
      return 'Cannot reach the server. Double-click START_AUTH.bat in the project folder, wait 5 seconds, then try again.';
    }
    return error.message || fallback;
  }

  const detail = error.response.data?.detail;

  if (typeof detail === 'string') return detail;

  if (Array.isArray(detail)) {
    return detail.map((d) => (typeof d === 'string' ? d : d.msg || d.message || JSON.stringify(d))).join('. ');
  }

  if (typeof detail === 'object' && detail !== null) {
    return detail.msg || detail.message || fallback;
  }

  return error.response.data?.message || fallback;
}

export function normalizeEmail(email) {
  return email.trim().toLowerCase();
}
