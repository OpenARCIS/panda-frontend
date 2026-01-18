import { useState, useRef, useEffect } from 'react';
import { Send, Loader2, Bot, User, Sparkles } from 'lucide-react';
import { Card, Button } from '../../components/ui';
import MessageBubble from '../../components/Chat/MessageBubble';
import PlanDisplay from '../../components/Chat/PlanDisplay';
import ChatInput from '../../components/Chat/ChatInput';
import { chatAPI } from '../../api';
import './Chat.css';

export default function Chat() {
    const [messages, setMessages] = useState([
        {
            id: 'welcome',
            role: 'assistant',
            content: "Hi! I'm your Panda AI assistant. I can help you manage your schedule, send emails, and more. What would you like to do today?",
            timestamp: new Date(),
        }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

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

        try {
            const response = await chatAPI.sendMessage(userMessage.content);

            const assistantMessage = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: response.response || 'I apologize, but I encountered an issue processing your request.',
                plan: response.plan || [],
                timestamp: new Date(),
            };

            setMessages(prev => [...prev, assistantMessage]);
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
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="chat-page">
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

                        {isLoading && (
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
                    <div className="chat-input-wrapper">
                        <ChatInput
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Type your message..."
                            disabled={isLoading}
                        />
                        <Button
                            variant="primary"
                            size="md"
                            icon={isLoading ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
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
