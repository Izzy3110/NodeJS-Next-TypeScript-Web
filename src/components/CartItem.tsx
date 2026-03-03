"use client";

import React from 'react';
import { CartItem as CartItemType } from '@/context/CartContext';
import { TranslationKey } from '@/data/translations';
import { preprocess_html } from '@/utils/stringUtils';

interface CartItemProps {
    item: CartItemType;
    onRemoveOne: (id: number) => void;
    onRemoveAll: (id: number) => void;
    t: (key: TranslationKey) => string;
}

export default function CartItem({ item, onRemoveOne, onRemoveAll, t }: CartItemProps) {
    return (
        <div className="cart-item-container">
            <div className="removal-panel">
                {item.quantity > 1 && (
                    <button 
                        className="remove-one-btn"
                        onClick={() => onRemoveOne(item.id)}
                    >
                        {t('cart_remove')}
                    </button>
                )}
                <button 
                    className="remove-all-btn"
                    onClick={() => onRemoveAll(item.id)}
                    title={t('cart_remove_all')}
                >
                    <span className="hint">{t('cart_remove_all')}</span>
                    &times;
                </button>
            </div>
            
            <div className="item-details">
                <span className="item-count">{item.quantity}x</span>
                <span className="item-name" dangerouslySetInnerHTML={{ __html: preprocess_html(item.name) }}></span>
                <span className="item-price">
                    €{(Number(item.price) * item.quantity).toFixed(2)}
                </span>
            </div>
        </div>
    );
}
