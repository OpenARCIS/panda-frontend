import { useMemo } from 'react';
import { Skeleton } from '../../components/ui';
import CalendarEvent from './CalendarEvent';
import './CalendarGrid.css';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const HOURS = Array.from({ length: 24 }, (_, i) => i);

export default function CalendarGrid({
    view,
    currentDate,
    items = [],
    loading,
    onDateClick
}) {
    const calendarDays = useMemo(() => {
        if (view === 'month') {
            return getMonthDays(currentDate);
        } else if (view === 'week') {
            return getWeekDays(currentDate);
        } else {
            return [currentDate];
        }
    }, [view, currentDate]);

    const getItemsForDate = (date) => {
        return items.filter(item => {
            const itemDate = new Date(item.start_time || item.due_date || item.reminder_time);
            return itemDate.toDateString() === date.toDateString();
        });
    };

    if (loading) {
        return (
            <div className="calendar-grid-loading">
                {Array.from({ length: 35 }).map((_, i) => (
                    <Skeleton key={i} width="100%" height={80} radius="md" />
                ))}
            </div>
        );
    }

    if (view === 'day') {
        return (
            <div className="calendar-day-view">
                <div className="day-header">
                    <span className="day-name">{DAYS[currentDate.getDay()]}</span>
                    <span className="day-number">{currentDate.getDate()}</span>
                </div>
                <div className="day-timeline">
                    {HOURS.map(hour => {
                        const hourItems = getItemsForDate(currentDate).filter(item => {
                            const itemDate = new Date(item.start_time || item.due_date || item.reminder_time);
                            return itemDate.getHours() === hour;
                        });

                        return (
                            <div key={hour} className="timeline-row">
                                <div className="timeline-hour">
                                    {hour === 0 ? '12 AM' : hour < 12 ? `${hour} AM` : hour === 12 ? '12 PM' : `${hour - 12} PM`}
                                </div>
                                <div className="timeline-content">
                                    {hourItems.map((item, idx) => (
                                        <CalendarEvent key={idx} item={item} compact />
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    }

    return (
        <div className={`calendar-grid calendar-${view}`}>
            {/* Header */}
            <div className="calendar-grid-header">
                {DAYS.map(day => (
                    <div key={day} className="grid-header-cell">
                        {day}
                    </div>
                ))}
            </div>

            {/* Days */}
            <div className="calendar-grid-body">
                {calendarDays.map((date, index) => {
                    const isToday = date.toDateString() === new Date().toDateString();
                    const isCurrentMonth = date.getMonth() === currentDate.getMonth();
                    const dayItems = getItemsForDate(date);

                    return (
                        <div
                            key={index}
                            className={`grid-cell ${isToday ? 'grid-cell-today' : ''} ${!isCurrentMonth ? 'grid-cell-other' : ''}`}
                            onClick={() => onDateClick?.(date)}
                        >
                            <span className={`grid-cell-date ${isToday ? 'today' : ''}`}>
                                {date.getDate()}
                            </span>
                            <div className="grid-cell-events">
                                {dayItems.slice(0, 3).map((item, idx) => (
                                    <CalendarEvent key={idx} item={item} mini />
                                ))}
                                {dayItems.length > 3 && (
                                    <span className="more-events">+{dayItems.length - 3} more</span>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

function getMonthDays(date) {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const days = [];

    // Add days from previous month
    for (let i = 0; i < firstDay.getDay(); i++) {
        const d = new Date(year, month, -i);
        days.unshift(d);
    }

    // Add days of current month
    for (let i = 1; i <= lastDay.getDate(); i++) {
        days.push(new Date(year, month, i));
    }

    // Add days from next month to complete grid
    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
        days.push(new Date(year, month + 1, i));
    }

    return days;
}

function getWeekDays(date) {
    const day = date.getDay();
    const days = [];

    for (let i = 0; i < 7; i++) {
        const d = new Date(date);
        d.setDate(date.getDate() - day + i);
        days.push(d);
    }

    return days;
}
