import React, { useContext, useEffect, useState } from 'react'
import NoteContext from "../context/notes/NoteContext"

const NoteModal = ({ note, isOpen, onClose, onEditSuccess }) => {
    const context = useContext(NoteContext);
    const { editNote } = context;

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
                                    className="modal-note-title-input"
                                    name="etitle"
                                    value={editNoteState.etitle}
                                    onChange={handleEditChange}
                                    minLength={3}
                                    required
                                    placeholder="Title"
                                />
                                <input
                                    type="text"
                                    className="modal-note-tag-input"
                                    name="etag"
                                    value={editNoteState.etag}
                                    onChange={handleEditChange}
                                    placeholder="optional (use comma ',' to use multiple tags)"
                                />
                            </>
                        ) : (
                            <>
                                <h2 id="note-modal-title" className="modal-note-title">{title}</h2>
                                {tagArray.length > 0 && (
                                    <div className="d-flex flex-wrap gap-1">
                                        {tagArray.map((t, i) => (
                                            <span key={i} className="badge text-bg-secondary modal-note-tag">
                                                {t}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                    <div className="modal-note-actions">
                        {!isEditMode ? (
                            <i
                                className="far fa-edit modal-note-icon"
                                role="button"
                                aria-label="Edit note"
                                onClick={handleOpenEdit}
                            ></i>
                        ) : (
                            <>
                                <button type="button" className="btn btn-sm btn-outline-secondary me-2" onClick={handleCloseEdit}>
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-sm btn-primary"
                                    onClick={handleSaveEdit}
                                    disabled={editNoteState.etitle.length < 3 || editNoteState.econtent.length < 5}
                                >
                                    Save
                                </button>
                            </>
                        )}
                        <i
                            className="fa-solid fa-xmark modal-note-icon"
                            role="button"
                            aria-label="Close modal"
                            onClick={onClose}
                        ></i>
                    </div>
                </div>

                <div className="modal-note-body">
                    {editError ? <div className="alert alert-danger mb-3">{editError}</div> : null}
                    {isEditMode ? (
                        <textarea
                            className="modal-note-content-input"
                            name="econtent"
                            value={editNoteState.econtent}
                            onChange={handleEditChange}
                            minLength={5}
                            required
                            placeholder="Write your note content here..."
                        />
                    ) : (
                        <div className="modal-note-content">{content}</div>
                    )}
                </div>
            </div>

            <style>{`
                .modal-overlay {
                    position: fixed;
                    inset: 0;
                    background: rgba(0, 0, 0, 0.5);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 1050;
                    padding: 1rem;
                }
                .modal-note {
                    background: #ffffff;
                    color: #000000;
                    border-radius: 8px;
                    max-width: 650px;
                    width: 100%;
                    max-height: 90vh;
                    display: flex;
                    flex-direction: column;
                    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
                    color-scheme: light;
                }
                .modal-note-header {
                    position: sticky;
                    top: 0;
                    background: #ffffff;
                    color: #000000;
                    z-index: 10;
                    padding: 1rem 1.25rem;
                    border-bottom: 1px solid #dee2e6;
                    display: flex;
                    align-items: flex-start;
                    justify-content: space-between;
                    gap: 1rem;
                }
                .modal-note-header-content {
                    flex: 1;
                    min-width: 0;
                }
                .modal-note-title {
                    color: #000000;
                    font-size: 1.4rem;
                    font-weight: 600;
                    margin: 0 0 0.5rem 0;
                }
                .modal-note-title-input {
                    background: #ffffff;
                    color: #000000;
                    font-size: 1.4rem;
                    font-weight: 600;
                    border: none;
                    outline: none;
                    width: 100%;
                    padding: 0;
                    margin-bottom: 0.5rem;
                }
                .modal-note-title-input::placeholder {
                    color: #6c757d;
                }
                .modal-note-tag-input {
                    background: #ffffff;
                    color: #000000;
                    font-size: 0.875rem;
                    border: 1px solid #ddd;
                    border-radius: 4px;
                    padding: 0.25rem 0.5rem;
                    width: auto;
                    max-width: 200px;
                }
                .modal-note-tag-input::placeholder {
                    color: #6c757d;
                }
                .modal-note-tag {
                    display: inline-block;
                    margin-top: 0.25rem;
                    margin-right: 4px;
                }
                .modal-note-actions {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    flex-shrink: 0;
                }
                .modal-note-icon {
                    cursor: pointer;
                    font-size: 1.25rem;
                    padding: 0.25rem;
                    color: #111111;
                }
                .modal-note-icon:hover {
                    opacity: 0.7;
                }
                .modal-note-body {
                    padding: 1rem 1.25rem;
                    overflow-y: auto;
                    flex: 1;
                    background: #ffffff;
                    color: #000000;
                }
                .modal-note-content {
                    color: #000000;
                    white-space: pre-wrap;
                    word-break: break-word;
                }
                .modal-note-content-input {
                    background: #ffffff;
                    color: #000000;
                    width: 100%;
                    min-height: 200px;
                    border: none;
                    resize: none;
                    outline: none;
                    font-size: 1rem;
                    line-height: 1.5;
                    font-family: inherit;
                }
                .modal-note-content-input::placeholder {
                    color: #6c757d;
                }
            `}</style>
        </div>
    );
};

export default NoteModal;
