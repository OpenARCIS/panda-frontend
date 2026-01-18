import './Loader.css';

export default function Loader({
    size = 'md',
    className = '',
    text,
    fullScreen = false,
}) {
    const sizeClass = {
        sm: 'loader-sm',
        md: 'loader-md',
        lg: 'loader-lg',
    }[size];

    if (fullScreen) {
        return (
            <div className="loader-fullscreen">
                <div className="loader-content">
                    <div className={`loader-spinner ${sizeClass} ${className}`} />
                    {text && <p className="loader-text">{text}</p>}
                </div>
            </div>
        );
    }

    return (
        <div className={`loader-inline ${className}`}>
            <div className={`loader-spinner ${sizeClass}`} />
            {text && <span className="loader-text-inline">{text}</span>}
        </div>
    );
}

export function Skeleton({
    width,
    height = 20,
    radius = 'md',
    className = '',
}) {
    const radiusValue = {
        sm: 'var(--radius-sm)',
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
        full: 'var(--radius-full)',
    }[radius] || radius;

    return (
        <div
            className={`skeleton-component ${className}`}
            style={{
                width: typeof width === 'number' ? `${width}px` : width,
                height: typeof height === 'number' ? `${height}px` : height,
                borderRadius: radiusValue,
            }}
        />
    );
}
