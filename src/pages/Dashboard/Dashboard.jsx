import { useEffect, useState } from 'react';
import {
    Activity,
    MessageSquare,
    Calendar,
    Zap,
    ArrowRight,
    TrendingUp,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent, Button, Skeleton } from '../../components/ui';
import EmotionCard from '../../components/Dashboard/EmotionCard';
import TokenUsageChart from '../../components/Dashboard/TokenUsageChart';
import UpcomingEvents from '../../components/Dashboard/UpcomingEvents';
import { tokenTrackerAPI, calendarAPI } from '../../api';
import './Dashboard.css';

export default function Dashboard() {
    const [stats, setStats] = useState([]);
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            try {
                const [tokenStats, calendarData] = await Promise.all([
                    tokenTrackerAPI.getCumulativeStats(),
                    calendarAPI.getAllItems(
                        new Date().toISOString(),
                        new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
                    ),
                ]);

                setStats(tokenStats);
                setEvents([
                    ...(calendarData.events || []).map(e => ({ ...e, type: 'event' })),
                    ...(calendarData.todos || []).map(e => ({ ...e, type: 'todo' })),
                    ...(calendarData.reminders || []).map(e => ({ ...e, type: 'reminder' })),
                ]);
            } catch (error) {
                console.error('Failed to fetch dashboard data:', error);
            } finally {
                setLoading(false);
            }
        }

        fetchData();
    }, []);

    const totalTokens = stats.reduce((sum, s) => sum + (s.total_tokens || 0), 0);
    const totalRequests = stats.reduce((sum, s) => sum + (s.request_count || 0), 0);

    return (
        <div className="dashboard">
            {/* Quick Stats */}
            <div className="dashboard-stats">
                <Card className="stat-card" glow>
                    <div className="stat-icon stat-icon-purple">
                        <Activity size={24} />
                    </div>
                    <div className="stat-content">
                        <span className="stat-value">
                            {loading ? <Skeleton width={60} height={28} /> : totalTokens.toLocaleString()}
                        </span>
                        <span className="stat-label">Total Tokens</span>
                    </div>
                    <TrendingUp className="stat-trend" size={16} />
                </Card>

                <Card className="stat-card" glow>
                    <div className="stat-icon stat-icon-cyan">
                        <MessageSquare size={24} />
                    </div>
                    <div className="stat-content">
                        <span className="stat-value">
                            {loading ? <Skeleton width={40} height={28} /> : totalRequests}
                        </span>
                        <span className="stat-label">AI Requests</span>
                    </div>
                </Card>

                <Card className="stat-card" glow>
                    <div className="stat-icon stat-icon-green">
                        <Calendar size={24} />
                    </div>
                    <div className="stat-content">
                        <span className="stat-value">
                            {loading ? <Skeleton width={40} height={28} /> : events.length}
                        </span>
                        <span className="stat-label">Upcoming Events</span>
                    </div>
                </Card>

                <Card className="stat-card" glow>
                    <div className="stat-icon stat-icon-orange">
                        <Zap size={24} />
                    </div>
                    <div className="stat-content">
                        <span className="stat-value">
                            {loading ? <Skeleton width={40} height={28} /> : stats.length}
                        </span>
                        <span className="stat-label">Active Agents</span>
                    </div>
                </Card>
            </div>

            {/* Main Content Grid */}
            <div className="dashboard-grid">
                {/* Left Column */}
                <div className="dashboard-main">
                    {/* Emotion Status */}
                    <EmotionCard />

                    {/* Token Usage Chart */}
                    <TokenUsageChart stats={stats} loading={loading} />
                </div>

                {/* Right Column */}
                <div className="dashboard-sidebar">
                    {/* Quick Actions */}
                    <Card className="quick-actions-card">
                        <CardHeader>
                            <CardTitle>Quick Actions</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="quick-actions">
                                <Link to="/chat" className="quick-action">
                                    <div className="quick-action-icon">
                                        <MessageSquare size={20} />
                                    </div>
                                    <div className="quick-action-content">
                                        <span className="quick-action-title">Start Chat</span>
                                        <span className="quick-action-desc">Talk to your AI assistant</span>
                                    </div>
                                    <ArrowRight size={16} className="quick-action-arrow" />
                                </Link>

                                <Link to="/calendar" className="quick-action">
                                    <div className="quick-action-icon">
                                        <Calendar size={20} />
                                    </div>
                                    <div className="quick-action-content">
                                        <span className="quick-action-title">View Calendar</span>
                                        <span className="quick-action-desc">Check your schedule</span>
                                    </div>
                                    <ArrowRight size={16} className="quick-action-arrow" />
                                </Link>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Upcoming Events */}
                    <UpcomingEvents events={events} loading={loading} />
                </div>
            </div>
        </div>
    );
}
