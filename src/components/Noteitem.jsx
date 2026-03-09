import React from 'react';

const Noteitem = (props) => {
    const { note, onExpand, onDelete, timestampText } = props;

    const noteId = note?.id ?? note?._id;
    const title = note?.title ?? '';
    const content = note?.content ?? '';
    const tag = note?.tag ?? '';

    const tagArray = (tag || '').split(',').map(t => t.trim()).filter(Boolean);

    return (
        <div className="col-12 col-sm-6 col-md-4 col-lg-3">
            <div className="card my-3 h-100 position-relative">

                <div className="card-actions">
                    <i
                        className="far fa-trash-alt"
                        role="button"
                        aria-label="Delete note"
                        onClick={() => noteId != null && onDelete(noteId)}
                    ></i>
                    <i
                        className="fa-solid fa-up-right-and-down-left-from-center"
                        role="button"
                        aria-label="Expand note"
                        onClick={() => onExpand(note)}
                    ></i>
                </div>

                <div className="card-body d-flex flex-column">

                    <div className="title-wrapper">
                        <h5 className="card-title note-title" title={title}>{title}</h5>
                    </div>

                    <div className="tag-wrapper">
                        {tagArray.length > 0 ? (
                            <div className="d-flex flex-wrap gap-1">
                                {tagArray.slice(0, 2).map((t, i) => (
                                    <span key={i} className="badge text-bg-secondary">{t}</span>
                                ))}
                                {tagArray.length > 2 && (
                                    <span className="badge text-bg-light text-dark">...</span>
                                )}
                            </div>
                        ) : <div className="empty-tag-space" />}
                    </div>

                    <div className="content-preview-wrapper">
                        <p className="card-text card-preview">{content}</p>
                    </div>

                    <div className="timestamp-wrapper">
                        {timestampText && (
                            <small className="text-muted">{timestampText}</small>
                        )}
                    </div>
                </div>

                <style>{`
                    .card {
                        position: relative;
                        display: flex;
                        flex-direction: column;
                        height: 100%;
                    }

                    .card-actions {
                        position: absolute;
                        top: 0.5rem;
                        right: 0.5rem;
                        z-index: 10;
                        display: flex;
                        gap: 1rem;
                    }

                    .card-actions i {
                        cursor: pointer;
                        font-size: 1rem;
                        color: #111;
                    }

                    .card-actions i:hover {
                        opacity: 0.7;
                    }

                    /* Title: fixed 2 lines */
                    .note-title {
                        display: -webkit-box;
                        -webkit-line-clamp: 2;      
                        -webkit-box-orient: vertical;
                        overflow: hidden;
                        text-overflow: ellipsis;
                        font-weight: 600;
                        min-height: 2.5em; /* 2 lines * line-height 1.4em */
                    }
                    
                    .title-wrapper {
                        position: relative;
                        display: inline-block;
                        max-width: 80%;
                    }

                    .note-title, .card-preview {
                        word-break: break-word;
                    }
                        
                    /* Tags: fixed height 1 line */
                    .tag-wrapper {
                        min-height: 1.5em; /* enough for badges */
                        margin-bottom: 0.25rem;
                    }

                    .empty-tag-space {
                        width: 100%;
                        height: 1.5em; /* reserve space when no tags */
                    }

                    /* Content Preview: fixed 3 lines */
                    .content-preview-wrapper {
                        min-height: 3em;
                        max-height: 3em;
                        margin-bottom: 1.5rem;
                    }

                    .card-preview {
                        display: -webkit-box;
                        -webkit-line-clamp: 3;
                        -webkit-box-orient: vertical;
                        overflow: hidden;
                        line-height: 1.2em;
                        margin: 0;
                    }

                    /* Timestamp */
                    .timestamp-wrapper {
                        min-height: 1.2em; /* 1 line */
                        max-height: 1.2em;
                    }
                `}</style>
            </div>
        </div>
    );
};

export default Noteitem;
