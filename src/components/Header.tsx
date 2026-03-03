"use client";
import React from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';

import { useTheme } from '@/context/ThemeContext';
import { useLanguage } from '@/context/LanguageContext';

export default function Header() {
    const { cartCount, toggleCart } = useCart();
    const { theme, toggleTheme } = useTheme();
    const { language, setLanguage, t } = useLanguage();

    const toggleLanguage = () => {
        setLanguage(language === 'en' ? 'de' : 'en');
    };

    return (
        <header>
            <div className="logo">TakeOff Restaurant</div>
            <nav className="nav-links">
                <button onClick={toggleTheme} className="nav-item" style={{ background: 'none', border: 'none', fontSize: '1.2rem', fontFamily: 'inherit', cursor: 'pointer', marginRight: '1rem' }} title="Toggle Theme">
                    {theme === 'dark' ? <i className="fa-solid fa-sun"></i> : <i className="fa-solid fa-moon"></i>}
                </button>
                <div className="nav-item" style={{ marginRight: '1rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <span 
                        onClick={() => setLanguage('de')} 
                        style={{ 
                            cursor: 'pointer', 
                            fontWeight: language === 'de' ? 'bold' : 'normal',
                            opacity: language === 'de' ? 1 : 0.7,
                            textDecoration: language === 'de' ? 'underline' : 'none'
                        }}
                    >
                        DE
                    </span>
                    <span>|</span>
                    <span 
                        onClick={() => setLanguage('en')} 
                        style={{ 
                            cursor: 'pointer', 
                            fontWeight: language === 'en' ? 'bold' : 'normal',
                            opacity: language === 'en' ? 1 : 0.7,
                            textDecoration: language === 'en' ? 'underline' : 'none'
                        }}
                    >
                        EN
                    </span>
                </div>
                <button 
                    onClick={toggleCart} 
                    className="nav-item cart-btn" 
                    style={{ background: 'none', border: 'none', fontSize: '1.8rem', fontFamily: 'inherit', position: 'relative' }}
                >
                    <i className="fa-solid fa-cart-shopping"></i>
                    {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
                </button>
            </nav>
        </header>
    );
}
