import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

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
        <div className="container auth-page" style={{ maxWidth: "420px" }}>
            <h2 className="mb-3 text-center">Log in</h2>
            <p className="text-muted text-center mb-4">
                Enter your credentials to access your notes.
            </p>

            {apiError && (
                <div className="alert alert-danger" role="alert">
                    {apiError}
                </div>
            )}

            <form onSubmit={handleSubmit} noValidate>
                <div className="mb-3">
                    <label htmlFor="email" className="form-label">
                        Email address
                    </label>
                    <input
                        type="email"
                        className={`form-control ${errors.email ? "is-invalid" : ""}`}
                        id="email"
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        autoComplete="email"
                    />
                    {errors.email && <div className="invalid-feedback">{errors.email}</div>}
                </div>

                <div className="mb-3">
                    <label htmlFor="password" className="form-label">
                        Password
                    </label>
                    <div className="input-group">
                        <input
                            type={showPassword ? "text" : "password"}
                            className={`form-control ${errors.password ? "is-invalid" : ""}`}
                            id="password"
                            name="password"
                            value={form.password}
                            onChange={handleChange}
                            autoComplete="current-password"
                        />
                        <span
                            className="input-group-text"
                            style={{ cursor: "pointer" }}
                            onClick={() => setShowPassword((prev) => !prev)}
                        >
                            <i className={`bi ${showPassword ? "bi-eye-slash" : "bi-eye"}`}></i>
                        </span>
                    </div>
                    {errors.password && (
                        <div className="invalid-feedback d-block">{errors.password}</div>
                    )}
                </div>

                <button
                    type="submit"
                    className="btn btn-primary w-100"
                    disabled={loading}
                >
                    {loading ? (
                        <>
                            <span
                                className="spinner-border spinner-border-sm me-2"
                                role="status"
                                aria-hidden="true"
                            ></span>
                            Logging in...
                        </>
                    ) : (
                        "Log in"
                    )}
                </button>
            </form>

            <p className="mt-3 text-center">
                Don't have an account?{" "}
                <Link to="/signup">
                    Sign up
                </Link>
            </p>
        </div>
    );
};

export default Login;
