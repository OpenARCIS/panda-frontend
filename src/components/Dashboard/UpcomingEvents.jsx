import { Calendar, CheckSquare, Bell, Clock } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, Badge, Skeleton } from '../../components/ui';
import './UpcomingEvents.css';

const typeConfig = {
    event: { icon: Calendar, color: 'primary', label: 'Event' },
    todo: { icon: CheckSquare, color: 'warning', label: 'Todo' },
    reminder: { icon: Bell, color: 'info', label: 'Reminder' },
};

function EventItem({ event }) {
    const config = typeConfig[event.type] || typeConfig.event;
    const Icon = config.icon;

    const formatDate = (dateStr) => {
        if (!dateStr) return 'No date';
        const date = new Date(dateStr);
        const now = new Date();
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);

        if (date.toDateString() === now.toDateString()) {
            return `Today, ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
        }
        if (date.toDateString() === tomorrow.toDateString()) {
            return `Tomorrow, ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
        }
        return date.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit'
        });
    };

    return (
        <div className="event-item">
            <div className={`event-icon event-icon-${config.color}`}>
                <Icon size={16} />
            </div>
            <div className="event-content">
                <span className="event-title">
                    {event.title || event.name || 'Untitled'}
                </span>
                <span className="event-time">
                    <Clock size={12} />
                    {formatDate(event.start_time || event.due_date || event.reminder_time)}
                </span>
            </div>
            <Badge variant={config.color} size="sm">{config.label}</Badge>
        </div>
    );
}

export default function UpcomingEvents({ events = [], loading }) {
    const sortedEvents = [...events].sort((a, b) => {
        const dateA = new Date(a.start_time || a.due_date || a.reminder_time || 0);
        const dateB = new Date(b.start_time || b.due_date || b.reminder_time || 0);
        return dateA - dateB;
    }).slice(0, 5);

    return (
        <Card className="upcoming-events-card">
            <CardHeader>
                <CardTitle subtitle="Next 7 days">
                    Upcoming
                </CardTitle>
            </CardHeader>
            <CardContent>
                {loading ? (
                    <div className="events-skeleton">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="event-skeleton-item">
                                <Skeleton width={32} height={32} radius="md" />
                                <div className="event-skeleton-content">
                                    <Skeleton width="70%" height={16} />
                                    <Skeleton width="50%" height={12} />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : sortedEvents.length === 0 ? (
                    <div className="events-empty">
                        <Calendar size={32} className="events-empty-icon" />
                        <p>No upcoming events</p>
                        <span>Your schedule is clear!</span>
                    </div>
                ) : (
                    <div className="events-list">
                        {sortedEvents.map((event, index) => (
                            <EventItem key={event.id || index} event={event} />
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
