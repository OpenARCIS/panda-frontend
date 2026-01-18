import { useState } from 'react';
import { Settings as SettingsIcon, Share2 } from 'lucide-react';
import GeneralSettings from './GeneralSettings';
import IntegrationSettings from './IntegrationSettings';
import './Settings.css';

export default function Settings() {
    const [activeTab, setActiveTab] = useState('general');

    const renderContent = () => {
        switch (activeTab) {
            case 'general':
                return <GeneralSettings />;
            case 'integrations':
                return <IntegrationSettings />;
            default:
                return <GeneralSettings />;
        }
    };

    return (
        <div className="settings-page-container">
            <div className="settings-sidebar">
                <div
                    className={`settings-nav-item ${activeTab === 'general' ? 'active' : ''}`}
                    onClick={() => setActiveTab('general')}
                >
                    <SettingsIcon size={20} />
                    <span>General</span>
                </div>
                <div
                    className={`settings-nav-item ${activeTab === 'integrations' ? 'active' : ''}`}
                    onClick={() => setActiveTab('integrations')}
                >
                    <Share2 size={20} />
                    <span>Integrations</span>
                </div>
            </div>
            <div className="settings-content-area">
                {renderContent()}
            </div>
        </div>
    );
}
