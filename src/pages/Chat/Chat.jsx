import { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Loader2, Bot, User, Sparkles, Plus, MessageSquare, Clock, Volume2, Type } from 'lucide-react';
import { Card, Button } from '../../components/ui';
import MessageBubble from '../../components/Chat/MessageBubble';
import PlanDisplay from '../../components/Chat/PlanDisplay';
import ChatInput from '../../components/Chat/ChatInput';
import { chatAPI } from '../../api';
import './Chat.css';

const WELCOME_MESSAGE = {
    id: 'welcome',
    role: 'assistant',
    content: "Hi! I'm your Panda AI assistant. I can help you manage your schedule, send emails, and more. What would you like to do today?",
    timestamp: new Date(),
};

/**
 * Map backend MessageSchema type → frontend role
 * Backend types: 'human', 'ai', 'interrupt'
 */
function mapRole(type) {
    if (type === 'human') return 'user';
    if (type === 'ai') return 'assistant';
    if (type === 'interrupt') return 'interrupt';
    return 'assistant';
}

/**
 * Convert a backend MessageSchema to our local message format
 */
function toLocalMessage(msg, index) {
    return {
        id: `history-${index}`,
        role: mapRole(msg.type),
        content: msg.response,
        plan: msg.plan || [],
        timestamp: new Date(),
    };
}

/**
 * Format a unix timestamp (seconds) into a human-readable relative time
 */
function formatRelativeTime(unixTs) {
    if (!unixTs) return '';
    const diff = Date.now() / 1000 - unixTs;
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
}

