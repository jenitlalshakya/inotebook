import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react'
import InfiniteScroll from 'react-infinite-scroll-component'
import NoteContext from "../context/notes/NoteContext"
import Noteitem from './Noteitem';
import AddNote from './Addnote';
import NoteModal from './NoteModal';

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
    const [searchResults, setSearchResults] = useState([]);
    const [searchSkip, setSearchSkip] = useState(0);
    const [searchHasMore, setSearchHasMore] = useState(false);
    const [searchLoading, setSearchLoading] = useState(false);
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

    // Search mode: fetch more search results (only when searchSkip > 0; first page is done by debounce)
    const fetchSearchNotes = useCallback(async () => {
        if (!isSearchMode || searchLoading) return;
        const q = (searchQuery || "").trim();
        if (!q) return;
        if (searchSkip === 0) return;
        setSearchLoading(true);
        try {
            const { notes: nextNotes, hasMore: more } = await searchNotes(q, LIMIT, searchSkip);
            setSearchResults((prev) => [...prev, ...nextNotes]);
            setSearchSkip((s) => s + LIMIT);
            setSearchHasMore(Boolean(more));
        } catch (err) {
            console.error("Error fetching search notes:", err);
            setSearchHasMore(false);
        } finally {
            setSearchLoading(false);
        }
    }, [isSearchMode, searchQuery, searchSkip, searchLoading, searchNotes]);

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

    // When search query changes while in search mode: reset so debounce can refetch first page
    useEffect(() => {
        if (isSearchMode) {
            setSearchResults([]);
            setSearchSkip(0);
            setSearchHasMore(false);
            setSearchLoading(true);
        }
    }, [searchQuery]);

    // Debounced first-page search: 400ms after user stops typing, call search API
    useEffect(() => {
        const q = (searchQuery || "").trim();
        if (!q) return;
        const t = setTimeout(async () => {
            setSearchLoading(true);
            try {
                const { notes: firstNotes, hasMore: more } = await searchNotes(q, LIMIT, 0);
                setSearchResults(firstNotes || []);
                setSearchSkip(LIMIT);
                setSearchHasMore(Boolean(more));
            } catch (err) {
                console.error("Error searching notes:", err);
                setSearchResults([]);
                setSearchHasMore(false);
            } finally {
                setSearchLoading(false);
            }
        }, SEARCH_DEBOUNCE_MS);
        return () => clearTimeout(t);
    }, [searchQuery, searchNotes]);

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
        if (isSearchMode && updatedNote) {
            setSearchResults((prev) =>
                prev.map((n) => {
                    const id = n?.id ?? n?._id;
                    const updatedId = updatedNote?.id ?? updatedNote?._id;
                    return id === updatedId ? { ...n, ...updatedNote } : n;
                })
            );
            setSelectedNote((prev) => (prev && (prev?.id ?? prev?._id) === (updatedNote?.id ?? updatedNote?._id) ? { ...prev, ...updatedNote } : prev));
        }
    }, [isSearchMode]);

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

    const sortedSearchResults = useMemo(() => {
        const getTime = (n) => {
            const tUpdated = getMs(n?.updated_at);
            if (Number.isFinite(tUpdated)) return tUpdated;
            const tCreated = getMs(n?.created_at);
            if (Number.isFinite(tCreated)) return tCreated;
            return 0;
        };
        return [...searchResults].sort((a, b) => getTime(b) - getTime(a));
    }, [searchResults]);

    const isInitialLoad = page === 0 && safeNotes.length === 0;

    return (
        <>
            <AddNote />
            <NoteModal
                note={selectedNote}
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onEditSuccess={handleEditSuccess}
            />

            <div className="row my-3">
                <h2>Your Notes ({totalNotes} Notes) {ownerName ? `— Owner: ${ownerName}` : ""}</h2>
                <div className="container mx-2 mb-2">
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Search notes... (title:, content:, tag:, combine with comma, use 'or' to search for multiple keywords in the different fields)"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        aria-label="Search notes"
                    />
                </div>
                <div className="container mx-2">
                    {!isSearchMode && isInitialLoad && loading && <p>Loading notes...</p>}
                    {!isSearchMode && !loading && error && (
                        <p className="text-danger">Unable to load notes. Please try again later.</p>
                    )}
                    {!isSearchMode && !loading && !error && safeNotes.length === 0 && !isInitialLoad && <p>No notes to display</p>}
                    {isSearchMode && searchLoading && searchResults.length === 0 && <p>Searching...</p>}
                    {isSearchMode && !searchLoading && searchResults.length === 0 && (searchQuery || "").trim() && <p>No notes found</p>}
                </div>

                {isSearchMode ? (
                    <InfiniteScroll
                        dataLength={searchResults.length}
                        next={fetchSearchNotes}
                        hasMore={searchHasMore}
                        loader={searchLoading ? <h4 className="my-3">Loading...</h4> : null}
                        endMessage={searchResults.length > 0 && !searchHasMore ? <p className="text-muted text-center my-3">End of search results. Total: {searchResults.length} out of {totalNotes}</p> : null}
                    >
                        <div className="d-flex flex-wrap">
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
                        loader={<h4 className="my-3">Loading...</h4>}
                            endMessage={safeNotes.length > 0 && !hasMore ? <p className="text-muted text-center my-3">You have seen all notes. Total notes: {safeNotes.length} out of {totalNotes}</p> : null}
                    >
                        <div className="d-flex flex-wrap">
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
            </div>
        </>
    )
}

export default Notes;
