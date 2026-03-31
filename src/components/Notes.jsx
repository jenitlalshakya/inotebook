import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react'
import InfiniteScroll from 'react-infinite-scroll-component'
import NoteContext from "../context/notes/NoteContext"
import AuthContext from "../context/auth/AuthContext"
import Noteitem from './Noteitem';
import AddNote from './Addnote';
import NoteModal from './NoteModal';
import { Link } from 'react-router-dom';
import Layout from './Layout';

const LIMIT = 20;
const SEARCH_DEBOUNCE_MS = 400;

const Notes = () => {
    const context = useContext(NoteContext);
    const { user, planConfig } = useContext(AuthContext);
    const { notes, totalNotes, deleteNote, getNotes, searchNotes } = context;
    const [selectedNote, setSelectedNote] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const ownerName = user?.name || localStorage.getItem("name") || "User";
    
    const isPro = user?.plan && user.plan !== "free";
    const notesLimit = planConfig && user?.plan === "free" ? planConfig.free.notes_limit : Infinity;
    const notesLimitReached = totalNotes >= notesLimit;

    // --- Search state (isolated from normal notes) ---
    const [searchQuery, setSearchQuery] = useState("");
    const isSearchMode = (searchQuery || "").trim() !== "";
    const [searchResults, setSearchResults] = useState([]);
    const [searchPage, setSearchPage] = useState(0);
    const [searchHasMore, setSearchHasMore] = useState(false);
    const [isSearching, setIsSearching] = useState(false);

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
        if ('scrollRestoration' in window.history) {
            window.history.scrollRestoration = 'manual';
        }

        setPage(0);
        setHasMore(true);

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
                    requestAnimationFrame(() => {
                        window.scrollTo({ top: 0, behavior: 'auto' });
                    });
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

    useEffect(() => {
        if (!isSearchMode) {
            setSearchResults([]);
            setSearchPage(0);
            setSearchHasMore(false);
            return;
        }

        const timeoutId = setTimeout(async () => {
            setIsSearching(true);
            try {
                const { notes: resNotes, hasMore: more } = await searchNotes(searchQuery, LIMIT, 0);
                setSearchResults(resNotes);
                setSearchHasMore(Boolean(more));
                setSearchPage(1);
            } catch (err) {
                console.error("Search error:", err);
            } finally {
                setIsSearching(false);
            }
        }, SEARCH_DEBOUNCE_MS);

        return () => clearTimeout(timeoutId);
    }, [searchQuery, isSearchMode, searchNotes]);

    const fetchSearchNotes = useCallback(async () => {
        if (isSearching || !searchHasMore) return;
        setIsSearching(true);
        try {
            const { notes: resNotes, hasMore: more } = await searchNotes(searchQuery, LIMIT, searchPage * LIMIT);
            setSearchResults(prev => [...prev, ...resNotes]);
            setSearchHasMore(Boolean(more));
            setSearchPage(p => p + 1);
        } catch (err) {
            console.error("Search fetch error:", err);
        } finally {
            setIsSearching(false);
        }
    }, [searchQuery, searchPage, searchHasMore, isSearching, searchNotes]);

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
            setSearchResults((prev) => prev.map((n) => (n?.id ?? n?._id) === (updatedNote?.id ?? updatedNote?._id) ? { ...n, ...updatedNote } : n));
        }
    }, []);

    const handleDelete = useCallback(async (id) => {
        try {
            await deleteNote(id);
            if (selectedNote && (selectedNote?.id ?? selectedNote?._id) === id) {
                handleCloseModal();
            }
            setSearchResults((prev) => prev.filter((n) => (n?.id ?? n?._id) !== id));
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

        // Hide favorites from All Notes list (Favorites has its own section)
        const nonFavorite = [...safeNotes].filter((n) => !n?.is_favorite);
        return nonFavorite.sort((a, b) => getTime(b) - getTime(a));
    }, [safeNotes]);

    const sortedSearchResults = useMemo(() => {
        const getTime = (n) => {
            const tUpdated = getMs(n?.updated_at);
            if (Number.isFinite(tUpdated)) return tUpdated;
            const tCreated = getMs(n?.created_at);
            if (Number.isFinite(tCreated)) return tCreated;
            return 0;
        };
        const safeSearch = Array.isArray(searchResults) ? searchResults : [];
        return [...safeSearch].sort((a, b) => getTime(b) - getTime(a));
    }, [searchResults]);

    const isInitialLoad = page === 0 && safeNotes.length === 0;

    return (
        <>
            <NoteModal
                note={selectedNote}
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onEditSuccess={handleEditSuccess}
            />

            {/* Layout provides the sidebar + dashboard-container shell */}
            <Layout>
                <main className="dashboard-main">
                    {/* Top Search & Profile Bar */}
                    <div className="dashboard-top">
                        <div className="search-container">
                            <i className="bi bi-search search-icon"></i>
                            <input
                                type="text"
                                className="search-input"
                                placeholder="Search: title, content, tag, e.g. title:todo, tag:work"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                aria-label="Search notes"
                            />
                        </div>
                        <div className="profile-container">
                            <div className="profile-info">
                                <div className="profile-name">{ownerName}</div>
                                <div className="profile-status text-capitalize">{user?.plan === "free" ? "Free Member" : "Pro Member"}</div>
                            </div>
                            <div className="profile-avatar">
                                <Link to="/profile"><i className="bi bi-person-fill" style={{ color: '#c2410c' }}></i></Link>
                            </div>
                        </div>
                    </div>

                    {/* Inline Add Note Editor */}
                    {!isSearchMode && (
                        notesLimitReached ? (
                            <div className="alert alert-warning p-4 mb-4 rounded shadow-sm">
                                <h5><i className="bi bi-exclamation-triangle-fill text-warning me-2"></i> Note Limit Reached</h5>
                                <p className="mb-2">You have reached the maximum limit of {notesLimit} notes on the Free plan.</p>
                                <Link to="/subscription" className="btn btn-warning fw-bold">Upgrade to Pro</Link>
                            </div>
                        ) : (
                            <AddNote />
                        )
                    )}

                    {/* Status Messages */}
                    <div className="mb-3">
                        {!isSearchMode && isInitialLoad && loading && <p className="text-muted">Loading notes...</p>}
                        {!isSearchMode && !loading && error && (
                            <p className="text-danger">Unable to load notes. Please try again later.</p>
                        )}
                        {!isSearchMode && !loading && !error && safeNotes.length === 0 && !isInitialLoad && <p className="text-muted">No notes to display. Start writing above!</p>}
                        {isSearchMode && isSearching && searchPage === 0 && <p className="text-muted">Searching...</p>}
                        {isSearchMode && !isSearching && sortedSearchResults.length === 0 && (searchQuery || "").trim() && <p className="text-muted">No notes found for "{searchQuery}"</p>}
                    </div>

                    {/* Notes Grid */}
                    <h2 className="notes-section-title">
                        {isSearchMode ? "Search Results" : "Recent Notes"}
                        <span className="notes-badge">{isSearchMode ? sortedSearchResults.length : totalNotes}</span>
                    </h2>

                    {isSearchMode ? (
                        <InfiniteScroll
                            dataLength={sortedSearchResults.length}
                            next={fetchSearchNotes}
                            hasMore={searchHasMore}
                            loader={<h4 className="my-3 text-muted">Loading...</h4>}
                            endMessage={sortedSearchResults.length > 0 && !searchHasMore ? <p className="text-muted mt-4 text-center">You have seen all search results.</p> : null}
                            style={{ overflow: 'visible' }}
                        >
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
                        </InfiniteScroll>
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
            </Layout>
        </>
    )
}

export default Notes;
