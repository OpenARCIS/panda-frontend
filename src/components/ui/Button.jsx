import { forwardRef } from 'react';
import './Button.css';

const Button = forwardRef(function Button({
    children,
    variant = 'primary',
    size = 'md',
    icon,
    iconPosition = 'left',
    loading = false,
    disabled = false,
    fullWidth = false,
    className = '',
    ...props
}, ref) {
    const classes = [
        'btn-component',
        `btn-${variant}`,
        `btn-${size}`,
        fullWidth && 'btn-full',
        loading && 'btn-loading',
        icon && !children && 'btn-icon-only',
        className,
    ].filter(Boolean).join(' ');

    return (
        <button
            ref={ref}
            className={classes}
            disabled={disabled || loading}
            {...props}
        >
            {loading && (
                <span className="btn-loader">
                    <span className="loader loader-sm" />
                </span>
            )}
            {!loading && icon && iconPosition === 'left' && (
                <span className="btn-icon">{icon}</span>
            )}
            {children && <span className="btn-text">{children}</span>}
            {!loading && icon && iconPosition === 'right' && (
                <span className="btn-icon">{icon}</span>
            )}
        </button>
    );
});

export default Button;
