let config = null;

const loadConfig = async () => {
    if (config) return config;
    try {
        const response = await fetch('/connection.txt');
        const text = await response.text();
        const lines = text.split('\n');
        const cfg = {};
        lines.forEach(line => {
            const [key, value] = line.split('=');
            if (key && value) {
                cfg[key.trim()] = value.trim();
            }
        });
        config = {
            baseUrl: cfg.URL || 'http://localhost:5000/api',
            refreshInterval: parseInt(cfg.REFRESH) || 10000
        };
        return config;
    } catch (error) {
        console.error('Failed to load connection.txt, using defaults.', error);
        config = {
            baseUrl: 'http://localhost:5000/api',
            refreshInterval: 10000
        };
        return config;
    }
};

export const getAppConfig = () => loadConfig();

const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return token ? { 'Authorization': `Bearer ${token}` } : {};
};

const handleResponse = async (response) => {
    if (response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        throw new Error('Session expired');
    }
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'API request failed');
    }
    return response.json();
};

export const login = async (userId, password) => {
    const cfg = await loadConfig();
    const response = await fetch(`${cfg.baseUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, password })
    });
    const data = await handleResponse(response);
    if (data.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
    }
    return data;
};

export const fetchTodayStats = async () => {
    const cfg = await loadConfig();
    const response = await fetch(`${cfg.baseUrl}/stats/today`, {
        headers: getAuthHeaders()
    });
    return handleResponse(response);
};

export const fetchSalesTrend = async () => {
    const cfg = await loadConfig();
    const response = await fetch(`${cfg.baseUrl}/charts/sales-trend`, {
        headers: getAuthHeaders()
    });
    return handleResponse(response);
};

export const fetchTopItems = async () => {
    const cfg = await loadConfig();
    const response = await fetch(`${cfg.baseUrl}/charts/top-items`, {
        headers: getAuthHeaders()
    });
    return handleResponse(response);
};

export const fetchOrderTypes = async () => {
    const cfg = await loadConfig();
    const response = await fetch(`${cfg.baseUrl}/charts/order-types`, {
        headers: getAuthHeaders()
    });
    return handleResponse(response);
};

export const fetchHistory = async (startDate, endDate) => {
    const cfg = await loadConfig();
    let url = `${cfg.baseUrl}/history`;
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    if (params.toString()) url += `?${params.toString()}`;

    const response = await fetch(url, {
        headers: getAuthHeaders()
    });
    return handleResponse(response);
};

export const fetchHistoryStats = async (startDate, endDate) => {
    const cfg = await loadConfig();
    let url = `${cfg.baseUrl}/history/stats`;
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    if (params.toString()) url += `?${params.toString()}`;

    const response = await fetch(url, {
        headers: getAuthHeaders()
    });
    return handleResponse(response);
};

export const fetchHistoryTrend = async (startDate, endDate) => {
    const cfg = await loadConfig();
    let url = `${cfg.baseUrl}/history/trend`;
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    if (params.toString()) url += `?${params.toString()}`;

    const response = await fetch(url, {
        headers: getAuthHeaders()
    });
    return handleResponse(response);
};

export const fetchHistoryTopItems = async (startDate, endDate) => {
    const cfg = await loadConfig();
    let url = `${cfg.baseUrl}/history/top-items`;
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    if (params.toString()) url += `?${params.toString()}`;

    const response = await fetch(url, {
        headers: getAuthHeaders()
    });
    return handleResponse(response);
};

export const fetchHistoryOrderTypes = async (startDate, endDate) => {
    const cfg = await loadConfig();
    let url = `${cfg.baseUrl}/history/order-types`;
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    if (params.toString()) url += `?${params.toString()}`;

    const response = await fetch(url, {
        headers: getAuthHeaders()
    });
    return handleResponse(response);
};

export const fetchPaymentMethods = async () => {
    const cfg = await loadConfig();
    const response = await fetch(`${cfg.baseUrl}/charts/payment-methods`, {
        headers: getAuthHeaders()
    });
    return handleResponse(response);
};

export const fetchHistoryPaymentMethods = async (startDate, endDate) => {
    const cfg = await loadConfig();
    let url = `${cfg.baseUrl}/history/payment-methods`;
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    if (params.toString()) url += `?${params.toString()}`;

    const response = await fetch(url, {
        headers: getAuthHeaders()
    });
    return handleResponse(response);
};
