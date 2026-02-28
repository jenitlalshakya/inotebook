import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import InfiniteScroll from 'react-infinite-scroll-component'
import NoteContext from "../context/notes/NoteContext"
import Noteitem from './Noteitem';
import AddNote from './Addnote';

const LIMIT = 20;

const Notes = () => {
    const context = useContext(NoteContext);
    const { notes, editNote, deleteNote, getNotes } = context;
    const [note, setNote] = useState({ id: "", etitle: "", econtent: "", etag: "" })
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [editError, setEditError] = useState(null);
    const ref = useRef(null)
    const refClose = useRef(null)
    const ownerName = localStorage.getItem("name");

    const fetchNotes = useCallback(
        async (signal = null) => {
            if (loading) return;
            setLoading(true);
            setError(null);
            // Initial load (page 0): replace notes. Load more (page > 0): append.
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

    const updateNote = (currentNote) => {
        setEditError(null);
        ref.current.click();
        setNote({
            id: currentNote?.id ?? currentNote?._id ?? "",
            etitle: currentNote?.title ?? "",
            econtent: currentNote?.content ?? "",
            etag: currentNote?.tag ?? "",
        })
    }

    const handleDelete = useCallback(async (id) => {
        try {
            await deleteNote(id);
        } catch (err) {
            console.error('Error deleting note:', err);
        }
    }, [deleteNote]);

    const handleClick = async (e) => {
        setEditError(null);
        try {
            await editNote(note.id, note.etitle, note.econtent, note.etag);
            refClose.current.click();
        } catch (err) {
            console.error('Error updating note:', err);
            setEditError('Failed to update note. Please try again.');
        }
    }

    const onChange = (e) => {
        setNote({ ...note, [e.target.name]: e.target.value })
    }

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

    const isInitialLoad = page === 0 && safeNotes.length === 0;

    return (
        <>
            <AddNote />
            <button ref={ref} type="button" className="btn btn-primary d-none" data-bs-toggle="modal" data-bs-target="#exampleModal">
                Launch demo modal
            </button>
            <div className="modal fade" id="exampleModal" tabIndex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
                <div className="modal-dialog">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title" id="exampleModalLabel">Edit Note</h5>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div className="modal-body">
                            {editError ? <div className="alert alert-danger mb-3">{editError}</div> : null}
                            <form className="my-3">
                                <div className="mb-3">
                                    <label htmlFor="title" className="form-label">Title</label>
                                    <input type="text" className="form-control" id="etitle" name="etitle" value={note.etitle} aria-describedby="emailHelp" onChange={onChange} minLength={5} required />
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="content" className="form-label">Content</label>
                                    <textarea type="text" className="form-control" id="econtent" name="econtent" value={note.econtent} onChange={onChange} minLength={5} required />
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="tag" className="form-label">Tag</label>
                                    <input type="text" className="form-control" id="etag" name="etag" value={note.etag} onChange={onChange} />
                                </div>

                            </form>
                        </div>
                        <div className="modal-footer">
                            <button ref={refClose} type="button" className="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                            <button disabled={note.etitle.length < 5 || note.econtent.length < 5} onClick={handleClick} type="button" className="btn btn-primary">Update Note</button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="row my-3">
                <h2>Your Notes {ownerName && `(Owner: ${ownerName})`}</h2>
                <div className="container mx-2">
                    {isInitialLoad && loading && <p>Loading notes...</p>}
                    {!loading && error && (
                        <p className="text-danger">Unable to load notes. Please try again later.</p>
                    )}
                    {!loading && !error && safeNotes.length === 0 && !isInitialLoad && <p>No notes to display</p>}
                </div>
                <InfiniteScroll
                    dataLength={safeNotes.length}
                    next={fetchNotes}
                    hasMore={hasMore}
                    loader={<h4 className="my-3">Loading...</h4>}
                    endMessage={safeNotes.length > 0 && !hasMore ? <p className="text-muted text-center my-3">You have seen all notes. Total notes: {safeNotes.length}</p> : null}
                >
                    <div className="d-flex flex-wrap">
                        {sortedNotes.map((n, idx) => {
                            const key = n?.id ?? n?._id ?? idx;
                            return (
                                <Noteitem
                                    key={key}
                                    note={n}
                                    updateNote={updateNote}
                                    onDelete={handleDelete}
                                    timestampText={getTimestampText(n)}
                                />
                            );
                        })}
                    </div>
                </InfiniteScroll>
            </div>
        </>
    )
}

export default Notes;
