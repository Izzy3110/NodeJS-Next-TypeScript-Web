"use client";
import React, { useEffect, useState } from 'react';
import { useCart } from '@/context/CartContext';
import { Category } from '@/types';
import { preprocess_html, decode_entities } from '@/utils/stringUtils';
import { useLanguage } from '@/context/LanguageContext';
import PizzaMatrix from './PizzaMatrix';
import { useTheme } from '@/context/ThemeContext';
import { TextShadowOrNot } from '@/utils/styleUtils';

export default function Menu() {
    const [menuData, setMenuData] = useState<Category[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const { addToCart } = useCart();
    const { t } = useLanguage();
    const { designSettings } = useTheme();

    const priceColor = designSettings['--item-price-color'] || '#ffffff';

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
        <section className="container-fluid" id="menu">
            <div className="menu-search-container">
                <input 
                    type="text" 
                    className="menu-search-input"
                    placeholder={t('menu_search_placeholder')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <h2 
                className="section-title" 
                style={TextShadowOrNot(designSettings['--secondary-color'] || '#ffffff')}
            >
                {t('section_menu')}
            </h2>
            
            <div className="menu-grid">
                {filteredMenuData.length === 0 ? (
                    <div style={{ textAlign: 'center', gridColumn: '1/-1', padding: '2rem', color: 'var(--text-muted)' }}>
                        {t('menu_no_results')}
                    </div>
                ) : (
                    <>
                        {(() => {
                            let matrixRendered = false;
                            
                            return filteredMenuData.map(category => {
                                const orderId = category.order_id;
                                // If it's a pizza category (Order ID 4 or 5)
                                if (orderId === 4 || orderId === 5) {
                                    if (!matrixRendered) {
                                        matrixRendered = true;
                                        return <PizzaMatrix key="pizza-matrix" menuData={filteredMenuData} />;
                                    }
                                    return null;
                                }

                                // Default rendering for other categories
                                return (
                                    <div key={category.id} className="category-section">
                                        <h2 
                                            className="category-title" 
                                            style={TextShadowOrNot(designSettings['--category-title-color'] || '#ffffff')}
                                            dangerouslySetInnerHTML={{ __html: preprocess_html(category.name) }}
                                        ></h2>
                                        {category.description && (
                                            <p className="category-desc" dangerouslySetInnerHTML={{ __html: preprocess_html(category.description) }}></p>
                                        )}
                                        <div className="category-grid">
                                            {category.items?.map(item => (
                                                <div key={item.id} className="item-card">
                                                    {category.pic_url && (
                                                        <img src={category.pic_url} alt={category.name} className="pizza-image" />
                                                    )}
                                                    <div className="item-content">
                                                        <h3 className="item-title" dangerouslySetInnerHTML={{ __html: preprocess_html(item.name) }}></h3>
                                                        {item.description && (
                                                            <p className="item-desc" dangerouslySetInnerHTML={{ __html: preprocess_html(item.description) }}></p>
                                                        )}
                                                        <div className="item-footer">
                                                            <span className="item-price" style={TextShadowOrNot(priceColor)}>
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
                            });
                        })()}
                    </>
                )}
            </div>
        </section>
    );
}
