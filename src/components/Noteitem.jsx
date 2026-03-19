import React, { useContext } from 'react';
import NoteContext from '../context/notes/NoteContext';

const Noteitem = (props) => {
    const { note, onExpand, onDelete, timestampText, mode = 'notes', onRemoveFavorite } = props;
    const { toggleFavorite } = useContext(NoteContext);

    const noteId = note?.id ?? note?._id;
    const title = note?.title ?? '';
    const content = note?.content ?? '';
    const tag = note?.tag ?? '';

    const tagArray = (tag || '').split(',').map(t => t.trim()).filter(Boolean);

    const handleToggleFav = (e) => {
        e.stopPropagation();
        if (noteId == null) return;
        // optimistic UI handled in context
        toggleFavorite(noteId, !!note?.is_favorite).then((res) => {
            if (!res.success) {
                alert('Failed to update favorite: ' + (res.error || 'unknown'));
            }
        });
    };

    return (
        <div className="dash-note-card" onClick={() => onExpand(note)}>
            {tagArray.length > 0 && (
                <div className="dash-note-tags-container">
                    {tagArray.slice(0, 2).map((t, i) => (
                        <span key={i} className={`dash-note-tag ${t.toLowerCase()}`}>{t}</span>
                    ))}
                    {tagArray.length > 2 && (
                        <span className="dash-note-tag">...</span>
                    )}
                </div>
            )}

            <div className="dash-note-actions">
                {mode !== 'favorites' && (
                    <button
                        className="dash-note-btn text-danger"
                        title="Delete note"
                        aria-label="Delete note"
                        onClick={(e) => {
                            e.stopPropagation();
                            if (noteId != null) onDelete(noteId);
                        }}
                    >
                        <i className="bi bi-trash"></i>
                    </button>
                )}

                {mode === 'favorites' ? (
                    <button
                        className="dash-note-btn text-danger"
                        title="Remove Favorite"
                        aria-label="Remove Favorite"
                        onClick={(e) => {
                            e.stopPropagation();
                            if (noteId != null && typeof onRemoveFavorite === 'function') onRemoveFavorite(noteId);
                        }}
                        style={{ marginLeft: 8 }}
                    >
                        <i className="bi bi-x-circle text-danger" style={{ cursor: 'pointer' }}></i>
                    </button>
                ) : (
                    <button
                        className="dash-note-btn"
                        title={note?.is_favorite ? 'Unfavorite' : 'Favorite'}
                        aria-label="Toggle favorite"
                        onClick={handleToggleFav}
                        style={{ marginLeft: 8 }}
                    >
                        <i
                            className={`bi ${note?.is_favorite ? 'bi-star-fill' : 'bi-star'}`}
                            style={{
                                cursor: 'pointer',
                                color: note?.is_favorite ? '#ffc107' : 'inherit',
                            }}
                        ></i>
                    </button>
                )}
            </div>

            <h5 className="dash-note-title" title={title}>{title}</h5>
            
            <p className="dash-note-preview">{content}</p>

            <div className="dash-note-footer">
                <span>{timestampText ? timestampText.replace('Created: ', '').replace('Updated: ', 'Last edited ') : 'Last edited recently'}</span>
            </div>
        </div>
    );
};

export default Noteitem;