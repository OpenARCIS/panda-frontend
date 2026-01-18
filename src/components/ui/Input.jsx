import { forwardRef } from 'react';
import './Input.css';

const Input = forwardRef(function Input({
    label,
    error,
    icon,
    iconPosition = 'left',
    className = '',
    containerClassName = '',
    ...props
}, ref) {
    return (
        <div className={`input-wrapper ${containerClassName}`}>
            {label && <label className="input-label">{label}</label>}
            <div className={`input-container ${icon ? `has-icon icon-${iconPosition}` : ''} ${error ? 'has-error' : ''}`}>
                {icon && iconPosition === 'left' && (
                    <span className="input-icon left">{icon}</span>
                )}
                <input
                    ref={ref}
                    className={`input-component ${className}`}
                    {...props}
                />
                {icon && iconPosition === 'right' && (
                    <span className="input-icon right">{icon}</span>
                )}
            </div>
            {error && <span className="input-error">{error}</span>}
        </div>
    );
});

export default Input;

export const Textarea = forwardRef(function Textarea({
    label,
    error,
    className = '',
    containerClassName = '',
    ...props
}, ref) {
    return (
        <div className={`input-wrapper ${containerClassName}`}>
            {label && <label className="input-label">{label}</label>}
            <textarea
                ref={ref}
                className={`input-component textarea-component ${error ? 'has-error' : ''} ${className}`}
                {...props}
            />
            {error && <span className="input-error">{error}</span>}
        </div>
    );
});
