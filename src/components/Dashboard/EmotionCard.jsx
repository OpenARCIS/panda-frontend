import { useEffect, useState } from 'react';
import { Smile, Frown, Meh, AlertCircle, Zap, Heart } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, Skeleton } from '../../components/ui';
import { userStatusAPI } from '../../api';
import './EmotionCard.css';

const emotionConfig = {
    happiness: {
        label: 'Happiness',
        icon: Heart,
        lowLabel: 'Low',
        highLabel: 'High',
        color: 'var(--success)',
    },
    frustration: {
        label: 'Frustration',
        icon: Frown,
        lowLabel: 'Calm',
        highLabel: 'Frustrated',
        color: 'var(--error)',
    },
    urgency: {
        label: 'Urgency',
        icon: Zap,
        lowLabel: 'Low',
        highLabel: 'High',
        color: 'var(--warning)',
    },
    confusion: {
        label: 'Confusion',
        icon: AlertCircle,
        lowLabel: 'Clear',
        highLabel: 'Confused',
        color: 'var(--info)',
    },
};

function EmotionMeter({ type, value, loading }) {
    const config = emotionConfig[type];
    const Icon = config.icon;
    const percentage = ((value - 1) / 9) * 100;

    return (
        <div className="emotion-meter">
            <div className="emotion-meter-header">
                <div className="emotion-meter-icon" style={{ '--emotion-color': config.color }}>
                    <Icon size={16} />
                </div>
                <span className="emotion-meter-label">{config.label}</span>
                <span className="emotion-meter-value" style={{ color: config.color }}>
                    {loading ? '-' : value}/10
                </span>
            </div>
            <div className="emotion-meter-track">
                {loading ? (
                    <Skeleton width="100%" height={8} radius="full" />
                ) : (
                    <div
                        className="emotion-meter-fill"
                        style={{
                            width: `${percentage}%`,
                            background: config.color,
                        }}
                    />
                )}
            </div>
            <div className="emotion-meter-labels">
                <span>{config.lowLabel}</span>
                <span>{config.highLabel}</span>
            </div>
        </div>
    );
}

export default function EmotionCard() {
    const [emotion, setEmotion] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchEmotion() {
            try {
                const data = await userStatusAPI.getStatus();
                if (!data.status) {
                    setEmotion(data);
                }
            } catch (error) {
                console.error('Failed to fetch emotion:', error);
            } finally {
                setLoading(false);
            }
        }

        fetchEmotion();
    }, []);

    const getOverallMood = () => {
        if (!emotion) return { label: 'Unknown', icon: Meh, color: 'var(--text-muted)' };

        const { happiness, frustration, confusion } = emotion;

        if (frustration >= 7) return { label: 'Frustrated', icon: Frown, color: 'var(--error)' };
        if (confusion >= 7) return { label: 'Confused', icon: AlertCircle, color: 'var(--info)' };
        if (happiness >= 7) return { label: 'Happy', icon: Smile, color: 'var(--success)' };
        if (happiness >= 4) return { label: 'Neutral', icon: Meh, color: 'var(--warning)' };
        return { label: 'Low', icon: Frown, color: 'var(--error)' };
    };

    const mood = getOverallMood();
    const MoodIcon = mood.icon;

    return (
        <Card className="emotion-card" glow>
            <CardHeader>
                <CardTitle subtitle="How you're feeling based on recent interactions">
                    Emotion Status
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="emotion-overview">
                    <div className="emotion-mood" style={{ '--mood-color': mood.color }}>
                        <div className="emotion-mood-icon">
                            <MoodIcon size={32} />
                        </div>
                        <div className="emotion-mood-info">
                            <span className="emotion-mood-label">Overall Mood</span>
                            <span className="emotion-mood-value">{mood.label}</span>
                        </div>
                    </div>
                </div>

                <div className="emotion-meters">
                    <EmotionMeter
                        type="happiness"
                        value={emotion?.happiness || 5}
                        loading={loading}
                    />
                    <EmotionMeter
                        type="frustration"
                        value={emotion?.frustration || 1}
                        loading={loading}
                    />
                    <EmotionMeter
                        type="urgency"
                        value={emotion?.urgency || 1}
                        loading={loading}
                    />
                    <EmotionMeter
                        type="confusion"
                        value={emotion?.confusion || 1}
                        loading={loading}
                    />
                </div>
            </CardContent>
        </Card>
    );
}
