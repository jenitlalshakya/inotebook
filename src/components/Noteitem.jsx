import React from 'react';

const Noteitem = (props) => {
    const { note, onExpand, onDelete, timestampText } = props;

    const noteId = note?.id ?? note?._id;
    const title = note?.title ?? '';
    const content = note?.content ?? '';
    const tag = note?.tag ?? '';

    const tagArray = (tag || '').split(',').map(t => t.trim()).filter(Boolean);

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
