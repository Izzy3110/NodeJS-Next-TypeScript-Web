import React from 'react';
import Link from 'next/link';

export default function AGB() {
    return (
        <div className="container" style={{ paddingTop: '120px', paddingBottom: '60px' }}>
            <h1 className="section-title">Terms of Service (AGB)</h1>
            <div className="agb-content" style={{ color: 'var(--text-light)', maxWidth: '800px', margin: '0 auto' }}>
                <p><strong>1. General</strong></p>
                <p>These are the General Terms and Conditions (AGB) for Slice & Savor.</p>
                <br />
                <p><strong>2. Orders</strong></p>
                <p>By placing an order, you agree to purchase the selected items at the listed price.</p>
                <br />
                <p><strong>3. Delivery</strong></p>
                <p>We aim to deliver within 45-60 minutes. Delays may occur during peak times.</p>
                <br />
                <p><strong>4. Payment</strong></p>
                <p>Payment is due upon delivery or pickup.</p>
                <br />
                <p><Link href="/" className="btn">Back to Home</Link></p>
            </div>
        </div>
    );
}
