"use client";
import React from 'react';
import Link from 'next/link';

import { useLanguage } from '@/context/LanguageContext';

export default function Footer() {
    const { t } = useLanguage();

    return (
        <footer className="footer">
            <div className="container footer-content">
                <div className="footer-links">
                    <Link href="/imprint" className="footer-link">{t('footer_imprint')}</Link>
                    <span className="separator"> | </span>
                    <Link href="/agb" className="footer-link">{t('footer_agb')}</Link>
                </div>
                <div className="footer-copyright">
                    &copy; {new Date().getFullYear()} {t('footer_copyright')}
                </div>
            </div>
        </footer>
    );
}
