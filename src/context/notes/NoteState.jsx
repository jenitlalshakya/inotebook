import NoteContext from "./NoteContext";
import React, { useState } from "react";

const NoteState = (props) => {
    const host = import.meta.env.VITE_BACKEND_URL || "http://localhost:8000";

    const [notes, setNotes] = useState([]);
    const [totalNotes, setTotalNotes] = useState(0);
    const [trashNotes, setTrashNotes] = useState([]);
    const [favoriteNotes, setFavoriteNotes] = useState([]);

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

            if (data.count !== undefined) {
                setTotalNotes(data.count);
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
    // Also normalizes `is_favorite` by merging with the current notes/favorites state in case
    // the search endpoint omits it.
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

            // Build a quick lookup from existing state
            const favIdSet = new Set((favoriteNotes || []).map((n) => n?.id ?? n?._id).filter((v) => v != null));
            const notesFavMap = new Map(
                (notes || [])
                    .map((n) => [n?.id ?? n?._id, n?.is_favorite])
                    .filter(([id]) => id != null)
            );

            const normalized = notesList.map((n) => {
                const id = n?.id ?? n?._id;
                if (id == null) return n;

                // Prefer API value if it is a boolean
                if (typeof n?.is_favorite === "boolean") return n;

                // Otherwise merge from local state
                if (favIdSet.has(id)) return { ...n, is_favorite: true };
                if (notesFavMap.has(id) && typeof notesFavMap.get(id) === "boolean") {
                    return { ...n, is_favorite: notesFavMap.get(id) };
                }
                return { ...n, is_favorite: false };
            });

            return { notes: normalized, hasMore: notesList.length === limit };
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
                setTotalNotes((prev) => prev + 1);
            } else {
                console.error("Unexpected create response:", data);
            }
        } catch (error) {
            console.error("Error adding note:", error);
        }
    };

    // Delete a Note (Move to trash)
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
            setTotalNotes((prev) => prev - 1);
        } catch (error) {
            console.error("Error deleting note:", error);
        }
    };

    // Get Trash Notes
    const getTrashNotes = async () => {
        try {
            const response = await fetch(`${host}/api/notes/get-trash/`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem("token")}`,
                },
            });

            const data = await response.json();

            if (response.ok && data?.success) {
                setTrashNotes(data.notes || []);
            } else {
                console.error("Error fetching trash notes:", data?.error);
            }
        } catch (error) {
            console.error("Error fetching trash notes:", error);
        }
    };

    // Delete Permanent (single note)
    const deletePermanentNote = async (id) => {
        try {
            const response = await fetch(`${host}/api/notes/delete-permanent/${id}/`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem("token")}`,
                },
            });

            const data = await response.json();

            if (response.ok && data?.success) {
                setTrashNotes((prev) => prev.filter((note) => note.id !== id));
            } else {
                console.error("Error deleting note permanently:", data?.error);
            }
        } catch (error) {
            console.error("Error deleting note permanently:", error);
        }
    };

    // Restore Note
    const restoreNote = async (id) => {
        try {
            const response = await fetch(`${host}/api/notes/restore/${id}/`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem("token")}`,
                },
            });

            const data = await response.json();

            if (response.ok && data?.success) {
                setTrashNotes((prev) => prev.filter((note) => note.id !== id));
                if (data.note) {
                    setNotes((prev) => [data.note, ...prev]);
                    setTotalNotes((prev) => prev + 1);
                }
            } else {
                console.error("Error restoring note:", data?.error);
            }
        } catch (error) {
            console.error("Error restoring note:", error);
        }
    };

    // Empty Trash
    const emptyTrash = async () => {
        try {
            const response = await fetch(`${host}/api/notes/empty-trash/`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem("token")}`,
                },
            });

            const data = await response.json();

            if (response.ok && data?.success) {
                setTrashNotes([]);
            } else {
                console.error("Error emptying trash:", data?.error);
            }
        } catch (error) {
            console.error("Error emptying trash:", error);
        }
    };

    // Toggle Favorite (optimistic + shared state)
    const toggleFavorite = async (id, currentIsFavorite) => {
        const endpoint = currentIsFavorite ? "unfavorite" : "favorite";

        // snapshots for revert
        const prevNotesSnapshot = notes;
        const prevFavoritesSnapshot = favoriteNotes;

        // optimistic update: notes
        setNotes((prev) =>
            prev.map((n) =>
                (n?.id ?? n?._id) === id ? { ...n, is_favorite: !currentIsFavorite } : n
            )
        );

        // optimistic update: favoriteNotes
        setFavoriteNotes((prev) => {
            if (!currentIsFavorite) {
                const exists = prev.some((n) => (n?.id ?? n?._id) === id);
                if (exists) return prev;
                const noteToAdd = prevNotesSnapshot.find((n) => (n?.id ?? n?._id) === id) || null;
                return noteToAdd ? [{ ...noteToAdd, is_favorite: true }, ...prev] : [{ id, is_favorite: true }, ...prev];
            }
            return prev.filter((n) => (n?.id ?? n?._id) !== id);
        });

        try {
            const response = await fetch(`${host}/api/notes/${endpoint}/${id}/`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem("token")}`,
                },
            });
            const data = await response.json();
            if (!response.ok || !data?.success) {
                throw new Error(data?.error || "Failed to update favorite status");
            }
            return { success: true };
        } catch (error) {
            console.error("Error toggling favorite:", error);
            // revert
            setNotes(prevNotesSnapshot);
            setFavoriteNotes(prevFavoritesSnapshot);
            return { success: false, error: error.message };
        }
    };

    const removeFavorite = async (id) => {
        return await toggleFavorite(id, true);
    };

    // Get Favorite Notes
    const getFavoriteNotes = async () => {
        try {
            const response = await fetch(`${host}/api/notes/favorites/`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem("token")}`,
                },
            });
            const data = await response.json();
            if (response.ok && data?.success && Array.isArray(data?.notes)) {
                setFavoriteNotes(data.notes);
                return { notes: data.notes };
            }
            setFavoriteNotes([]);
            return { notes: [] };
        } catch (error) {
            console.error("Error fetching favorite notes:", error);
            setFavoriteNotes([]);
            return { notes: [] };
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
        <NoteContext.Provider value={{ notes, totalNotes, trashNotes, favoriteNotes, addNote, deleteNote, editNote, getNotes, searchNotes, getTrashNotes, deletePermanentNote, emptyTrash, restoreNote, toggleFavorite, removeFavorite, getFavoriteNotes }}>
            {props.children}
        </NoteContext.Provider>
    );
};

export default NoteState;