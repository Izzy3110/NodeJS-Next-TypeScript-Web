"use client";

import React, { useState, useEffect } from 'react';
import { useAdmin } from '@/context/AdminContext';
import { useLanguage } from '@/context/LanguageContext';

const DEFAULT_THEME = {
  "--primary-color": "#ff6b6b",
  "--secondary-color": "#4ecdc4",
  "--background-dark": "#1a1a1a",
  "--text-light": "#f7f7f7",
  "--text-muted": "#a0a0a0",
  "--card-bg": "#2d2d2d",
  "--font-heading": "\"Poppins\", sans-serif",
  "--font-body": "\"Inter\", sans-serif",
  "--matrix-price-color": "#ffffff",
  "--matrix-desc-color": "#888888",
  "--matrix-name-color": "#ffffff",
  "--matrix-header-text-color": "#ffffff",
  "--matrix-btn-color": "#ff6b6b",
  "--matrix-btn-hover-color": "#3bb8af",
  "--item-title-color": "#ffffff",
  "--item-price-color": "#4ecdc4",
  "--item-desc-color": "#888888",
  "--add-btn-hover-color": "#3bb8af",
  "--category-title-color": "#ffffff",
  "--hero-bg-image": "none"
};

export default function DesignSettings() {
    const { t } = useLanguage();
    const { showToast } = useAdmin();
    const [variables, setVariables] = useState<Record<string, string>>({});
    const [originalVariables, setOriginalVariables] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showRestoreModal, setShowRestoreModal] = useState(false);
    const [restoreText, setRestoreText] = useState('');

    useEffect(() => {
        fetchVars();
    }, []);

    // Live Preview
    useEffect(() => {
        Object.entries(variables).forEach(([key, value]) => {
            document.documentElement.style.setProperty(key, value, 'important');
        });
    }, [variables]);

    const fetchVars = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/design');
            if (!res.ok) throw new Error("Failed to fetch design settings");
            const data = await res.json();
            setVariables(data);
            setOriginalVariables(data);
        } catch (error: any) {
            showToast(error.message, 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = (key: string, value: string) => {
        setVariables(prev => ({ ...prev, [key]: value }));
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const res = await fetch('/api/admin/design', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(variables)
            });
            if (!res.ok) throw new Error("Failed to save design settings");
            showToast("Design erfolgreich gespeichert!", 'success');
            setOriginalVariables(variables);
            
            // Reload page to apply changes (since globals.scss is recompiled)
            window.location.reload();
        } catch (error: any) {
            showToast(error.message, 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleReset = () => {
        if (window.confirm(t('design_settings_confirm_reset') || "Möchten Sie alle Einstellungen auf die Standardwerte zurücksetzen?")) {
            setVariables(DEFAULT_THEME);
            showToast("Auf Standardwerte zurückgesetzt! (Speichern zum Übernehmen)", 'success');
        }
    };

    const handleDiscard = () => {
        // Reset styles for preview
        Object.entries(originalVariables).forEach(([key, value]) => {
            document.documentElement.style.setProperty(key, value, 'important');
        });
        setVariables(originalVariables);
        showToast("Änderungen verworfen", 'success');
    };
    
    const handleDownload = () => {
        const data = JSON.stringify(variables, null, 2);
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'theme.json';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        showToast("theme.json heruntergeladen!", 'success');
    };

    const handleRestoreText = () => {
        try {
            const parsed = JSON.parse(restoreText);
            // Basic validation
            if (typeof parsed !== 'object' || parsed === null) throw new Error("Ungültiges Format");
            setVariables(parsed);
            setShowRestoreModal(false);
            setRestoreText('');
            showToast("Theme aus Text wiederhergestellt! (Speichern zum Übernehmen)", 'success');
        } catch (error) {
            showToast("Fehler beim Parsen des JSON-Textes", 'error');
        }
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const content = event.target?.result as string;
                const parsed = JSON.parse(content);
                if (typeof parsed !== 'object' || parsed === null) throw new Error("Ungültiges Format");
                setVariables(parsed);
                setShowRestoreModal(false);
                showToast("Theme aus Datei wiederhergestellt! (Speichern zum Übernehmen)", 'success');
            } catch (error) {
                showToast("Fehler beim Lesen der Datei", 'error');
            }
        };
        reader.readAsText(file);
    };

    const renderVariable = (key: string, value: string) => {
        const isColor = value.startsWith('#') || value.startsWith('rgb');
        const translationKeys: Record<string, string> = {
            '--primary-color': 'design_settings_primary_color',
            '--secondary-color': 'design_settings_secondary_color',
            '--background-dark': 'design_settings_bg_dark',
            '--text-light': 'design_settings_text_light',
            '--text-muted': 'design_settings_text_muted',
            '--card-bg': 'design_settings_card_bg',
            '--matrix-price-color': 'design_settings_matrix_price_color',
            '--matrix-name-color': 'design_settings_matrix_name_color',
            '--matrix-desc-color': 'design_settings_matrix_desc_color',
            '--matrix-header-text-color': 'design_settings_matrix_header_text_color',
            '--matrix-btn-color': 'design_settings_matrix_btn_color',
            '--matrix-btn-hover-color': 'design_settings_matrix_btn_hover_color',
            '--item-title-color': 'design_settings_item_title_color',
            '--item-price-color': 'design_settings_item_price_color',
            '--item-desc-color': 'design_settings_item_desc_color',
            '--add-btn-hover-color': 'design_settings_add_btn_hover_color',
            '--category-title-color': 'design_settings_category_title_color',
            '--hero-bg-image': 'design_settings_hero_bg'
        };
        const tKey = translationKeys[key];
        const label = tKey ? t(tKey as any) : key.replace('--', '').replace(/-/g, ' ');

        if (key === '--hero-bg-image') {
            const isEnabled = value !== 'none';
            return (
                <div key={key} className="col-12 mb-4">
                    <div className="form-check form-switch p-0 d-flex align-items-center gap-3" style={{ minHeight: '3rem', cursor: 'pointer' }}>
                        <div className="flex-grow-1">
                            <label className="form-check-label fw-bold h5 mb-0" htmlFor="hero-bg-toggle" style={{ cursor: 'pointer' }}>
                                {label}
                            </label>
                            <p className="text-muted small mb-0">Schaltet das filmreife Hangar-Hintergrundbild im oberen Bereich ein oder aus.</p>
                        </div>
                        <input 
                            className="form-check-input ms-0" 
                            type="checkbox" 
                            id="hero-bg-toggle"
                            checked={isEnabled}
                            onChange={(e) => handleUpdate(key, e.target.checked ? "url('/hangar-bg.jpg')" : "none")}
                            style={{ width: '3rem', height: '1.5rem', cursor: 'pointer' }}
                        />
                    </div>
                </div>
            );
        }

        return (
            <div key={key} className="col-md-6 mb-3">
                <label className="form-label d-flex justify-content-between">
                    <span className="fw-bold">{label}</span>
                    {isColor && (
                        <div 
                            style={{ 
                                width: '20px', 
                                height: '20px', 
                                backgroundColor: value, 
                                border: '1px solid #ccc',
                                borderRadius: '3px'
                            }} 
                        />
                    )}
                </label>
                <div className="input-group">
                    {isColor && (
                        <input 
                            type="color" 
                            className="form-control form-control-color" 
                            value={value.startsWith('#') ? value : '#000000'}
                            onChange={(e) => handleUpdate(key, e.target.value)}
                            title="Choose your color"
                            style={{ width: '60px' }}
                        />
                    )}
                    <input 
                        type="text" 
                        className="form-control" 
                        value={value} 
                        onChange={(e) => handleUpdate(key, e.target.value)}
                    />
                </div>
            </div>
        );
    };

    if (loading) return <div className="p-4">Lade Design-Einstellungen...</div>;

    const hasChanges = JSON.stringify(variables) !== JSON.stringify(originalVariables);

    return (
        <div className="design-settings-container card p-4 shadow-sm">
            <div className="d-flex justify-content-between align-items-start mb-4">
                <div>
                    <h3>Design Einstellungen</h3>
                    <p className="text-muted mb-0">Passen Sie die Farben und Schriftarten der Website an.</p>
                </div>
                <button 
                    className="btn btn-outline-danger btn-sm" 
                    onClick={handleReset}
                    title="Alle Einstellungen auf Standardwerte zurücksetzen"
                >
                    <i className="fa fa-rotate-left me-2"></i> Reset to defaults
                </button>
            </div>
            
            <div className="design-sections">
                {(() => {
                    const groups = [
                        { title: 'design_settings_group_general', prefixes: ['--primary', '--secondary', '--background', '--card'] },
                        { title: 'design_settings_group_text', prefixes: ['--text'] },
                        { title: 'design_settings_group_matrix', prefixes: ['--matrix'] },
                        { title: 'design_settings_group_items', prefixes: ['--item'] },
                    ];

                    const entries = Object.entries(variables);
                    const usedKeys = new Set<string>();

                    return groups.map(group => {
                        const groupEntries = entries.filter(([key]) => {
                            const match = group.prefixes.some(p => key.startsWith(p));
                            if (match) usedKeys.add(key);
                            return match;
                        });

                        if (groupEntries.length === 0) return null;

                        return (
                            <div key={group.title} className="design-section mb-5">
                                <h4 className="border-bottom pb-2 mb-3 text-secondary">{t(group.title as any)}</h4>
                                <div className="row">
                                    {groupEntries.map(([key, value]) => renderVariable(key, value))}
                                </div>
                            </div>
                        );
                    });
                })()}

                {(() => {
                    const remainingEntries = Object.entries(variables).filter(([key]) => !new Set(
                        ['--primary', '--secondary', '--background', '--card', '--text', '--matrix', '--item']
                            .flatMap(p => Object.keys(variables).filter(k => k.startsWith(p)))
                    ).has(key));

                    if (remainingEntries.length === 0) return null;

                    return (
                        <div key="other" className="design-section mb-5">
                            <h4 className="border-bottom pb-2 mb-3 text-secondary">Other Settings</h4>
                            <div className="row">
                                {remainingEntries.map(([key, value]) => renderVariable(key, value))}
                            </div>
                        </div>
                    );
                })()}
            </div>

            <div className="mt-4 d-flex flex-wrap gap-2 pt-4 border-top">
                <div className="d-flex gap-2 flex-grow-1">
                    <button 
                        className="btn btn-primary" 
                        onClick={handleSave} 
                        disabled={!hasChanges || saving}
                    >
                        {saving ? 'Speichert...' : 'Speichern & Neu laden'}
                    </button>
                    <button 
                        className="btn btn-outline-secondary" 
                        onClick={handleDiscard}
                        disabled={!hasChanges || saving}
                    >
                        Verwerfen
                    </button>
                </div>
                
                <div className="d-flex gap-2">
                    <button 
                        className="btn btn-info" 
                        onClick={handleDownload}
                        title="Aktuelles Theme als theme.json herunterladen"
                    >
                        <i className="fa fa-download me-2"></i> Download theme.json
                    </button>
                    <button 
                        className="btn btn-warning" 
                        onClick={() => setShowRestoreModal(true)}
                        title="Theme aus Datei oder Text wiederherstellen"
                    >
                        <i className="fa fa-upload me-2"></i> Restore theme.json
                    </button>
                </div>
            </div>

            {/* Restore Modal */}
            {showRestoreModal && (
                <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-lg modal-dialog-centered">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Theme wiederherstellen</h5>
                                <button type="button" className="btn-close" onClick={() => setShowRestoreModal(false)}></button>
                            </div>
                            <div className="modal-body">
                                <div className="mb-4">
                                    <h6>Option 1: Datei hochladen</h6>
                                    <input 
                                        type="file" 
                                        className="form-control" 
                                        accept=".json"
                                        onChange={handleFileUpload}
                                    />
                                    <small className="text-muted">Wählen Sie eine zuvor heruntergeladene theme.json Datei aus.</small>
                                </div>
                                
                                <div className="border-top pt-3">
                                    <h6>Option 2: JSON Text einfügen</h6>
                                    <textarea 
                                        className="form-control font-monospace" 
                                        rows={10} 
                                        placeholder='{ "--primary-color": "#ff6b6b", ... }'
                                        value={restoreText}
                                        onChange={(e) => setRestoreText(e.target.value)}
                                        style={{ fontSize: '0.85rem' }}
                                    ></textarea>
                                    <button 
                                        className="btn btn-primary mt-2"
                                        disabled={!restoreText.trim()}
                                        onClick={handleRestoreText}
                                    >
                                        Text anwenden
                                    </button>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowRestoreModal(false)}>Abbrechen</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
