import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import NoteContext from "../context/notes/NoteContext";
import TrashNoteItem from './TrashNoteItem';
import { Link } from 'react-router-dom';
import Layout from './Layout';

const Trash = () => {
    const context = useContext(NoteContext);
    const { trashNotes, getTrashNotes, deletePermanentNote, emptyTrash, restoreNote } = context;
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [toastMessage, setToastMessage] = useState(null);
    const [infoMessage, setInfoMessage] = useState('');
    const ownerName = localStorage.getItem("name");

    useEffect(() => {
        let mounted = true;

        const load = async () => {
            if (loading) return;
            setLoading(true);
            setError(null);
            try {
                await getTrashNotes();
            } catch (err) {
                if (mounted) setError(err?.message || "Failed to load trash notes.");
            } finally {
                if (mounted) setLoading(false);
            }
        };
        load();

        return () => {
            mounted = false;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const showToast = (msg) => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(null), 3000);
    };

    const handleDeleteForever = useCallback(async (id) => {
        if (window.confirm("Are you sure you want to permanently delete this note?")) {
            await deletePermanentNote(id);
            showToast("Note permanently deleted");
        }
    }, [deletePermanentNote]);

    const handleRestore = useCallback(async (id) => {
        await restoreNote(id);
        showToast("Note restored");
    }, [restoreNote]);

    const handleEmptyTrash = useCallback(async () => {
        if (window.confirm("Are you sure you want to empty the trash? This action cannot be undone.")) {
            await emptyTrash();
            showToast("Trash emptied");
        }
    }, [emptyTrash]);

    const handleTrashNoteClick = useCallback(() => {
        setInfoMessage("Restore to read full content");
    }, []);

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
        const createdLabel = formatDateTime(n?.created_at);
        const updatedLabel = formatDateTime(n?.updated_at);

        if (createdLabel && updatedLabel) {
            return `Created: ${createdLabel}`;
        }
        if (createdLabel) return `Created: ${createdLabel}`;
        return '';
    };

    const safeNotes = Array.isArray(trashNotes) ? trashNotes : [];

    const sortedNotes = useMemo(() => {
        const getTime = (n) => {
            const tUpdated = getMs(n?.updated_at);
            if (Number.isFinite(tUpdated)) return tUpdated;
            const tCreated = getMs(n?.created_at);
            if (Number.isFinite(tCreated)) return tCreated;
            return 0;
        };

        return [...safeNotes].sort((a, b) => getTime(b) - getTime(a));
    }, [safeNotes]);

    return (
        <>
            <Layout>
                <main className="dashboard-main">
                    {/* Top Profile Bar */}
                    <div className="dashboard-top">
                        <div className="search-container" style={{ visibility: 'hidden' }}>
                            {/* Placeholder to keep alignment */}
                        </div>
                        <div className="profile-container">
                            <div className="profile-info">
                                <div className="profile-name">{ownerName || "A"}</div>
                                <div className="profile-status">Pro Member</div>
                            </div>
                            <div className="profile-avatar">
                                <Link to="/profile"><i className="bi bi-person-fill" style={{ color: '#c2410c' }}></i></Link>
                            </div>
                        </div>
                    </div>

                    {/* Status Messages */}
                    <div className="mb-3">
                        {loading && <p className="text-muted">Loading trash...</p>}
                        {!loading && error && (
                            <p className="text-danger">Unable to load trash. Please try again later.</p>
                        )}
                        {!loading && !error && safeNotes.length === 0 && <p className="text-muted">Trash is empty.</p>}
                        {!loading && !error && infoMessage && <p className="text-warning mb-0">{infoMessage}</p>}
                    </div>

                    {/* Notes Grid */}
                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <h2 className="notes-section-title mb-0">
                            Trash
                            <span className="notes-badge">{safeNotes.length}</span>
                        </h2>
                        {safeNotes.length > 0 && (
                            <button className="btn btn-outline-danger" onClick={handleEmptyTrash}>
                                <i className="bi bi-trash me-1"></i> Empty Bin
                            </button>
                        )}
                    </div>

                    <div className="notes-grid">
                        {sortedNotes.map((n, idx) => {
                            const key = n?.id ?? n?._id ?? idx;
                            return (
                                <TrashNoteItem
                                    key={key}
                                    note={n}
                                    onNoteClick={handleTrashNoteClick}
                                    onRestore={handleRestore}
                                    onDeleteForever={handleDeleteForever}
                                    timestampText={getTimestampText(n)}
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

export default Trash;
