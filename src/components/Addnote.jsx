import React, { useContext, useState } from 'react'
import NoteContext from "../context/notes/NoteContext"
import AuthContext from "../context/auth/AuthContext"

const AddNote = () => {
    const context = useContext(NoteContext);
    const { addNote } = context;
    const { user, planConfig } = useContext(AuthContext);

    const [note, setNote] = useState({ title: "", content: "", tag: "" })

    const handleClick = (e) => {
        e.preventDefault();
        const normalizedTags = note.tag
            .split(',')
            .map(t => t.trim().toLowerCase())
            .filter(Boolean)
            .join(',');

        addNote(note.title, note.content, normalizedTags);
        setNote({ title: "", content: "", tag: "" })
    }

    const onChange = (e) => {
        setNote({ ...note, [e.target.name]: e.target.value })
    }

    const wordCount = note.content.trim().split(/\s+/).filter(w => w.length > 0).length;
    const wordLimit = user?.plan === "free" && planConfig?.free?.words_limit ? planConfig.free.words_limit : 0;

    return (
        <div className="editor-container">
            <input
                type="text"
                className="editor-title-input"
                name="title"
                placeholder="Note Title"
                value={note.title}
                onChange={onChange}
                minLength={3}
                required
            />
            <input
                type="text"
                className="editor-tag-input"
                name="tag"
                placeholder="Tags (e.g. Work, Ideas)"
                value={note.tag}
                onChange={onChange}
            />
            <textarea
                className="editor-content"
                name="content"
                placeholder="Start writing your thoughts..."
                value={note.content}
                onChange={onChange}
                minLength={5}
                required
            />
            {wordLimit > 0 && (
                <div className={`text-end small ${wordCount > wordLimit ? 'text-danger fw-bold' : 'text-muted'}`}>
                    {wordCount} / {wordLimit} words
                </div>
            )}
            <div className="editor-actions">
                <button
                    type="submit"
                    className="btn-save-note"
                    onClick={handleClick}
                    disabled={note.title.length < 3 || note.content.length < 5 || (wordLimit > 0 && wordCount > wordLimit)}
                >
                    <i className="bi bi-plus-lg"></i> Save Note
                </button>
            </div>
        </div>
    )
}

export default AddNote;
