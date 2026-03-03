"use client";
import React, { useState } from 'react';
import { useAdmin } from '@/context/AdminContext';
import { Category } from '@/types';

import EditableCell from './EditableCell';

export default function CategoryManager({ searchQuery = '' }: { searchQuery?: string }) {
    const { categories, refreshData, showToast } = useAdmin();
    const [isAddOpen, setIsAddOpen] = useState(false);

    const [newCat, setNewCat] = useState({ name: '', description: '', order_id: '', pic_url: '', additional_text: '' });
    const [unsavedCategories, setUnsavedCategories] = useState<Set<number>>(new Set());
    // However, for React, we usually bind inputs to state. 
    // We can use a local copy of categories for editing? 
    // Or just update the context state directly if we had a setCategories?
    // Context only provides data.
    // Better: Local state initialized from context, or just direct edits if we don't mind.
    // But we need to track "unsaved" state.
    
    // Let's create a sub-component for each Category Card to handle its own edit state.
    
    const handleAddCategory = async () => {
        if (!newCat.name) {
            showToast('Name is required', 'error');
            return;
        }

        try {
            const res = await fetch('/api/admin/categories', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...newCat,
                    order_id: newCat.order_id ? Number(newCat.order_id) : undefined
                })
            });
            
            if (res.ok) {
                showToast('Category created');
                setIsAddOpen(false);
                setNewCat({ name: '', description: '', order_id: '', pic_url: '', additional_text: '' });
                refreshData();
            } else {
                showToast('Failed to create category', 'error');
            }
        } catch (err) {
            showToast('Error creating category', 'error');
        }
    };

    const decodeHtmlEntities = (str: string) => {
        if (!str) return '';
        // Only run in browser
        if (typeof window === 'undefined') return str;
        const txt = document.createElement('textarea');
        txt.innerHTML = str;
        return txt.value;
    };

    return (
        <div id="categories" className="section active">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', alignItems: 'center', gap: '8px' }}>
                <button className="add-item-btn" onClick={() => setIsAddOpen(!isAddOpen)} style={{ marginBottom: 0 }}>
                    <span style={{ fontSize: '18px' }}>+</span> Add Category
                </button>
            </div>

            {isAddOpen && (
                <div className="add-item-panel open" style={{ marginBottom: '20px' }}>
                    <h3>Create New Category</h3>
                    <div className="form-grid">
                        <div className="form-group">
                            <label>Name *</label>
                            <EditableCell 
                                value={newCat.name || ''} 
                                onChange={val => setNewCat({...newCat, name: val})} 
                                placeholder="Category Name"
                            />
                        </div>
                         <div className="form-group">
                            <label>Order ID</label>
                            <EditableCell 
                                value={String(newCat.order_id || '')} 
                                onChange={val => setNewCat({...newCat, order_id: val})} 
                                placeholder="Auto"
                            />
                        </div>
                        <div className="form-group full-width">
                            <label>Description</label>
                            <EditableCell 
                                value={newCat.description || ''} 
                                onChange={val => setNewCat({...newCat, description: val})} 
                                placeholder="Description"
                            />
                        </div>
                         <div className="form-group full-width">
                            <label>Additional Text</label>
                            <EditableCell 
                                value={newCat.additional_text || ''} 
                                onChange={val => setNewCat({...newCat, additional_text: val})} 
                                placeholder="Additional Text"
                                minHeight="15vh"
                            />
                        </div>
                        <div className="form-group full-width">
                            <label>Pic URL</label>
                            <EditableCell 
                                value={newCat.pic_url || ''} 
                                onChange={val => setNewCat({...newCat, pic_url: val})} 
                                placeholder="/img/..."
                                minHeight="7vh"
                            />
                        </div>
                    </div>
                    <div className="btn-row">
                        <button className="btn btn-create" onClick={handleAddCategory}>Create Category</button>
                        <button className="btn btn-cancel" onClick={() => setIsAddOpen(false)}>Cancel</button>
                    </div>
                </div>
            )}

            <div id="categories-content" style={{ display: 'grid', gap: '24px', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))' }}>
                {categories.map(cat => {
                    if (searchQuery) {
                        const query = searchQuery.toLowerCase();
                        const decodedName = decodeHtmlEntities(cat.name).toLowerCase();
                        const decodedDesc = decodeHtmlEntities(cat.description || '').toLowerCase();
                        
                        if (!decodedName.includes(query) && !decodedDesc.includes(query)) {
                            return null;
                        }
                    }
                    return <CategoryCard key={cat.id} category={cat} />;
                })}
            </div>
        </div>
    );
}

