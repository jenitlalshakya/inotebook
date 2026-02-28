import React from "react";
import { Link } from "react-router-dom";

const PublicHome = () => {
    const features = [
        "Create and organize your notes securely",
        "Edit and delete notes anytime",
        "Access your notes from anywhere",
        "Simple, fast, and easy to use",
    ];

    return (
        <div className="public-home auth-page">
            <div className="public-home__card">
                <h1 className="public-home__title">Welcome to iNotebook!</h1>
                <p className="public-home__subtitle">
                    Your personal space to capture ideas, organize thoughts, and keep everything in one place.
                </p>

                <ul className="public-home__features">
                    {features.map((feature, idx) => (
                        <li key={idx}>{feature}</li>
                    ))}
                </ul>

                <div className="public-home__actions">
                    <Link to="/login" className="btn btn-primary btn-lg">
                        Login
                    </Link>
                    <Link to="/signup" className="btn btn-outline-primary btn-lg">
                        Sign Up
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default PublicHome;
