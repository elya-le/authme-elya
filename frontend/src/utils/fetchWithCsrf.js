export const fetchWithCsrf = async (url, options = {}) => {
  const csrfToken = document.cookie
    .split(';')
    .find(cookie => cookie.trim().startsWith('XSRF-TOKEN='))
    .split('=')[1];

  const defaultOptions = {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      'CSRF-Token': csrfToken // Include CSRF token in the header
    }
  };

  const mergedOptions = { ...defaultOptions, ...options };
  const response = await fetch(url, mergedOptions);
  return response.json();
};