export default function Chat() {
    const [messages, setMessages] = useState([WELCOME_MESSAGE]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [threadId, setThreadId] = useState(null);
    const [threads, setThreads] = useState([]);
    const [threadsLoading, setThreadsLoading] = useState(false);
    const [isVoiceMode, setIsVoiceMode] = useState(false);
    const [voiceId, setVoiceId] = useState('');

    const messagesEndRef = useRef(null);

    // Audio streaming state
    const audioQueue = useRef([]);
    const isPlaying = useRef(false);
    const currentAudio = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Cleanup audio on unmount
    useEffect(() => {
        return () => {
            if (currentAudio.current) {
                currentAudio.current.pause();
                currentAudio.current = null;
            }
            audioQueue.current = [];
        };
    }, []);

    // Fetch threads on mount
    const loadThreads = useCallback(async () => {
        setThreadsLoading(true);
        try {
            const data = await chatAPI.getAllChats();
            setThreads(data || []);
        } catch (err) {
            console.error('Failed to load threads:', err);
        } finally {
            setThreadsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadThreads();
    }, [loadThreads]);

    // Start a new chat
    const handleNewChat = () => {
        setThreadId(null);
        setMessages([WELCOME_MESSAGE]);
        setInput('');
    };

    // Select an existing thread
    const handleSelectThread = async (selectedThreadId) => {
        if (selectedThreadId === threadId) return;

        setThreadId(selectedThreadId);
        setIsLoading(true);
        setMessages([]);

        try {
            const history = await chatAPI.getChatHistory(selectedThreadId);
            const localMessages = (history || []).map(toLocalMessage);
            setMessages(localMessages.length > 0 ? localMessages : [WELCOME_MESSAGE]);
        } catch (err) {
            console.error('Failed to load chat history:', err);
            setMessages([
                {
                    id: 'error',
                    role: 'assistant',
                    content: 'Failed to load chat history. Please try again.',
                    isError: true,
                    timestamp: new Date(),
                },
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    const playNextAudio = useCallback(() => {
        if (audioQueue.current.length === 0) {
            isPlaying.current = false;
            return;
        }

        isPlaying.current = true;
        const nextAudioData = audioQueue.current.shift();
        const audioSrc = `data:audio/wav;base64,${nextAudioData}`;
        const audio = new Audio(audioSrc);
        currentAudio.current = audio;

        audio.onended = () => {
            playNextAudio();
        };

        audio.onerror = (e) => {
            console.error("Audio playback error", e);
            playNextAudio();
        };

        audio.play().catch(e => {
            console.error("Failed to play audio chunk:", e);
            playNextAudio();
        });
    }, []);

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userMessage = {
            id: Date.now().toString(),
            role: 'user',
            content: input.trim(),
            timestamp: new Date(),
        };

        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        if (!isVoiceMode) {
            try {
                const response = await chatAPI.sendMessage(userMessage.content, threadId);

                // Capture thread_id from first response
                if (response.thread_id && !threadId) {
                    setThreadId(response.thread_id);
                }

                const assistantMessage = {
                    id: (Date.now() + 1).toString(),
                    role: mapRole(response.type || 'ai'),
                    content: response.response || 'I apologize, but I encountered an issue processing your request.',
                    plan: response.plan || [],
                    timestamp: new Date(),
                };

                setMessages(prev => [...prev, assistantMessage]);

                // Refresh sidebar threads
                loadThreads();
            } catch (error) {
                console.error('Chat error:', error);

                const errorMessage = {
                    id: (Date.now() + 1).toString(),
                    role: 'assistant',
                    content: 'I apologize, but I encountered an error. Please try again later.',
                    isError: true,
                    timestamp: new Date(),
                };

                setMessages(prev => [...prev, errorMessage]);
            } finally {
                setIsLoading(false);
            }
        } else {
            // Voice / Streaming Mode
            const assistantMessageId = (Date.now() + 1).toString();

            // Stop any currently playing audio
            if (currentAudio.current) {
                currentAudio.current.pause();
                currentAudio.current = null;
            }
            audioQueue.current = [];
            isPlaying.current = false;

            // Add a placeholder message for the assistant
            setMessages(prev => [...prev, {
                id: assistantMessageId,
                role: 'assistant',
                content: '',
                plan: [],
                timestamp: new Date()
            }]);

            try {
                await chatAPI.streamMessage({
                    message: userMessage.content,
                    threadId: threadId,
                    voiceId: voiceId.trim() || 'default',
                    onText: (content, plan) => {
                        setMessages(prev => prev.map(msg => {
                            if (msg.id === assistantMessageId) {
                                return { ...msg, content: msg.content + content, plan: plan || msg.plan };
                            }
                            return msg;
                        }));
                    },
                    onAudio: (data, format, chunk) => {
                        audioQueue.current.push(data);
                        if (!isPlaying.current) {
                            playNextAudio();
                        }
                    },
                    onInterrupt: (response, tId) => {
                        if (tId && !threadId) {
                            setThreadId(tId);
                        }
                        setMessages(prev => prev.map(msg => {
                            if (msg.id === assistantMessageId) {
                                return { ...msg, content: msg.content + response, role: 'interrupt' };
                            }
                            return msg;
                        }));
                    },
                    onDone: () => {
                        loadThreads();
                    },
                    onError: (errMsg) => {
                        setMessages(prev => prev.map(msg => {
                            if (msg.id === assistantMessageId) {
                                return { ...msg, content: msg.content + `\n\n[Error: ${errMsg}]`, isError: true };
                            }
                            return msg;
                        }));
                    }
                });
            } catch (error) {
                console.error('Streaming error:', error);
                setMessages(prev => prev.map(msg => {
                    if (msg.id === assistantMessageId) {
                        return { ...msg, content: 'I apologize, but I encountered an error during streaming.', isError: true };
                    }
                    return msg;
                }));
            } finally {
                setIsLoading(false);
            }
        }
    };

    const handleVoiceSubmit = async (audioBlob) => {
        if (isLoading) return;

        setIsLoading(true);
        const assistantMessageId = (Date.now() + 1).toString();

        // Stop any currently playing audio
        if (currentAudio.current) {
            currentAudio.current.pause();
            currentAudio.current = null;
        }
        audioQueue.current = [];
        isPlaying.current = false;

        // Add a placeholder message for the user (we don't have text yet)
        const userMessageId = Date.now().toString();
        setMessages(prev => [...prev, {
            id: userMessageId,
            role: 'user',
            content: '🎤 Sent a voice message...',
            timestamp: new Date()
        }]);

        // Add a placeholder message for the assistant
        setMessages(prev => [...prev, {
            id: assistantMessageId,
            role: 'assistant',
            content: '',
            plan: [],
            timestamp: new Date()
        }]);

        try {
            await chatAPI.streamVoiceMessage({
                file: new File([audioBlob], 'recording.wav', { type: 'audio/wav' }),
                threadId: threadId,
                voiceId: voiceId.trim() || 'default',
                onText: (content, plan) => {
                    setMessages(prev => prev.map(msg => {
                        if (msg.id === assistantMessageId) {
                            return { ...msg, content: msg.content + content, plan: plan || msg.plan };
                        }
                        return msg;
                    }));
                },
                onAudio: (data, format, chunk) => {
                    audioQueue.current.push(data);
                    if (!isPlaying.current) {
                        playNextAudio();
                    }
                },
                onInterrupt: (response, tId) => {
                    if (tId && !threadId) {
                        setThreadId(tId);
                    }
                    setMessages(prev => prev.map(msg => {
                        if (msg.id === assistantMessageId) {
                            return { ...msg, content: msg.content + response, role: 'interrupt' };
                        }
                        return msg;
                    }));
                },
                onDone: () => {
                    loadThreads();
                },
                onError: (errMsg) => {
                    setMessages(prev => prev.map(msg => {
                        if (msg.id === assistantMessageId) {
                            return { ...msg, content: msg.content + `\n\n[Error: ${errMsg}]`, isError: true };
                        }
                        return msg;
                    }));
                }
            });
        } catch (error) {
            console.error('Streaming API error:', error);
            setMessages(prev => prev.map(msg => {
                if (msg.id === assistantMessageId) {
                    return { ...msg, content: 'I apologize, but I encountered an error during audio upload/streaming.', isError: true };
                }
                return msg;
            }));
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="chat-page">
            {/* Thread Sidebar */}
            <aside className="chat-sidebar">
                <div className="chat-sidebar-header">
                    <h3 className="chat-sidebar-title">Chats</h3>
                    <button
                        className="chat-new-btn"
                        onClick={handleNewChat}
                        title="New Chat"
                    >
                        <Plus size={18} />
                    </button>
                </div>

                <div className="chat-thread-list">
                    {threadsLoading && threads.length === 0 ? (
                        <div className="chat-thread-empty">
                            <Loader2 size={20} className="animate-spin" />
                            <span>Loading chats…</span>
                        </div>
                    ) : threads.length === 0 ? (
                        <div className="chat-thread-empty">
                            <MessageSquare size={20} />
                            <span>No conversations yet</span>
                        </div>
                    ) : (
                        threads.map((thread) => (
                            <button
                                key={thread.thread_id}
                                className={`chat-thread-item ${thread.thread_id === threadId ? 'active' : ''}`}
                                onClick={() => handleSelectThread(thread.thread_id)}
                            >
                                <div className="chat-thread-icon">
                                    <MessageSquare size={16} />
                                </div>
                                <div className="chat-thread-info">
                                    <span className="chat-thread-preview">
                                        {thread.last_message
                                            ? thread.last_message.length > 40
                                                ? thread.last_message.substring(0, 40) + '…'
                                                : thread.last_message
                                            : 'New conversation'}
                                    </span>
                                    {thread.updated_at && (
                                        <span className="chat-thread-time">
                                            <Clock size={10} />
                                            {formatRelativeTime(thread.updated_at)}
                                        </span>
                                    )}
                                </div>
                            </button>
                        ))
                    )}
                </div>
            </aside>

            {/* Main Chat Area */}
            <div className="chat-container">
                {/* Messages Area */}
                <div className="chat-messages">
                    <div className="chat-messages-inner">
                        {messages.map((message) => (
                            <div key={message.id} className="message-wrapper">
                                <MessageBubble message={message} />
                                {message.plan && message.plan.length > 0 && (
                                    <PlanDisplay plan={message.plan} />
                                )}
                            </div>
                        ))}

                        {isLoading && !isVoiceMode && (
                            <div className="message-wrapper">
                                <div className="message message-assistant">
                                    <div className="message-avatar assistant-avatar">
                                        <Bot size={20} />
                                    </div>
                                    <div className="message-content">
                                        <div className="typing-indicator">
                                            <span></span>
                                            <span></span>
                                            <span></span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>
                </div>

                {/* Input Area */}
                <div className="chat-input-container">
                    <div className="chat-input-actions">
                        <button
                            className={`mode-toggle-btn ${!isVoiceMode ? 'active' : ''}`}
                            onClick={() => setIsVoiceMode(false)}
                            title="Text Mode"
                        >
                            <Type size={16} />
                            <span>Text</span>
                        </button>
                        <button
                            className={`mode-toggle-btn ${isVoiceMode ? 'active' : ''}`}
                            onClick={() => setIsVoiceMode(true)}
                            title="Voice Mode"
                        >
                            <Volume2 size={16} />
                            <span>Voice</span>
                        </button>

                        {isVoiceMode && (
                            <input
                                type="text"
                                className="voice-id-input"
                                placeholder="Voice ID (default)"
                                value={voiceId}
                                onChange={(e) => setVoiceId(e.target.value)}
                            />
                        )}
                    </div>
                    <div className="chat-input-wrapper">
                        <ChatInput
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder={isVoiceMode ? "Click the microphone to record..." : "Type your message..."}
                            disabled={isLoading}
                            isVoiceMode={isVoiceMode}
                            onVoiceSubmit={handleVoiceSubmit}
                        />
                        <Button
                            variant="primary"
                            size="md"
                            icon={isLoading && !isVoiceMode ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
                            onClick={handleSend}
                            disabled={!input.trim() || isLoading}
                            className="chat-send-btn"
                        />
                    </div>
                    <p className="chat-hint">
                        <Sparkles size={12} />
                        Press Enter to send, Shift+Enter for new line
                    </p>
                </div>
            </div>
        </div>
    );
}
