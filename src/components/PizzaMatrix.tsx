"use client";

import React from 'react';
import { Category, Item } from '@/types';
import { preprocess_html, decode_entities } from '@/utils/stringUtils';
import { useLanguage } from '@/context/LanguageContext';
import { useCart } from '@/context/CartContext';

interface PizzaMatrixProps {
    menuData: Category[];
}

export default function PizzaMatrix({ menuData }: PizzaMatrixProps) {
    const { t } = useLanguage();
    const { addToCart } = useCart();

    // Filter pizza categories
    const pizzaCats = menuData.filter(cat => cat.order_id === 4 || cat.order_id === 5);

    // Grouping logic for Pizza Matrix
    const pizzaMap = new Map<string, { name: string, description: string, normal?: Item, gross?: Item }>();
    
    pizzaCats.forEach(cat => {
        cat.items?.forEach(item => {
            const decodedName = decode_entities(item.name);
            if (!pizzaMap.has(decodedName)) {
                pizzaMap.set(decodedName, { 
                    name: item.name, 
                    description: item.description || '',
                });
            }
            const entry = pizzaMap.get(decodedName)!;
            // Pizza Normal: OrderID 4
            // Pizza Groß: OrderID 5
            if (cat.order_id === 4) entry.normal = item;
            if (cat.order_id === 5) entry.gross = item;
        });
    });

    const combinedPizzas = Array.from(pizzaMap.values()).sort((a, b) => {
        const idA = a.normal?.id || a.gross?.id || 0;
        const idB = b.normal?.id || b.gross?.id || 0;
        return idA - idB;
    });

    if (combinedPizzas.length === 0) return null;

    return (
        <div className="category-section">
            <h2 className="category-title">{t('matrix_pizza_category')}</h2>
            <div className="pizza-matrix-container">
                <table className="pizza-matrix-table">
                    <thead>
                        <tr>
                            <th>{t('matrix_pizza_category_name')}</th>
                            <th>{t('matrix_pizza_category_description')}</th>
                            <th className="pizza-matrix-price-cell matrix-price-size-header">{t('matrix_pizza_sizes_normal')}</th>
                            <th className="pizza-matrix-price-cell matrix-price-size-header">{t('matrix_pizza_sizes_large')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {combinedPizzas.map((pizza, idx) => (
                            <tr key={idx}>
                                <td>
                                    <span className="pizza-name" dangerouslySetInnerHTML={{ __html: preprocess_html(pizza.name) }}></span>
                                </td>
                                <td>
                                    <span className="pizza-desc" dangerouslySetInnerHTML={{ __html: preprocess_html(pizza.description) }}></span>
                                </td>
                                <td className="pizza-matrix-price-cell">
                                    {pizza.normal ? (
                                        <>
                                            <span className="pizza-matrix-price">€{Number(pizza.normal.price_s || 0).toFixed(2)}</span>
                                            <button className="add-btn" onClick={() => addToCart({ ...pizza.normal!, price: pizza.normal!.price_s || 0 })}>{t('add_to_cart')}</button>
                                        </>
                                    ) : "-"}
                                </td>
                                <td className="pizza-matrix-price-cell">
                                    {pizza.gross ? (
                                        <>
                                            <span className="pizza-matrix-price">€{Number(pizza.gross.price_m || 0).toFixed(2)}</span>
                                            <button className="add-btn" onClick={() => addToCart({ ...pizza.gross!, price: pizza.gross!.price_m || 0 })}>{t('add_to_cart')}</button>
                                        </>
                                    ) : "-"}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
