import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE = "http://localhost:8000/api/accounts/auth";

const Profile = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            navigate("/login");
            return;
        }

        const fetchProfile = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await fetch(`${API_BASE}/profile/`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                });

                const data = await response.json().catch(() => ({}));

                if (!response.ok || data.success === false) {
                    if (response.status === 401) {
                        localStorage.removeItem("token");
                        localStorage.removeItem("name");
                        navigate("/login");
                        return;
                    }
                    setError(data.error || "Failed to load profile.");
                    return;
                }

                if (data.user) {
                    setUser(data.user);
                }
            } catch (err) {
                setError("Unable to connect to the server. Please try again.");
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("name");
        navigate("/login");
    };

    const handleDeleteAccount = async () => {
        const confirmed = window.confirm(
            "Are you sure you want to delete your account? This action cannot be undone."
        );
        if (!confirmed) return;

        const token = localStorage.getItem("token");
        if (!token) {
            navigate("/login");
            return;
        }

        setDeleteLoading(true);
        setError(null);
        try {
            const response = await fetch(`${API_BASE}/delete-account/`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });

            const data = await response.json().catch(() => ({}));

            if (!response.ok || data.success === false) {
                setError(data.error || "Failed to delete account. Please try again.");
                return;
            }

            localStorage.removeItem("token");
            localStorage.removeItem("name");
            navigate("/");
        } catch (err) {
            setError("Unable to connect to the server. Please try again.");
        } finally {
            setDeleteLoading(false);
        }
    };

    const formatDate = (isoString) => {
        if (!isoString) return null;
        const d = new Date(isoString);
        if (Number.isNaN(d.getTime())) return null;
        return d.toLocaleDateString(undefined, {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    if (loading) {
        return (
            <div className="profile-page auth-page">
                <div className="profile-card">
                    <div className="text-center py-5">
                        <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                        <p className="mt-2 text-muted">Loading profile...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="profile-page auth-page">
            <div className="profile-card">
                <h2 className="profile-card__title">Profile Information</h2>

                {error && (
                    <div className="alert alert-danger" role="alert">
                        {error}
                    </div>
                )}

                {user && (
                    <>
                        <div className="profile-card__avatar" aria-hidden="true">
                            {user.name ? user.name.charAt(0).toUpperCase() : "?"}
                        </div>

                        <div className="profile-card__section">
                            <h3 className="profile-card__section-title">Account Details</h3>
                            <dl className="profile-card__details">
                                <div>
                                    <dt>Full Name</dt>
                                    <dd>{user.name || "—"}</dd>
                                </div>
                                <div>
                                    <dt>Email Address</dt>
                                    <dd>{user.email || "—"}</dd>
                                </div>
                                {user.created_at && (
                                    <div>
                                        <dt>Account Created</dt>
                                        <dd>{formatDate(user.created_at)}</dd>
                                    </div>
                                )}
                            </dl>
                        </div>

                        <div className="profile-card__actions">
                            <button
                                type="button"
                                className="btn btn-outline-primary"
                                disabled
                                title="Coming soon"
                            >
                                Edit Profile
                            </button>
                            <button
                                type="button"
                                className="btn btn-danger"
                                onClick={handleLogout}
                            >
                                Logout
                            </button>
                        </div>

                        <div className="profile-card__danger-zone">
                            <h3 className="profile-card__section-title">Danger Zone</h3>
                            <button
                                type="button"
                                className="btn btn-outline-danger"
                                onClick={handleDeleteAccount}
                                disabled={deleteLoading}
                            >
                                {deleteLoading ? (
                                    <>
                                        <span
                                            className="spinner-border spinner-border-sm me-2"
                                            role="status"
                                            aria-hidden="true"
                                        />
                                        Deleting...
                                    </>
                                ) : (
                                    "Delete Account"
                                )}
                            </button>
                        </div>
                    </>
                )}

                {!user && !error && !loading && (
                    <p className="text-muted">No profile data available.</p>
                )}
            </div>
        </div>
    );
};

export default Profile;
