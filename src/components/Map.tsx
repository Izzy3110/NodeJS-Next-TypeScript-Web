"use client";
import React from 'react';
import { useLanguage } from '@/context/LanguageContext';

export default function Map() {
    const { t } = useLanguage();
    
    // Coordinates: 47.9122633, 9.2511005 (Flugplatzgaststätte)
    const lat = 47.9122633;
    const lng = 9.2511005;
    const zoom = 16;
    
    // Google Maps Embed URL provided by user
    const mapUrl = `https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2674.2467273587904!2d${lng}!3d${lat}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x479a444c5aea62f1%3A0xd7362f2e57f7bb1d!2sFlugplatzgastst%C3%A4tte!5e0!3m2!1sde!2sde!4v1772575634464!5m2!1sde!2sde`;

    return (
        <section className="container-fluid" id="location">
            <h2 className="section-title">{t('section_map')}</h2>
            <div className="map-wrapper">
                <iframe
                    title="Google Maps Location"
                    src={mapUrl}
                    width="100%"
                    height="450"
                    style={{ border: 0, borderRadius: '12px' }}
                    allowFullScreen={true}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                ></iframe>
            </div>
        </section>
    );
}
