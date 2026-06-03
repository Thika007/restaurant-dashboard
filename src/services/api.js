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

// Map to track active concurrent promises to prevent duplicate simultaneous fetches
const pendingPromises = new Map();

// Map to cache static metadata responses (e.g. card-types, categories, locations)
const metadataCache = new Map();

/**
 * Perform a fetch request with active request deduplication.
 * If the same endpoint with the same arguments is already fetching, the existing promise is returned.
 */
const getJSON = async (url, options = {}) => {
    const key = `${url}_${JSON.stringify(options)}`;
    if (pendingPromises.has(key)) {
        return pendingPromises.get(key);
    }

    const promise = (async () => {
        const response = await fetch(url, options);
        return handleResponse(response);
    })();

    pendingPromises.set(key, promise);

    try {
        const result = await promise;
        pendingPromises.delete(key);
        return result;
    } catch (error) {
        pendingPromises.delete(key);
        throw error;
    }
};

/**
 * Perform a fetch request with metadata caching.
 * Results are cached for `ttlMs` (default 5 minutes). Deduplication is still applied.
 */
const getJSONWithCache = async (url, options = {}, ttlMs = 5 * 60 * 1000) => {
    const key = `${url}_${JSON.stringify(options)}`;
    const cached = metadataCache.get(key);
    if (cached && (Date.now() - cached.timestamp < ttlMs)) {
        return cached.data;
    }

    const data = await getJSON(url, options);
    metadataCache.set(key, { data, timestamp: Date.now() });
    return data;
};

export const fetchTodayStats = async (locationId) => {
    const cfg = await loadConfig();
    let url = `${cfg.baseUrl}/stats/today`;
    if (locationId) url += `?locationId=${locationId}`;
    return getJSON(url, { headers: getAuthHeaders() });
};

export const fetchSalesTrend = async (locationId) => {
    const cfg = await loadConfig();
    let url = `${cfg.baseUrl}/charts/sales-trend`;
    if (locationId) url += `?locationId=${locationId}`;
    return getJSON(url, { headers: getAuthHeaders() });
};

export const fetchTopItems = async (locationId) => {
    const cfg = await loadConfig();
    let url = `${cfg.baseUrl}/charts/top-items`;
    if (locationId) url += `?locationId=${locationId}`;
    return getJSON(url, { headers: getAuthHeaders() });
};

export const fetchOrderTypes = async (locationId) => {
    const cfg = await loadConfig();
    let url = `${cfg.baseUrl}/charts/order-types`;
    if (locationId) url += `?locationId=${locationId}`;
    return getJSON(url, { headers: getAuthHeaders() });
};

export const fetchHistory = async (startDate, endDate, locationId, page = 1, pageSize = 50) => {
    const cfg = await loadConfig();
    let url = `${cfg.baseUrl}/history`;
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    if (locationId) params.append('locationId', locationId);
    if (page) params.append('page', page);
    if (pageSize) params.append('pageSize', pageSize);
    if (params.toString()) url += `?${params.toString()}`;
    return getJSON(url, { headers: getAuthHeaders() });
};

export const fetchHistoryStats = async (startDate, endDate, locationId) => {
    const cfg = await loadConfig();
    let url = `${cfg.baseUrl}/history/stats`;
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    if (locationId) params.append('locationId', locationId);
    if (params.toString()) url += `?${params.toString()}`;
    return getJSON(url, { headers: getAuthHeaders() });
};

export const fetchHistoryTrend = async (startDate, endDate, locationId) => {
    const cfg = await loadConfig();
    let url = `${cfg.baseUrl}/history/trend`;
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    if (locationId) params.append('locationId', locationId);
    if (params.toString()) url += `?${params.toString()}`;
    return getJSON(url, { headers: getAuthHeaders() });
};

