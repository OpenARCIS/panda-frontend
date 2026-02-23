import { useState, useRef } from 'react';
import { UploadCloud, CheckCircle, AlertCircle, FileAudio, X } from 'lucide-react';
import { Card, CardContent, Button, Loader } from '../ui';
import { chatAPI } from '../../api';
import './VoiceUpload.css';

export default function VoiceUpload() {
    const [voiceId, setVoiceId] = useState('');
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [status, setStatus] = useState(null); // 'success' | 'error' | null
    const [errorMessage, setErrorMessage] = useState('');
    const fileInputRef = useRef(null);

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            if (selectedFile.type === 'audio/wav' || selectedFile.name.endsWith('.wav')) {
                setFile(selectedFile);
                setStatus(null);
            } else {
                setFile(null);
                setStatus('error');
                setErrorMessage('Please select a valid .wav file.');
            }
        }
    };

    const clearFile = () => {
        setFile(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleUpload = async () => {
        if (!file || !voiceId.trim()) return;

        setUploading(true);
        setStatus(null);
        setErrorMessage('');

        try {
            await chatAPI.uploadVoice(file, voiceId.trim());
            setStatus('success');
            setTimeout(() => {
                setStatus(null);
                setVoiceId('');
                clearFile();
            }, 3000);
        } catch (error) {
            console.error('Upload failed:', error);
            setStatus('error');
            setErrorMessage(error.message || 'Failed to upload voice.');
        } finally {
            setUploading(false);
        }
    };

    return (
        <Card className="voice-upload-card">
            <CardContent>
                <div className="voice-upload-header">
                    <div className="voice-upload-icon-wrapper">
                        <FileAudio size={24} className="voice-upload-icon" />
                    </div>
                    <div>
                        <h3 className="voice-upload-title">Custom Voice Cloning</h3>
                        <p className="voice-upload-desc">
                            Upload a short .wav audio clip of a voice to instantly clone it for the AI assistant.
                        </p>
                    </div>
                </div>

                <div className="voice-upload-form">
                    <div className="form-group">
                        <label className="form-label" htmlFor="voice-id">Voice ID (Name)</label>
                        <input
                            id="voice-id"
                            type="text"
                            className="form-input"
                            placeholder="e.g., my_clone_voice_01"
                            value={voiceId}
                            onChange={(e) => setVoiceId(e.target.value)}
                            disabled={uploading}
                        />
                        <p className="form-hint">A unique identifier you will use to select this voice in chat.</p>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Voice Sample (.wav format)</label>

                        {!file ? (
                            <div
                                className="file-drop-area"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <UploadCloud size={32} className="drop-icon" />
                                <p className="drop-text">Click to browse or drag and drop</p>
                                <p className="drop-hint">WAV format only, clear audio recommended</p>
                            </div>
                        ) : (
                            <div className="file-selected-area">
                                <div className="file-info">
                                    <FileAudio size={20} className="file-icon" />
                                    <span className="file-name">{file.name}</span>
                                    <span className="file-size">({(file.size / 1024).toFixed(1)} KB)</span>
                                </div>
                                <button className="file-remove-btn" onClick={clearFile} disabled={uploading}>
                                    <X size={16} />
                                </button>
                            </div>
                        )}

                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            accept="audio/wav,.wav"
                            className="hidden-file-input"
                        />
                    </div>

                    {status === 'error' && (
                        <div className="upload-alert error">
                            <AlertCircle size={16} />
                            <span>{errorMessage}</span>
                        </div>
                    )}

                    {status === 'success' && (
                        <div className="upload-alert success">
                            <CheckCircle size={16} />
                            <span>Voice '{voiceId}' cloned successfully!</span>
                        </div>
                    )}

                    <div className="voice-upload-actions">
                        <Button
                            variant="primary"
                            icon={uploading ? <Loader size="sm" /> : <UploadCloud size={16} />}
                            onClick={handleUpload}
                            disabled={!file || !voiceId.trim() || uploading}
                            className="w-full"
                        >
                            {uploading ? 'Processing Voice...' : 'Upload & Clone Voice'}
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
