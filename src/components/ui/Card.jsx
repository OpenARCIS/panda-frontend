import './Card.css';

export default function Card({
    children,
    className = '',
    glow = false,
    hover = true,
    padding = 'md',
    ...props
}) {
    const paddingClass = {
        none: 'card-p-none',
        sm: 'card-p-sm',
        md: 'card-p-md',
        lg: 'card-p-lg',
    }[padding];

    return (
        <div
            className={`card-component ${glow ? 'card-glow' : ''} ${hover ? 'card-hover' : ''} ${paddingClass} ${className}`}
            {...props}
        >
            {children}
        </div>
    );
}

export function CardHeader({ children, className = '', action }) {
    return (
        <div className={`card-header-component ${className}`}>
            <div className="card-header-content">{children}</div>
            {action && <div className="card-header-action">{action}</div>}
        </div>
    );
}

export function CardTitle({ children, className = '', subtitle }) {
    return (
        <div className={`card-title-wrapper ${className}`}>
            <h3 className="card-title-component">{children}</h3>
            {subtitle && <p className="card-subtitle-component">{subtitle}</p>}
        </div>
    );
}

export function CardContent({ children, className = '' }) {
    return (
        <div className={`card-content-component ${className}`}>
            {children}
        </div>
    );
}
