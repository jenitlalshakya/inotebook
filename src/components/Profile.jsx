import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE = import.meta.env.VITE_BACKEND_URL || "http://localhost:8000";
const MIN_PASSWORD_LENGTH = 6;

const Profile = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [passwordForm, setPasswordForm] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });
    const [passwordErrors, setPasswordErrors] = useState({});
    const [passwordSuccess, setPasswordSuccess] = useState(null);
    const [showPasswords, setShowPasswords] = useState(false);
    const [changePasswordLoading, setChangePasswordLoading] = useState(false);
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
                const response = await fetch(`${API_BASE}/api/accounts/auth/profile/`, {
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
            const response = await fetch(`${API_BASE}/api/accounts/auth/delete-account/`, {
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

    const validatePasswordForm = () => {
        const errs = {};
        if (!passwordForm.currentPassword) {
            errs.currentPassword = "Current password is required.";
        }
        if (!passwordForm.newPassword) {
            errs.newPassword = "New password is required.";
        } else if (passwordForm.newPassword.length < MIN_PASSWORD_LENGTH) {
            errs.newPassword = `New password must be at least ${MIN_PASSWORD_LENGTH} characters.`;
        }
        if (!passwordForm.confirmPassword) {
            errs.confirmPassword = "Please confirm your new password.";
        } else if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            errs.confirmPassword = "Passwords do not match.";
        }
        setPasswordErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setPasswordForm((prev) => ({ ...prev, [name]: value }));
        setPasswordErrors((prev) => {
            const { submit, ...rest } = prev;
            return { ...rest, [name]: "" };
        });
        setPasswordSuccess(null);
        setError(null);
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        setPasswordSuccess(null);
        setError(null);

        if (!validatePasswordForm()) return;

        const token = localStorage.getItem("token");
        if (!token) {
            navigate("/login");
            return;
        }

        setChangePasswordLoading(true);
        try {
            const response = await fetch(`${API_BASE}/api/accounts/auth/change-password/`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    old_password: passwordForm.currentPassword,
                    new_password: passwordForm.newPassword,
                }),
            });

            const data = await response.json().catch(() => ({}));

            if (!response.ok || data.success === false) {
                if (response.status === 401) {
                    localStorage.removeItem("token");
                    localStorage.removeItem("name");
                    navigate("/login");
                    return;
                }
                setPasswordErrors({ submit: data.error || "Failed to change password. Please try again." });
                return;
            }
            
            setPasswordSuccess("Password changed successfully. Redirecting you to login...");
            setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });

            // Clear auth data and redirect to login after a short delay
            localStorage.removeItem("token");
            localStorage.removeItem("name");
            setTimeout(() => {
                navigate("/login");
            }, 1500);
        } catch (err) {
            setPasswordErrors({ submit: "Unable to connect to the server. Please try again." });
        } finally {
            setChangePasswordLoading(false);
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

                        <div className="profile-card__section profile-card__change-password">
                            <h3 className="profile-card__section-title">Change Password</h3>
                            {passwordSuccess && (
                                <div className="alert alert-success" role="alert">
                                    {passwordSuccess}
                                </div>
                            )}
                            {passwordErrors.submit && (
                                <div className="alert alert-danger" role="alert">
                                    {passwordErrors.submit}
                                </div>
                            )}
                            <form onSubmit={handleChangePassword} noValidate>
                                <div className="mb-3 position-relative">
                                    <label htmlFor="currentPassword" className="form-label">
                                        Current Password
                                    </label>
                                    <input
                                        type={showPasswords ? "text" : "password"}
                                        className={`form-control ${passwordErrors.currentPassword ? "is-invalid" : ""}`}
                                        id="currentPassword"
                                        name="currentPassword"
                                        value={passwordForm.currentPassword}
                                        onChange={handlePasswordChange}
                                        autoComplete="current-password"
                                    />
                                    <button
                                        type="button"
                                        className="btn btn-outline-secondary btn-sm position-absolute"
                                        style={{ top: "38px", right: "10px" }}
                                        onClick={() => setShowPasswords((p) => !p)}
                                    >
                                        {showPasswords ? "Hide" : "Show"}
                                    </button>
                                    {passwordErrors.currentPassword && (
                                        <div className="invalid-feedback d-block">{passwordErrors.currentPassword}</div>
                                    )}
                                </div>
                                <div className="mb-3 position-relative">
                                    <label htmlFor="newPassword" className="form-label">
                                        New Password
                                    </label>
                                    <input
                                        type={showPasswords ? "text" : "password"}
                                        className={`form-control ${passwordErrors.newPassword ? "is-invalid" : ""}`}
                                        id="newPassword"
                                        name="newPassword"
                                        value={passwordForm.newPassword}
                                        onChange={handlePasswordChange}
                                        autoComplete="new-password"
                                    />
                                    {passwordErrors.newPassword && (
                                        <div className="invalid-feedback d-block">{passwordErrors.newPassword}</div>
                                    )}
                                </div>
                                <div className="mb-3 position-relative">
                                    <label htmlFor="confirmPassword" className="form-label">
                                        Confirm New Password
                                    </label>
                                    <input
                                        type={showPasswords ? "text" : "password"}
                                        className={`form-control ${passwordErrors.confirmPassword ? "is-invalid" : ""}`}
                                        id="confirmPassword"
                                        name="confirmPassword"
                                        value={passwordForm.confirmPassword}
                                        onChange={handlePasswordChange}
                                        autoComplete="new-password"
                                    />
                                    {passwordErrors.confirmPassword && (
                                        <div className="invalid-feedback d-block">{passwordErrors.confirmPassword}</div>
                                    )}
                                </div>
                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                    disabled={changePasswordLoading}
                                >
                                    {changePasswordLoading ? (
                                        <>
                                            <span
                                                className="spinner-border spinner-border-sm me-2"
                                                role="status"
                                                aria-hidden="true"
                                            />
                                            Changing...
                                        </>
                                    ) : (
                                        "Change Password"
                                    )}
                                </button>
                            </form>
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
