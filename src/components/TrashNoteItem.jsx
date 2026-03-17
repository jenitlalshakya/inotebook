import React from 'react';

const TrashNoteItem = (props) => {
    const { note, onDeleteForever, timestampText } = props;

    const noteId = note?.id ?? note?._id;
    const title = note?.title ?? '';
    const content = note?.content ?? '';
    const tag = note?.tag ?? '';

    const tagArray = (tag || '').split(',').map(t => t.trim()).filter(Boolean);

    return (
        <div className="dash-note-card">
            <div className="dash-note-actions">
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

            {tagArray.length > 0 && (
                <div className="d-flex flex-wrap gap-1 mb-2">
                    {tagArray.slice(0, 2).map((t, i) => (
                        <span key={i} className={`dash-note-tag ${t.toLowerCase()}`}>{t}</span>
                    ))}
                    {tagArray.length > 2 && (
                        <span className="dash-note-tag bg-light text-dark">...</span>
                    )}
                </div>
            )}

            <h5 className="dash-note-title" title={title}>{title}</h5>
            
            <p className="dash-note-preview">{content}</p>

            <div className="dash-note-footer">
                <span>{timestampText ? timestampText.replace('Created: ', '').replace('Updated: ', 'Deleted ') : 'Deleted recently'}</span>
            </div>
        </div>
    );
};

export default TrashNoteItem;
