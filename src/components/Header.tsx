"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';

import { useTheme } from '@/context/ThemeContext';
import { useLanguage } from '@/context/LanguageContext';
import OpeningHours from './OpeningHours';

function Header() {
    const {cartCount, toggleCart} = useCart();
    const {theme, toggleTheme} = useTheme();
    const {language, setLanguage, t} = useLanguage();

    const [isPulsating, setIsPulsating] = useState(false);
    const [prevCount, setPrevCount] = useState(cartCount);

    useEffect(() => {
        if (cartCount > prevCount) {
            setIsPulsating(true);
            const timer = setTimeout(() => setIsPulsating(false), 400);
            return () => clearTimeout(timer);
        }
        setPrevCount(cartCount);
    }, [cartCount, prevCount]);

    const toggleLanguage = () => {
        setLanguage(language === 'en' ? 'de' : 'en');
    };

    return (
        <header>
            <Link href="/" className="logo">
                <img src="/logo.png" alt="TakeOff Restaurant" className="logo-img"/>
            </Link>

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

                <div className="nav-controls">
                    <a href="tel:075524000088" className="nav-item phone-link">
                        <i className="fa-solid fa-phone phone-icon"></i>
                        <span className="desk-only">07552 4000088</span>
                    </a>
                    <OpeningHours/>
                    {/* Theme Toggle hidden for now */}
                    {/* <button onClick={toggleTheme} className="nav-item" style={{ background: 'none', border: 'none', fontSize: '1.2rem', fontFamily: 'inherit', cursor: 'pointer', marginRight: '1rem' }} title="Toggle Theme">
                        {theme === 'dark' ? <i className="fa-solid fa-sun"></i> : <i className="fa-solid fa-moon"></i>}
                    </button> */}
                    <div className="nav-item lang-switcher">
                        <span
                            onClick={() => setLanguage('de')}
                            className={`lang-btn ${language === 'de' ? 'lang-active' : 'lang-inactive'}`}
                        >
                            DE
                        </span>
                        <span>|</span>
                        <span
                            onClick={() => setLanguage('en')}
                            className={`lang-btn ${language === 'en' ? 'lang-active' : 'lang-inactive'}`}
                        >
                            EN
                        </span>
                    </div>
                    <button
                        onClick={toggleCart}
                        className={`nav-item cart-btn ${isPulsating ? 'pulsate' : ''}`}
                    >
                        <i className="fa-solid fa-cart-shopping"></i>
                        {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
                    </button>
                </div>
            </nav>
        </header>
    );
}

export default Header
