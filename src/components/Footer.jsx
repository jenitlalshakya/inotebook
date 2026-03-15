import React from 'react'
import { useLocation } from 'react-router-dom'

const Footer = () => {
    const currentYear = new Date().getFullYear();
    const location = useLocation();
    const token = localStorage.getItem("token");

    if (location.pathname === '/' && !token) {
        return null; // PublicHome renders its own footer
    }

    return (
        <footer className="site-footer">
            <div className="site-footer__content">
                <p className="site-footer__copyright">
                    © {currentYear} iNotebook. All rights reserved.
                </p>
                <p className="site-footer__credit">
                    Created by <strong>Jenit Lal Shakya</strong> for college project.
                </p>
            </div>
        </footer>
    )
}

export default Footer
