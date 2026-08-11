const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const getHeaders = () => {
  const token = localStorage.getItem('hms_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
};

export const api = {
  async get(url) {
    const res = await fetch(`${API_BASE}${url}`, { headers: getHeaders() });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'API Request failed');
    return data;
  },

  async post(url, body, options = {}) {
    const isFormData = body instanceof FormData;
    const token = localStorage.getItem('hms_token');
    
    const headers = {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(!isFormData ? { 'Content-Type': 'application/json' } : {}),
      ...(options.headers || {})
    };
    
    if (isFormData && headers['Content-Type']) {
      delete headers['Content-Type'];
    }

    const res = await fetch(`${API_BASE}${url}`, {
      method: 'POST',
      headers,
      body: isFormData ? body : JSON.stringify(body)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'API Request failed');
    return data;
  },

  async put(url, body, options = {}) {
    const isFormData = body instanceof FormData;
    const token = localStorage.getItem('hms_token');
    
    const headers = {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(!isFormData ? { 'Content-Type': 'application/json' } : {}),
      ...(options.headers || {})
    };
    
    if (isFormData && headers['Content-Type']) {
      delete headers['Content-Type'];
    }

    const res = await fetch(`${API_BASE}${url}`, {
      method: 'PUT',
      headers,
      body: isFormData ? body : JSON.stringify(body)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'API Request failed');
    return data;
  },

  async delete(url) {
    const res = await fetch(`${API_BASE}${url}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'API Request failed');
    return data;
  }
};
