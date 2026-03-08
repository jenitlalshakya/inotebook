import React, { useContext, useState } from 'react'
import NoteContext from "../context/notes/NoteContext"

const AddNote = () => {
    const context = useContext(NoteContext);
    const { addNote } = context;

    const [note, setNote] = useState({ title: "", content: "", tag: "" })

    const handleClick = (e) => {
        e.preventDefault();
        addNote(note.title, note.content, note.tag);
        setNote({ title: "", content: "", tag: "" })
    }

    const onChange = (e) => {
        setNote({ ...note, [e.target.name]: e.target.value })
    }

    return (
        <div className="container my-3">
            <h2>Add a Note</h2>
            <div className="add-note-editor">
                <input
                    type="text"
                    className="add-note-title"
                    name="title"
                    placeholder="Title"
                    value={note.title}
                    onChange={onChange}
                    minLength={3}
                    required
                />
                <div className="add-note-tag-row">
                    <label htmlFor="tag" className="add-note-tag-label">Tag:</label>
                    <input
                        type="text"
                        className="add-note-tag-input"
                        id="tag"
                        name="tag"
                        placeholder="optional"
                        value={note.tag}
                        onChange={onChange}
                    />
                </div>
                <textarea
                    className="add-note-content"
                    name="content"
                    placeholder="Write your note content here..."
                    value={note.content}
                    onChange={onChange}
                    minLength={5}
                    required
                />
                <button
                    type="submit"
                    className="btn btn-primary add-note-save"
                    onClick={handleClick}
                    disabled={note.title.length < 3 || note.content.length < 5}
                >
                    Save Note
                </button>
            </div>

            <style>{`
                .add-note-editor {
                    margin-top: 1rem;
                    padding: 1rem;
                    background: #ffffff;
                    border-radius: 8px;
                    border: 1px solid #dee2e6;
                    color-scheme: light;
                }
                .add-note-title {
                    background: #ffffff;
                    color: #000000;
                    font-size: 1.4rem;
                    font-weight: 600;
                    border: none;
                    outline: none;
                    width: 100%;
                    padding: 0;
                    margin-bottom: 0.5rem;
                    display: block;
                }
                .add-note-title::placeholder {
                    color: #6c757d;
                }
                .add-note-tag-row {
                    margin-bottom: 1rem;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }
                .add-note-tag-label {
                    font-size: 0.875rem;
                    color: #111111;
                    margin: 0;
                }
                .add-note-tag-input {
                    background: #ffffff;
                    color: #000000;
                    border: 1px solid #ddd;
                    font-size: 0.875rem;
                    border-radius: 4px;
                    padding: 0.25rem 0.5rem;
                    flex: 1;
                    max-width: 200px;
                }
                .add-note-tag-input::placeholder {
                    color: #6c757d;
                }
                .add-note-content {
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
                    padding: 0;
                    margin-bottom: 1rem;
                }
                .add-note-content::placeholder {
                    color: #6c757d;
                }
                .add-note-save {
                    margin-top: 0.5rem;
                }
            `}</style>
        </div>
    )
}

export default AddNote;
