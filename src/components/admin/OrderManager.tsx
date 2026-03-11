"use client";
import React, { useState, useEffect } from 'react';
import { useAdmin } from '@/context/AdminContext';
import { useLanguage } from '@/context/LanguageContext';

interface OrderManagerProps {
    searchQuery: string;
}

export default function OrderManager({ searchQuery }: OrderManagerProps) {
    const { t } = useLanguage();
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const { showToast } = useAdmin();

    const fetchOrders = async (isManual = true) => {
        setLoading(true);
        try {
            const res = await fetch('/api/orders');
            if (!res.ok) throw new Error('Failed to fetch orders');
            const data = await res.json();
            setOrders(data);
            if (isManual) {
                showToast('Orders refreshed', 'success');
            }
        } catch (err: any) {
            console.error(err);
            showToast('Failed to load orders', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders(false);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const filteredOrders = orders.filter(order => {
        if (!searchQuery) return true;
        const searchLower = searchQuery.toLowerCase();
        return Object.values(order).some(val => 
            String(val).toLowerCase().includes(searchLower)
        );
    });

    const columns = orders.length > 0 ? Object.keys(orders[0]) : [];

    return (
        <div style={{ position: 'relative', minHeight: '400px', backgroundColor: 'var(--bg-card)', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 style={{ margin: 0 }}>{t('admin_orders_headline')}</h2>
            </div>
            
            {/* Sticky Circular Refresh Button */}
            <button
                onClick={() => fetchOrders(true)}
                title="Refresh Orders"
                style={{
                    position: 'absolute',
                    top: '20px',
                    right: '20px',
                    width: '50px',
                    height: '50px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--primary-color, #4facfe)',
                    color: 'white',
                    border: 'none',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '24px',
                    cursor: 'pointer',
                    zIndex: 100,
                    transition: 'transform 0.2s ease',
                }}
                onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
                ↻
            </button>

            {loading ? (
                <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-color)' }}>Loading orders...</div>
            ) : filteredOrders.length === 0 ? (
                <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-color)' }}>{t('admin_orders_no_orders_found')}</div>
            ) : (
                <div style={{ overflowX: 'auto', backgroundColor: 'var(--bg-color)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                            <tr style={{ backgroundColor: 'var(--th-bg)', borderBottom: '2px solid var(--border-color)' }}>
                                {columns.map(col => (
                                    <th key={col} style={{ padding: '12px 16px', fontWeight: 'bold', color: 'var(--text-color)' }}>{col}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {filteredOrders.map((order, i) => (
                                <tr key={order.id || i} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                    {columns.map(col => (
                                        <td key={col} style={{ padding: '12px 16px', color: 'var(--text-color)' }}>
                                            {typeof order[col] === 'object' && order[col] !== null 
                                                ? JSON.stringify(order[col]) 
                                                : String(order[col] ?? '')}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
