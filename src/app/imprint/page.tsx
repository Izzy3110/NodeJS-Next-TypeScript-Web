'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ImprintPage() {
    const router = useRouter();

    const handleBack = () => {
        router.back();
    };

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                handleBack();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [router]);

    return (
        <div className="container" style={{ marginTop: '100px' }}>
            <style jsx global>{`
                .imprint-page-content {
                    font-family: 'Inter', sans-serif;
                    color: var(--text-light);
                    max-width: 900px;
                    margin: 0 auto;
                }

                .imprint-page-content h1 {
                    font-family: var(--font-heading);
                    font-size: 2.5rem;
                    color: var(--secondary-color);
                    text-align: center;
                    margin-bottom: 2rem;
                    border-bottom: 2px solid #333;
                    padding-bottom: 0.5rem;
                }

                .imprint-page-content p {
                    margin: 0 0 20px;
                }

                .imprint-page-content strong {
                    font-weight: bold;
                    color: var(--secondary-color);
                }

                .imprint-page-content .copyright {
                    font-size: 0.9rem;
                    color: var(--text-muted);
                    display: block;
                    margin-top: 40px;
                    text-align: center;
                }
            `}</style>

            <div className="imprint-page-content">
                <div data-exp="simple2" className="outputVersion1 template_DE templated">

                    <div className="firstHeader">
                        <span className="content">Impressum für Website</span>
                    </div>
                    
                    <h1>IMPRESSUM</h1>
                    
                    <p style={{ textAlign: 'left' }}>
                        Dieses Impressum gilt für alle Angebote unter der Domain pizzaservice-pfullendorf.de.
                    </p>
                    
                    <p style={{ textAlign: 'left' }}>
                        <strong>Angaben gemäß § 5 DDG</strong>
                    </p>
                    <p style={{ textAlign: 'left' }}>
                        TakeOff Restaurant<br />
                        Gurvinder Kaur Ghotra<br />
                        Aftholderberger Str. 5<br />
                        88630 Pfullendorf<br />
                    </p>
                    
                    <p style={{ textAlign: 'left' }}>
                        <strong>Vertretungsberechtigte Personen</strong>
                    </p>
                    <p style={{ textAlign: 'left' }}>
                        Gurvinder Kaur Ghotra, Inhaberin
                    </p>
                    
                    <p style={{ textAlign: 'left' }}>
                        <strong>Gültigkeit</strong>
                    </p>
                    <p style={{ textAlign: 'left' }}>
                        Dieses Impressum gilt ab dem 23. Februar 2026.
                    </p>

                    <span className="copyright">©2002-2026 RECHTSDOKUMENTE (Sequiter Inc.)</span>
                </div>
            </div>
        </div>
    );
}
