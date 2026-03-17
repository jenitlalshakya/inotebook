import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react'
import InfiniteScroll from 'react-infinite-scroll-component'
import NoteContext from "../context/notes/NoteContext"
import Noteitem from './Noteitem';
import AddNote from './Addnote';
import NoteModal from './NoteModal';
import { Link } from 'react-router-dom';

const LIMIT = 20;
const SEARCH_DEBOUNCE_MS = 400;

const Notes = () => {
    const context = useContext(NoteContext);
    const { notes, totalNotes, deleteNote, getNotes, searchNotes } = context;
    const [selectedNote, setSelectedNote] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const ownerName = localStorage.getItem("name");

    // --- Search state (isolated from normal notes) ---
    const [searchQuery, setSearchQuery] = useState("");
    const isSearchMode = (searchQuery || "").trim() !== "";

    // Normal mode: existing fetch (unchanged)
    const fetchNotes = useCallback(
        async (signal = null) => {
            if (loading) return;
            setLoading(true);
            setError(null);
            const append = page > 0;
            try {
                const { hasMore: more } = await getNotes(LIMIT, page * LIMIT, append, signal);
                setHasMore(Boolean(more));
                setPage((p) => p + 1);
            } catch (err) {
                if (err?.name === "AbortError") return;
                console.error("Error fetching notes:", err);
                setError(err?.message || "Failed to load notes.");
            } finally {
                setLoading(false);
            }
        },
        [getNotes, page, loading]
    );



    useEffect(() => {
        let mounted = true;
        const controller = new AbortController();

        const load = async () => {
            if (loading) return;
            setLoading(true);
            setError(null);
            try {
                const { hasMore: more } = await getNotes(LIMIT, 0, false, controller.signal);
                if (mounted) {
                    setHasMore(Boolean(more));
                    setPage(1);
                }
            } catch (err) {
                if (err?.name === "AbortError") return;
                if (mounted) setError(err?.message || "Failed to load notes.");
            } finally {
                if (mounted) setLoading(false);
            }
        };
        load();

        return () => {
            mounted = false;
            controller.abort();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps -- run only on mount
    }, []);



    const handleExpand = (note) => {
        setSelectedNote(note);
        setIsModalOpen(true);
    };

    // Sync local note whenever the note in context changes
    useEffect(() => {
        if (selectedNote) {
            const updated = notes.find(n => n.id === selectedNote.id);
            if (updated) setSelectedNote(updated);
        }
    }, [notes, selectedNote]); // runs whenever selectedNote or notes array changes

    const handleCloseModal = useCallback(() => {
        setIsModalOpen(false);
        setSelectedNote(null);
    }, []);

    const handleEditSuccess = useCallback((updatedNote) => {
        if (updatedNote) {
            setSelectedNote((prev) => (prev && (prev?.id ?? prev?._id) === (updatedNote?.id ?? updatedNote?._id) ? { ...prev, ...updatedNote } : prev));
        }
    }, []);

    const handleDelete = useCallback(async (id) => {
        try {
            await deleteNote(id);
            if (selectedNote && (selectedNote?.id ?? selectedNote?._id) === id) {
                handleCloseModal();
            }
        } catch (err) {
            console.error('Error deleting note:', err);
        }
    }, [deleteNote, selectedNote, handleCloseModal]);

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

    const safeNotes = Array.isArray(notes) ? notes : [];

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

    const filteredNotes = useMemo(() => {
        if (!isSearchMode) return [];
        
        const query = searchQuery.trim().toLowerCase();
        
        // Split by comma for AND conditions
        const conditions = query.split(',').map(c => c.trim()).filter(Boolean);
        
        return safeNotes.filter(note => {
            // For each AND condition, the note must match
            return conditions.every(condition => {
                // Split by ' or ' for OR conditions
                const orParts = condition.split(/\s+or\s+/).map(p => p.trim()).filter(Boolean);
                
                return orParts.some(part => {
                    const match = part.match(/^(title|tag|content):\s*(.*)$/);
                    if (match) {
                        const [, field, value] = match;
                        const noteValue = (note[field] || "").toLowerCase();
                        return noteValue.includes(value);
                    } else {
                        // Normal text search across all fields
                        const t = (note.title || "").toLowerCase();
                        const c = (note.content || "").toLowerCase();
                        const tag = (note.tag || "").toLowerCase();
                        return t.includes(part) || c.includes(part) || tag.includes(part);
                    }
                });
            });
        });
    }, [isSearchMode, searchQuery, safeNotes]);

    const sortedSearchResults = useMemo(() => {
        const getTime = (n) => {
            const tUpdated = getMs(n?.updated_at);
            if (Number.isFinite(tUpdated)) return tUpdated;
            const tCreated = getMs(n?.created_at);
            if (Number.isFinite(tCreated)) return tCreated;
            return 0;
        };
        return [...filteredNotes].sort((a, b) => getTime(b) - getTime(a));
    }, [filteredNotes]);

    const isInitialLoad = page === 0 && safeNotes.length === 0;

    return (
        <>
            <NoteModal
                note={selectedNote}
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onEditSuccess={handleEditSuccess}
            />

            <div className="dashboard-container">
                {/* Sidebar Menu */}
                <aside className="dashboard-sidebar">
                    <h3 className="sidebar-section-title">Library</h3>
                    <ul className="sidebar-menu">
                        <li className="sidebar-item active">
                            <i className="bi bi-journal-text"></i> All Notes
                        </li>
                        <li className="sidebar-item">
                            <i className="bi bi-star"></i> Favorites
                        </li>
                        <Link to="/trash" style={{ textDecoration: 'none', color: 'inherit' }}>
                            <li className="sidebar-item">
                                <i className="bi bi-trash"></i> Trash
                            </li>
                        </Link>
                    </ul>

                    <div className="sidebar-premium-card">
                        <h4>Go Premium</h4>
                        <p>Unlock cloud sync and unlimited notebooks.</p>
                    </div>
                </aside>

                {/* Main Content Area */}
                <main className="dashboard-main">
                    {/* Top Search & Profile Bar */}
                    <div className="dashboard-top">
                        <div className="search-container">
                            <i className="bi bi-search search-icon"></i>
                            <input
                                type="text"
                                className="search-input"
                                placeholder="Search your notes..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                aria-label="Search notes"
                            />
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

                    {/* Inline Add Note Editor */}
                    {!isSearchMode && <AddNote />}

                    {/* Status Messages */}
                    <div className="mb-3">
                        {!isSearchMode && isInitialLoad && loading && <p className="text-muted">Loading notes...</p>}
                        {!isSearchMode && !loading && error && (
                            <p className="text-danger">Unable to load notes. Please try again later.</p>
                        )}
                        {!isSearchMode && !loading && !error && safeNotes.length === 0 && !isInitialLoad && <p className="text-muted">No notes to display. Start writing above!</p>}
                        {isSearchMode && sortedSearchResults.length === 0 && (searchQuery || "").trim() && <p className="text-muted">No notes found for "{searchQuery}"</p>}
                    </div>

                    {/* Notes Grid */}
                    <h2 className="notes-section-title">
                        {isSearchMode ? "Search Results" : "Recent Notes"} 
                        <span className="notes-badge">{isSearchMode ? sortedSearchResults.length : totalNotes}</span>
                    </h2>

                    {isSearchMode ? (
                        <div className="notes-grid">
                            {sortedSearchResults.map((n, idx) => {
                                const key = n?.id ?? n?._id ?? idx;
                                return (
                                    <Noteitem
                                        key={key}
                                        note={n}
                                        onExpand={handleExpand}
                                        onDelete={handleDelete}
                                        timestampText={getTimestampText(n)}
                                    />
                                );
                            })}
                        </div>
                    ) : (
                        <InfiniteScroll
                            dataLength={safeNotes.length}
                            next={fetchNotes}
                            hasMore={hasMore}
                            loader={<h4 className="my-3 text-muted">Loading...</h4>}
                            endMessage={safeNotes.length > 0 && !hasMore ? <p className="text-muted mt-4 text-center">You have seen all notes.</p> : null}
                            style={{ overflow: 'visible' }}
                        >
                            <div className="notes-grid">
                                {sortedNotes.map((n, idx) => {
                                    const key = n?.id ?? n?._id ?? idx;
                                    return (
                                        <Noteitem
                                            key={key}
                                            note={n}
                                            onExpand={handleExpand}
                                            onDelete={handleDelete}
                                            timestampText={getTimestampText(n)}
                                        />
                                    );
                                })}
                            </div>
                        </InfiniteScroll>
                    )}
                </main>
            </div>
        </>
    )
}

export default Notes;
