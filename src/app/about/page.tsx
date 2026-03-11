"use client";
import React from 'react';
import { useLanguage } from '@/context/LanguageContext';

export default function AboutPage() {
    const { t } = useLanguage();

    return (
        <div className="container" id="about" style={{ marginTop: '100px' }}>
            <h1 className="section-title">{t('nav_about')}</h1>
            
            <div style={{ color: 'var(--text-light)', lineHeight: '1.8', fontSize: '1.1rem', maxWidth: '800px', margin: '0 auto' }}>
                <p>
                    Willkommen im <strong>TakeOff Restaurant</strong>, Ihrer ersten Adresse für kulinarische Vielfalt in Pfullendorf. 
                    Seit vielen Jahren verwöhnen wir unsere Gäste mit einer einzigartigen Mischung aus traditioneller italienischer Pizza, 
                    würzig-indischen Spezialitäten und aromatischen thailändischen Gerichten.
                </p>
                
                <br />
                
                <p>
                    Unsere Leidenschaft ist es, hochwertige Zutaten mit authentischen Rezepten zu kombinieren, 
                    um Ihnen ein unvergessliches Geschmackserlebnis zu bieten – egal ob Sie bei uns im Restaurant speisen, 
                    Ihre Bestellung abholen oder unseren bequemen Lieferservice nutzen.
                </p>

                <br />

                <p>
                    Besuchen Sie uns am Flugplatz Pfullendorf und genießen Sie die besondere Atmosphäre. 
                    Unser Team freut sich darauf, Sie begrüßen zu dürfen!
                </p>
            </div>
        </div>
    );
}
