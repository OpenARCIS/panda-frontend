import { Bot, User } from 'lucide-react';
import './MessageBubble.css';

export default function MessageBubble({ message }) {
    const isUser = message.role === 'user';

    const formatTime = (date) => {
        return date.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit'
        });
    };

    return (
        <div className={`message message-${message.role} ${message.isError ? 'message-error' : ''}`}>
            <div className={`message-avatar ${isUser ? 'user-avatar' : 'assistant-avatar'}`}>
                {isUser ? <User size={18} /> : <Bot size={18} />}
            </div>
            <div className="message-content">
                <p className="message-text">{message.content}</p>
                <span className="message-time">{formatTime(message.timestamp)}</span>
            </div>
        </div>
    );
}
