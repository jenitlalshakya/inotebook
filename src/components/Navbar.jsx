import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

const Navbar = (props) => {
    const location = useLocation();
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem("token");
        navigate("/");
    };

    const token = localStorage.getItem("token");

    return (
        <nav className="navbar navbar-expand-lg navbar-dark bg-dark fixed-top">
            <div className="container-fluid">
                <Link className="navbar-brand" to="/">{props.title}</Link>
                <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent">
                    <span className="navbar-toggler-icon"></span>
                </button>

                <div className="collapse navbar-collapse" id="navbarSupportedContent">
                    <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                        <li className="nav-item">
                            <Link className={`nav-link ${location.pathname === "/" ? "active" : ""}`} to="/">Home</Link>
                        </li>

                        <li className="nav-item">
                            <Link className={`nav-link ${location.pathname === "/about" ? "active" : ""}`} to="/about">About</Link>
                        </li>
                        {token && (
                            <li className="nav-item">
                                <Link className={`nav-link ${location.pathname === "/profile" ? "active" : ""}`} to="/profile">Profile</Link>
                            </li>
                        )}
                    </ul>

                    <form className="d-flex">
                        {!token ? (
                            <>
                                <Link className="btn btn-primary mx-1" to="/login">Login</Link>
                                <Link className="btn btn-primary mx-1" to="/signup">Signup</Link>
                            </>
                        ) : (
                            <>
                                <button className="btn btn-danger" onClick={handleLogout}>Logout</button>
                            </>
                        )}
                    </form>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
