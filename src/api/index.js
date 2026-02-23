const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://test.itsvinayak.eu.org:8501';

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
    sendMessage: (message, threadId = null) =>
        fetchAPI('/chat', {
            method: 'POST',
            body: JSON.stringify({ message, thread_id: threadId }),
        }),

    getAllChats: () =>
        fetchAPI('/chat/all_chats'),

    getChatHistory: (threadId) =>
        fetchAPI(`/chat/${encodeURIComponent(threadId)}`),

    streamMessage: async ({ message, threadId = null, voiceId = 'default', onText, onAudio, onDone, onError, onInterrupt }) => {
        const url = `${API_BASE_URL}/chat/stream?voice_id=${encodeURIComponent(voiceId)}`;

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message, thread_id: threadId }),
            });

            if (!response.ok) {
                const error = await response.json().catch(() => ({ message: 'An error occurred' }));
                throw new Error(error.detail || error.message || 'API Error');
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder("utf-8");
            let buffer = '';

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split('\n');

                buffer = lines.pop();

                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        const dataStr = line.substring(6).trim();
                        if (dataStr === '[DONE]') continue;
                        if (!dataStr) continue;

                        try {
                            const data = JSON.parse(dataStr);

                            switch (data.type) {
                                case 'text':
                                    if (onText) onText(data.content, data.plan);
                                    break;
                                case 'audio':
                                    if (onAudio) onAudio(data.data, data.format, data.chunk);
                                    break;
                                case 'done':
                                    if (onDone) onDone();
                                    break;
                                case 'error':
                                    if (onError) onError(data.message);
                                    break;
                                case 'interrupt':
                                    if (onInterrupt) onInterrupt(data.response, data.thread_id);
                                    break;
                                default:
                                    console.warn('Unknown stream event type:', data.type);
                            }
                        } catch (e) {
                            console.error("Failed to parse stream JSON", e, "Raw data:", dataStr);
                        }
                    }
                }
            }
        } catch (error) {
            if (onError) onError(error.message);
            throw error;
        }
    },

    uploadVoice: async (file, voiceId) => {
        const url = `${API_BASE_URL}/chat/voice-upload?voice_id=${encodeURIComponent(voiceId)}`;
        const formData = new FormData();
        formData.append('file', file);

        // Note: We bypass the fetchAPI helper because FormData doesn't need Content-Type JSON
        const response = await fetch(url, {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({ message: 'An error occurred during upload' }));
            throw new Error(error.detail || error.message || 'Upload Error');
        }

        return response.json();
    },
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
