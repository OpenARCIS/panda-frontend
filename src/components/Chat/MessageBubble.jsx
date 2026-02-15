import { Bot, User, AlertTriangle } from 'lucide-react';
import './MessageBubble.css';

export default function MessageBubble({ message }) {
    const isUser = message.role === 'user';
    const isInterrupt = message.role === 'interrupt';

    const formatTime = (date) => {
        return date.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit'
        });
    };

    const getAvatarClass = () => {
        if (isUser) return 'user-avatar';
        if (isInterrupt) return 'interrupt-avatar';
        return 'assistant-avatar';
    };

    const getAvatarIcon = () => {
        if (isUser) return <User size={18} />;
        if (isInterrupt) return <AlertTriangle size={18} />;
        return <Bot size={18} />;
    };

    return (
        <div className={`message message-${message.role} ${message.isError ? 'message-error' : ''}`}>
            <div className={`message-avatar ${getAvatarClass()}`}>
                {getAvatarIcon()}
            </div>
            <div className="message-content">
                <p className="message-text">{message.content}</p>
                <span className="message-time">{formatTime(message.timestamp)}</span>
            </div>
        </div>
    );
}

