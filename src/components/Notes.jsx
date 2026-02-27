import React, { useContext, useEffect, useMemo, useRef, useState } from 'react'
import NoteContext from "../context/notes/NoteContext"
import Noteitem from './Noteitem';
import AddNote from './AddNote';

const Notes = () => {
    const context = useContext(NoteContext);
    const { notes, addNote, editNote, deleteNote, getNotes } = context;
    const [note, setNote] = useState({ id: "", etitle: "", econtent: "", etag: "" })
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [editError, setEditError] = useState(null);
    const ref = useRef(null)
    const refClose = useRef(null)

    useEffect(() => {
        const fetchNotes = async () => {
            setLoading(true);
            setError(null);
            try {
                await getNotes();
            } catch (err) {
                console.error('Error fetching notes:', err);
                setError('Failed to load notes.');
            } finally {
                setLoading(false);
            }
        };

        if (typeof getNotes === 'function') {
            fetchNotes();
        } else {
            console.error('getNotes is not a function');
            setLoading(false);
        }
        // eslint-disable-next-line
    }, [])

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

    const handleClick = async (e) => {
        setEditError(null);
        try {
            await editNote(note.id, note.etitle, note.econtent, note.etag)
            refClose.current.click();
        } catch (err) {
            console.error('Error updating note:', err);
            setEditError('Failed to update note. Please try again.');
        }
    }

    const onChange = (e) => {
        setNote({ ...note, [e.target.name]: e.target.value })
    }

    const notesToRender = Array.isArray(notes) ? notes : [];

    const sortedNotes = useMemo(() => {
        const getTime = (n) => {
            const raw = n?.created_at ?? n?.updated_at ?? null;
            const t = raw ? Date.parse(raw) : NaN;
            return Number.isFinite(t) ? t : 0;
        };

        return [...notesToRender].sort((a, b) => getTime(b) - getTime(a));
    }, [notesToRender]);

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
                <h2>Your Notes</h2>
                <div className="container mx-2">
                    {loading && 'Loading notes...'}
                    {!loading && error && (
                        <p className="text-danger">Unable to load notes. Please try again later.</p>
                    )}
                    {!loading && !error && sortedNotes.length === 0 && 'No notes to display'}
                </div>
                {!loading && !error && sortedNotes.map((note, idx) => {
                    const key = note?.id ?? note?._id ?? idx;
                    return <Noteitem key={key} updateNote={updateNote} note={note} />
                })}
            </div>
        </>
    )
}

export default Notes;
