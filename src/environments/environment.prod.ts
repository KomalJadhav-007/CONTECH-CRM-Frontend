const getApiUrl = (): string => {
  if (typeof window !== 'undefined' && window.location) {
    const protocol = window.location.protocol || 'http:';
    const hostname = window.location.hostname || '192.168.29.8';
    const port = (window.location.port && window.location.port !== '80' && window.location.port !== '443')
      ? `:${window.location.port}`
      : '';
    return `${protocol}//${hostname}${port}/api`;
  }
  return 'http://192.168.29.8/api';
};

export const environment = {
  production: true,
  apiUrl: 'https://contech-poc-backend.zerovaega.co.in/api'
};
