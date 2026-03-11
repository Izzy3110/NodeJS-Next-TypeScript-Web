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
    const [email, setEmail] = useState('');
    const [address, setAddress] = useState('');
    const [isConfirmed, setIsConfirmed] = useState(false);
    
    const { t } = useLanguage();

    // Reset step when cart opens/closes
    useEffect(() => {
        if (!isCartOpen) {
            setStep('cart');
            setEmail('');
            setAddress('');
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
        if (!email.trim() || !address.trim() || !email.includes('@')) {
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

        const orderData = {
            email: email.trim(),
            address: address.trim(),
            items: cart.map(item => ({ 
                itemId: item.id, 
                name: item.name, 
                quantity: item.quantity, 
                price: item.price 
            }))
        };

        try {
            const res = await fetch('/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(orderData)
            });

            if (res.ok) {
                alert(t('cart_order_success') + ' ' + email + '!');
                clearCart();
                setEmail('');
                setAddress('');
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
                                <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: 'bold' }}>{t('cart_address_label')}</label>
                                <textarea 
                                    placeholder="Ihre Adresse..." 
                                    value={address}
                                    onChange={(e) => setAddress(e.target.value)}
                                    rows={3}
                                    style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid var(--border-color)', resize: 'vertical' }}
                                />
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
                                disabled={!isConfirmed || !email || !address}
                            >
                                {t('cart_order_now')}
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
