import React, { useState, useEffect } from "react";

const SwipeUpIcon = () => {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setVisible(window.scrollY > window.innerHeight);
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    return (
        <i
            className="bi bi-arrow-up-circle-fill" // change to any bootstrap icon you like
            onClick={scrollToTop}
            style={{
                position: "fixed",
                bottom: "20px",
                right: "20px",
                zIndex: 999,
                fontSize: "2.5rem",
                color: "#4F46E5", // adjust to your site color
                cursor: "pointer",
                opacity: visible ? 1 : 0,
                transition: "opacity 0.3s ease, transform 0.3s ease",
                transform: visible ? "translateY(0)" : "translateY(50px)",
                pointerEvents: visible ? "auto" : "none",
            }}
            title="Scroll to top"
        ></i>
    );
};

export default SwipeUpIcon;
