import { Calendar, CheckSquare, Bell } from 'lucide-react';
import './CalendarEvent.css';

const typeConfig = {
    event: { icon: Calendar, color: 'var(--accent-primary)', bg: 'rgba(124, 58, 237, 0.15)' },
    todo: { icon: CheckSquare, color: 'var(--warning)', bg: 'var(--warning-bg)' },
    reminder: { icon: Bell, color: 'var(--info)', bg: 'var(--info-bg)' },
};

export default function CalendarEvent({ item, mini = false, compact = false }) {
    const config = typeConfig[item.type] || typeConfig.event;
    const Icon = config.icon;

    const formatTime = () => {
        const date = new Date(item.start_time || item.due_date || item.reminder_time);
        return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    };

    if (mini) {
        return (
            <div
                className="calendar-event-mini"
                style={{
                    background: config.bg,
                    borderLeftColor: config.color,
                }}
            >
                <span className="event-mini-title">
                    {item.title || item.name || 'Untitled'}
                </span>
            </div>
        );
    }

    if (compact) {
        return (
            <div
                className="calendar-event-compact"
                style={{
                    background: config.bg,
                    borderLeftColor: config.color,
                }}
            >
                <Icon size={14} style={{ color: config.color }} />
                <span className="event-compact-title">
                    {item.title || item.name || 'Untitled'}
                </span>
                <span className="event-compact-time">{formatTime()}</span>
            </div>
        );
    }

    return (
        <div
            className="calendar-event"
            style={{
                background: config.bg,
                borderLeftColor: config.color,
            }}
        >
            <div className="event-header">
                <Icon size={16} style={{ color: config.color }} />
                <span className="event-title">{item.title || item.name || 'Untitled'}</span>
            </div>
            <span className="event-time">{formatTime()}</span>
            {item.description && (
                <p className="event-description">{item.description}</p>
            )}
        </div>
    );
}
