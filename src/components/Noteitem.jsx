import React, { useContext } from 'react'
import NoteContext from "../context/notes/NoteContext"


const Noteitem = (props) => {
    const context = useContext(NoteContext);
    const { deleteNote } = context;
    const { note, updateNote } = props;

    const noteId = note?.id ?? note?._id;
    const title = note?.title ?? '';

    const content = note?.content ?? '';
    const tag = note?.tag ?? '';
    const createdAt = note?.created_at ?? null;
    const updatedAt = note?.updated_at ?? null;

    const formatDateTime = (value) => {
        if (!value) return null;
        const d = new Date(value);
        if (Number.isNaN(d.getTime())) return null;
        return d.toLocaleString();
    };

    const createdLabel = formatDateTime(createdAt);
    const updatedLabel = formatDateTime(updatedAt);
    return (
        <div className="col-12 col-sm-6 col-md-4 col-lg-3">
            <div className="card my-3">
                <div className="card-body">
                    <div className="d-flex align-items-start justify-content-between gap-2">
                        <div className="me-2">
                            <h5 className="card-title mb-1">{title}</h5>
                            {tag ? <span className="badge text-bg-secondary">{tag}</span> : null}
                        </div>
                        <div className="d-flex align-items-center flex-shrink-0">
                            <i
                                className="far fa-trash-alt mx-2"
                                role="button"
                                aria-label="Delete note"
                                onClick={() => { if (noteId != null) deleteNote(noteId) }}
                            ></i>
                            <i
                                className="far fa-edit mx-2"
                                role="button"
                                aria-label="Edit note"
                                onClick={() => { updateNote(note) }}
                            ></i>
                        </div>
                    </div>
                    <p className="card-text mt-2 mb-0">{content}</p>
                    {(createdLabel || updatedLabel) ? (
                        <div className="mt-2">
                            {createdLabel ? <small className="text-muted d-block">Created: {createdLabel}</small> : null}
                            {updatedLabel ? <small className="text-muted d-block">Updated: {updatedLabel}</small> : null}
                        </div>
                    ) : null}

                </div>
            </div>
        </div>
    )
}

export default Noteitem;
