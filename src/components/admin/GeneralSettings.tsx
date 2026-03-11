"use client";
import React, { useState, useEffect } from 'react';
import { useAdmin } from '@/context/AdminContext';
import { useLanguage } from '@/context/LanguageContext';
import EditableCell from './EditableCell';

export default function GeneralSettings() {
    const { t } = useLanguage();
    const [settings, setSettings] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(true);
    const { showToast } = useAdmin();

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const res = await fetch('/api/settings');
            const data = await res.json();
            setSettings(data);
            setLoading(false);
        } catch (err) {
            console.error("Failed to fetch settings:", err);
            showToast("Failed to load settings", "error");
            setLoading(false);
        }
    };

    const formatValue = (key: string, value: string) => {
        if (!value) return value;
        // Strip any existing characters, keep only digits, dots, commas
        let clean = value.replace(/[^\d.,]/g, '').trim();
        
        if (key === 'delivery_costs' || key === 'tax_food' || key === 'tax_drinks') {
            // Convert to metric format (comma as decimal separator)
            let num = parseFloat(clean.replace(',', '.'));
            if (isNaN(num)) return clean;
            // Use de-DE to get the comma separator
            return num.toLocaleString('de-DE', { 
                minimumFractionDigits: key === 'delivery_costs' ? 2 : 0, 
                maximumFractionDigits: 2 
            });
        }
        return value;
    };

    const unformatValue = (value: string) => {
        // Return numeric string for API (using dots)
        return value.replace(/[^\d.,]/g, '').trim().replace(',', '.');
    };

    const handleUpdate = async (key: string, value: string) => {
        const rawValue = unformatValue(value);
        try {
            const res = await fetch('/api/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ key, value: rawValue })
            });

            if (res.ok) {
                setSettings(prev => ({ ...prev, [key]: rawValue }));
                const displayValue = formatValue(key, rawValue);
                const displayKey = key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
                showToast(`Updated ${displayKey} to ${displayValue}`, "success");
            } else {
                showToast("Failed to update setting", "error");
            }
        } catch (err) {
            console.error("Update failed:", err);
            showToast("Failed to update setting", "error");
        }
    };

    const handleTestPrint = async () => {
        try {
            const res = await fetch('/api/admin/test-print', {
                method: 'POST'
            });
            const data = await res.json();
            
            if (res.ok) {
                showToast(`Test print job queued: ${data.filename}`, "success");
            } else {
                showToast(data.error || "Failed to queue test print", "error");
            }
        } catch (err) {
            console.error("Test print failed:", err);
            showToast("Error triggering test print", "error");
        }
    };

    if (loading) return <div>{t('admin_settings_loading')}</div>;

    return (
        <div className="general-settings">
            <h2 className="section-title">{t('admin_menu_settings')}</h2>
            
            <div className="table-responsive mt-3">
                <table className="table table-hover settings-table">
                    <thead>
                        <tr>
                            <th style={{ width: '25%' }}>{t('admin_settings_col_setting')}</th>
                            <th style={{ width: '45%' }}>{t('admin_settings_col_description')}</th>
                            <th style={{ width: '30%' }}>{t('admin_settings_col_value')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr className="settings-group-row">
                            <td colSpan={3}><strong>{t('admin_settings_taxes')}</strong></td>
                        </tr>
                        <tr>
                            <td><strong>{t('admin_settings_tax_category_food')}</strong></td>
                            <td className="text-muted small">{t('admin_settings_tax_notice_food')}</td>
                            <td>
                                <div className="input-group-custom">
                                    <EditableCell 
                                        value={formatValue('tax_food', settings.tax_food || '0')} 
                                        onChange={(val) => handleUpdate('tax_food', val)}
                                        className="form-control-custom"
                                        singleLine={true}
                                    />
                                    <span className="input-addon">%</span>
                                </div>
                            </td>
                        </tr>
                        <tr>
                            <td><strong>{t('admin_settings_tax_category_drinks')}</strong></td>
                            <td className="text-muted small">{t('admin_settings_tax_notice_drinks')}</td>
                            <td>
                                <div className="input-group-custom">
                                    <EditableCell 
                                        value={formatValue('tax_drinks', settings.tax_drinks || '0')} 
                                        onChange={(val) => handleUpdate('tax_drinks', val)}
                                        className="form-control-custom"
                                        singleLine={true}
                                    />
                                    <span className="input-addon">%</span>
                                </div>
                            </td>
                        </tr>
                        <tr className="settings-group-row">
                            <td colSpan={3}><strong>{t('admin_settings_shipping_delivery')}</strong></td>
                        </tr>
                        <tr>
                            <td><strong>{t('admin_settings_delivery_costs')}</strong></td>
                            <td className="text-muted small">{t('admin_settings_delivery_costs_infotext')}</td>
                            <td>
                                <div className="input-group-custom">
                                    <EditableCell 
                                        value={formatValue('delivery_costs', settings.delivery_costs || '0.00')} 
                                        onChange={(val) => handleUpdate('delivery_costs', val)}
                                        className="form-control-custom"
                                        singleLine={true}
                                    />
                                    <span className="input-addon">€</span>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div className="admin-actions mt-4">
                <button 
                    className="btn btn-primary" 
                    onClick={handleTestPrint}
                    style={{ 
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        border: 'none',
                        padding: '12px 24px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                    }}
                >
                    <span style={{ fontSize: '1.2em' }}>🖨️</span>
                    {t('admin_settings_print_test_btn')}
                </button>
                <p className="text-muted mt-2 small">
                    {t('admin_settings_print_test_notice')}
                </p>
            </div>

            <style jsx>{`
                .general-settings {
                    max-width: 900px;
                    margin: 0 auto;
                }
                .settings-table {
                    background: white;
                    border: 1px solid #dee2e6;
                    border-radius: 8px;
                    overflow: hidden;
                }
                .settings-table th {
                    background-color: #f8f9fa;
                    border-bottom: 2px solid #dee2e6;
                    padding: 12px;
                }
                .settings-table td {
                    padding: 12px;
                    vertical-align: middle;
                }
                .settings-group-row {
                    background-color: #f1f3f5;
                }
                .settings-group-row td {
                    padding: 8px 12px !important;
                    text-transform: uppercase;
                    font-size: 0.85rem;
                    color: #495057;
                    letter-spacing: 0.05em;
                }
                .input-group-custom {
                    display: flex;
                    align-items: center;
                    border: 1px solid #ced4da;
                    border-radius: 4px;
                    background: white;
                    overflow: hidden;
                }
                .input-group-custom:focus-within {
                    border-color: var(--primary-color);
                    box-shadow: 0 0 0 0.2rem rgba(var(--primary-color-rgb), 0.25);
                }
                .input-addon {
                    background: #f1f3f5;
                    padding: 8px 12px;
                    border-left: 1px solid #ced4da;
                    color: #495057;
                    font-weight: 600;
                    user-select: none;
                }
                :global(.form-control-custom) {
                    padding: 8px 12px;
                    border: none !important;
                    background: transparent !important;
                    width: 100%;
                    outline: none !important;
                }
            `}</style>
        </div>
    );
}
