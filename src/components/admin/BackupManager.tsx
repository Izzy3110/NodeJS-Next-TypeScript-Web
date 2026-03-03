"use client";
import React, { useEffect, useState, useRef } from 'react';
import { useAdmin } from '@/context/AdminContext';

interface BackupFile {
    filename: string;
    created: string;
}

export default function BackupManager() {
    const { showToast } = useAdmin();
    const [backups, setBackups] = useState<BackupFile[]>([]);
    const [loading, setLoading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const loadBackups = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/backups');
            const data = await res.json();
            setBackups(data);
        } catch (err) {
            console.error("Failed to load backups", err);
            showToast("Failed to load backups", "error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadBackups();
    }, []);

    const createBackup = async () => {
        if (!confirm('Create a new backup now?')) return;
        try {
            const res = await fetch('/api/admin/backup', { method: 'POST' });
            const data = await res.json();
            if (data.success) {
                showToast(`Backup created: ${data.filename}`);
                loadBackups();
            } else {
                showToast('Backup failed', 'error');
            }
        } catch (err) {
            showToast('Error creating backup', 'error');
        }
    };

    const createCategoryBackup = async () => {
        try {
            const res = await fetch('/api/admin/backup-categories', { method: 'POST' });
            const data = await res.json();
            if (data.success) {
                showToast(`Category backup created: ${data.filename}`);
                loadBackups();
            } else {
                showToast('Category backup failed', 'error');
            }
        } catch (err) {
            showToast('Error creating category backup', 'error');
        }
    };

    const deleteBackup = async (filename: string) => {
        if (!confirm(`Are you sure you want to PERMANENTLY delete the backup "${filename}"?`)) return;
        try {
            const res = await fetch(`/api/admin/backup-file/${encodeURIComponent(filename)}`, { method: 'DELETE' });
            if (res.ok) {
                showToast('Backup deleted successfully');
                loadBackups();
            } else {
                showToast('Delete failed', 'error');
            }
        } catch (err) {
            showToast('Error deleting backup', 'error');
        }
    };

    const restoreBackup = async (filename: string) => {
        if (!confirm(`WARNING: This will overwrite the current database with data from ${filename}. Are you sure?`)) {
            return;
        }
        try {
            const res = await fetch(`/api/admin/restore/${filename}`, { method: 'POST' });
            if (res.ok) {
                alert('Restore successful! Page will reload.');
                window.location.reload();
            } else {
                alert('Restore failed');
            }
        } catch (err) {
            alert('Error restoring backup');
        }
    };

    const handleFileRestore = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('backupFile', file);

        try {
            const res = await fetch('/api/admin/restore-categories-file', {
                method: 'POST',
                body: formData
            });
            if (res.ok) {
                alert('Categories restored successfully! Page will reload.');
                window.location.reload();
            } else {
                const data = await res.json();
                alert('Restore failed: ' + (data.error || 'Unknown error'));
            }
        } catch (err) {
            alert('Error restoring categories from file');
        } finally {
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    return (
        <div id="backups" className="section active">
            <h2 style={{ margin: '0 0 20px 0' }}>Backup & Restore</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px', alignItems: 'flex-start' }}>
                <button className="btn btn-backup" onClick={createBackup} 
                    style={{ background: '#4a90e2', padding: '12px 24px', minWidth: '250px', textAlign: 'left' }}>
                    Create Backup
                </button>
                <button className="btn btn-backup" onClick={createCategoryBackup}
                    style={{ background: '#4a90e2', padding: '12px 24px', minWidth: '250px', textAlign: 'left' }}>
                    Backup Categories
                </button>
                <button className="btn btn-save" onClick={() => fileInputRef.current?.click()}
                    style={{ background: '#10b981', padding: '12px 24px', minWidth: '250px', textAlign: 'left' }}>
                    Restore Categories from File
                </button>
                <input 
                    type="file" 
                    id="restore-cat-file" 
                    accept=".json" 
                    onChange={handleFileRestore}
                    style={{ display: 'none' }}
                    ref={fileInputRef}
                />
            </div>
            <h3>Available Backups</h3>
            <div className="table-wrapper" style={{ overflowX: 'auto', minWidth: 'auto' }}>
                <table id="backup-table" style={{ minWidth: '600px' }}>
                    <thead>
                        <tr>
                            <th style={{ position: 'static', borderRight: 'none', minWidth: '70vw', textAlign: 'left' }}>Filename</th>
                            <th style={{ maxWidth: '1vw', textAlign: 'center' }}>Date</th>
                            <th style={{ minWidth: '8vw', textAlign: 'center' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                             <tr><td colSpan={3}>Loading backups...</td></tr>
                        ) : backups.length === 0 ? (
                             <tr><td colSpan={3} style={{ textAlign: 'center' }}>No backups found</td></tr>
                        ) : (
                            backups.map(f => (
                                <tr key={f.filename}>
                                    <td style={{ textAlign: 'left' }}><strong>{f.filename}</strong></td>
                                    <td style={{ textAlign: 'center' }}><small>{new Date(f.created).toLocaleString()}</small></td>
                                    <td style={{ textAlign: 'center' }}>
                                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', whiteSpace: 'nowrap' }}>
                                            <button className="btn btn-save" style={{ backgroundColor: '#4a90e2', padding: '6px 12px' }} onClick={() => restoreBackup(f.filename)}>Restore</button>
                                            <button className="btn btn-restore" style={{ padding: '6px 12px' }} onClick={() => deleteBackup(f.filename)}>Delete</button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
