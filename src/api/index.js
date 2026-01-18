const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8501';

// Helper function for API calls
async function fetchAPI(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;

    const defaultHeaders = {
        'Content-Type': 'application/json',
    };

    const config = {
        ...options,
        headers: {
            ...defaultHeaders,
            ...options.headers,
        },
    };

    const response = await fetch(url, config);

    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'An error occurred' }));
        throw new Error(error.detail || error.message || 'API Error');
    }

    return response.json();
}

// ==========================================
// CALENDAR API
// ==========================================

export const calendarAPI = {
    getEvents: (startTime, endTime) =>
        fetchAPI(`/calendar/events?start_time=${encodeURIComponent(startTime)}&end_time=${encodeURIComponent(endTime)}`),

    getTodos: (startTime, endTime) =>
        fetchAPI(`/calendar/todos?start_time=${encodeURIComponent(startTime)}&end_time=${encodeURIComponent(endTime)}`),

    getReminders: (startTime, endTime) =>
        fetchAPI(`/calendar/reminders?start_time=${encodeURIComponent(startTime)}&end_time=${encodeURIComponent(endTime)}`),

    // Helper to get all calendar items
    getAllItems: async (startTime, endTime) => {
        const [events, todos, reminders] = await Promise.all([
            calendarAPI.getEvents(startTime, endTime),
            calendarAPI.getTodos(startTime, endTime),
            calendarAPI.getReminders(startTime, endTime),
        ]);
        return { events, todos, reminders };
    },
};

// ==========================================
// GMAIL API
// ==========================================

export const gmailAPI = {
    getAuthUrl: () => fetchAPI('/gmail/auth/login'),
    getAuthStatus: () => fetchAPI('/gmail/auth/status'),
    logout: () => fetchAPI('/gmail/auth/logout'),
};

// ==========================================
// CHAT / MANUAL FLOW API
// ==========================================

export const chatAPI = {
    sendMessage: (message) =>
        fetchAPI('/manual_flow/chat', {
            method: 'POST',
            body: JSON.stringify({ message }),
        }),
};

// ==========================================
// SETTINGS API
// ==========================================

export const settingsAPI = {
    getModels: () => fetchAPI('/settings/models'),

    getAgentConfigs: () => fetchAPI('/settings/agents'),

    updateAgentConfigs: (agentConfigs) =>
        fetchAPI('/settings/agents', {
            method: 'PUT',
            body: JSON.stringify({ agent_configs: agentConfigs }),
        }),
};

// ==========================================
// TOKEN TRACKER API
// ==========================================

export const tokenTrackerAPI = {
    getAgents: () => fetchAPI('/token-tracker/agents'),

    getCumulativeStats: () => fetchAPI('/token-tracker/cumulative'),

    getAgentHistory: (agentName) =>
        fetchAPI(`/token-tracker/agent/${encodeURIComponent(agentName)}`),
};

// ==========================================
// USER STATUS API
// ==========================================

export const userStatusAPI = {
    getStatus: () => fetchAPI('/user/status'),
};

// Export all APIs
export default {
    calendar: calendarAPI,
    gmail: gmailAPI,
    chat: chatAPI,
    settings: settingsAPI,
    tokenTracker: tokenTrackerAPI,
    userStatus: userStatusAPI,
};
