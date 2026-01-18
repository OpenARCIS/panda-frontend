import { useState, useEffect } from 'react';
import {
    ChevronLeft,
    ChevronRight,
    Calendar as CalendarIcon,
    Plus,
    Filter,
} from 'lucide-react';
import { Card, Button, Badge } from '../../components/ui';
import CalendarGrid from '../../components/Calendar/CalendarGrid';
import DatePicker from '../../components/Calendar/DatePicker';
import { calendarAPI } from '../../api';
import './Calendar.css';

const VIEWS = ['month', 'week', 'day'];

export default function Calendar() {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [view, setView] = useState('month');
    const [events, setEvents] = useState([]);
    const [todos, setTodos] = useState([]);
    const [reminders, setReminders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        showEvents: true,
        showTodos: true,
        showReminders: true,
    });

    useEffect(() => {
        fetchCalendarData();
    }, [currentDate, view]);

    const fetchCalendarData = async () => {
        setLoading(true);
        try {
            const { startDate, endDate } = getDateRange();
            const data = await calendarAPI.getAllItems(
                startDate.toISOString(),
                endDate.toISOString()
            );

            setEvents(data.events || []);
            setTodos(data.todos || []);
            setReminders(data.reminders || []);
        } catch (error) {
            console.error('Failed to fetch calendar data:', error);
        } finally {
            setLoading(false);
        }
    };

    const getDateRange = () => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();

        if (view === 'month') {
            return {
                startDate: new Date(year, month, 1),
                endDate: new Date(year, month + 1, 0, 23, 59, 59),
            };
        } else if (view === 'week') {
            const day = currentDate.getDay();
            const startDate = new Date(currentDate);
            startDate.setDate(currentDate.getDate() - day);
            const endDate = new Date(startDate);
            endDate.setDate(startDate.getDate() + 6);
            endDate.setHours(23, 59, 59);
            return { startDate, endDate };
        } else {
            return {
                startDate: new Date(year, month, currentDate.getDate()),
                endDate: new Date(year, month, currentDate.getDate(), 23, 59, 59),
            };
        }
    };

    const navigateDate = (direction) => {
        const newDate = new Date(currentDate);
        if (view === 'month') {
            newDate.setMonth(newDate.getMonth() + direction);
        } else if (view === 'week') {
            newDate.setDate(newDate.getDate() + direction * 7);
        } else {
            newDate.setDate(newDate.getDate() + direction);
        }
        setCurrentDate(newDate);
    };

    const goToToday = () => {
        setCurrentDate(new Date());
    };

    const formatHeaderDate = () => {
        if (view === 'month') {
            return currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
        } else if (view === 'week') {
            const { startDate, endDate } = getDateRange();
            const start = startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            const end = endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
            return `${start} - ${end}`;
        } else {
            return currentDate.toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
                year: 'numeric'
            });
        }
    };

    const allItems = [
        ...(filters.showEvents ? events.map(e => ({ ...e, type: 'event' })) : []),
        ...(filters.showTodos ? todos.map(t => ({ ...t, type: 'todo' })) : []),
        ...(filters.showReminders ? reminders.map(r => ({ ...r, type: 'reminder' })) : []),
    ];

    const toggleFilter = (filter) => {
        setFilters(prev => ({ ...prev, [filter]: !prev[filter] }));
    };

    return (
        <div className="calendar-page">
            {/* Header Controls */}
            <div className="calendar-header">
                <div className="calendar-nav">
                    <Button
                        variant="ghost"
                        icon={<ChevronLeft size={20} />}
                        onClick={() => navigateDate(-1)}
                        className="nav-btn"
                    />
                    <Button
                        variant="ghost"
                        icon={<ChevronRight size={20} />}
                        onClick={() => navigateDate(1)}
                        className="nav-btn"
                    />
                    <h2 className="calendar-title">{formatHeaderDate()}</h2>
                </div>

                <div className="calendar-actions">
                    <Button
                        variant="secondary"
                        size="sm"
                        onClick={goToToday}
                    >
                        Today
                    </Button>

                    <div className="view-toggle">
                        {VIEWS.map((v) => (
                            <button
                                key={v}
                                className={`view-btn ${view === v ? 'active' : ''}`}
                                onClick={() => setView(v)}
                            >
                                {v.charAt(0).toUpperCase() + v.slice(1)}
                            </button>
                        ))}
                    </div>

                    <div className="filter-toggle">
                        <Badge
                            variant={filters.showEvents ? 'primary' : 'default'}
                            className="filter-badge"
                            onClick={() => toggleFilter('showEvents')}
                        >
                            Events
                        </Badge>
                        <Badge
                            variant={filters.showTodos ? 'warning' : 'default'}
                            className="filter-badge"
                            onClick={() => toggleFilter('showTodos')}
                        >
                            Todos
                        </Badge>
                        <Badge
                            variant={filters.showReminders ? 'info' : 'default'}
                            className="filter-badge"
                            onClick={() => toggleFilter('showReminders')}
                        >
                            Reminders
                        </Badge>
                    </div>
                </div>
            </div>

            {/* Calendar Content */}
            <div className="calendar-content">
                <Card className="calendar-main" padding="none" hover={false}>
                    <CalendarGrid
                        view={view}
                        currentDate={currentDate}
                        items={allItems}
                        loading={loading}
                        onDateClick={(date) => {
                            setCurrentDate(date);
                            if (view === 'month') setView('day');
                        }}
                    />
                </Card>

                {/* Sidebar */}
                <div className="calendar-sidebar">
                    <Card>
                        <DatePicker
                            selectedDate={currentDate}
                            onDateSelect={setCurrentDate}
                        />
                    </Card>

                    <Card>
                        <div className="calendar-stats">
                            <div className="stat-row">
                                <span className="stat-label">Events</span>
                                <span className="stat-value text-accent">{events.length}</span>
                            </div>
                            <div className="stat-row">
                                <span className="stat-label">Todos</span>
                                <span className="stat-value text-warning">{todos.length}</span>
                            </div>
                            <div className="stat-row">
                                <span className="stat-label">Reminders</span>
                                <span className="stat-value text-info">{reminders.length}</span>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}
