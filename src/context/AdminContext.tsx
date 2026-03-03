"use client";
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Category, Item } from '@/types';

interface Toast {
    message: string;
    type: 'success' | 'error';
    id: number;
}

interface AdminContextType {
    categories: Category[];
    items: Item[];
    zutaten: any[]; // Define proper type if possible
    loading: boolean;
    refreshData: () => Promise<void>;
    showToast: (msg: string, type?: 'success' | 'error') => void;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export function AdminProvider({ children }: { children: React.ReactNode }) {
    const [categories, setCategories] = useState<Category[]>([]);
    const [items, setItems] = useState<Item[]>([]);
    const [zutaten, setZutaten] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [toasts, setToasts] = useState<Toast[]>([]);

    const refreshData = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/data');
            const data = await res.json();
            setCategories(data.categories || []);
            setItems(data.items || []);
            setZutaten(data.zutaten || []);
        } catch (err) {
            console.error("Failed to fetch admin data", err);
            showToast("Failed to fetch data", "error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        refreshData();
    }, []);

    const showToast = (message: string, type: 'success' | 'error' = 'success') => {
        const id = Date.now();
        setToasts(prev => [...prev, { message, type, id }]);
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, 5000);
    };

    return (
        <AdminContext.Provider value={{ categories, items, zutaten, loading, refreshData, showToast }}>
            {children}
            <div style={{ 
                position: 'fixed', 
                bottom: '30px', 
                right: '30px', 
                zIndex: 10000, 
                display: 'flex', 
                flexDirection: 'column-reverse', 
                gap: '10px',
                pointerEvents: 'none'
            }}>
                {toasts.map(t => (
                    <div 
                        key={t.id} 
                        className="admin-toast" 
                        style={{ 
                            position: 'relative', 
                            bottom: 'auto', 
                            right: 'auto', 
                            pointerEvents: 'auto',
                            backgroundColor: t.type === 'error' ? '#e53e3e' : '#28a745',
                            margin: 0
                        }}
                    >
                        {t.message}
                    </div>
                ))}
            </div>
        </AdminContext.Provider>
    );
}

export function useAdmin() {
    const context = useContext(AdminContext);
    if (!context) {
        throw new Error("useAdmin must be used within an AdminProvider");
    }
    return context;
}
