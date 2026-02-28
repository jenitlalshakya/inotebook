import React from 'react'

const Footer = () => {
    const currentYear = new Date().getFullYear()

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
