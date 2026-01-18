import { useRef, useEffect } from 'react';
import './ChatInput.css';

export default function ChatInput({
    value,
    onChange,
    onKeyDown,
    placeholder = 'Type a message...',
    disabled = false,
    maxRows = 5,
}) {
    const textareaRef = useRef(null);

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

    return (
        <div className="chat-input">
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
        </div>
    );
}
