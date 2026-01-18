import { useEffect, useState } from 'react';
import { Menu, Smile, Frown, Meh, AlertCircle, Sun, Moon } from 'lucide-react';
import { userStatusAPI } from '../../api';
import { useTheme } from '../../context/ThemeContext';
import './Header.css';

const emotionIcons = {
    happy: { icon: Smile, color: 'var(--success)' },
    neutral: { icon: Meh, color: 'var(--warning)' },
    frustrated: { icon: Frown, color: 'var(--error)' },
    confused: { icon: AlertCircle, color: 'var(--info)' },
};

function getEmotionState(emotion) {
    if (!emotion || emotion.status) return null;

    const { happiness, frustration, confusion } = emotion;

    if (frustration >= 6) return 'frustrated';
    if (confusion >= 6) return 'confused';
    if (happiness >= 6) return 'happy';
    return 'neutral';
}

export default function Header({ title, subtitle, onMenuClick, showMenu = false }) {
    const [emotion, setEmotion] = useState(null);
    const { theme, toggleTheme } = useTheme();

    useEffect(() => {
        async function fetchEmotion() {
            try {
                const data = await userStatusAPI.getStatus();
                setEmotion(data);
            } catch (error) {
                console.error('Failed to fetch emotion:', error);
            }
        }

        fetchEmotion();
        const interval = setInterval(fetchEmotion, 30000); // Refresh every 30s

        return () => clearInterval(interval);
    }, []);

    const emotionState = getEmotionState(emotion);
    const EmotionIcon = emotionState ? emotionIcons[emotionState].icon : null;

    return (
        <header className="header">
            <div className="header-left">
                {showMenu && (
                    <button className="header-menu-btn" onClick={onMenuClick}>
                        <Menu size={20} />
                    </button>
                )}
                <div className="header-titles">
                    <h1 className="header-title">{title}</h1>
                    {subtitle && <p className="header-subtitle">{subtitle}</p>}
                </div>
            </div>

            <div className="header-right">
                {emotionState && (
                    <div
                        className="header-emotion"
                        style={{ '--emotion-color': emotionIcons[emotionState].color }}
                    >
                        <EmotionIcon size={18} />
                        <span className="header-emotion-label">
                            {emotionState.charAt(0).toUpperCase() + emotionState.slice(1)}
                        </span>
                    </div>
                )}

                <button
                    className="theme-toggle"
                    onClick={toggleTheme}
                    aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
                >
                    {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                </button>

                <div className="header-time">
                    {new Date().toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric'
                    })}
                </div>
            </div>
        </header>
    );
}

