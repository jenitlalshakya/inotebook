import React, { useContext, useState, useEffect, useRef } from "react";
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

    const [menuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef(null);

    const handleLogout = () => {
        logout();
        clearNotes();
        navigate("/login");
        setMenuOpen(false);
    };

    const closeMenu = () => setMenuOpen(false);
    const toggleMenu = () => setMenuOpen((prev) => !prev);

    // Close menu on outside click
    useEffect(() => {
        const handleOutsideClick = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                setMenuOpen(false);
            }
        };
        if (menuOpen) {
            document.addEventListener("mousedown", handleOutsideClick);
        }
        return () => document.removeEventListener("mousedown", handleOutsideClick);
    }, [menuOpen]);

    // Close menu on route change
    useEffect(() => {
        setMenuOpen(false);
    }, [location.pathname]);

    return (
        <header className="custom-navbar" ref={menuRef}>
            <Link to="/" className="nav-logo">
                <span className="nav-logo-icon">
                    <i className="bi bi-journal-text"></i>
                </span>
                <span className="nav-logo-text">{props.title || "iNotebook"}</span>
            </Link>

            {/* Desktop Nav Links */}
            <nav className="nav-links">
                {isAuthenticated ? (
                    <>
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
                        <Link to="/" className={`nav-link ${location.pathname === "/" ? "active" : ""}`}>Home</Link>
                        <Link to="/about" className={`nav-link ${location.pathname === "/about" ? "active" : ""}`}>About</Link>
                        <Link to="#features" className="nav-link">Features</Link>
                    </>
                )}
            </nav>

            {/* Desktop Action Buttons */}
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
                        <Link to="/signup" className="nav-btn-danger" style={{ backgroundColor: '#0d4a46' }}>
                            Sign Up
                        </Link>
                    </>
                )}
            </div>

            {/* Hamburger Button (mobile only) */}
            <button
                className={`hamburger-btn ${menuOpen ? "open" : ""}`}
                onClick={toggleMenu}
                aria-label="Toggle navigation menu"
                aria-expanded={menuOpen}
            >
                <span className="hamburger-line"></span>
                <span className="hamburger-line"></span>
                <span className="hamburger-line"></span>
            </button>

            {/* Mobile Dropdown Menu */}
            <div className={`mobile-menu ${menuOpen ? "mobile-menu--open" : ""}`} aria-hidden={!menuOpen}>
                <nav className="mobile-nav">
                    {isAuthenticated ? (
                        <>
                            <Link to="/" className={`mobile-nav-link ${location.pathname === "/" ? "active" : ""}`} onClick={closeMenu}>
                                <i className="bi bi-journal-text"></i> Notes
                            </Link>
                            <Link to="/files" className={`mobile-nav-link ${location.pathname === "/files" ? "active" : ""}`} onClick={closeMenu}>
                                <i className="bi bi-folder2-open"></i> My Files
                            </Link>
                            <Link to="/favorites" className={`mobile-nav-link ${location.pathname === "/favorites" ? "active" : ""}`} onClick={closeMenu}>
                                <i className="bi bi-star"></i> Favorites
                            </Link>
                            <Link to="/trash" className={`mobile-nav-link ${location.pathname === "/trash" ? "active" : ""}`} onClick={closeMenu}>
                                <i className="bi bi-trash"></i> Trash
                            </Link>
                            <Link to="/profile" className={`mobile-nav-link ${location.pathname === "/profile" ? "active" : ""}`} onClick={closeMenu}>
                                <i className="bi bi-person"></i> Profile
                            </Link>
                            <Link to="/subscription" className={`mobile-nav-link ${location.pathname === "/subscription" ? "active" : ""}`} onClick={closeMenu}>
                                <i className="bi bi-star-fill"></i>
                                {user && user.plan !== "free" ? " PRO Plan" : " Upgrade to Pro"}
                            </Link>
                            <div className="mobile-menu-divider"></div>
                            <button onClick={handleLogout} className="mobile-nav-logout">
                                <i className="bi bi-box-arrow-right"></i> Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <Link to="/" className={`mobile-nav-link ${location.pathname === "/" ? "active" : ""}`} onClick={closeMenu}>
                                <i className="bi bi-house"></i> Home
                            </Link>
                            <Link to="/about" className={`mobile-nav-link ${location.pathname === "/about" ? "active" : ""}`} onClick={closeMenu}>
                                <i className="bi bi-info-circle"></i> About
                            </Link>
                            <Link to="#features" className="mobile-nav-link" onClick={closeMenu}>
                                <i className="bi bi-grid"></i> Features
                            </Link>
                            <div className="mobile-menu-divider"></div>
                            <Link to="/login" className="mobile-nav-link mobile-nav-link--cta" onClick={closeMenu}>
                                <i className="bi bi-person-circle"></i> Login
                            </Link>
                            <Link to="/signup" className="mobile-nav-link mobile-nav-link--signup" onClick={closeMenu}>
                                Sign Up
                            </Link>
                        </>
                    )}
                </nav>
            </div>
        </header>
    );
};

export default Navbar;