function CategoryCard({ category }: { category: Category }) {
    const { refreshData, showToast } = useAdmin();
    const [data, setData] = useState(category);
    const [isModified, setIsModified] = useState(false);

    // Update local state if prop changes (e.g. after refresh)
    React.useEffect(() => {
        setData(category);
        setIsModified(false);
    }, [category]);

    const handleChange = (field: keyof Category, value: string | number | null) => {
        setData(prev => ({ ...prev, [field]: value }));
        setIsModified(true);
    };

    const handleSave = async () => {
        try {
            const res = await fetch(`/api/admin/categories/${data.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            if (res.ok) {
                showToast('Category saved');
                setIsModified(false);
                refreshData();
            } else {
                showToast('Failed to save category', 'error');
            }
        } catch (err) {
            showToast('Error saving category', 'error');
        }
    };

    const handleDelete = async () => {
        if (!confirm(`Delete category "${category.name}"?`)) return;
        try {
            const res = await fetch(`/api/admin/categories/${data.id}`, { method: 'DELETE' });
            if (res.ok) {
                showToast('Category deleted');
                refreshData();
            } else {
                showToast('Failed to delete category', 'error');
            }
        } catch (err) {
            showToast('Error deleting category', 'error');
        }
    };
    
    // Upload image handler could be added here
    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        
        const formData = new FormData();
        formData.append('image', file);
        formData.append('categoryId', String(data.id));
        
        try {
            const res = await fetch('/api/admin/upload', {
                method: 'POST',
                body: formData
            });
            const resData = await res.json();
            if (res.ok) {
                showToast('Image uploaded');
                handleChange('pic_url', resData.path);
            } else {
                showToast('Upload failed: ' + resData.error, 'error');
            }
        } catch(err) {
            showToast('Error uploading image', 'error');
        }
    };


    return (
        <div className={`category-card ${isModified ? 'modified' : ''}`} style={isModified ? { borderColor: 'var(--warning-border)', backgroundColor: 'var(--warning-color)' } : {}}>
            <div className="category-card-header">
                <h2>
                    <span dangerouslySetInnerHTML={{ __html: category.name || '' }} style={{ fontSize: '1.5rem', fontWeight: 'bold' }} /> 
                    <span>ID: {category.id}</span>
                </h2>
            </div>
            <div className="form-group" style={{ marginBottom: '10px' }}>
                <label style={{ fontSize: '12px', fontWeight: 600, color: '#4a5568' }}>Name</label>
                <EditableCell 
                    value={data.name || ''} 
                    onChange={val => handleChange('name', val)} 
                />
            </div>
            <div className="form-group" style={{ marginBottom: '10px' }}>
                <label style={{ fontSize: '12px', fontWeight: 600, color: '#4a5568' }}>Description</label>
                <EditableCell 
                    value={data.description || ''} 
                    onChange={val => handleChange('description', val)}
                    minHeight="60px"
                />
            </div>
            <div className="form-group" style={{ marginBottom: '10px' }}>
                <label style={{ fontSize: '12px', fontWeight: 600, color: '#4a5568' }}>Additional Text</label>
                <EditableCell 
                    value={data.additional_text || ''} 
                    onChange={val => handleChange('additional_text', val)}
                    minHeight="15vh"
                />
            </div>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                <div className="form-group" style={{ flex: 1 }}>
                     <label style={{ fontSize: '12px', fontWeight: 600, color: '#4a5568' }}>Order ID</label>
                     <EditableCell 
                        value={String(data.order_id || '')} 
                        onChange={val => handleChange('order_id', Number(val))} 
                    />
                </div>
            </div>
             <div className="form-group" style={{ marginBottom: '15px' }}>
                <label style={{ fontSize: '12px', fontWeight: 600, color: '#4a5568' }}>Image</label>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <EditableCell 
                        value={data.pic_url || ''} 
                        onChange={val => handleChange('pic_url', val)} 
                        placeholder="/img/..."
                        minHeight="7vh"
                    />
                    <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleImageUpload}
                        style={{ display: 'none' }}
                        id={`upload-${data.id}`}
                    />
                    <label htmlFor={`upload-${data.id}`} className="btn" style={{ background: '#718096', padding: '8px 12px', whiteSpace: 'nowrap' }}>
                        Upload
                    </label>
                </div>
                {data.pic_url ? (
                    <img src={data.pic_url} alt="Preview" style={{ marginTop: '10px', width: '100%', maxHeight: '50px', objectFit: 'cover', borderRadius: '4px', display: 'block' }} />
                ) : (
                    <div style={{ marginTop: '10px', width: '100%', height: '50px', backgroundColor: '#f0f0f0', border: '1px solid #e2e8f0', borderRadius: '4px', position: 'relative', overflow: 'hidden' }}>
                        <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}>
                            <line x1="0" y1="0" x2="100%" y2="100%" stroke="#cbd5e0" strokeWidth="1.5" />
                            <line x1="100%" y1="0" x2="0" y2="100%" stroke="#cbd5e0" strokeWidth="1.5" />
                        </svg>
                    </div>
                )}
            </div>

            <div className="cat-actions">
                <button className="btn btn-save" onClick={handleSave} disabled={!isModified}>Save</button>
                <button className="btn btn-restore" onClick={handleDelete}>Delete</button>
            </div>
        </div>
    );
}
