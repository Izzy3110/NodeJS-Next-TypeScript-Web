"use client";
import React, { useState } from 'react';
import { useCart } from '@/context/CartContext';

import { useLanguage } from '@/context/LanguageContext';
import CartItem from './CartItem';

export default function Cart() {
    const { cart, removeFromCart, removeAllFromCart, cartTotal, isCartOpen, toggleCart, clearCart } = useCart();
    const [customerName, setCustomerName] = useState('');
    const { t } = useLanguage();

    const handleCheckout = async () => {
        if (!customerName.trim()) {
            alert(t('cart_name_alert'));
            return;
        }
        if (cart.length === 0) {
            alert(t('cart_empty'));
            return;


      
        }

        const orderData = {
            customerName: customerName,
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
                alert(t('cart_order_success') + customerName + '!');
                clearCart();
                setCustomerName('');
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
                <h3>{t('cart_title')}</h3>
                <button className="close-cart" onClick={toggleCart}>&times;</button>
            </div>
            
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
                    <input 
                        type="text" 
                        placeholder={t('cart_name_placeholder')} 
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                    />
                    <button 
                        className="btn" 
                        style={{ width: '100%' }}
                        onClick={handleCheckout}
                    >
                        {t('cart_checkout')}
                    </button>
                </div>
            </div>
        </div>
    );
}
