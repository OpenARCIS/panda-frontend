import GmailAuth from '../../components/Settings/GmailAuth';
import './Settings.css';

export default function IntegrationSettings() {
    return (
        <div className="integration-settings">
            <div className="settings-header">
                <div>
                    <h2 className="settings-title">Integrations</h2>
                    <p className="settings-subtitle">Manage your connections with external services</p>
                </div>
            </div>

            <div className="integrations-grid">
                <GmailAuth />
            </div>
        </div>
    );
}
