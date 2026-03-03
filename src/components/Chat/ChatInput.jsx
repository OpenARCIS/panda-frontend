import { useRef, useEffect, useState } from 'react';
import { Mic, Square } from 'lucide-react';
import './ChatInput.css';

export default function ChatInput({
    value,
    onChange,
    onKeyDown,
    placeholder = 'Type a message...',
    disabled = false,
    maxRows = 5,
    onVoiceSubmit,
    isVoiceMode = false
}) {
    const textareaRef = useRef(null);
    const [isRecording, setIsRecording] = useState(false);
    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);

    useEffect(() => {
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = 'auto';
            const lineHeight = 24;
            const maxHeight = lineHeight * maxRows;
            const newHeight = Math.min(textarea.scrollHeight, maxHeight);
            textarea.style.height = `${newHeight}px`;
        }
    }, [value, maxRows]);

    const handleMicClick = async () => {
        if (isRecording) {
            // Stop recording
            if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
                mediaRecorderRef.current.stop();
            }
            setIsRecording(false);
        } else {
            // Start recording
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                const mediaRecorder = new MediaRecorder(stream);
                mediaRecorderRef.current = mediaRecorder;
                audioChunksRef.current = [];

                mediaRecorder.ondataavailable = (e) => {
                    if (e.data.size > 0) {
                        audioChunksRef.current.push(e.data);
                    }
                };

                mediaRecorder.onstop = () => {
                    const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
                    if (onVoiceSubmit) {
                        onVoiceSubmit(audioBlob);
                    }
                    // Clean up tracks to stop using the microphone
                    stream.getTracks().forEach(track => track.stop());
                };

                mediaRecorder.start();
                setIsRecording(true);
            } catch (err) {
                console.error("Error accessing microphone:", err);
                alert("Could not access microphone. Please check permissions.");
            }
        }
    };

    return (
        <div className={`chat-input ${isRecording ? 'recording' : ''} ${isVoiceMode ? 'has-mic' : ''}`}>
            <textarea
                ref={textareaRef}
                className="chat-input-field"
                value={value}
                onChange={onChange}
                onKeyDown={onKeyDown}
                placeholder={placeholder}
                disabled={disabled}
                rows={1}
            />
            {isVoiceMode && (
                <button
                    className={`mic-btn ${isRecording ? 'recording-active' : ''}`}
                    onClick={handleMicClick}
                    disabled={disabled && !isRecording}
                    title={isRecording ? "Stop Recording" : "Start Recording"}
                >
                    {isRecording ? <Square size={18} fill="currentColor" /> : <Mic size={18} />}
                </button>
            )}
        </div>
    );
}
