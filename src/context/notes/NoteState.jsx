import NoteContext from "./NoteContext";
import React, { useState } from "react";

const NoteState = (props) => {
    const host = import.meta.env.VITE_BACKEND_URL || "http://localhost:8000";

    const [notes, setNotes] = useState([]);

    // Get all Notes
    // append=false: replace notes (use for initial load when mounting). append=true: append (use for infinite scroll).
    const getNotes = async (limit = 20, skip = 0, append = false, signal = null) => {
        try {
            const fetchOptions = {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem("token")}`,
                },
            };
            if (signal) fetchOptions.signal = signal;

            const response = await fetch(`${host}/api/notes/all/?limit=${limit}&skip=${skip}`, fetchOptions);

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data?.error || `Request failed: ${response.status}`);
            }
            if (!data?.success || !Array.isArray(data?.notes)) {
                throw new Error(data?.error || "Invalid notes response");
            }

            if (append === true) {
                setNotes((prev) => [...prev, ...data.notes]);
            } else {
                setNotes(data.notes);
            }

            return {
                newNotes: data.notes,
                hasMore: data.notes.length === limit,
            };
        } catch (error) {
            if (error?.name === "AbortError") throw error;
            console.error("Error fetching notes:", error);
            if (append !== true) setNotes([]);
            return { newNotes: [], hasMore: false };
        }
    };

    // Search notes (dedicated API; does not touch notes state). Uses q= for encrypted-note search.
    const searchNotes = async (q, limit = 20, skip = 0) => {
        const trimmed = typeof q === "string" ? q.trim() : "";
        if (!trimmed) {
            return { notes: [], hasMore: false };
        }
        try {
            const url = `${host}/api/notes/search/?q=${encodeURIComponent(trimmed)}&limit=${limit}&skip=${skip}`;
            const response = await fetch(url, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem("token")}`,
                },
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data?.error || `Request failed: ${response.status}`);
            }
            if (!data?.success || !Array.isArray(data?.notes)) {
                throw new Error(data?.error || "Invalid search response");
            }
            const notesList = data.notes || [];
            return { notes: notesList, hasMore: notesList.length === limit };
        } catch (error) {
            console.error("Error searching notes:", error);
            return { notes: [], hasMore: false };
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

            setNotes((prev) => prev.filter((note) => note.id !== id)); // Use `id` from backend
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

            setNotes((prev) =>
                prev.map((n) => {
                    if (n?.id === id) {
                        return {
                            ...n,
                            title,
                            content,
                            tag,
                            updated_at: new Date().toISOString(),
                        };
                    }
                    return n;
                })
            );
        } catch (error) {
            console.error("Error updating note:", error);
        }
    };

    return (
        <NoteContext.Provider value={{ notes, addNote, deleteNote, editNote, getNotes, searchNotes }}>
            {props.children}
        </NoteContext.Provider>
    );
};

export default NoteState;