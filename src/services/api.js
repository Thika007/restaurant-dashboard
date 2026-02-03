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
        const message = error.details || error.message || 'API request failed';
        throw new Error(message);
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

export const fetchTodayStats = async (locationId) => {
    const cfg = await loadConfig();
    let url = `${cfg.baseUrl}/stats/today`;
    if (locationId) url += `?locationId=${locationId}`;
    const response = await fetch(url, {
        headers: getAuthHeaders()
    });
    return handleResponse(response);
};

export const fetchSalesTrend = async (locationId) => {
    const cfg = await loadConfig();
    let url = `${cfg.baseUrl}/charts/sales-trend`;
    if (locationId) url += `?locationId=${locationId}`;
    const response = await fetch(url, {
        headers: getAuthHeaders()
    });
    return handleResponse(response);
};

export const fetchTopItems = async (locationId) => {
    const cfg = await loadConfig();
    let url = `${cfg.baseUrl}/charts/top-items`;
    if (locationId) url += `?locationId=${locationId}`;
    const response = await fetch(url, {
        headers: getAuthHeaders()
    });
    return handleResponse(response);
};

export const fetchOrderTypes = async (locationId) => {
    const cfg = await loadConfig();
    let url = `${cfg.baseUrl}/charts/order-types`;
    if (locationId) url += `?locationId=${locationId}`;
    const response = await fetch(url, {
        headers: getAuthHeaders()
    });
    return handleResponse(response);
};

export const fetchHistory = async (startDate, endDate, locationId) => {
    const cfg = await loadConfig();
    let url = `${cfg.baseUrl}/history`;
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    if (locationId) params.append('locationId', locationId);
    if (params.toString()) url += `?${params.toString()}`;

    const response = await fetch(url, {
        headers: getAuthHeaders()
    });
    return handleResponse(response);
};

export const fetchHistoryStats = async (startDate, endDate, locationId) => {
    const cfg = await loadConfig();
    let url = `${cfg.baseUrl}/history/stats`;
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    if (locationId) params.append('locationId', locationId);
    if (params.toString()) url += `?${params.toString()}`;

    const response = await fetch(url, {
        headers: getAuthHeaders()
    });
    return handleResponse(response);
};

export const fetchHistoryTrend = async (startDate, endDate, locationId) => {
    const cfg = await loadConfig();
    let url = `${cfg.baseUrl}/history/trend`;
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    if (locationId) params.append('locationId', locationId);
    if (params.toString()) url += `?${params.toString()}`;

    const response = await fetch(url, {
        headers: getAuthHeaders()
    });
    return handleResponse(response);
};

export const fetchHistoryTopItems = async (startDate, endDate, locationId) => {
    const cfg = await loadConfig();
    let url = `${cfg.baseUrl}/history/top-items`;
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    if (locationId) params.append('locationId', locationId);
    if (params.toString()) url += `?${params.toString()}`;

    const response = await fetch(url, {
        headers: getAuthHeaders()
    });
    return handleResponse(response);
};

export const fetchHistoryOrderTypes = async (startDate, endDate, locationId) => {
    const cfg = await loadConfig();
    let url = `${cfg.baseUrl}/history/order-types`;
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    if (locationId) params.append('locationId', locationId);
    if (params.toString()) url += `?${params.toString()}`;

    const response = await fetch(url, {
        headers: getAuthHeaders()
    });
    return handleResponse(response);
};

export const fetchPaymentMethods = async (locationId) => {
    const cfg = await loadConfig();
    let url = `${cfg.baseUrl}/charts/payment-methods`;
    if (locationId) url += `?locationId=${locationId}`;
    const response = await fetch(url, {
        headers: getAuthHeaders()
    });
    return handleResponse(response);
};

export const fetchHistoryPaymentMethods = async (startDate, endDate, locationId) => {
    const cfg = await loadConfig();
    let url = `${cfg.baseUrl}/history/payment-methods`;
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    if (locationId) params.append('locationId', locationId);
    if (params.toString()) url += `?${params.toString()}`;

    const response = await fetch(url, {
        headers: getAuthHeaders()
    });
    return handleResponse(response);
};

export const fetchBillReport = async (startDate, endDate, filters = {}, locationId) => {
    const cfg = await loadConfig();
    let url = `${cfg.baseUrl}/reports/bill`;
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    if (locationId) params.append('locationId', locationId);
    if (filters.txnType) {
        const txnType = Array.isArray(filters.txnType) ? filters.txnType.join(',') : filters.txnType;
        params.append('txnType', txnType);
    }
    if (filters.orderType) {
        const orderType = Array.isArray(filters.orderType) ? filters.orderType.join(',') : filters.orderType;
        params.append('orderType', orderType);
    }
    if (filters.sort) params.append('sort', filters.sort);

    if (params.toString()) url += `?${params.toString()}`;

    const response = await fetch(url, {
        headers: getAuthHeaders()
    });
    return handleResponse(response);
};

export const fetchItemReport = async (startDate, endDate, filters = {}, locationId) => {
    const cfg = await loadConfig();
    let url = `${cfg.baseUrl}/reports/item`;
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    if (locationId) params.append('locationId', locationId);

    if (filters.mainType) {
        const typeSelection = Array.isArray(filters.mainType) ? filters.mainType.join(',') : filters.mainType;
        params.append('typeSelection', typeSelection);
    }
    if (filters.descSort) params.append('descSort', filters.descSort);
    if (filters.qtySort) params.append('qtySort', filters.qtySort);
    if (filters.amtSort) params.append('amtSort', filters.amtSort);
    if (filters.remark) {
        const remarkValue = Array.isArray(filters.remark) ? filters.remark.join(',') : filters.remark;
        params.append('remark', remarkValue);
    }

    if (params.toString()) url += `?${params.toString()}`;

    const response = await fetch(url, {
        headers: getAuthHeaders()
    });
    return handleResponse(response);
};

export const fetchCardTypes = async () => {
    const cfg = await loadConfig();
    const response = await fetch(`${cfg.baseUrl}/reports/card-types`, {
        headers: getAuthHeaders()
    });
    return handleResponse(response);
};

export const fetchLocations = async () => {
    const cfg = await loadConfig();
    const response = await fetch(`${cfg.baseUrl}/auth/locations`, {
        headers: getAuthHeaders()
    });
    return handleResponse(response);
};
