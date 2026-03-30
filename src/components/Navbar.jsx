import React, { useContext } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import AuthContext from "../context/auth/AuthContext";
import NoteContext from "../context/notes/NoteContext";
import "./Navbar.css";

const Navbar = (props) => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout } = useContext(AuthContext);
    const { clearNotes } = useContext(NoteContext);
    const token = localStorage.getItem("token");
    const isAuthenticated = !!token;

    const handleLogout = () => {
        logout();
        clearNotes();
        navigate("/login");
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
                        <Link to="/files" className={`nav-link ${location.pathname === "/files" ? "active" : ""}`}>My Files</Link>
                        <Link to="/favorites" className={`nav-link ${location.pathname === "/favorites" ? "active" : ""}`}>Favorites</Link>
                        <Link to="/trash" className={`nav-link ${location.pathname === "/trash" ? "active" : ""}`}>Trash</Link>
                        <Link to="/profile" className={`nav-link ${location.pathname === "/profile" ? "active" : ""}`}>Profile</Link>
                        <Link to="/subscription" className={`nav-link ${location.pathname === "/subscription" ? "active" : ""}`}>
                            {user && user.plan !== "free" ? <span className="badge bg-primary ms-1">PRO</span> : <span className="badge bg-secondary ms-1">Upgrade</span>}
                        </Link>
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
