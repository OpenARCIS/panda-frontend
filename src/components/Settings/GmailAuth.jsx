import { useState, useEffect } from 'react';
import { Mail, ExternalLink, CheckCircle, AlertCircle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, Button, Badge } from '../../components/ui';
import { gmailAPI } from '../../api';
import './GmailAuth.css';

export default function GmailAuth() {
    const [loading, setLoading] = useState(true);
    const [connected, setConnected] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        checkAuthStatus();
    }, []);

    const checkAuthStatus = async () => {
        try {
            const status = await gmailAPI.getAuthStatus();
            setConnected(status === true);
        } catch (err) {
            console.error('Failed to check auth status:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleConnect = async () => {
        setLoading(true);
        setError(null);

        try {
            const { auth_url } = await gmailAPI.getAuthUrl();
            if (auth_url) {
                // Open in new window
                const width = 500;
                const height = 600;
                const left = (window.screen.width - width) / 2;
                const top = (window.screen.height - height) / 2;

                const authWindow = window.open(
                    auth_url,
                    'Google Auth',
                    `width=${width},height=${height},left=${left},top=${top}`
                );

                // Poll for window closure to refresh status
                const timer = setInterval(() => {
                    if (authWindow.closed) {
                        clearInterval(timer);
                        checkAuthStatus();
                    }
                }, 1000);
            }
        } catch (err) {
            console.error('Gmail auth error:', err);
            setError('Failed to initiate authentication');
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        setLoading(true);
        try {
            await gmailAPI.logout();
            setConnected(false);
        } catch (err) {
            console.error('Logout error:', err);
            setError('Failed to logout');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="gmail-auth-card" glow>
            <CardHeader>
                <div className="gmail-header">
                    <div className="gmail-icon">
                        <Mail size={20} />
                    </div>
                    <CardTitle subtitle="Connect your Gmail account">
                        Gmail Integration
                    </CardTitle>
                    <Badge variant={connected ? 'success' : 'default'} dot>
                        {connected ? 'Connected' : 'Not connected'}
                    </Badge>
                </div>
            </CardHeader>
            <CardContent>
                <div className="gmail-content">
                    <p className="gmail-description">
                        Connect your Gmail account to enable email features like sending, searching, and analyzing emails.
                    </p>

                    {error && (
                        <div className="gmail-error">
                            <AlertCircle size={16} />
                            <span>{error}</span>
                        </div>
                    )}

                    {connected ? (
                        <div className="gmail-connected-actions">
                            <div className="gmail-connected-status">
                                <CheckCircle size={16} />
                                <span>Your Gmail account is connected</span>
                            </div>
                            <Button
                                variant="destructive"
                                onClick={handleLogout}
                                loading={loading}
                                size="sm"
                            >
                                Disconnect
                            </Button>
                        </div>
                    ) : (
                        <Button
                            variant="secondary"
                            icon={<ExternalLink size={16} />}
                            onClick={handleConnect}
                            loading={loading}
                            fullWidth
                        >
                            Connect Gmail Account
                        </Button>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
