"use client";
import React, { useEffect, useState } from 'react';
import { useCart } from '@/context/CartContext';
import { Category, Item } from '@/types';
import { preprocess_html } from '@/utils/stringUtils';

import { useLanguage } from '@/context/LanguageContext';

export default function Menu() {
    const [menuData, setMenuData] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const { addToCart } = useCart();
    const { t } = useLanguage();

    useEffect(() => {
        fetch('/api/menu')
            .then(res => res.json())
            .then(data => {
                setMenuData(data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Failed to load menu", err);
                setLoading(false);
            });
    }, []);

    if (loading) {
        return <div className="container"><div className="loading">Loading menu...</div></div>;
    }

    return (
        <div className="container" id="menu">
            <h2 className="section-title">{t('section_menu')}</h2>
            <div className="menu-grid">
                {menuData.map(category => {
                     if (!category.items || category.items.length === 0) return null;
                     return (
                        <div key={category.id} className="category-section">
                            <h2 className="category-title" dangerouslySetInnerHTML={{ __html: preprocess_html(category.name) }}></h2>
                            {category.description && (
                                <p className="category-desc" dangerouslySetInnerHTML={{ __html: preprocess_html(category.description) }}></p>
                            )}
                            <div className="pizza-grid">
                                {category.items.map(item => (
                                    <div key={item.id} className="pizza-card">
                                        {category.pic_url && (
                                            <img src={category.pic_url} alt={category.name} className="pizza-image" />
                                        )}
                                        <div className="pizza-content">
                                            <h3 className="pizza-title" dangerouslySetInnerHTML={{ __html: preprocess_html(item.name) }}></h3>
                                            {item.description && (
                                                <p className="pizza-desc" dangerouslySetInnerHTML={{ __html: preprocess_html(item.description) }}></p>
                                            )}
                                            <div className="pizza-footer">
                                                <span className="price">
                                                    €{Number(item.price).toFixed(2)}
                                                </span>
                                                <button className="add-btn" onClick={() => addToCart(item)}>{t('add_to_cart')}</button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                     );
                })}
            </div>
        </div>
    );
}
