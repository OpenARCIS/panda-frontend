import { useState, useEffect } from 'react';
import {
    Save,
    RefreshCw,
    Bot,
    Check,
    AlertCircle,
} from 'lucide-react';
import { Card, CardContent, Button, Loader } from '../../components/ui';
import AgentCard from '../../components/Settings/AgentCard';
import VoiceUpload from '../../components/Settings/VoiceUpload';
import { settingsAPI } from '../../api';
import './Settings.css';

export default function GeneralSettings() {
    const [models, setModels] = useState({});
    const [agents, setAgents] = useState({});
    const [originalAgents, setOriginalAgents] = useState({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saveStatus, setSaveStatus] = useState(null); // 'success' | 'error' | null

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        setLoading(true);
        try {
            const [modelsData, agentsData] = await Promise.all([
                settingsAPI.getModels(),
                settingsAPI.getAgentConfigs(),
            ]);

            setModels(modelsData || {});
            setAgents(agentsData || {});
            setOriginalAgents(agentsData || {});
        } catch (error) {
            console.error('Failed to fetch settings:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAgentChange = (agentName, field, value) => {
        setAgents(prev => ({
            ...prev,
            [agentName]: {
                ...prev[agentName],
                [field]: value,
            },
        }));
    };

    const handleSave = async () => {
        setSaving(true);
        setSaveStatus(null);

        try {
            await settingsAPI.updateAgentConfigs(agents);
            setOriginalAgents(agents);
            setSaveStatus('success');
            setTimeout(() => setSaveStatus(null), 3000);
        } catch (error) {
            console.error('Failed to save settings:', error);
            setSaveStatus('error');
        } finally {
            setSaving(false);
        }
    };

    const handleReset = () => {
        setAgents(originalAgents);
    };

    const hasChanges = JSON.stringify(agents) !== JSON.stringify(originalAgents);

    const providerOptions = Object.keys(models).map(provider => ({
        value: provider,
        label: provider.charAt(0).toUpperCase() + provider.slice(1),
    }));

    if (loading) {
        return (
            <div className="settings-loading">
                <Loader size="lg" text="Loading settings..." />
            </div>
        );
    }

    return (
        <div className="general-settings">
            <div className="settings-header">
                <div>
                    <h2 className="settings-title">Agent Configuration</h2>
                    <p className="settings-subtitle">Configure AI models and providers for each agent</p>
                </div>
                <div className="settings-actions">
                    {saveStatus === 'success' && (
                        <span className="save-status success">
                            <Check size={16} /> Saved successfully
                        </span>
                    )}
                    {saveStatus === 'error' && (
                        <span className="save-status error">
                            <AlertCircle size={16} /> Failed to save
                        </span>
                    )}
                    <Button
                        variant="secondary"
                        icon={<RefreshCw size={16} />}
                        onClick={handleReset}
                        disabled={!hasChanges || saving}
                    >
                        Reset
                    </Button>
                    <Button
                        variant="primary"
                        icon={saving ? <Loader size="sm" /> : <Save size={16} />}
                        onClick={handleSave}
                        disabled={!hasChanges || saving}
                    >
                        {saving ? 'Saving...' : 'Save Changes'}
                    </Button>
                </div>
            </div>

            <div className="agents-grid">
                {Object.entries(agents).map(([name, config]) => (
                    <AgentCard
                        key={name}
                        name={name}
                        config={config}
                        providers={providerOptions}
                        models={models}
                        onChange={(field, value) => handleAgentChange(name, field, value)}
                    />
                ))}
            </div>

            <VoiceUpload />

            {Object.keys(agents).length === 0 && (
                <Card className="no-agents-card">
                    <CardContent>
                        <div className="no-agents">
                            <Bot size={48} />
                            <h3>No Agents Configured</h3>
                            <p>Agent configurations will appear here once they are set up in the backend.</p>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
