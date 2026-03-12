"use client";
import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './admin.scss';
import { AdminProvider, useAdmin } from '@/context/AdminContext';
import MenuEditor from '@/components/admin/MenuEditor';
import CategoryManager from '@/components/admin/CategoryManager';
import BackupManager from '@/components/admin/BackupManager';
import GeneralSettings from '@/components/admin/GeneralSettings';
import OrderManager from '@/components/admin/OrderManager';
import DesignSettings from '@/components/admin/DesignSettings';

import { useLanguage } from '@/context/LanguageContext';

function AdminContent() {
    const { t } = useLanguage();
    const { showToast, refreshData } = useAdmin();
    const [activeTab, setActiveTab] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [showScrollTop, setShowScrollTop] = useState(false);
    const [showSearchInput, setShowSearchInput] = useState(false);

    // Touch swipe state
    const [touchStartX, setTouchStartX] = useState<number | null>(null);
    const [touchEndX, setTouchEndX] = useState<number | null>(null);
    const minSwipeDistance = 50;

    useEffect(() => {
        const handleScroll = () => {
            setShowScrollTop(window.scrollY > 300);
            console.log(window.scrollY);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Load active tab from localStorage on mount
    useEffect(() => {
        const savedTab = localStorage.getItem('adminActiveTab');
        setActiveTab(savedTab || 'orders');
    }, []);

    // Save active tab to localStorage whenever it changes
    useEffect(() => {
        if (!activeTab) return;
        
        localStorage.setItem('adminActiveTab', activeTab);
        
        const activeTabElement = document.querySelector('.tabs .tab.active');
        if (activeTabElement) {
            activeTabElement.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        }
    }, [activeTab]);

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const renderContent = () => {
        if (!activeTab) return null;
        
        switch (activeTab) {
            case 'orders': return <OrderManager searchQuery={searchQuery} />;
            case 'menu': return <MenuEditor />;
            case 'categories': return <CategoryManager />;
            case 'backups': return <BackupManager />;
            case 'settings': return <GeneralSettings />;
            case 'design': return <DesignSettings />;
            default: return <OrderManager searchQuery={searchQuery} />;
        }
    };

    const getSearchPlaceholder = () => {
        switch(activeTab) {
            case 'menu': return t('admin_editor_search_placeholder');
            case 'categories': return t('admin_categories_search_placeholder');
            case 'orders': return t('admin_orders_search_placeholder');
            default: return "Search...";
        }
    };

    const handleTouchStart = (e: React.TouchEvent) => {
        setTouchEndX(null); // Reset on new touch
        setTouchStartX(e.targetTouches[0].clientX);
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        setTouchEndX(e.targetTouches[0].clientX);
    };

    const handleTouchEnd = () => {
        if (!touchStartX || !touchEndX) return;
        
        const distance = touchStartX - touchEndX;
        const isLeftSwipe = distance > minSwipeDistance;
        const isRightSwipe = distance < -minSwipeDistance;
        
        const tabs = ['orders', 'menu', 'categories', 'backups', 'settings', 'design'];
        const currentIndex = tabs.indexOf(activeTab!);

        if (isLeftSwipe) {
            // User requested: Swipe left -> Next menu
            const nextIndex = currentIndex === tabs.length - 1 ? 0 : currentIndex + 1;
            setActiveTab(tabs[nextIndex]);
        } else if (isRightSwipe) {
            // User requested: Swipe right -> Previous menu
            const prevIndex = currentIndex === 0 ? tabs.length - 1 : currentIndex - 1;
            setActiveTab(tabs[prevIndex]);
        }
    };

    // If activeTab is null, render a loading state
    if (activeTab === null) {
        return (
            <div className="admin-container container-fluid" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
                <div style={{ padding: '40px', textAlign: 'center', fontSize: '1.2em', color: 'var(--text-color)' }}>
                    {t('general_loading')}...
                </div>
            </div>
        );
    }

    return (
        <div 
            className="admin-container container-fluid"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
        >
            <div className="admin-header">
                <h1>{t('admin_dashboard')}</h1>
                <div className="system-controls" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <button className="btn btn-refresh" onClick={refreshData} title={t('general_refresh_btn')}>
                        {t('general_refresh_btn')}
                    </button>
                </div>
            </div>

            <div className="tabs">
                {['orders', 'menu', 'categories', 'backups', 'settings', 'design'].map((tab) => (
                    <button
                        key={tab}
                        className={`tab ${activeTab === tab ? 'active' : ''}`}
                        onClick={() => setActiveTab(tab)}
                    >
                        {t(`admin_menu_${tab}` as any)}
                    </button>
                ))}
            </div>

            {/* Global Search Bar shown for supported tabs */}
            {activeTab && ['menu', 'categories', 'orders'].includes(activeTab) && (
                <div style={{ position: 'sticky', top: 0, zIndex: 100, backgroundColor: 'var(--bg-color)', padding: '16px 0', borderBottom: '1px solid var(--border-color)', marginBottom: '16px' }}>
                    <div className="search-wrapper" style={{ display: 'flex', width: '100%' }}>
                        <input 
                            type="text" 
                            placeholder={getSearchPlaceholder()}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{ 
                                width: '100%', 
                                padding: '12px 16px', 
                                borderRadius: '8px', 
                                border: '1px solid var(--border-color)',
                                fontSize: '16px',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                            }}
                        />
                    </div>
                </div>
            )}

            <div className="section active" style={{ paddingBottom: showScrollTop ? '80px' : '0' }}>
                {activeTab === 'menu' && <MenuEditor searchQuery={searchQuery} />}
                {activeTab === 'categories' && <CategoryManager searchQuery={searchQuery} />}
                {activeTab === 'backups' && <BackupManager />}
                {activeTab === 'settings' && <GeneralSettings />}
                {activeTab === 'design' && <DesignSettings />}
                {activeTab === 'orders' && <OrderManager searchQuery={searchQuery} />}
            </div>

            {/* Floating Action Buttons */}
            {showScrollTop && (
                <div style={{
                    position: 'fixed',
                    bottom: '20px',
                    left: '0',
                    right: '0',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: '12px',
                    pointerEvents: 'none', // Allow clicking through empty space
                    zIndex: 4000,
                    padding: '0 20px'
                }}>
                    {/* Search Component container */}
                    {activeTab && ['menu', 'categories', 'orders'].includes(activeTab) && (
                        <div style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            pointerEvents: 'auto',
                            backgroundColor: showSearchInput ? 'white' : 'transparent',
                            borderRadius: '25px',
                            boxShadow: showSearchInput ? '0 4px 12px rgba(0,0,0,0.15)' : 'none',
                            transition: 'all 0.3s ease',
                            padding: showSearchInput ? '4px 4px 4px 16px' : '0',
                            border: showSearchInput ? '1px solid var(--border-color)' : 'none'
                        }}>
                            <input 
                                type="text"
                                placeholder={getSearchPlaceholder()}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                style={{
                                    width: showSearchInput ? '200px' : '0px',
                                    opacity: showSearchInput ? 1 : 0,
                                    padding: '0',
                                    border: 'none',
                                    outline: 'none',
                                    fontSize: '16px',
                                    transition: 'all 0.3s ease',
                                    backgroundColor: 'transparent'
                                }}
                            />
                            <button 
                                onClick={() => setShowSearchInput(!showSearchInput)}
                                title="Toggle Search"
                                style={{
                                    width: '50px',
                                    height: '50px',
                                    borderRadius: '50%',
                                    backgroundColor: showSearchInput ? 'transparent' : 'var(--primary-color)',
                                    color: showSearchInput ? '#4a5568' : 'white',
                                    border: 'none',
                                    boxShadow: showSearchInput ? 'none' : '0 4px 12px rgba(0,0,0,0.3)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '20px',
                                    cursor: 'pointer',
                                    flexShrink: 0,
                                    transition: 'all 0.3s ease'
                                }}
                            >
                                {showSearchInput ? '✕' : '🔍'}
                            </button>
                        </div>
                    )}

                    {/* Scroll to Top */}
                    <button 
                        onClick={scrollToTop}
                        title="Scroll to Top"
                        style={{
                            width: '50px',
                            height: '50px',
                            borderRadius: '50%',
                            backgroundColor: 'var(--primary-color)',
                            color: 'white',
                            border: 'none',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '24px',
                            cursor: 'pointer',
                            flexShrink: 0,
                            pointerEvents: 'auto'
                        }}
                    >
                        ↑
                    </button>
                </div>
            )}
        </div>
    );
}

export default function AdminPage() {
    return (
        <AdminProvider>
            <AdminContent />
        </AdminProvider>
    );
}
