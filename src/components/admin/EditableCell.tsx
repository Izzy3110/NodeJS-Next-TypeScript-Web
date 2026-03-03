"use client";
import React, { useState, useEffect, useRef } from 'react';

interface EditableCellProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    minHeight?: string;
    className?: string;
    readonly?: boolean;
    singleLine?: boolean;
    style?: React.CSSProperties;
}

export default function EditableCell({ 
    value, 
    onChange, 
    placeholder, 
    minHeight = '40px', 
    className = '', 
    readonly = false, 
    singleLine = false,
    style 
}: EditableCellProps) {
    const contentRef = useRef<HTMLDivElement>(null);
    const [isFocused, setIsFocused] = useState(false);

    // Sync external value changes to innerHTML when not focused
    useEffect(() => {
        if (contentRef.current && !isFocused) {
            // Only update if fundamentally different to avoid caret jumps (though !isFocused should prevent that)
             if (contentRef.current.innerHTML !== (value || '')) {
                contentRef.current.innerHTML = value || '';
            }
        }
    }, [value, isFocused]);

    const handleBlur = () => {
        setIsFocused(false);
        if (contentRef.current) {
            const html = contentRef.current.innerHTML;
            if (html !== value) {
                onChange(html);
            }
        }
    };

    const handleFocus = () => {
        setIsFocused(true);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            if (e.ctrlKey || e.metaKey) {
                // Ctrl+Enter: Add newline
                e.preventDefault();
                // Inserting a newline in contentEditable
                document.execCommand('insertLineBreak');
            } else {
                // Regular Enter: Save/Blur
                e.preventDefault();
                contentRef.current?.blur();
            }
        }
    };

    return (
        <div
            ref={contentRef}
            contentEditable={!readonly}
            onBlur={!readonly ? handleBlur : undefined}
            onFocus={!readonly ? handleFocus : undefined}
            onKeyDown={!readonly ? handleKeyDown : undefined}
            className={`editable-cell ${readonly ? 'readonly' : ''} ${className}`}
            style={{ 
                minHeight, 
                backgroundColor: readonly ? '#edf2f7' : undefined,
                color: readonly ? '#718096' : undefined,
                cursor: readonly ? 'default' : 'text',
                userSelect: 'text', // Allow selection even if readonly
                ...style
            }}
            dangerouslySetInnerHTML={{ __html: value || '' }}
        />
    );
}
