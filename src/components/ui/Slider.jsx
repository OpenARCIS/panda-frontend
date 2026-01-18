import { forwardRef } from 'react';
import './Slider.css';

const Slider = forwardRef(function Slider({
    label,
    value,
    min = 0,
    max = 100,
    step = 1,
    showValue = true,
    valueFormatter = (v) => v,
    className = '',
    containerClassName = '',
    onChange,
    ...props
}, ref) {
    const percentage = ((value - min) / (max - min)) * 100;

    return (
        <div className={`slider-wrapper ${containerClassName}`}>
            {(label || showValue) && (
                <div className="slider-header">
                    {label && <label className="slider-label">{label}</label>}
                    {showValue && (
                        <span className="slider-value">{valueFormatter(value)}</span>
                    )}
                </div>
            )}
            <div className="slider-container">
                <input
                    ref={ref}
                    type="range"
                    className={`slider-component ${className}`}
                    value={value}
                    min={min}
                    max={max}
                    step={step}
                    onChange={onChange}
                    style={{ '--slider-progress': `${percentage}%` }}
                    {...props}
                />
            </div>
        </div>
    );
});

export default Slider;
