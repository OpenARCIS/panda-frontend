import { Bot } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, Select, Slider } from '../../components/ui';
import './AgentCard.css';

export default function AgentCard({
    name,
    config,
    providers = [],
    models = {},
    onChange
}) {
    const formatName = (name) => {
        return name
            .split('_')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    };

    const currentProvider = config?.provider || '';
    const currentModel = config?.model_name || '';
    const currentTemp = config?.temperature ?? 0.7;

    const availableModels = models[currentProvider];

    let modelList = [];
    if (Array.isArray(availableModels)) {
        modelList = availableModels;
    } else if (availableModels && typeof availableModels === 'object') {
        modelList = Object.keys(availableModels);
    }

    const modelOptions = modelList.map(model => ({
        value: model,
        label: model,
    }));

    return (
        <Card className="agent-card" glow>
            <CardHeader>
                <div className="agent-header">
                    <div className="agent-icon">
                        <Bot size={20} />
                    </div>
                    <CardTitle subtitle={`Provider: ${currentProvider || 'Not set'}`}>
                        {formatName(name)}
                    </CardTitle>
                </div>
            </CardHeader>
            <CardContent>
                <div className="agent-settings">
                    <Select
                        label="Provider"
                        value={currentProvider}
                        options={providers}
                        placeholder="Select provider"
                        onChange={(e) => onChange('provider', e.target.value)}
                    />

                    <Select
                        label="Model"
                        value={currentModel}
                        options={modelOptions}
                        placeholder={currentProvider ? 'Select model' : 'Select provider first'}
                        disabled={!currentProvider}
                        onChange={(e) => onChange('model_name', e.target.value)}
                    />

                    <Slider
                        label="Temperature"
                        value={currentTemp}
                        min={0}
                        max={1}
                        step={0.1}
                        showValue
                        valueFormatter={(v) => v.toFixed(1)}
                        onChange={(e) => onChange('temperature', parseFloat(e.target.value))}
                    />

                    <div className="temp-hints">
                        <span>Precise</span>
                        <span>Creative</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
