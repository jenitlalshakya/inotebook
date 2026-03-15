import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "./Navbar.css";

const Navbar = (props) => {
    const location = useLocation();
    const navigate = useNavigate();
    const token = localStorage.getItem("token");
    const isAuthenticated = !!token;

    const handleLogout = () => {
        localStorage.removeItem("token");
        navigate("/");
        window.location.reload();
    };

    return (
        <header className="custom-navbar">
            <Link to="/" className="nav-logo">
                <span className="nav-logo-icon">
                    <i className="bi bi-journal-text"></i>
                </span>
                <span className="nav-logo-text">{props.title || "iNotebook"}</span>
            </Link>

            <nav className="nav-links">
                {isAuthenticated ? (
                    <>
                        {/* Authenticated Links */}
                        <Link to="/" className={`nav-link ${location.pathname === "/" ? "active" : ""}`}>Notes</Link>
                        <Link to="/profile" className={`nav-link ${location.pathname === "/profile" ? "active" : ""}`}>Profile</Link>
                        {/* You can add more app-specific links here if needed */}
                    </>
                ) : (
                    <>
                        {/* Public Links */}
                        <Link to="/" className={`nav-link ${location.pathname === "/" ? "active" : ""}`}>Home</Link>
                        <Link to="/about" className={`nav-link ${location.pathname === "/about" ? "active" : ""}`}>About</Link>
                        <Link to="#features" className="nav-link">Features</Link>
                    </>
                )}
            </nav>

            <div className="nav-actions">
                {isAuthenticated ? (
                    <button onClick={handleLogout} className="nav-btn-danger">
                        Logout
                    </button>
                ) : (
                    <>
                        <Link to="/login" className="nav-btn-light">
                            <i className="bi bi-person-circle"></i> Login
                        </Link>
                        <Link to="/signup" className="nav-btn-danger" style={{backgroundColor: '#0d4a46'}}>
                            Sign Up
                        </Link>
                    </>
                )}
            </div>
        </header>
    );
};

export default Navbar;
