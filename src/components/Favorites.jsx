import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import NoteContext from '../context/notes/NoteContext';
import Noteitem from './Noteitem';
import NoteModal from './NoteModal';
import Layout from './Layout';

const Favorites = () => {
    const context = useContext(NoteContext);
    const { notes, favoriteNotes, getFavoriteNotes, removeFavorite } = context;

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [toastMessage, setToastMessage] = useState(null);

    // Preview modal (same behavior as Notes)
    const [selectedNote, setSelectedNote] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Local list for immediate rendering on navigation.
    // Source of truth remains context (notes/favoriteNotes) via sync effect below.
    const [favorites, setFavorites] = useState(() => (Array.isArray(favoriteNotes) ? favoriteNotes : []));

    const mountedRef = useRef(true);
    const ownerName = localStorage.getItem('name');

    useEffect(() => {
        mountedRef.current = true;

        const load = async () => {
            if (loading) return;
            setLoading(true);
            setError(null);
            try {
                // Fetch once on mount to ensure favorites show even if notes aren't loaded yet.
                const res = await getFavoriteNotes();
                if (mountedRef.current) setFavorites(Array.isArray(res?.notes) ? res.notes : []);
            } catch (err) {
                if (mountedRef.current) setError(err?.message || 'Failed to load favorite notes.');
            } finally {
                if (mountedRef.current) setLoading(false);
            }
        };

        load();
        return () => {
            mountedRef.current = false;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Sync favorites with global notes state (instant updates when starring/un-starring in Notes)
    useEffect(() => {
        if (!Array.isArray(notes) || notes.length === 0) return;

        setFavorites((prev) => {
            const byId = new Map();
            (Array.isArray(prev) ? prev : []).forEach((n) => {
                const id = n?.id ?? n?._id;
                if (id != null) byId.set(id, n);
            });

            notes.forEach((n) => {
                const id = n?.id ?? n?._id;
                if (id == null) return;

                if (n?.is_deleted || !n?.is_favorite) {
                    byId.delete(id);
                } else {
                    byId.set(id, n);
                }
            });

            return Array.from(byId.values());
        });
    }, [notes]);

    const showToast = (msg) => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(null), 3000);
    };

    const handleExpand = useCallback((note) => {
        setSelectedNote(note);
        setIsModalOpen(true);
    }, []);

    const handleCloseModal = useCallback(() => {
        setIsModalOpen(false);
        setSelectedNote(null);
    }, []);

    const handleRemoveFavorite = useCallback(async (id) => {
        const prev = favorites;
        setFavorites((f) => f.filter((n) => (n?.id ?? n?._id) !== id));

        const res = await removeFavorite(id);
        if (!res.success) {
            alert('Failed to remove favorite: ' + (res.error || 'unknown'));
            setFavorites(prev);
            return;
        }
        showToast('Removed from favorites');
    }, [favorites, removeFavorite]);

    const formatDateTime = (value) => {
        if (!value) return null;
        const d = new Date(value);
        if (Number.isNaN(d.getTime())) return null;
        return d.toLocaleString();
    };

    const getMs = (value) => {
        if (!value) return NaN;
        const t = Date.parse(value);
        return Number.isFinite(t) ? t : NaN;
    };

    const getTimestampText = (n) => {
        const createdMs = getMs(n?.created_at);
        const updatedMs = getMs(n?.updated_at);

        const createdLabel = formatDateTime(n?.created_at);
        const updatedLabel = formatDateTime(n?.updated_at);

        if (createdLabel && updatedLabel && Number.isFinite(createdMs) && Number.isFinite(updatedMs)) {
            if (createdMs === updatedMs) return `Created: ${createdLabel}`;
            return `Created: ${createdLabel} | Updated: ${updatedLabel}`;
        }

        if (createdLabel && updatedLabel) {
            if (n?.created_at === n?.updated_at) return `Created: ${createdLabel}`;
            return `Created: ${createdLabel} | Updated: ${updatedLabel}`;
        }

        if (createdLabel) return `Created: ${createdLabel}`;
        if (updatedLabel) return `Updated: ${updatedLabel}`;
        return '';
    };

    const safeFavorites = Array.isArray(favorites) ? favorites : [];

    const sortedFavorites = useMemo(() => {
        const getTime = (n) => {
            const tUpdated = getMs(n?.updated_at);
            if (Number.isFinite(tUpdated)) return tUpdated;
            const tCreated = getMs(n?.created_at);
            if (Number.isFinite(tCreated)) return tCreated;
            return 0;
        };
        return [...safeFavorites].sort((a, b) => getTime(b) - getTime(a));
    }, [safeFavorites]);

    return (
        <>
            <Layout>
                <main className="dashboard-main">
                    <NoteModal
                        note={selectedNote}
                        isOpen={isModalOpen}
                        onClose={handleCloseModal}
                        onEditSuccess={() => {}}
                    />

                    {/* Top Profile Bar */}
                    <div className="dashboard-top">
                        <div className="search-container" style={{ visibility: 'hidden' }}>
                            {/* Placeholder to keep alignment */}
                        </div>
                        <div className="profile-container">
                            <div className="profile-info">
                                <div className="profile-name">{ownerName || 'A'}</div>
                                <div className="profile-status">Pro Member</div>
                            </div>
                            <div className="profile-avatar">
                                <Link to="/profile"><i className="bi bi-person-fill" style={{ color: '#c2410c' }}></i></Link>
                            </div>
                        </div>
                    </div>

                    {/* Status Messages */}
                    <div className="mb-3">
                        {loading && <p className="text-muted">Loading favorites...</p>}
                        {!loading && error && (
                            <p className="text-danger">Unable to load favorites. Please try again later.</p>
                        )}
                        {!loading && !error && safeFavorites.length === 0 && <p className="text-muted">No favorite notes yet</p>}
                    </div>

                    {/* Notes Grid */}
                    <h2 className="notes-section-title">
                        Favorites
                        <span className="notes-badge">{safeFavorites.length}</span>
                    </h2>

                    <div className="notes-grid">
                        {sortedFavorites.map((n, idx) => {
                            const key = n?.id ?? n?._id ?? idx;
                            return (
                                <Noteitem
                                    key={key}
                                    note={n}
                                    onExpand={handleExpand}
                                    onDelete={() => {}}
                                    timestampText={getTimestampText(n)}
                                    mode="favorites"
                                    onRemoveFavorite={handleRemoveFavorite}
                                />
                            );
                        })}
                    </div>
                </main>
            </Layout>

            {/* Toast renders outside Layout so it floats above all content */}
            {toastMessage && (
                <div style={{
                    position: 'fixed',
                    bottom: '20px',
                    right: '20px',
                    background: '#111827',
                    color: '#ffffff',
                    padding: '12px 24px',
                    borderRadius: '8px',
                    zIndex: 1050,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    fontWeight: 500,
                    fontSize: '0.95rem',
                    animation: 'fadeInOut 3s forwards'
                }}>
                    {toastMessage}
                </div>
            )}

            <style>{`
                @keyframes fadeInOut {
                    0% { opacity: 0; transform: translateY(20px); }
                    10% { opacity: 1; transform: translateY(0); }
                    90% { opacity: 1; transform: translateY(0); }
                    100% { opacity: 0; transform: translateY(20px); pointer-events: none; }
                }
            `}</style>
        </>
    );
};

export default Favorites;
