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
        <div className="imprint-container">
            <style jsx global>{`
                .imprint-container {
                    padding: 2.5cm 1.5cm 2cm;
                    font-family: 'minion-pro', serif;
                    font-size: 12pt;
                    line-height: 15pt;
                    color: #000;
                    background: #fff;
                    max-width: 900px;
                    margin: 20px auto;
                    box-shadow: 0 0 10px rgba(0,0,0,0.1);
                    position: relative;
                }

                .back-button {
                    position: absolute;
                    top: 20px;
                    left: 20px;
                    padding: 8px 16px;
                    background: #333;
                    color: #fff;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                    font-family: 'myriad-pro', sans-serif;
                    font-size: 10pt;
                    transition: background 0.2s;
                    z-index: 10;
                }

                .back-button:hover {
                    background: #111;
                }

                .imprint-container h1 {
                    font-family: 'myriad-pro', sans-serif;
                    font-size: 18pt;
                    color: #000;
                    font-weight: 700;
                    text-align: center;
                    line-height: normal;
                    margin: 50px 0;
                }

                .imprint-container p {
                    margin: 0 0 20px;
                }

                .imprint-container strong {
                    font-weight: bold;
                }

                /* Header/Footer styles from original HTML */
                .imprint-container .header, 
                .imprint-container .footer, 
                .imprint-container .firstHeader, 
                .imprint-container .firstFooter {
                    font-family: 'myriad-pro', sans-serif;
                    font-size: 10pt;
                    color: #bcbec0;
                    position: relative;
                    margin-bottom: 20px;
                }

                .imprint-container .footer, 
                .imprint-container .firstFooter {
                    margin-top: 50px;
                    border-top: 1px solid #bcbec0;
                    padding-top: 10px;
                }

                .imprint-container .pageNumbers {
                    display: none; /* Hide page numbers in web view */
                }

                .imprint-container .copyright {
                    font-size: 9pt;
                    color: #bcbec0;
                    display: block;
                    margin-top: 20px;
                }

                @media print {
                    .imprint-container {
                        box-shadow: none;
                        margin: 0;
                        padding: 0;
                    }
                    .back-button {
                        display: none;
                    }
                }
            `}</style>

            <button className="back-button" onClick={handleBack} title="Go Back (Esc)">
                &lsaquo; Back
            </button>

            <div className="format-html">
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
