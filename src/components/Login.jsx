import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import "./Auth.css";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const Login = () => {
    const host = import.meta.env.VITE_BACKEND_URL || "http://localhost:8000";

    const [form, setForm] = useState({ email: "", password: "" });
    const [errors, setErrors] = useState({});
    const [apiError, setApiError] = useState(null);
    const [showPassword, setShowPassword] = useState(false);
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

        if (!form.email.trim()) {
            newErrors.email = "Email is required.";
        } else if (!emailRegex.test(form.email.trim())) {
            newErrors.email = "Please enter a valid email address.";
        }

        if (!form.password) {
            newErrors.password = "Password is required.";
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
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setApiError(null);

        if (!validate()) return;

        setLoading(true);
        try {
            const response = await fetch(`${host}/api/accounts/auth/login/`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: form.email.trim(),
                    password: form.password,
                }),
            });

            const data = await response.json().catch(() => ({}));

            if (!response.ok || data.success === false || !data.token) {
                setApiError(data.error || "Invalid email or password.");
                return;
            }

            localStorage.setItem("token", data.token);
            if (data.name) {
                localStorage.setItem("name", data.name);
            }

            if (data.email) {
                localStorage.setItem("email", email);
            }
            navigate("/");
        } catch (err) {
            setApiError("Unable to connect to the server. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <Navbar />
            <div className="auth-content">
                <div className="auth-card">
                    <div className="auth-header">
                        <div className="auth-logo">
                            <i className="bi bi-journal-text"></i>
                        </div>
                        <h2 className="auth-title">Welcome Back</h2>
                        <p className="auth-subtitle">Sign in to continue to iNotebook</p>
                    </div>

                    {apiError && (
                        <div className="auth-alert auth-alert-danger" role="alert">
                            <i className="bi bi-exclamation-circle-fill"></i>
                            <div>{apiError}</div>
                        </div>
                    )}

                    <form className="auth-form" onSubmit={handleSubmit} noValidate>
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
                                    placeholder="Enter your password"
                                    value={form.password}
                                    onChange={handleChange}
                                    autoComplete="current-password"
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

                        <button
                            type="submit"
                            className="auth-button"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                    Signing in...
                                </>
                            ) : (
                                "Login"
                            )}
                        </button>
                    </form>

                    <div className="auth-footer">
                        Don't have an account? <Link to="/signup" className="auth-link">Sign up</Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
