"use client";
import React, { useState, useEffect } from 'react';
import { useAdmin } from '@/context/AdminContext';
import { Category, Item } from '@/types';

import EditableCell from './EditableCell';
import CustomSelect from './CustomSelect';

// Helper to format/parse currency
const formatPrice = (p: number | undefined | null) => {
    const val = Number(p) || 0;
    return val.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const parsePrice = (val: string) => {
    // Remove currency, whitespace, replace German comma with dot
    const clean = val.replace(/[^\d,.-]/g, '').replace(',', '.');
    return parseFloat(clean) || 0;
};

export default function MenuEditor({ searchQuery = '' }: { searchQuery?: string }) {
    const { categories, items, zutaten, refreshData, showToast } = useAdmin();
    const [isAddItemOpen, setIsAddItemOpen] = useState(false);
    
    const [newItem, setNewItem] = useState<Partial<Item>>({
        name: '', description: '', category_id: 0, price_type: 1, 
        price: 0, price_s: 0, price_m: 0, price_l: 0, price_xl: 0,
        goods_item: 1, cartid: '', show_menu: 0
    });

    const decodeHtmlEntities = (str: string) => {
        if (!str) return '';
        if (typeof window === 'undefined') return str;
        const txt = document.createElement('textarea');
        txt.innerHTML = str;
        return txt.value;
    };

    // Global tracking of unsaved changes
    const [pendingChanges, setPendingChanges] = useState<Record<number, Item>>({});
    const [isSavingAll, setIsSavingAll] = useState(false);

    const handleUpdateItem = (item: Item, isModified: boolean) => {
        setPendingChanges(prev => {
            const next = { ...prev };
            if (isModified) {
                next[item.id!] = item;
            } else {
                delete next[item.id!];
            }
            return next;
        });
    };

    const handleSaveAll = async () => {
        const itemsToSave = Object.values(pendingChanges);
        if (itemsToSave.length === 0) return;

        setIsSavingAll(true);
        let successCount = 0;
        
        try {
            // Processing sequentially to avoid overwhelming the connection pool
            // though parallel with Promise.all could also work if the server can handle it.
            for (const item of itemsToSave) {
                const res = await fetch(`/api/admin/items/${item.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(item)
                });
                if (res.ok) successCount++;
            }

            if (successCount === itemsToSave.length) {
                showToast(`Saved ${successCount} items successfully`);
            } else {
                showToast(`Saved ${successCount}/${itemsToSave.length} items. Some failed.`, 'error');
            }
        } catch (err) {
            showToast('Error during bulk save', 'error');
        } finally {
            setIsSavingAll(false);
            setPendingChanges({});
            refreshData();
        }
    };

    const pendingCount = Object.keys(pendingChanges).length;

    // Helper to format/parse currency
    const formatPrice = (p: number | undefined | null) => {
        const val = Number(p) || 0;
        return val.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };

    const parsePrice = (val: string) => {
        // Remove currency, whitespace, replace German comma with dot
        const clean = val.replace(/[^\d,.-]/g, '').replace(',', '.');
        return parseFloat(clean) || 0;
    };

    const handleAddItem = async () => {
        if (!newItem.name || !newItem.category_id) {
            showToast('Name and Category are required', 'error');
            return;
        }

        try {
            const res = await fetch('/api/admin/items', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newItem)
            });
            if (res.ok) {
                showToast('Item created');
                setIsAddItemOpen(false);
                setNewItem({
                    name: '', description: '', category_id: 0, price_type: 1, 
                    price: 0, price_s: 0, price_m: 0, price_l: 0, price_xl: 0,
                    goods_item: 1, cartid: '', show_menu: 0
                });
                refreshData();
            } else {
                showToast('Failed to create item', 'error');
            }
        } catch (err) {
            showToast('Error creating item', 'error');
        }
    };

    // Delete Confirmation State
    const [itemToDelete, setItemToDelete] = useState<{id: number, name: string} | null>(null);

    // Bulk Deletion State
    const [markedForDeletion, setMarkedForDeletion] = useState<Set<number>>(new Set());
    const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);
    const [deletionSelection, setDeletionSelection] = useState<Set<number>>(new Set());

    const toggleDeletionMark = (id: number, forceState?: boolean) => {
        setMarkedForDeletion(prev => {
            const next = new Set(prev);
            if (forceState !== undefined) {
                 if (forceState) next.add(id);
                 else next.delete(id);
            } else {
                 if (next.has(id)) next.delete(id);
                 else next.add(id);
            }
            return next;
        });
    };

    const confirmDelete = async () => {
        if (!itemToDelete) return;
        try {
            const res = await fetch(`/api/admin/items/${itemToDelete.id}`, { method: 'DELETE' });
            if (res.ok) {
                showToast('Item deleted');
                refreshData();
                // Also remove from marked if present
                if (markedForDeletion.has(itemToDelete.id)) {
                    toggleDeletionMark(itemToDelete.id, false);
                }
            } else {
                showToast('Failed to delete item', 'error');
            }
        } catch (err) {
            showToast('Error deleting item', 'error');
        } finally {
            setItemToDelete(null);
        }
    };

    const handleBulkDeleteClick = () => {
        if (markedForDeletion.size === 0) return;
        setDeletionSelection(new Set(markedForDeletion));
        setShowBulkDeleteConfirm(true);
    };

    const toggleSelectionInModal = (id: number) => {
        setDeletionSelection(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const performBulkDelete = async () => {
        if (deletionSelection.size === 0) return;
        
        let successCount = 0;
        const itemsToDelete = Array.from(deletionSelection);
        
        try {
            for (const id of itemsToDelete) {
                const res = await fetch(`/api/admin/items/${id}`, { method: 'DELETE' });
                if (res.ok) successCount++;
            }

            if (successCount === itemsToDelete.length) {
                showToast(`Deleted ${successCount} items successfully`);
                // Clear all marks, assuming operation is done
                setMarkedForDeletion(new Set());
            } else {
                showToast(`Deleted ${successCount}/${itemsToDelete.length} items. Some failed.`, 'error');
                // Refresh marks to only remaining ones?
                // For now, let's just refresh data and keep marks for failed ones if possible, but simplest is to clear or re-evaluate.
                // We'll just refreshData which updates the list, but marks are by ID.
                // If items are gone, marks on them are irrelevant.
                // If we want to be precise, we should filter `markedForDeletion` to exclude `deletionSelection` (successful ones).
                setMarkedForDeletion(prev => {
                    const next = new Set(prev);
                    itemsToDelete.forEach(id => next.delete(id)); // simplistic assumption of success
                    return next;
                });
            }
        } catch (err) {
            showToast('Error during bulk delete', 'error');
        } finally {
            refreshData();
            setShowBulkDeleteConfirm(false);
        }
    };

    return (
        <div id="menu" className="section active">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    <button className="add-item-btn" onClick={() => setIsAddItemOpen(!isAddItemOpen)} style={{ marginBottom: 0 }}>
                        <span style={{ fontSize: '18px' }}>+</span> Add Item
                    </button>
                    {markedForDeletion.size > 0 && (
                         <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#fffaf0', padding: '8px 12px', borderRadius: '8px', border: '1px solid #ed8936' }}>
                            <span style={{ color: '#c05621', fontWeight: 600 }}>{markedForDeletion.size} marked</span>
                            <button onClick={() => setMarkedForDeletion(new Set())} style={{ background: 'transparent', border: 'none', color: '#c05621', cursor: 'pointer', textDecoration: 'underline' }}>Clear</button>
                         </div>
                    )}
                </div>
            </div>

            {/* Custom Delete Confirmation Modal */}
            {itemToDelete && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 3000
                }}>
                    <div style={{
                        background: 'white', padding: '24px', borderRadius: '12px',
                        boxShadow: '0 4px 6px rgba(0,0,0,0.1)', maxWidth: '400px', width: '90%'
                    }}>
                        <h3 style={{ marginTop: 0, fontSize: '1.25rem', color: '#1a202c' }}>Confirm Deletion</h3>
                        <p style={{ color: '#4a5568', margin: '16px 0' }}>Are you sure you want to delete <strong>{itemToDelete.name}</strong>? This action cannot be undone.</p>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                            <button 
                                onClick={() => setItemToDelete(null)}
                                style={{
                                    padding: '8px 16px', borderRadius: '6px', border: '1px solid #e2e8f0',
                                    background: 'white', color: '#4a5568', cursor: 'pointer', fontWeight: 600
                                }}
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={confirmDelete}
                                style={{
                                    padding: '8px 16px', borderRadius: '6px', border: 'none',
                                    background: '#e53e3e', color: 'white', cursor: 'pointer', fontWeight: 600
                                }}
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Bulk Delete Confirmation Modal (Cart Style) */}
            {showBulkDeleteConfirm && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 3000
                }}>
                    <div style={{
                        background: 'white', padding: '24px', borderRadius: '12px',
                        boxShadow: '0 4px 6px rgba(0,0,0,0.1)', maxWidth: '500px', width: '90%', maxHeight: '80vh', display: 'flex', flexDirection: 'column'
                    }}>
                        <h3 style={{ marginTop: 0, fontSize: '1.25rem', color: '#1a202c', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px' }}>
                            Review Deletion ({deletionSelection.size})
                        </h3>
                        
                        <div style={{ flex: 1, overflowY: 'auto', margin: '16px 0', border: '1px solid #edf2f7', borderRadius: '8px' }}>
                            {items.filter(i => markedForDeletion.has(i.id!)).map(item => (
                                <div key={item.id} style={{ 
                                    padding: '8px 12px', borderBottom: '1px solid #edf2f7', display: 'flex', alignItems: 'center', gap: '12px',
                                    backgroundColor: deletionSelection.has(item.id!) ? 'transparent' : '#f7fafc',
                                    opacity: deletionSelection.has(item.id!) ? 1 : 0.6
                                }}>
                                    <input 
                                        type="checkbox" 
                                        checked={deletionSelection.has(item.id!)}
                                        onChange={() => toggleSelectionInModal(item.id!)}
                                        style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                                    />
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: 500, color: '#2d3748' }}>{item.name || 'Unnamed Item'}</div>
                                        {item.description && (
                                            <div style={{ fontSize: '0.8rem', color: '#718096', marginTop: '2px', whiteSpace: 'pre-wrap' }}>
                                                {item.description}
                                            </div>
                                        )}
                                    </div>
                                    <div style={{ fontSize: '0.875rem', color: '#718096' }}>
                                        {formatPrice(item.price || item.price_s)}€
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #e2e8f0', paddingTop: '16px' }}>
                            <div style={{ fontSize: '0.875rem', color: '#718096' }}>
                                {items.filter(i => markedForDeletion.has(i.id!)).length} marked total
                            </div>
                            <div style={{ display: 'flex', gap: '12px' }}>
                                <button 
                                    onClick={() => setShowBulkDeleteConfirm(false)}
                                    style={{
                                        padding: '8px 16px', borderRadius: '6px', border: '1px solid #e2e8f0',
                                        background: 'white', color: '#4a5568', cursor: 'pointer', fontWeight: 600
                                    }}
                                >
                                    Cancel
                                </button>
                                <button 
                                    onClick={performBulkDelete}
                                    disabled={deletionSelection.size === 0}
                                    style={{
                                        padding: '8px 16px', borderRadius: '6px', border: 'none',
                                        background: deletionSelection.size === 0 ? '#cbd5e0' : '#e53e3e', 
                                        color: 'white', cursor: deletionSelection.size === 0 ? 'not-allowed' : 'pointer', fontWeight: 600
                                    }}
                                >
                                    Delete ({deletionSelection.size})
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {isAddItemOpen && (
                <div className="add-item-panel open">
                    <h3>✨ Create New Menu Item</h3>
                    <div className="form-grid">
                        <div className="form-group full-width">
                            <label>Name</label>
                            <EditableCell 
                                value={newItem.name || ''} 
                                onChange={val => setNewItem({...newItem, name: val})} 
                                placeholder="Item name"
                            />
                        </div>
                        <div className="form-group full-width">
                            <label>Description</label>
                            <EditableCell 
                                value={newItem.description || ''} 
                                onChange={val => setNewItem({...newItem, description: val})} 
                                placeholder="Description"
                            />
                        </div>
                        <div className="form-group">
                            <label>Category</label>
                            <select 
                                value={newItem.category_id} 
                                onChange={e => setNewItem({...newItem, category_id: Number(e.target.value)})}
                            >
                                <option value={0}>Select Category</option>
                                {categories.map(cat => (
                                    <option key={cat.id} value={cat.order_id}>{cat.name}</option> 
                                    // Note: Legacy uses order_id for category linking? Or id? 
                                    // Legacy admin.js: `items.filter(i => i.category_id === cat.order_id);`
                                    // So it uses order_id.
                                ))}
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Cart ID</label>
                            <EditableCell 
                                value={newItem.cartid || ''} 
                                onChange={val => setNewItem({...newItem, cartid: val})} 
                                placeholder="e.g. P1"
                            />
                        </div>
                        <div className="form-group">
                            <label>Price Type</label>
                            <div 
                                className="editable-cell" 
                                style={{ cursor: 'pointer', textAlign: 'center', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                onClick={() => setNewItem({...newItem, price_type: newItem.price_type === 1 ? 2 : 1})}
                            >
                                {newItem.price_type || 1}
                            </div>
                        </div>
                        
                        {Number(newItem.price_type) === 1 ? (
                             <div className="form-group">
                                <label>Price</label>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                    <EditableCell 
                                        value={formatPrice(newItem.price)} 
                                        onChange={val => setNewItem({...newItem, price: parsePrice(val)})} 
                                        className="price-input"
                                    />
                                    <span>€</span>
                                </div>
                            </div>
                        ) : (
                            <>
                                <div className="form-group"><label>Price S</label><div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><EditableCell value={formatPrice(newItem.price_s)} onChange={val => setNewItem({...newItem, price_s: parsePrice(val)})} className="price-input" /><span>€</span></div></div>
                                <div className="form-group"><label>Price M</label><div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><EditableCell value={formatPrice(newItem.price_m)} onChange={val => setNewItem({...newItem, price_m: parsePrice(val)})} className="price-input" /><span>€</span></div></div>
                                <div className="form-group"><label>Price L</label><div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><EditableCell value={formatPrice(newItem.price_l)} onChange={val => setNewItem({...newItem, price_l: parsePrice(val)})} className="price-input" /><span>€</span></div></div>
                                <div className="form-group"><label>Price XL</label><div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><EditableCell value={formatPrice(newItem.price_xl)} onChange={val => setNewItem({...newItem, price_xl: parsePrice(val)})} className="price-input" /><span>€</span></div></div>
                            </>
                        )}
                         <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '10px' }}>
                            <label style={{ marginBottom: 0 }}>Goods Item</label>
                            <input 
                                type="checkbox" 
                                checked={newItem.goods_item === 1} 
                                onChange={e => setNewItem({...newItem, goods_item: e.target.checked ? 1 : 0})} 
                                style={{ width: 'auto', cursor: 'pointer', transform: 'scale(1.2)' }}
                            />
                            <label style={{ marginBottom: 0, marginLeft: '10px' }}>Menü</label>
                            <input 
                                type="checkbox" 
                                checked={newItem.show_menu === 1} 
                                onChange={e => setNewItem({...newItem, show_menu: e.target.checked ? 1 : 0})} 
                                style={{ width: 'auto', cursor: 'pointer', transform: 'scale(1.2)' }}
                            />
                        </div>
                    </div>
                    <div className="btn-row">
                        <button className="btn btn-create" onClick={handleAddItem}>Create Item</button>
                        <button className="btn btn-cancel" onClick={() => setIsAddItemOpen(false)}>Cancel</button>
                    </div>
                </div>
            )}

            <div id="content">
                {categories.map(cat => {
                    const catItems = items.filter(i => i.category_id === cat.order_id);
                    
                    // Simple search filter
                    if (searchQuery) {
                        const query = searchQuery.toLowerCase();
                        const decodedCatName = decodeHtmlEntities(cat.name).toLowerCase();
                        const catMatch = decodedCatName.includes(query);
                        const itemMatch = catItems.some(i => {
                            const decodedItemName = decodeHtmlEntities(i.name || '').toLowerCase();
                            const decodedItemDesc = decodeHtmlEntities(i.description || '').toLowerCase();
                            return decodedItemName.includes(query) || 
                                   decodedItemDesc.includes(query) ||
                                   (i.cartid && i.cartid.toLowerCase().includes(query));
                        });
                        
                        if (!catMatch && !itemMatch) return null;
                    }

                    return (
                        <CategoryMenuCard 
                            key={cat.id} 
                            category={cat} 
                            categories={categories}
                            items={searchQuery ? catItems.filter(i => {
                                const decodedCatName = decodeHtmlEntities(cat.name).toLowerCase();
                                const decodedItemName = decodeHtmlEntities(i.name || '').toLowerCase();
                                const decodedItemDesc = decodeHtmlEntities(i.description || '').toLowerCase();
                                
                                return decodedCatName.includes(searchQuery.toLowerCase()) || 
                                       decodedItemName.includes(searchQuery.toLowerCase()) ||
                                       decodedItemDesc.includes(searchQuery.toLowerCase()) ||
                                       (i.cartid && i.cartid.toLowerCase().includes(searchQuery.toLowerCase()))
                            }) : catItems} 
                            newItem={newItem}
                            onItemUpdate={handleUpdateItem}
                            onRequestDelete={(id, name) => setItemToDelete({id, name})}
                            isMarked={(id) => markedForDeletion.has(id)}
                            onToggleMark={toggleDeletionMark}
                            isBulkSaved={!isSavingAll && pendingCount === 0}
                        />
                    );
                })}
            </div>

            {/* Sticky Footers */}
            {markedForDeletion.size > 0 && (
                <div className="bulk-delete-notice">
                    <div className="notice-content">
                        <span className="count-badge">{markedForDeletion.size}</span>
                        <span className="notice-text">For Deletion marked items</span>
                    </div>
                    <button 
                        className="btn btn-delete-all" 
                        onClick={handleBulkDeleteClick}
                    >
                        DELETE ALL
                    </button>
                </div>
            )}

            {pendingCount > 0 && (
                <div className="save-all-notice">
                    <div className="notice-content">
                        <span className="count-badge">{pendingCount}</span>
                        <span className="notice-text">Unsaved Changes</span>
                    </div>
                    <button 
                        className="btn btn-save-all" 
                        onClick={handleSaveAll}
                        disabled={isSavingAll}
                    >
                        {isSavingAll ? 'Saving...' : 'Save All Changes'}
                    </button>
                </div>
            )}
        </div>
    );
}

// Updating Component Signature for CategoryMenuCard ...

// Update signature
function CategoryMenuCard({ category, items, categories, newItem, onItemUpdate, onRequestDelete, isMarked, onToggleMark, isBulkSaved }: { 
    category: Category, 
    items: Item[], 
    categories: Category[],
    newItem: Partial<Item>,
    onItemUpdate: (item: Item, isModified: boolean) => void,
    onRequestDelete: (id: number, name: string) => void,
    isMarked: (id: number) => boolean,
    onToggleMark: (id: number, forceState?: boolean) => void,
    isBulkSaved: boolean
}) {
    // Track local type changes to update grid layout immediately
    const [typeOverrides, setTypeOverrides] = useState<Record<number, number>>({});

    // Check if the newItem in the form above is currently targeting this category
    const isAddingToThis = newItem.category_id === category.order_id;
    const addingPriceType = Number(newItem.price_type) || 1;

    // Determine visibility based on content (checking overrides first, and factoring in what's being added)
    const getEffectiveType = (item: Item) => {
        const override = typeOverrides[item.id];
        if (override !== undefined) return Number(override);
        return Number(item.price_type) === 2 ? 2 : 1;
    };
    
    // hasSingle: At least one item is type 1, OR we are adding a type 1 item to an empty-ish category
    const hasSingle = items.some(i => getEffectiveType(i) === 1) || (isAddingToThis && addingPriceType === 1);
    const hasMulti = items.some(i => getEffectiveType(i) === 2) || (isAddingToThis && addingPriceType === 2);
    const hasMenu = items.some(i => i.show_menu === 1) || (isAddingToThis && newItem.show_menu === 1);

    // If perfectly empty and not adding, show single price header as default
    const effectiveHasSingle = items.length === 0 && !isAddingToThis ? true : hasSingle;

    // Construct grid template: Only Description is fluid (1fr)
    // Construct grid template: Only Description is fluid (1fr)
    let template = "4.5rem 4.5rem 6rem 12rem 14rem minmax(18rem, 1fr) 4.5rem 4rem 4rem "; 

    if (effectiveHasSingle) template += "6rem "; // Price column
    if (hasMulti) template += "6rem 6rem 6rem 6rem "; // M, L, XL, XXL
    if (hasMenu) template += "4.5rem 4.5rem 4.5rem "; // M1, M2, M3
    
    template += "4.5rem"; // Save column

    const handleTypeChange = (id: number, type: number) => {
        setTypeOverrides(prev => ({ ...prev, [id]: type }));
    };

    return (
        <div className="category-card">
            <div className="category-card-header">
                <h2>
                    <span dangerouslySetInnerHTML={{ __html: category.name }} />
                    <span style={{fontSize: '13px', fontWeight: 500, color: '#718096', marginLeft: '10px'}}>ID: {category.id} | Order: {category.order_id}</span>
                </h2>
            </div>
            <div className="category-card-body">
                <div className="table-wrapper">
                    <div className="grid-table" style={{ display: 'grid', gridTemplateColumns: template }}>
                        <div className="grid-header">
                            <div className="grid-cell header-cell">ID</div>
                            <div className="grid-cell header-cell">Del</div>
                            <div className="grid-cell header-cell">Cart ID</div>
                            <div className="grid-cell header-cell">Cat ID</div>
                            <div className="grid-cell header-cell col-name">Name</div>
                            <div className="grid-cell header-cell col-desc">Description</div>
                            <div className="grid-cell header-cell">Type</div>
                            <div className="grid-cell header-cell">Goods</div>
                            <div className="grid-cell header-cell">Menü</div>
                            {effectiveHasSingle && <div className="grid-cell header-cell col-price">Price</div>}
                            {hasMulti && (
                                <>
                                    <div className="grid-cell header-cell">S</div>
                                    <div className="grid-cell header-cell">M</div>
                                    <div className="grid-cell header-cell">L</div>
                                    <div className="grid-cell header-cell">XL</div>
                                </>
                            )}
                            {hasMenu && (
                                <>
                                    <div className="grid-cell header-cell">M1</div>
                                    <div className="grid-cell header-cell">M2</div>
                                    <div className="grid-cell header-cell">M3</div>
                                </>
                            )}
                            <div className="grid-cell header-cell">Save</div>
                        </div>
                        {items.length === 0 ? (
                            <div style={{ gridColumn: '1 / -1', padding: '20px', textAlign: 'center' }}>No items found in this category</div>
                        ) : (
                            items.map(item => <ItemRow 
                                key={item.id} 
                                item={item} 
                                categories={categories}
                                showSingle={effectiveHasSingle} 
                                showMulti={hasMulti} 
                                showMenu={hasMenu}
                                onTypeChange={handleTypeChange}
                                onUpdate={onItemUpdate}
                                onRequestDelete={onRequestDelete}
                                isMarked={isMarked(item.id!)}
                                onToggleMark={onToggleMark}
                                isBulkSaved={isBulkSaved}
                            />)
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

function ItemRow({ item, categories, showSingle, showMulti, showMenu, onTypeChange, onUpdate, onRequestDelete, isMarked, onToggleMark, isBulkSaved }: { 
    item: Item, 
    categories: Category[],
    showSingle: boolean, 
    showMulti: boolean, 
    showMenu: boolean,
    onTypeChange: (id: number, type: number) => void,
    onUpdate: (item: Item, isModified: boolean) => void,
    onRequestDelete: (id: number, name: string) => void,
    isMarked: boolean,
    onToggleMark: (id: number, forceState?: boolean) => void,
    isBulkSaved: boolean
}) {
    const { refreshData, showToast } = useAdmin();
    const [data, setData] = useState(item);
    const [isModified, setIsModified] = useState(false);

    useEffect(() => {
        setData(item);
        setIsModified(false);
    }, [item]);

    // Handle bulk save reset
    useEffect(() => {
        if (isBulkSaved && isModified) {
            setIsModified(false);
        }
    }, [isBulkSaved, isModified]);

    const handleChange = (field: keyof Item, value: any) => {
        const newData = { ...data, [field]: value };
        setData(newData);
        setIsModified(true);
        onUpdate(newData, true);
        
        if (field === 'price_type') {
            onTypeChange(item.id!, Number(value));
        }
    };

    const handleSave = async () => {
        try {
            const res = await fetch(`/api/admin/items/${data.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            if (res.ok) {
                showToast('Item saved');
                setIsModified(false);
                onUpdate(data, false); // Remove from global pending list
                refreshData();
            } else {
                showToast('Failed to save item', 'error');
            }
        } catch (err) {
            showToast('Error saving item', 'error');
        }
    };

    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation();

        if (e.shiftKey) {
            // Mark for deletion
            onToggleMark(item.id!, true);
            return;
        }

        if (e.altKey && isMarked) {
             // Unmark
             onToggleMark(item.id!, false);
             return;
        }

        if (data.id) {
            onRequestDelete(data.id, data.name || 'Unnamed Item');
        }
    };

    const isMultiPriceItem = Number(data.price_type) === 2;

    return (
        <div className={`grid-row ${isModified ? 'modified' : ''}`}>
            <div className="grid-cell" data-label="ID" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'center', height: '100%', paddingTop: '8px' }}>
                <EditableCell value={String(data.id)} onChange={() => {}} readonly style={{ textAlign: 'center', width: '100%', border: 'none', background: 'transparent' }} />
            </div>
            <div className="grid-cell" data-label="Del" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'center', height: '100%' }}>
                <button 
                    type="button" 
                    className={`btn ${isMarked ? 'btn-marked-delete' : 'btn-delete'}`} 
                    onClick={handleDelete} 
                    style={{
                        padding: '0', 
                        fontSize: '18px', 
                        lineHeight: 1, 
                        height: '42px',
                        width: '42px',
                        minWidth: '42px',
                        maxWidth: '42px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                    title="Click to delete. Shift+Click to mark. Alt+Click to unmark."
                >
                    🗑
                </button>
            </div>
            <div className="grid-cell" data-label="Cart ID" style={{ display: 'flex', alignItems: 'flex-start', height: '100%' }}>
                <EditableCell value={data.cartid || ''} onChange={val => handleChange('cartid', val)} style={{ width: '100%' }} />
            </div>
            <div className="grid-cell" data-label="Cat ID" style={{ display: 'flex', alignItems: 'flex-start', height: '100%', paddingTop: '8px' }}>
                <CustomSelect
                    value={data.category_id || 0}
                    options={categories.map(cat => ({ value: cat.order_id || 0, label: cat.name }))}
                    onChange={(val) => handleChange('category_id', Number(val))}
                    placeholder="Category"
                    height="42px"
                />
            </div>
            <div className="grid-cell col-name" data-label="Name" style={{ display: 'flex', alignItems: 'flex-start', height: '100%' }}>
                <EditableCell value={data.name || ''} onChange={val => handleChange('name', val)} style={{ width: '100%' }} />
            </div>
            <div className="grid-cell col-desc" data-label="Description" style={{ display: 'flex', alignItems: 'flex-start', height: '100%', overflow: 'hidden' }}>
                <div style={{ maxWidth: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', width: '100%' }}>
                    <EditableCell 
                        value={data.description || ''} 
                        onChange={val => handleChange('description', val)} 
                        style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'block' }} 
                    />
                </div>
            </div>
            <div className="grid-cell" data-label="Type" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'center', height: '100%' }}>
                <div 
                    className="editable-cell" 
                    style={{ cursor: 'pointer', textAlign: 'center', minHeight: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    onClick={() => handleChange('price_type', data.price_type === 1 ? 2 : 1)}
                >
                    {data.price_type || 1}
                </div>
            </div>
            <div className="grid-cell col-center" data-label="Goods" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'center', height: '100%', paddingTop: '8px' }}>
                <input 
                    type="checkbox" 
                    checked={Number(data.goods_item) === 1} 
                    onChange={e => {
                        const val = e.target.checked ? 1 : 0;
                        handleChange('goods_item', val);
                    }} 
                    style={{ transform: 'scale(1.1)', cursor: 'pointer' }}
                />
            </div>
            <div className="grid-cell col-center" data-label="Menü" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'center', height: '100%', paddingTop: '8px' }}>
                <input 
                    type="checkbox" 
                    checked={Number(data.show_menu) === 1} 
                    onChange={e => {
                        const val = e.target.checked ? 1 : 0;
                        handleChange('show_menu', val);
                    }} 
                    style={{ transform: 'scale(1.1)', cursor: 'pointer' }}
                />
            </div>

            {/* Single Price Cell */}
            {showSingle && (
                <div className="grid-cell col-price" data-label="Price" style={{ display: 'flex', alignItems: 'flex-start', gap: '4px' }}>
                    {!isMultiPriceItem && (
                        <>
                            <EditableCell value={formatPrice(data.price)} onChange={val => handleChange('price', parsePrice(val))} className="price-input" />
                            <span style={{ marginTop: '10px' }}>€</span>
                        </>
                    )}
                </div>
            )}

            {/* Multi Price Cells */}
            {showMulti && (
                <>
                    <div className="grid-cell" data-label="S / P1" style={{ display: 'flex', alignItems: 'flex-start', gap: '4px' }}>{isMultiPriceItem && <><EditableCell value={formatPrice(data.price_s)} onChange={val => handleChange('price_s', parsePrice(val))} className="price-input" /><span style={{ marginTop: '10px' }}>€</span></>}</div>
                    <div className="grid-cell" data-label="M / P2" style={{ display: 'flex', alignItems: 'flex-start', gap: '4px' }}>{isMultiPriceItem && <><EditableCell value={formatPrice(data.price_m)} onChange={val => handleChange('price_m', parsePrice(val))} className="price-input" /><span style={{ marginTop: '10px' }}>€</span></>}</div>
                    <div className="grid-cell" data-label="L / P3" style={{ display: 'flex', alignItems: 'flex-start', gap: '4px' }}>{isMultiPriceItem && <><EditableCell value={formatPrice(data.price_l)} onChange={val => handleChange('price_l', parsePrice(val))} className="price-input" /><span style={{ marginTop: '10px' }}>€</span></>}</div>
                    <div className="grid-cell" data-label="XL / P4" style={{ display: 'flex', alignItems: 'flex-start', gap: '4px' }}>{isMultiPriceItem && <><EditableCell value={formatPrice(data.price_xl)} onChange={val => handleChange('price_xl', parsePrice(val))} className="price-input" /><span style={{ marginTop: '10px' }}>€</span></>}</div>
                </>
            )}

            {showMenu && (
                <>
                    <div className="grid-cell" data-label="M1" style={{ display: 'flex', alignItems: 'flex-start', height: '100%' }}><EditableCell value={String(data.in_menu_1 || 0)} onChange={val => handleChange('in_menu_1', Number(val))} /></div>
                    <div className="grid-cell" data-label="M2" style={{ display: 'flex', alignItems: 'flex-start', height: '100%' }}><EditableCell value={String(data.in_menu_2 || 0)} onChange={val => handleChange('in_menu_2', Number(val))} /></div>
                    <div className="grid-cell" data-label="M3" style={{ display: 'flex', alignItems: 'flex-start', height: '100%' }}><EditableCell value={String(data.in_menu_3 || 0)} onChange={val => handleChange('in_menu_3', Number(val))} /></div>
                </>
            )}
            <div className="grid-cell" data-label="Save" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'center', height: '100%' }}>
                <button 
                    className="btn btn-save" 
                    onClick={handleSave} 
                    disabled={!isModified && !isMultiPriceItem && !data.goods_item && !data.show_menu}
                    style={{ 
                        opacity: isModified ? 1 : 0.7, 
                        width: '100%',
                        height: '42px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center' 
                    }}
                >
                    {isModified ? 'Save' : '✓'}
                </button>
            </div>
            {data.goods_item === 1 && (
                <div className="grid-subrow">
                    <div style={{ padding: '10px 20px 20px 60px' }}>
                        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '15px' }}>
                            <h4 style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#4a5568' }}>Goods Panel - Zutaten</h4>
                            <EditableCell 
                                value={data.zutaten || ''} 
                                onChange={val => handleChange('zutaten', val)}
                                placeholder="e.g. 1;2;3"
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

