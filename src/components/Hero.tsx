"use client";
import React from 'react';
import { useLanguage } from '@/context/LanguageContext';

export default function Hero() {
    const { t } = useLanguage();
    return (
        <section className="hero">
            <div className="hero-content">
                <h2>{t('hero_title')}</h2>
                <p>{t('hero_subtitle')}</p>
                <a href="#menu" className="btn">{t('hero_cta')}</a>
            </div>
        </section>
    );
}
