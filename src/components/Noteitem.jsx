const Noteitem = (props) => {
    const { note, updateNote, onDelete, timestampText } = props;

    const noteId = note?.id ?? note?._id;
    const title = note?.title ?? '';

    const content = note?.content ?? '';
    const tag = note?.tag ?? '';
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
                                onClick={() => { if (noteId != null) onDelete(noteId) }}
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
                    {timestampText ? <small className="text-muted d-block mt-2">{timestampText}</small> : null}

                </div>
            </div>
        </div>
    )
}

export default Noteitem;
