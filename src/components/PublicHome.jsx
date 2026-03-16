import React from "react";
import { Link } from "react-router-dom";
import Navbar from "./Navbar";
import "./PublicHome.css";

const PublicHome = () => {
    return (
        <div className="public-home-container">
            {/* Unified Header */}
            <Navbar />

            {/* Hero Section */}
            <section className="ph-hero" id="home">
                <h1 className="ph-hero-title">
                    Capture Your <br />
                    <span className="ph-highlight">Thoughts</span>, Anywhere
                </h1>
                <p className="ph-hero-subtitle">
                    Your digital space to organize ideas, tasks, and daily inspirations in one beautifully simple place.
                </p>
                <Link to="/signup" className="ph-cta-btn">
                    Get Started for Free
                </Link>
                <div className="ph-no-credit">
                    <i className="bi bi-check-circle-fill ph-check-icon"></i> No credit card required
                </div>
            </section>

            {/* Mockup Section */}
            <div className="ph-mockup-container">
                <div className="ph-mockup-window">
                    <div className="ph-mockup-header">
                        <div className="ph-dots">
                            <div className="ph-dot"></div>
                            <div className="ph-dot"></div>
                            <div className="ph-dot"></div>
                        </div>
                        <div className="ph-search-bar">
                             <div style={{fontSize: '10px', color: '#aaa', textAlign: 'center', lineHeight: '24px'}}>inotebook.app/dashboard</div>
                        </div>
                    </div>
                    <div className="ph-mockup-body">
                        <div className="ph-sidebar">
                            <div className="ph-nav-item active"></div>
                            <div className="ph-nav-item"></div>
                            <div className="ph-nav-item short"></div>
                            <br />
                            <div className="ph-nav-item"></div>
                            <div className="ph-nav-item short"></div>
                        </div>
                        <div className="ph-content">
                            <div className="ph-board-column">
                                <div className="d-flex justify-content-between align-items-center">
                                    <span className="ph-board-tag personal">Personal</span>
                                    <i className="bi bi-three-dots text-muted"></i>
                                </div>
                                <div className="ph-task-item">
                                    <div className="ph-task-line"></div>
                                    <div className="ph-task-line short"></div>
                                </div>
                                <div className="ph-task-item">
                                    <div className="ph-task-line"></div>
                                    <div className="ph-task-line"></div>
                                </div>
                            </div>
                            <div className="ph-board-column">
                                <div className="d-flex justify-content-between align-items-center">
                                    <span className="ph-board-tag work">Work</span>
                                    <i className="bi bi-three-dots text-muted"></i>
                                </div>
                                <div className="ph-task-item">
                                    <div className="ph-task-line"></div>
                                    <div className="ph-task-line short"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Organize Section */}
            <section className="ph-organize-section" id="features">
                <h2 className="ph-organize-title">Organize Your Life</h2>
                <p className="ph-organize-subtitle">
                    Stay on top of your tasks with our intuitive interface designed for maximum productivity and minimal distraction.
                </p>
                
                <div className="ph-cards-container">
                    <div className="ph-card">
                        <div className="ph-card-img-placeholder ph-card-img-work"></div>
                        <h3 className="ph-card-title">Work</h3>
                        <p className="ph-card-desc">
                            Keep your professional projects organized with tags, shared notebooks, and real-time collaboration tools.
                        </p>
                    </div>
                    <div className="ph-card">
                        <div className="ph-card-img-placeholder ph-card-img-personal"></div>
                        <h3 className="ph-card-title">Personal</h3>
                        <p className="ph-card-desc">
                            Manage your daily inspirations, journal entries, and personal to-do lists in a private, secure environment.
                        </p>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="ph-footer">
                <div className="ph-footer-links">
                    <a href="#!" className="ph-footer-link">Privacy</a>
                    <a href="#!" className="ph-footer-link">Terms</a>
                    <a href="#!" className="ph-footer-link">Help</a>
                </div>
                <div className="ph-footer-logo">
                    <Link to="/" className="ph-footer-link" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}><i className="bi bi-journal-text" style={{color: '#aaa', marginRight: '4px'}}></i> iNotebook</Link>
                </div>
                <div className="ph-footer-copy">
                    © {new Date().getFullYear()} iNotebook. All rights reserved. Designed for thinkers and makers everywhere.
                </div>
            </footer>
        </div>
    );
};

export default PublicHome;
