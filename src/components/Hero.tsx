"use client";
import React from 'react';
import Image from 'next/image';
import { useLanguage } from '@/context/LanguageContext';

export default function Hero() {
    const { t } = useLanguage();
    return (
        <section className="hero">
            <div className="hero-content">
                <Image src="/logo.png" alt="TakeOff Restaurant Logo" width={450} height={450} className="hero-logo" priority />
                <h2>{t('hero_title')}</h2>
                <p>{t('hero_subtitle')}</p>
                <a href="#menu" className="btn btn-large">{t('hero_cta')}</a>
            </div>
        </section>
    );
}
