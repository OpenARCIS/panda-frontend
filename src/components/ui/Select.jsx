import { forwardRef } from 'react';
import { ChevronDown } from 'lucide-react';
import './Select.css';

const Select = forwardRef(function Select({
    label,
    error,
    options = [],
    placeholder = 'Select an option',
    className = '',
    containerClassName = '',
    ...props
}, ref) {
    return (
        <div className={`select-wrapper ${containerClassName}`}>
            {label && <label className="select-label">{label}</label>}
            <div className={`select-container ${error ? 'has-error' : ''}`}>
                <select
                    ref={ref}
                    className={`select-component ${className}`}
                    {...props}
                >
                    {placeholder && (
                        <option value="" disabled>
                            {placeholder}
                        </option>
                    )}
                    {options.map((option) => (
                        <option
                            key={option.value}
                            value={option.value}
                            disabled={option.disabled}
                        >
                            {option.label}
                        </option>
                    ))}
                </select>
                <ChevronDown className="select-arrow" size={16} />
            </div>
            {error && <span className="select-error">{error}</span>}
        </div>
    );
});

export default Select;