export const fetchHistoryTopItems = async (startDate, endDate, locationId) => {
    const cfg = await loadConfig();
    let url = `${cfg.baseUrl}/history/top-items`;
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    if (locationId) params.append('locationId', locationId);
    if (params.toString()) url += `?${params.toString()}`;
    return getJSON(url, { headers: getAuthHeaders() });
};

export const fetchHistoryOrderTypes = async (startDate, endDate, locationId) => {
    const cfg = await loadConfig();
    let url = `${cfg.baseUrl}/history/order-types`;
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    if (locationId) params.append('locationId', locationId);
    if (params.toString()) url += `?${params.toString()}`;
    return getJSON(url, { headers: getAuthHeaders() });
};

export const fetchPaymentMethods = async (locationId) => {
    const cfg = await loadConfig();
    let url = `${cfg.baseUrl}/charts/payment-methods`;
    if (locationId) url += `?locationId=${locationId}`;
    return getJSON(url, { headers: getAuthHeaders() });
};

export const fetchHistoryPaymentMethods = async (startDate, endDate, locationId) => {
    const cfg = await loadConfig();
    let url = `${cfg.baseUrl}/history/payment-methods`;
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    if (locationId) params.append('locationId', locationId);
    if (params.toString()) url += `?${params.toString()}`;
    return getJSON(url, { headers: getAuthHeaders() });
};

export const fetchHistoryCollections = async (startDate, endDate, locationId) => {
    const cfg = await loadConfig();
    let url = `${cfg.baseUrl}/history/collections`;
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    if (locationId) params.append('locationId', locationId);
    if (params.toString()) url += `?${params.toString()}`;
    return getJSON(url, { headers: getAuthHeaders() });
};


export const fetchBillReport = async (startDate, endDate, filters = {}, locationId, page = 1, pageSize = 50) => {
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
    if (page) params.append('page', page);
    if (pageSize) params.append('pageSize', pageSize);
    if (params.toString()) url += `?${params.toString()}`;
    return getJSON(url, { headers: getAuthHeaders() });
};

export const fetchItemReport = async (startDate, endDate, filters = {}, locationId, page = 1, pageSize = 50) => {
    const cfg = await loadConfig();
    let url = `${cfg.baseUrl}/reports/item`;
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
    if (filters.categories) {
        const cats = Array.isArray(filters.categories) ? filters.categories.join(',') : filters.categories;
        params.append('categories', cats);
    }
    if (filters.subCategories) {
        const subCats = Array.isArray(filters.subCategories) ? filters.subCategories.join(',') : filters.subCategories;
        params.append('subCategories', subCats);
    }
    if (filters.itemName) params.append('itemName', filters.itemName);

    if (filters.descSort) params.append('descSort', filters.descSort);
    if (filters.qtySort) params.append('qtySort', filters.qtySort);
    if (filters.amtSort) params.append('amtSort', filters.amtSort);
    if (page) params.append('page', page);
    if (pageSize) params.append('pageSize', pageSize);

    if (params.toString()) url += `?${params.toString()}`;
    return getJSON(url, { headers: getAuthHeaders() });
};

export const fetchCategories = async () => {
    const cfg = await loadConfig();
    return getJSONWithCache(`${cfg.baseUrl}/reports/categories`, { headers: getAuthHeaders() });
};

export const fetchSubCategories = async (deptCode) => {
    const cfg = await loadConfig();
    let url = `${cfg.baseUrl}/reports/subcategories`;
    if (deptCode) url += `?deptCode=${deptCode}`;
    return getJSONWithCache(url, { headers: getAuthHeaders() });
};

export const fetchCardTypes = async () => {
    const cfg = await loadConfig();
    return getJSONWithCache(`${cfg.baseUrl}/reports/card-types`, { headers: getAuthHeaders() });
};

export const fetchLocations = async () => {
    const cfg = await loadConfig();
    return getJSONWithCache(`${cfg.baseUrl}/auth/locations`, { headers: getAuthHeaders() });
};
