import React, { useContext } from "react";
import { NavLink, Link } from "react-router-dom";
import AuthContext from "../context/auth/AuthContext";

/**
 * Reusable Sidebar component.
 * Uses NavLink so active classes are applied automatically by React Router.
 * Rendered once via Layout.jsx — no duplication across pages.
 */
const Sidebar = () => {
    const { user } = useContext(AuthContext);
    const isPro = user?.plan && user.plan !== "free";

    return (
        <aside className="dashboard-sidebar">
            {/* ── Library Section ───────────────────────── */}
            <h3 className="sidebar-section-title">Library</h3>
            <ul className="sidebar-menu">
                <li>
                    <NavLink
                        to="/"
                        end
                        className={({ isActive }) =>
                            `sidebar-item${isActive ? " active" : ""}`
                        }
                    >
                        <i className="bi bi-journal-text"></i> All Notes
                    </NavLink>
                </li>
                <li>
                    <NavLink
                        to="/favorites"
                        className={({ isActive }) =>
                            `sidebar-item${isActive ? " active" : ""}`
                        }
                    >
                        <i className="bi bi-star"></i> Favorites
                    </NavLink>
                </li>
                <li>
                    <NavLink
                        to="/trash"
                        className={({ isActive }) =>
                            `sidebar-item${isActive ? " active" : ""}`
                        }
                    >
                        <i className="bi bi-trash"></i> Trash
                    </NavLink>
                </li>
            </ul>

            {/* ── My Files Section ──────────────────────── */}
            <div className="sidebar-files-section">
                <h3 className="sidebar-section-title">My Files</h3>
                <NavLink
                    to="/files"
                    className={({ isActive }) =>
                        `sidebar-item${isActive ? " active" : ""}`
                    }
                    style={{ marginBottom: "0.5rem" }}
                >
                    <i className="bi bi-folder2-open"></i> My Files
                </NavLink>
                <ul className="sidebar-files-list">
                    <li className="sidebar-files-empty">
                        Go to My Files to manage uploads
                    </li>
                </ul>
            </div>

            {/* ── Premium Upgrade Card ──────────────────── */}
            {!isPro && (
                <div className="sidebar-premium-card">
                    <h4>Go Premium</h4>
                    <p>Unlock unlimited notes, 5 GB storage &amp; file uploads.</p>
                    <Link
                        to="/subscription"
                        className="btn btn-sm btn-warning w-100 fw-bold"
                    >
                        Upgrade Now
                    </Link>
                </div>
            )}
        </aside>
    );
};

export default Sidebar;
