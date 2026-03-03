import React, { useState, useRef, useEffect } from 'react';

interface CustomSelectProps {
    value: string | number;
    options: { value: string | number; label: string }[];
    onChange: (value: string | number) => void;
    placeholder?: string;
    height?: string;
    width?: string;
}

export default function CustomSelect({ value, options, onChange, placeholder = 'Select...', height = '42px', width = '100%' }: CustomSelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const selectedOption = options.find(opt => String(opt.value) === String(value));

    // Handle clicking outside to close
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleSelect = (val: string | number) => {
        onChange(val);
        setIsOpen(false);
    };

    return (
        <div 
            ref={containerRef}
            style={{ 
                position: 'relative', 
                width, 
                height,
                minWidth: width // Ensure it doesn't shrink
            }}
        >
            {/* Trigger Area - Looks like the button/input */}
            <div 
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    width: '100%',
                    height: '100%',
                    padding: '0 10px',
                    border: '1px solid #e2e8f0',
                    borderRadius: '6px',
                    backgroundColor: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    fontSize: '14px',
                    color: '#2d3748',
                    userSelect: 'none'
                }}
            >
                <div style={{ 
                    whiteSpace: 'nowrap', 
                    overflow: 'hidden', 
                    textOverflow: 'ellipsis',
                    marginRight: '8px'
                }}>
                    {selectedOption ? (
                        <span dangerouslySetInnerHTML={{ __html: selectedOption.label }} />
                    ) : (
                        <span style={{ color: '#a0aec0' }}>{placeholder}</span>
                    )}
                </div>
                {/* Arrow Icon */}
                <div style={{ color: '#cbd5e0', fontSize: '10px' }}>
                    ▼
                </div>
            </div>

            {/* Dropdown Menu */}
            {isOpen && (
                <div style={{
                    position: 'absolute',
                    top: 'calc(100% + 4px)',
                    left: 0,
                    width: '100%',
                    maxHeight: '200px',
                    overflowY: 'auto',
                    backgroundColor: '#fff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '6px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                    zIndex: 1000,
                }}>
                    {options.map((opt) => (
                        <div
                            key={opt.value}
                            onClick={() => handleSelect(opt.value)}
                            style={{
                                padding: '8px 12px',
                                cursor: 'pointer',
                                fontSize: '14px',
                                color: '#2d3748',
                                backgroundColor: String(opt.value) === String(value) ? '#ebf8ff' : 'transparent',
                                borderLeft: String(opt.value) === String(value) ? '3px solid #4a90e2' : '3px solid transparent',
                            }}
                            onMouseEnter={(e) => {
                                if (String(opt.value) !== String(value)) {
                                    e.currentTarget.style.backgroundColor = '#f7fafc';
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (String(opt.value) !== String(value)) {
                                    e.currentTarget.style.backgroundColor = 'transparent';
                                }
                            }}
                        >
                            <span dangerouslySetInnerHTML={{ __html: opt.label }} />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
