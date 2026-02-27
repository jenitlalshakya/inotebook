import NoteContext from "./NoteContext";
import React, { useState } from "react";

const NoteState = (props) => {
    const host = "http://localhost:8000";

    const [notes, setNotes] = useState([]);

    // Get all Notes
    const getNotes = async () => {
        try {
            const response = await fetch(`${host}/api/notes/all/`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem("token")}`,
                },
            });

            const data = await response.json();
            console.log("Fetched notes:", data);

            // Backend returns { success: true, notes: [...] }
            setNotes(data.notes || []);
        } catch (error) {
            console.error("Error fetching notes:", error);
            setNotes([]);
        }
    };

    // Add a Note
    const addNote = async (title, content, tag) => {
        try {
            const response = await fetch(`${host}/api/notes/create/`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem("token")}`,
                },
                body: JSON.stringify({ title, content, tag }),
            });

            const data = await response.json();
            console.log("Added note:", data);

            if (data?.success && data?.note_id) {
                const nowIso = new Date().toISOString();
                const newNote = {
                    id: data.note_id,
                    title,
                    content,
                    tag,
                    created_at: nowIso,
                    updated_at: nowIso,
                };
                setNotes((prev) => [newNote, ...prev]);
            } else {
                console.error("Unexpected create response:", data);
            }
        } catch (error) {
            console.error("Error adding note:", error);
        }
    };

    // Delete a Note
    const deleteNote = async (id) => {
        try {
            const response = await fetch(`${host}/api/notes/delete/${id}/`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem("token")}`,
                },
            });

            const data = await response.json();
            console.log("Deleted note:", data);

            const newNotes = notes.filter((note) => note.id !== id); // Use `id` from backend
            setNotes(newNotes);
        } catch (error) {
            console.error("Error deleting note:", error);
        }
    };

    // Edit a Note
    const editNote = async (id, title, content, tag) => {
        try {
            const response = await fetch(`${host}/api/notes/update/${id}/`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem("token")}`,
                },
                body: JSON.stringify({ title, content, tag }),
            });

            const data = await response.json();
            console.log("Updated note:", data);

            let newNotes = JSON.parse(JSON.stringify(notes));
            for (let i = 0; i < newNotes.length; i++) {
                if (newNotes[i].id === id) { // Use `id` from backend
                    newNotes[i].title = title;
                    newNotes[i].content = content;
                    newNotes[i].tag = tag;
                    break;
                }
            }
            setNotes(newNotes);
        } catch (error) {
            console.error("Error updating note:", error);
        }
    };

    return (
        <NoteContext.Provider value={{ notes, addNote, deleteNote, editNote, getNotes }}>
            {props.children}
        </NoteContext.Provider>
    );
};

export default NoteState;