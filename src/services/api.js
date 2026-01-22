const API_BASE_URL = 'http://localhost:5000/api';

export const fetchTodayStats = async () => {
    const response = await fetch(`${API_BASE_URL}/stats/today`);
    if (!response.ok) throw new Error('Failed to fetch today stats');
    return response.json();
};

export const fetchSalesTrend = async () => {
    const response = await fetch(`${API_BASE_URL}/charts/sales-trend`);
    if (!response.ok) throw new Error('Failed to fetch sales trend');
    return response.json();
};

export const fetchTopItems = async () => {
    const response = await fetch(`${API_BASE_URL}/charts/top-items`);
    if (!response.ok) throw new Error('Failed to fetch top items');
    return response.json();
};

export const fetchOrderTypes = async () => {
    const response = await fetch(`${API_BASE_URL}/charts/order-types`);
    if (!response.ok) throw new Error('Failed to fetch order types');
    return response.json();
};

export const fetchHistory = async (startDate, endDate) => {
    let url = `${API_BASE_URL}/history`;
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    if (params.toString()) url += `?${params.toString()}`;

    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch history');
    return response.json();
};

export const fetchHistoryStats = async (startDate, endDate) => {
    let url = `${API_BASE_URL}/history/stats`;
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    if (params.toString()) url += `?${params.toString()}`;

    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch history stats');
    return response.json();
};

export const fetchHistoryTrend = async (startDate, endDate) => {
    let url = `${API_BASE_URL}/history/trend`;
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    if (params.toString()) url += `?${params.toString()}`;

    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch history trend');
    return response.json();
};

export const fetchHistoryTopItems = async (startDate, endDate) => {
    let url = `${API_BASE_URL}/history/top-items`;
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    if (params.toString()) url += `?${params.toString()}`;

    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch history top items');
    return response.json();
};

export const fetchHistoryOrderTypes = async (startDate, endDate) => {
    let url = `${API_BASE_URL}/history/order-types`;
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    if (params.toString()) url += `?${params.toString()}`;

    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch history order types');
    return response.json();
};
