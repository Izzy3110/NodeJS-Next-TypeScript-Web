"use client";
import React, { useState, useEffect } from 'react';
import { useCart } from '@/context/CartContext';
import { useLanguage } from '@/context/LanguageContext';
import CartItem from './CartItem';

export default function Cart() {
    const { cart, removeFromCart, removeAllFromCart, cartTotal, isCartOpen, toggleCart, clearCart } = useCart();
    
    // Two-step checkout states
    const [step, setStep] = useState<'cart' | 'finalize'>('cart');
    
    // Finalize form states
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [addressLine1, setAddressLine1] = useState('');
    const [addressPLZ, setAddressPLZ] = useState('');
    const [addressCity, setAddressCity] = useState('');
    const [isConfirmed, setIsConfirmed] = useState(false);
    
    const { t, language } = useLanguage();

    // Reset step when cart opens/closes
    useEffect(() => {
        if (!isCartOpen) {
            setStep('cart');
            setName('');
            setEmail('');
            setPhone('');
            setAddressLine1('');
            setAddressPLZ('');
            setAddressCity('');
            setIsConfirmed(false);
        }
    }, [isCartOpen]);

    const handleProceedToFinalize = () => {
        if (cart.length === 0) {
            alert(t('cart_empty'));
            return;
        }
        setStep('finalize');
    };

    const handleCheckout = async () => {
        if (!name.trim() || !email.trim() || !phone.trim() || !addressLine1.trim() || !addressPLZ.trim() || !addressCity.trim() || !email.includes('@')) {
            alert(t('cart_finalize_alert'));
            return;
        }
        if (!isConfirmed) {
            alert(t('cart_confirm_alert'));
            return;
        }
        if (cart.length === 0) {
            alert(t('cart_empty'));
            return;
        }

        // The API /api/submit_order expects a flat array of itemIds (duplicates for quantity)
        const itemIds = cart.flatMap(item => Array(item.quantity).fill(item.id));

        const orderData = {
            itemIds,
            lang: language,
            client: {
                name: name.trim(),
                email: email.trim(),
                tel: [phone.trim()],
                address: {
                    client_address_line_1: addressLine1.trim(),
                    client_address_plz: addressPLZ.trim(),
                    client_address_city: addressCity.trim()
                }
            }
        };

        try {
            const res = await fetch('/api/submit_order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(orderData)
            });

            if (res.ok) {
                alert(t('cart_order_success') + ' ' + name + '!');
                clearCart();
                setName('');
                setEmail('');
                setPhone('');
                setAddressLine1('');
                setAddressPLZ('');
                setAddressCity('');
                setIsConfirmed(false);
                setStep('cart');
                toggleCart();
            } else {
                alert(t('cart_order_fail'));
            }
        } catch (err) {
            console.error('Error placing order:', err);
            alert(t('cart_error'));
        }
    };

    return (
        <>
            <div 
                className={`cart-overlay ${isCartOpen ? 'open' : ''}`} 
                onClick={toggleCart}
            />
            <div className={`cart-modal ${isCartOpen ? 'open' : ''}`} id="cart-modal">
            <div className="cart-header">
                <h3>{step === 'cart' ? t('cart_title') : t('cart_finalize_title')}</h3>
                <button className="close-cart" onClick={toggleCart}>&times;</button>
            </div>
            
            {step === 'cart' ? (
                <>
                    <div className="cart-items">
                        {cart.length === 0 ? (
                            <p style={{ color: 'var(--text-muted)', textAlign: 'center', marginTop: '2rem' }}>
                                {t('cart_empty')}
                            </p>
                        ) : (
                            cart.map(item => (
                                <CartItem 
                                    key={item.id} 
                                    item={item} 
                                    onRemoveOne={removeFromCart} 
                                    onRemoveAll={removeAllFromCart}
                                    t={t}
                                />
                            ))
                        )}
                    </div>

                    <div className="cart-footer">
                        <div className="cart-total">{t('cart_total')}: €<span>{cartTotal.toFixed(2)}</span></div>
                        <div style={{ marginTop: '1rem' }}>
                            <button 
                                className="btn" 
                                style={{ width: '100%', marginBottom: '10px' }}
                                onClick={handleProceedToFinalize}
                                disabled={cart.length === 0}
                            >
                                {t('cart_proceed')}
                            </button>
                        </div>
                    </div>
                </>
            ) : (
                <>
                    <div className="cart-items" style={{ padding: '0 20px' }}>
                        <h4 style={{ marginBottom: '15px' }}>{t('cart_summary_title')}</h4>
                        <ul style={{ listStyleType: 'none', padding: 0, marginBottom: '20px' }}>
                            {cart.map(item => (
                                <li key={item.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px' }}>
                                    <span>{item.quantity}x {item.name}</span>
                                    <span>€{(item.price * item.quantity).toFixed(2)}</span>
                                </li>
                            ))}
                        </ul>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: 'bold' }}>{t('cart_name_label')}</label>
                                <input 
                                    type="text" 
                                    placeholder={t('cart_name_placeholder')} 
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid var(--border-color)' }}
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: 'bold' }}>{t('cart_phone_label')}</label>
                                <input 
                                    type="tel" 
                                    placeholder="+49 123 4567890" 
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid var(--border-color)' }}
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: 'bold' }}>{t('cart_email_label')}</label>
                                <input 
                                    type="email" 
                                    placeholder="mail@example.com" 
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid var(--border-color)' }}
                                />
                            </div>
                            
                            <div>
                                <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: 'bold' }}>{t('cart_street_label')}</label>
                                <input 
                                    type="text" 
                                    placeholder="Musterstr. 12" 
                                    value={addressLine1}
                                    onChange={(e) => setAddressLine1(e.target.value)}
                                    style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid var(--border-color)' }}
                                />
                            </div>

                            <div style={{ display: 'flex', gap: '10px' }}>
                                <div style={{ flex: 1 }}>
                                    <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: 'bold' }}>{t('cart_plz_label')}</label>
                                    <input 
                                        type="text" 
                                        placeholder="12345" 
                                        value={addressPLZ}
                                        onChange={(e) => setAddressPLZ(e.target.value)}
                                        style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid var(--border-color)' }}
                                    />
                                </div>
                                <div style={{ flex: 2 }}>
                                    <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: 'bold' }}>{t('cart_city_label')}</label>
                                    <input 
                                        type="text" 
                                        placeholder="Pfullendorf" 
                                        value={addressCity}
                                        onChange={(e) => setAddressCity(e.target.value)}
                                        style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid var(--border-color)' }}
                                    />
                                </div>
                            </div>

                            <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '14px', cursor: 'pointer', marginTop: '10px' }}>
                                <input 
                                    type="checkbox" 
                                    checked={isConfirmed}
                                    onChange={(e) => setIsConfirmed(e.target.checked)}
                                    style={{ marginTop: '3px' }}
                                />
                                {t('cart_confirm_label')}
                            </label>
                        </div>
                    </div>

                    <div className="cart-footer" style={{ marginTop: 'auto' }}>
                        <div className="cart-total">{t('cart_total')}: €<span>{cartTotal.toFixed(2)}</span></div>
                        <div style={{ marginTop: '1rem', display: 'flex', gap: '10px' }}>
                            <button 
                                className="btn" 
                                style={{ flex: 1, backgroundColor: 'var(--text-muted)' }}
                                onClick={() => setStep('cart')}
                            >
                                {t('cart_back')}
                            </button>
                            <button 
                                className="btn" 
                                style={{ flex: 2, backgroundColor: 'var(--primary-color)' }}
                                onClick={handleCheckout}
                                disabled={!isConfirmed || !email || !addressLine1 || !name || !addressPLZ || !addressCity || !phone}
                            >
                                {t('cart_order_now')}
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
        </>
    );
}
