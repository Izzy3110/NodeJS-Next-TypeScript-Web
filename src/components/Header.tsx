"use client";
import React from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';

import { useTheme } from '@/context/ThemeContext';
import { useLanguage } from '@/context/LanguageContext';
import OpeningHours from './OpeningHours';

export default function Header() {
    const { cartCount, toggleCart } = useCart();
    const { theme, toggleTheme } = useTheme();
    const { language, setLanguage, t } = useLanguage();

    const toggleLanguage = () => {
        setLanguage(language === 'en' ? 'de' : 'en');
    };

    return (
        <header>
            <Link href="/" className="logo">TakeOff Restaurant</Link>
            
            <nav className="nav-links">
                <div className="nav-menu">
                    <Link href="/" className="nav-item">
                        {t('nav_home')}
                    </Link>
                    <Link href="/about" className="nav-item">
                        {t('nav_about')}
                    </Link>
                    <Link href="/map" className="nav-item">
                        {t('nav_location')}
                    </Link>
                    <Link href="/imprint" className="nav-item">
                        {t('nav_imprint')}
                    </Link>
                    <Link href="/agb" className="nav-item">
                        {t('nav_agb')}
                    </Link>
                </div>

                <div className="nav-controls" style={{ display: 'flex', alignItems: 'center' }}>
                    <a href="tel:075524000088" className="nav-item phone-link" style={{ 
                        marginRight: '1.2rem', 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '0.6rem',
                        textDecoration: 'none',
                        color: 'white',
                        fontWeight: '700',
                        fontSize: '0.95rem',
                        transition: 'opacity 0.2s ease'
                    }}>
                        <i className="fa-solid fa-phone" style={{ fontSize: '1.1rem' }}></i>
                        <span className="desk-only">07552 4000088</span>
                    </a>
                    <OpeningHours />
                    {/* Theme Toggle hidden for now */}
                    {/* <button onClick={toggleTheme} className="nav-item" style={{ background: 'none', border: 'none', fontSize: '1.2rem', fontFamily: 'inherit', cursor: 'pointer', marginRight: '1rem' }} title="Toggle Theme">
                        {theme === 'dark' ? <i className="fa-solid fa-sun"></i> : <i className="fa-solid fa-moon"></i>}
                    </button> */}
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
                </div>
            </nav>
        </header>
    );
}
