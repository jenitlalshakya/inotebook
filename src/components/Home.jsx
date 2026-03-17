import React from "react";
import { Link, useNavigate } from "react-router-dom";
import Notes from "./Notes";
import PublicHome from "./PublicHome";
import "./HomeDashboard.css";

const Home = () => {
    const token = localStorage.getItem("token");

    if (!token) {
        return <PublicHome />;
    }

    return (
        <div className="home-dashboard">
            {/* Authenticated Dashboard Hero */}
            <section className="home-hero">
                <h1>Your Thoughts, <span className="highlight-red">Organized.</span></h1>
                <p>The simplest way to keep your notes, ideas, and daily tasks in one secure place. Designed for thinkers, builders, and everyone in between.</p>
            </section>

            {/* Main Application Area */}
            <Notes />

            <footer className="ph-footer" style={{background: 'transparent', padding: '1rem'}}>
               {/* Resusing PublicHome footer classes */}
                <div className="ph-footer-logo">
                    <i className="bi bi-journal-text" style={{color: '#aaa', marginRight: '4px'}}></i> iNotebook
                </div>
                <div className="ph-footer-copy">
                    © {new Date().getFullYear()} iNotebook Systems Inc. All rights reserved.
                </div>
            </footer>
        </div>
    );
};

export default Home;
