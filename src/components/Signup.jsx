import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

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
        <div className="container auth-page" style={{ maxWidth: "480px" }}>
            <h2 className="mb-3 text-center">Create an account</h2>
            <p className="text-muted text-center mb-4">
                Sign up to start managing your notes securely.
            </p>

            {apiError && (
                <div className="alert alert-danger" role="alert">
                    {apiError}
                </div>
            )}
            {apiSuccess && (
                <div className="alert alert-success" role="alert">
                    {apiSuccess}
                </div>
            )}

            <form onSubmit={handleSubmit} noValidate>
                <div className="mb-3">
                    <label htmlFor="name" className="form-label">
                        Full Name
                    </label>
                    <input
                        type="text"
                        className={`form-control ${errors.name ? "is-invalid" : ""}`}
                        id="name"
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        autoComplete="name"
                    />
                    {errors.name && <div className="invalid-feedback">{errors.name}</div>}
                </div>

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

                <div className="mb-3 position-relative">
                    <label htmlFor="password" className="form-label">
                        Password
                    </label>
                    <input
                        type={showPassword ? "text" : "password"}
                        className={`form-control ${errors.password ? "is-invalid" : ""}`}
                        id="password"
                        name="password"
                        value={form.password}
                        onChange={handleChange}
                        autoComplete="new-password"
                    />
                    <button
                        type="button"
                        className="btn btn-outline-secondary btn-sm position-absolute"
                        style={{ top: "38px", right: "10px" }}
                        onClick={() => setShowPassword((prev) => !prev)}
                    >
                        {showPassword ? "Hide" : "Show"}
                    </button>
                    {errors.password && (
                        <div className="invalid-feedback d-block">{errors.password}</div>
                    )}
                </div>

                <div className="mb-3 position-relative">
                    <label htmlFor="confirmPassword" className="form-label">
                        Confirm Password
                    </label>
                    <input
                        type={showConfirmPassword ? "text" : "password"}
                        className={`form-control ${errors.confirmPassword ? "is-invalid" : ""}`}
                        id="confirmPassword"
                        name="confirmPassword"
                        value={form.confirmPassword}
                        onChange={handleChange}
                        autoComplete="new-password"
                    />
                    <button
                        type="button"
                        className="btn btn-outline-secondary btn-sm position-absolute"
                        style={{ top: "38px", right: "10px" }}
                        onClick={() => setShowConfirmPassword((prev) => !prev)}
                    >
                        {showConfirmPassword ? "Hide" : "Show"}
                    </button>
                    {errors.confirmPassword && (
                        <div className="invalid-feedback d-block">
                            {errors.confirmPassword}
                        </div>
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
                            Creating account...
                        </>
                    ) : (
                        "Sign up"
                    )}
                </button>
            </form>

            <p className="mt-3 text-center">
                Already have an account?{" "}
                <Link to="/login">
                    Log in
                </Link>
            </p>
        </div>
    );
};

export default Signup;
