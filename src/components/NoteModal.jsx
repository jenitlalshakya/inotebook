import React, { useContext, useEffect, useState } from 'react'
import NoteContext from "../context/notes/NoteContext"
import AuthContext from "../context/auth/AuthContext"

const NoteModal = ({ note, isOpen, onClose, onEditSuccess }) => {
    const context = useContext(NoteContext);
    const { editNote } = context;
    const { user, planConfig } = useContext(AuthContext);

    const [isEditMode, setIsEditMode] = useState(false);
    const [editError, setEditError] = useState(null);
    const [editNoteState, setEditNoteState] = useState({
        id: '',
        etitle: '',
        econtent: '',
        etag: '',
    });

    const handleOpenEdit = () => {
        if (!note) return;
        setEditError(null);
        setEditNoteState({
            id: note?.id ?? note?._id ?? '',
            etitle: note?.title ?? '',
            econtent: note?.content ?? '',
            etag: note?.tag ?? '',
        });
        setIsEditMode(true);
    };

    const handleCloseEdit = () => {
        setIsEditMode(false);
        setEditError(null);
    };

    const handleEditChange = (e) => {
        setEditNoteState((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    useEffect(() => {
        setIsEditMode(false);
    }, [note]);

    const handleSaveEdit = async () => {
        setEditError(null);
        try {
            await editNote(
                editNoteState.id,
                editNoteState.etitle,
                editNoteState.econtent,
                editNoteState.etag
            );
            setIsEditMode(false);
            onEditSuccess?.({ ...note, title: editNoteState.etitle, content: editNoteState.econtent, tag: editNoteState.etag });
        } catch (err) {
            console.error('Error updating note:', err);
            setEditError('Failed to update note. Please try again.');
        }
    };

    if (!isOpen || !note) return null;

    const title = note?.title ?? '';
    const content = note?.content ?? '';
    const tag = note?.tag ?? '';
    
    const wordCount = editNoteState.econtent.trim().split(/\s+/).filter(w => w.length > 0).length;
    const wordLimit = user?.plan === "free" && planConfig?.free?.words_limit ? planConfig.free.words_limit : 0;

    const tagArray = (tag || '').split(',').map(t => t.trim()).filter(Boolean);

    return (
        <div
            className="modal-overlay"
            onClick={(e) => e.target === e.currentTarget && onClose()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="note-modal-title"
        >
            <div className="modal-note" onClick={(e) => e.stopPropagation()}>
                <div className="modal-note-header">
                    <div className="modal-note-header-content">
                        {isEditMode ? (
                            <>
                                <input
                                    type="text"
                                    className="modal-note-tag-input"
                                    name="etag"
                                    value={editNoteState.etag}
                                    onChange={handleEditChange}
                                    placeholder="Add tags... (use comma ',' for multiple tags)"
                                    style={{ marginBottom: '0.5rem' }}
                                />
                                <input
                                    type="text"
                                    className="modal-note-title-input"
                                    name="etitle"
                                    value={editNoteState.etitle}
                                    onChange={handleEditChange}
                                    minLength={3}
                                    required
                                    placeholder="Note Title"
                                />
                            </>
                        ) : (
                            <>
                                {tagArray.length > 0 && (
                                    <div className="modal-note-tags-container">
                                        {tagArray.map((t, i) => (
                                            <span key={i} className={`dash-note-tag ${t.toLowerCase()}`}>
                                                {t}
                                            </span>
                                        ))}
                                    </div>
                                )}
                                <h2 id="note-modal-title" className="modal-note-title">{title}</h2>
                            </>
                        )}
                    </div>
                    <div className="modal-note-actions">
                        {!isEditMode ? (
                            <i
                                className="bi bi-pencil-square modal-note-icon"
                                role="button"
                                aria-label="Edit note"
                                onClick={handleOpenEdit}
                            ></i>
                        ) : (
                            <>
                                <button type="button" className="btn btn-sm btn-outline-secondary" onClick={handleCloseEdit}>
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-sm btn-dark"
                                    onClick={handleSaveEdit}
                                    disabled={editNoteState.etitle.length < 3 || editNoteState.econtent.length < 5 || (wordLimit > 0 && wordCount > wordLimit)}
                                >
                                    Save
                                </button>
                            </>
                        )}
                        <i
                            className="bi bi-x-lg modal-note-icon"
                            role="button"
                            aria-label="Close modal"
                            onClick={onClose}
                        ></i>
                    </div>
                </div>

                <div className="modal-note-body">
                    {editError ? <div className="alert alert-danger mb-3">{editError}</div> : null}
                    {isEditMode ? (
                        <>
                            <textarea
                                className="modal-note-content-input"
                                name="econtent"
                                value={editNoteState.econtent}
                                onChange={handleEditChange}
                                minLength={5}
                                required
                                placeholder="Write your note content here..."
                            />
                            {wordLimit > 0 && (
                                <div className={`text-end small ${wordCount > wordLimit ? 'text-danger fw-bold' : 'text-muted'}`}>
                                    {wordCount} / {wordLimit} words
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="modal-note-content">{content}</div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default NoteModal;
