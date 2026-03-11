"use client";
import React, { useState, useEffect } from 'react';

export default function PageLoader() {
    const [isVisible, setIsVisible] = useState(true);
    const [shouldRender, setShouldRender] = useState(true);

    useEffect(() => {
        // We wait for the load event or a small timeout to ensure styles are applied
        const handleLoad = () => {
            setIsVisible(false);
            // Restore scrolling on both levels
            document.documentElement.style.overflow = 'auto';
            document.body.style.overflow = 'auto';
            setTimeout(() => setShouldRender(false), 500); 
        };

        if (document.readyState === 'complete') {
            handleLoad();
        } else {
            window.addEventListener('load', handleLoad);
        }

        // Safety timeout in case load event fails or takes too long
        const timeout = setTimeout(handleLoad, 3000);

        return () => {
            window.removeEventListener('load', handleLoad);
            clearTimeout(timeout);
        };
    }, []);

    if (!shouldRender) return null;

    return (
        <div className={`page-loader-overlay ${isVisible ? 'visible' : 'hidden'}`}>
            <div className="loader-content">
                <h1 className="loader-logo">TakeOff Restaurant</h1>
                <div className="loader-spinner"></div>
                <p className="loader-text">Loading deliciousness...</p>
            </div>
        </div>
    );
}
