import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import './DatePicker.css';

const DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

export default function DatePicker({ selectedDate, onDateSelect }) {
    const [viewDate, setViewDate] = useState(selectedDate || new Date());

    const { year, month, days } = useMemo(() => {
        const year = viewDate.getFullYear();
        const month = viewDate.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);

        const days = [];

        // Previous month days
        for (let i = 0; i < firstDay.getDay(); i++) {
            const d = new Date(year, month, -i);
            days.unshift({ date: d, isOtherMonth: true });
        }

        // Current month days
        for (let i = 1; i <= lastDay.getDate(); i++) {
            days.push({ date: new Date(year, month, i), isOtherMonth: false });
        }

        // Next month days
        const remaining = 42 - days.length;
        for (let i = 1; i <= remaining; i++) {
            days.push({ date: new Date(year, month + 1, i), isOtherMonth: true });
        }

        return { year, month, days };
    }, [viewDate]);

    const navigate = (direction) => {
        const newDate = new Date(viewDate);
        newDate.setMonth(newDate.getMonth() + direction);
        setViewDate(newDate);
    };

    const monthName = viewDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

    return (
        <div className="date-picker">
            <div className="dp-header">
                <button className="dp-nav-btn" onClick={() => navigate(-1)}>
                    <ChevronLeft size={16} />
                </button>
                <span className="dp-month">{monthName}</span>
                <button className="dp-nav-btn" onClick={() => navigate(1)}>
                    <ChevronRight size={16} />
                </button>
            </div>

            <div className="dp-weekdays">
                {DAYS.map(day => (
                    <span key={day} className="dp-weekday">{day}</span>
                ))}
            </div>

            <div className="dp-days">
                {days.map(({ date, isOtherMonth }, index) => {
                    const isToday = date.toDateString() === new Date().toDateString();
                    const isSelected = selectedDate && date.toDateString() === selectedDate.toDateString();

                    return (
                        <button
                            key={index}
                            className={`dp-day ${isOtherMonth ? 'other-month' : ''} ${isToday ? 'today' : ''} ${isSelected ? 'selected' : ''}`}
                            onClick={() => onDateSelect?.(date)}
                        >
                            {date.getDate()}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
