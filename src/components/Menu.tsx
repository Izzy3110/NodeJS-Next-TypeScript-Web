"use client";
import React, { useEffect, useState } from 'react';
import { useCart } from '@/context/CartContext';
import { Category, Item } from '@/types';
import { preprocess_html, decode_entities } from '@/utils/stringUtils';

import { useLanguage } from '@/context/LanguageContext';

export default function Menu() {
    const [menuData, setMenuData] = useState<Category[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
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

    const filteredMenuData = menuData.map(category => {
        const filteredItems = category.items?.filter(item => {
            const search = searchTerm.toLowerCase();
            
            // Decode entities before matching to handle cases like &auml; for "ä"
            const nameMatch = decode_entities(item.name).toLowerCase().includes(search);
            const descMatch = decode_entities(item.description || '').toLowerCase().includes(search);
            const zutatenMatch = decode_entities(item.zutaten || '').toLowerCase().includes(search);
            
            return nameMatch || descMatch || zutatenMatch;
        });

        return {
            ...category,
            items: filteredItems
        };
    }).filter(category => category.items && category.items.length > 0);


    if (loading) {
        return <div className="container"><div className="loading">Loading menu...</div></div>;
    }

    return (
        <div className="container-fluid" id="menu">
            <div className="menu-search-container">
                <input 
                    type="text" 
                    className="menu-search-input"
                    placeholder={t('menu_search_placeholder')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <h2 className="section-title">{t('section_menu')}</h2>
            
            <div className="menu-grid">
                {filteredMenuData.length === 0 ? (
                    <div style={{ textAlign: 'center', gridColumn: '1/-1', padding: '2rem', color: 'var(--text-muted)' }}>
                        {t('menu_no_results')}
                    </div>
                ) : (
                    filteredMenuData.map(category => (
                        <div key={category.id} className="category-section">
                            <h2 className="category-title" dangerouslySetInnerHTML={{ __html: preprocess_html(category.name) }}></h2>
                            {category.description && (
                                <p className="category-desc" dangerouslySetInnerHTML={{ __html: preprocess_html(category.description) }}></p>
                            )}
                            <div className="pizza-grid">
                                    {category.items?.map(item => {
                                        // Category 4 = Pizza Normal (use price_s), Category 5 = Pizza Groß (use price_m)
                                        const effectivePrice = item.category_id === 4 ? (item.price_s || 0) : 
                                                             item.category_id === 5 ? (item.price_m || 0) : 
                                                             (item.price || 0);
                                        
                                        return (
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
                                                            €{Number(effectivePrice).toFixed(2)}
                                                        </span>
                                                        <button 
                                                            className="add-btn" 
                                                            onClick={() => addToCart({ ...item, price: effectivePrice })}
                                                        >
                                                            {t('add_to_cart')}
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
