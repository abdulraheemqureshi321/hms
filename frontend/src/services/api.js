const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const cache = new Map();
const listeners = new Set();

export const subscribeToCache = (callback) => {
  listeners.add(callback);
  return () => listeners.delete(callback);
};

const notifyCacheUpdate = (url, data) => {
  listeners.forEach(cb => cb(url, data));
};

export const api = {
  async get(url, options = {}) {
    const { forceRefresh = false, cacheTTL = 300000 } = options; // 5 min TTL
    const cached = cache.get(url);

    if (!forceRefresh && cached && (Date.now() - cached.timestamp < cacheTTL)) {
      // Revalidate in background asynchronously
      this.fetchAndCache(url).catch(() => {});
      return cached.data;
    }

    return await this.fetchAndCache(url);
  },

  async fetchAndCache(url) {
    const token = localStorage.getItem('hms_token');
    const headers = {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    };

    const res = await fetch(`${API_BASE}${url}`, { headers });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'API Request failed');

    cache.set(url, { data, timestamp: Date.now() });
    notifyCacheUpdate(url, data);
    return data;
  },

  invalidateCache(urlPattern) {
    if (!urlPattern) {
      cache.clear();
      return;
    }
    for (const key of cache.keys()) {
      if (key.includes(urlPattern)) {
        cache.delete(key);
      }
    }
  },

  updateCacheKey(url, data) {
    cache.set(url, { data, timestamp: Date.now() });
    notifyCacheUpdate(url, data);
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

    this.invalidateCache();
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

    this.invalidateCache();
    return data;
  },

  async delete(url) {
    const token = localStorage.getItem('hms_token');
    const headers = {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    };

    const res = await fetch(`${API_BASE}${url}`, {
      method: 'DELETE',
      headers
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'API Request failed');

    this.invalidateCache();
    return data;
  }
};
