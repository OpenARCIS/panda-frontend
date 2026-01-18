import { useState } from 'react';
import { ChevronDown, ChevronUp, CheckCircle2, Circle, Play, Mail, Calendar, Search } from 'lucide-react';
import { Card, Badge } from '../../components/ui';
import './PlanDisplay.css';

const actionIcons = {
    email: Mail,
    calendar: Calendar,
    search: Search,
    default: Play,
};

function getActionIcon(action) {
    const lowercaseAction = (action.action || action.description || '').toLowerCase();
    if (lowercaseAction.includes('email') || lowercaseAction.includes('mail')) return Mail;
    if (lowercaseAction.includes('calendar') || lowercaseAction.includes('schedule') || lowercaseAction.includes('event')) return Calendar;
    if (lowercaseAction.includes('search') || lowercaseAction.includes('find')) return Search;
    return Play;
}

export default function PlanDisplay({ plan = [] }) {
    const [isExpanded, setIsExpanded] = useState(true);

    if (!plan.length) return null;

    return (
        <div className="plan-display">
            <button
                className="plan-header"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="plan-header-left">
                    <div className="plan-icon">
                        <Play size={14} />
                    </div>
                    <span className="plan-title">Execution Plan</span>
                    <Badge variant="primary" size="sm">{plan.length} steps</Badge>
                </div>
                {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>

            {isExpanded && (
                <div className="plan-steps">
                    {plan.map((step, index) => {
                        const Icon = getActionIcon(step);
                        const isCompleted = step.completed || step.status === 'completed';

                        return (
                            <div
                                key={index}
                                className={`plan-step ${isCompleted ? 'plan-step-completed' : ''}`}
                            >
                                <div className="plan-step-indicator">
                                    {isCompleted ? (
                                        <CheckCircle2 size={18} className="step-check" />
                                    ) : (
                                        <Circle size={18} className="step-circle" />
                                    )}
                                    {index < plan.length - 1 && <div className="plan-step-line" />}
                                </div>
                                <div className="plan-step-content">
                                    <div className="plan-step-icon">
                                        <Icon size={14} />
                                    </div>
                                    <div className="plan-step-info">
                                        <span className="plan-step-action">
                                            {step.action || step.description || `Step ${index + 1}`}
                                        </span>
                                        {step.details && (
                                            <span className="plan-step-details">{step.details}</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
