import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext';

export default function OpeningHours() {
    const { t } = useLanguage();
    const [isOpenDropdown, setIsOpenDropdown] = useState(false);
    const [isOpenNow, setIsOpenNow] = useState(false);

    useEffect(() => {
        const checkStatus = () => {
            const now = new Date();
            const day = now.getDay(); // 0 = Sun, 1 = Mon, ...
            const hour = now.getHours();
            const minutes = now.getMinutes();
            const time = hour + minutes / 60;

            let open = false;

            if (day === 2) { // Tuesday
                open = false;
            } else if (day === 0 || day === 6) { // Sat & Sun
                open = time >= 10 && time < 23;
            } else { // Mon, Wed, Thu, Fri
                const morningOpen = time >= 11 && time < 14;
                const eveningOpen = time >= 17 && time < 23;
                open = morningOpen || eveningOpen;
            }

            setIsOpenNow(open);
        };

        checkStatus();
        const interval = setInterval(checkStatus, 60000); // Check every minute
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="opening-hours-container" 
             onMouseEnter={() => setIsOpenDropdown(true)}
             onMouseLeave={() => setIsOpenDropdown(false)}
             style={{ position: 'relative' }}>
            <button className="nav-item" style={{ background: 'none', border: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ 
                    fontSize: '0.85rem', 
                    fontWeight: '700', 
                    color: isOpenNow ? '#4caf50' : '#f44336', 
                    marginRight: '5px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                }}>
                    <span style={{ 
                        width: '8px', 
                        height: '8px', 
                        borderRadius: '50%', 
                        backgroundColor: isOpenNow ? '#4caf50' : '#f44336',
                        boxShadow: `0 0 10px ${isOpenNow ? '#4caf50' : '#f44336'}`
                    }}></span>
                    {isOpenNow ? t('hours_open_now') : t('hours_closed_now')}
                </span>
                <i className="fa-solid fa-clock"></i>
                <span className="hours-label desk-only">{t('hours_title')}</span>
            </button>
            
            {isOpenDropdown && (
                <div className="hours-dropdown" style={{
                    position: 'absolute',
                    top: '100%',
                    right: 0,
                    backgroundColor: 'var(--card-bg)',
                    padding: '1.5rem',
                    borderRadius: '8px',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                    border: '1px solid #333',
                    zIndex: 1001,
                    minWidth: '280px',
                    marginTop: '0.5rem',
                    backdropFilter: 'blur(10px)'
                }}>
                    <h4 style={{ color: 'var(--secondary-color)', marginBottom: '1rem', borderBottom: '1px solid #333', paddingBottom: '0.5rem' }}>{t('hours_title')}</h4>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, color: 'var(--text-light)', fontSize: '0.9rem', lineHeight: '1.8' }}>
                        <li>{t('hours_mon')}</li>
                        <li>{t('hours_tue')}</li>
                        <li>{t('hours_wed_fri')}</li>
                        <li>{t('hours_sat_sun')}</li>
                    </ul>
                </div>
            )}
        </div>
    );
}
