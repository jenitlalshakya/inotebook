import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Auth.css";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 6;

const Signup = () => {
    const host = import.meta.env.VITE_BACKEND_URL || "http://localhost:8000";

    const [form, setForm] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
    });
    const [errors, setErrors] = useState({});
    const [apiError, setApiError] = useState(null);
    const [apiSuccess, setApiSuccess] = useState(null);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            navigate("/");
        }
    }, [navigate]);

    const validate = () => {
        const newErrors = {};

        if (!form.name.trim()) {
            newErrors.name = "Name is required.";
        }

        if (!form.email.trim()) {
            newErrors.email = "Email is required.";
        } else if (!emailRegex.test(form.email.trim())) {
            newErrors.email = "Please enter a valid email address.";
        }

        if (!form.password) {
            newErrors.password = "Password is required.";
        } else if (form.password.length < MIN_PASSWORD_LENGTH) {
            newErrors.password = `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`;
        }

        if (!form.confirmPassword) {
            newErrors.confirmPassword = "Please confirm your password.";
        } else if (form.password !== form.confirmPassword) {
            newErrors.confirmPassword = "Passwords do not match.";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({
            ...prev,
            [name]: value,
        }));
        setErrors((prev) => ({
            ...prev,
            [name]: "",
        }));
        setApiError(null);
        setApiSuccess(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setApiError(null);
        setApiSuccess(null);

        if (!validate()) return;

        setLoading(true);
        try {
            const response = await fetch(`${host}/api/accounts/auth/signup/`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: form.name.trim(),
                    email: form.email.trim(),
                    password: form.password,
                }),
            });

            const data = await response.json().catch(() => ({}));

            if (!response.ok || data.success === false) {
                setApiError(data.error || "Signup failed. Please try again.");
                return;
            }

            setApiSuccess("Account created successfully! You can now log in.");
            setForm({
                name: "",
                email: "",
                password: "",
                confirmPassword: "",
            });

            setTimeout(() => {
                navigate("/login");
            }, 800);
        } catch (err) {
            setApiError("Unable to connect to the server. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
                        <div className="auth-content">
                <div className="auth-card">
                    <div className="auth-header">
                        <div className="auth-logo">
                            <i className="bi bi-journal-text"></i>
                        </div>
                        <h2 className="auth-title">Create your account</h2>
                        <p className="auth-subtitle">Start organizing your ideas today</p>
                    </div>

                    {apiError && (
                        <div className="auth-alert auth-alert-danger" role="alert">
                            <i className="bi bi-exclamation-circle-fill"></i>
                            <div>{apiError}</div>
                        </div>
                    )}
                    {apiSuccess && (
                        <div className="auth-alert auth-alert-success" role="alert">
                            <i className="bi bi-check-circle-fill"></i>
                            <div>{apiSuccess}</div>
                        </div>
                    )}

                    <form className="auth-form" onSubmit={handleSubmit} noValidate>
                        <div className="form-group">
                            <label htmlFor="name" className="auth-label">
                                Full Name
                            </label>
                            <input
                                type="text"
                                className={`auth-input ${errors.name ? "is-invalid" : ""}`}
                                id="name"
                                name="name"
                                placeholder="John Doe"
                                value={form.name}
                                onChange={handleChange}
                                autoComplete="name"
                            />
                            {errors.name && <span className="auth-error-text">{errors.name}</span>}
                        </div>

                        <div className="form-group">
                            <label htmlFor="email" className="auth-label">
                                Email Address
                            </label>
                            <input
                                type="email"
                                className={`auth-input ${errors.email ? "is-invalid" : ""}`}
                                id="email"
                                name="email"
                                placeholder="name@example.com"
                                value={form.email}
                                onChange={handleChange}
                                autoComplete="email"
                            />
                            {errors.email && <span className="auth-error-text">{errors.email}</span>}
                        </div>

                        <div className="form-group">
                            <label htmlFor="password" className="auth-label">
                                Password
                            </label>
                            <div className="auth-password-group">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    className={`auth-input ${errors.password ? "is-invalid" : ""}`}
                                    id="password"
                                    name="password"
                                    placeholder="Create a password"
                                    value={form.password}
                                    onChange={handleChange}
                                    autoComplete="new-password"
                                />
                                <button
                                    type="button"
                                    className="auth-password-toggle"
                                    onClick={() => setShowPassword((prev) => !prev)}
                                    aria-label={showPassword ? "Hide password" : "Show password"}
                                >
                                    <i className={`bi ${showPassword ? "bi-eye-slash" : "bi-eye"}`}></i>
                                </button>
                            </div>
                            {errors.password && <span className="auth-error-text">{errors.password}</span>}
                        </div>

                        <div className="form-group">
                            <label htmlFor="confirmPassword" className="auth-label">
                                Confirm Password
                            </label>
                            <div className="auth-password-group">
                                <input
                                    type={showConfirmPassword ? "text" : "password"}
                                    className={`auth-input ${errors.confirmPassword ? "is-invalid" : ""}`}
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    placeholder="Confirm your password"
                                    value={form.confirmPassword}
                                    onChange={handleChange}
                                    autoComplete="new-password"
                                />
                                <button
                                    type="button"
                                    className="auth-password-toggle"
                                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                                    aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                                >
                                    <i className={`bi ${showConfirmPassword ? "bi-eye-slash" : "bi-eye"}`}></i>
                                </button>
                            </div>
                            {errors.confirmPassword && (
                                <span className="auth-error-text">{errors.confirmPassword}</span>
                            )}
                        </div>

                        <button
                            type="submit"
                            className="auth-button"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                    Creating account...
                                </>
                            ) : (
                                "Create Account"
                            )}
                        </button>
                    </form>

                    <div className="auth-footer">
                        Already have an account? <Link to="/login" className="auth-link">Log in</Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Signup;
