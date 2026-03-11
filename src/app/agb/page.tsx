export default function AGB() {
    return (
        <div className="container" style={{ marginTop: '100px', paddingBottom: '60px' }}>
            <h1 className="section-title">Terms of Service (AGB)</h1>
            <div className="agb-content" style={{ color: 'var(--text-light)', maxWidth: '800px', margin: '0 auto', lineHeight: '1.8' }}>
                <p><strong style={{ color: 'var(--secondary-color)' }}>1. General</strong></p>
                <p>These are the General Terms and Conditions (AGB) for TakeOff Restaurant.</p>
                <br />
                <p><strong style={{ color: 'var(--secondary-color)' }}>2. Orders</strong></p>
                <p>By placing an order, you agree to purchase the selected items at the listed price.</p>
                <br />
                <p><strong style={{ color: 'var(--secondary-color)' }}>3. Delivery</strong></p>
                <p>We aim to deliver within 45-60 minutes. Delays may occur during peak times.</p>
                <br />
                <p><strong style={{ color: 'var(--secondary-color)' }}>4. Payment</strong></p>
                <p>Payment is due upon delivery or pickup.</p>
            </div>
        </div>
    );
}
