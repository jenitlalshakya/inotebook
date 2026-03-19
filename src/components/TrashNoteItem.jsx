import React from 'react';

const TrashNoteItem = (props) => {
    const { note, onNoteClick, onRestore, onDeleteForever, timestampText } = props;

    const noteId = note?.id ?? note?._id;
    const title = note?.title ?? '';
    const tag = note?.tag ?? '';

    const tagArray = (tag || '').split(',').map(t => t.trim()).filter(Boolean);

    return (
        <div className="dash-note-card" onClick={onNoteClick} style={{ cursor: 'pointer' }}>
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

            <div className="dash-note-actions" style={{ opacity: 1, display: 'flex', gap: '0.5rem' }}>
                <button
                    className="btn btn-outline-secondary btn-sm"
                    title="Restore note"
                    aria-label="Restore note"
                    onClick={(e) => {
                        e.stopPropagation();
                        if (noteId != null) onRestore(noteId);
                    }}
                >
                    <i className="bi bi-arrow-counterclockwise me-1"></i> Restore
                </button>
                <button
                    className="btn btn-danger btn-sm"
                    title="Delete Forever"
                    aria-label="Delete Forever"
                    onClick={(e) => {
                        e.stopPropagation();
                        if (noteId != null) onDeleteForever(noteId);
                    }}
                >
                    <i className="bi bi-trash-fill me-1"></i> Delete Forever
                </button>
            </div>

            <h5 className="dash-note-title" title={title}>{title}</h5>

            <div className="dash-note-footer">
                <span>{timestampText ? timestampText.replace('Created: ', '').replace('Updated: ', 'Deleted ') : 'Deleted recently'}</span>
            </div>
        </div>
    );
};

export default TrashNoteItem;
