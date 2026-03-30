import React, { useState, useEffect } from "react";
import AuthContext from "./AuthContext";

const AuthState = (props) => {
    const host = import.meta.env.VITE_BACKEND_URL || "http://localhost:8000";
    const [user, setUser] = useState(null);
    const [planConfig, setPlanConfig] = useState(null);

    const fetchProfile = async () => {
        const token = localStorage.getItem("token");
        if (!token) return;

        try {
            const response = await fetch(`${host}/api/accounts/auth/profile/`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });

            const data = await response.json();
            if (response.ok && data.success) {
                setUser(data.user);
            } else {
                setUser(null);
            }
        } catch (error) {
            console.error("Failed to fetch profile", error);
        }
    };

    const fetchConfig = async () => {
        try {
            const response = await fetch(`${host}/api/subscription/configs`, {
                method: "GET",
            });
            const data = await response.json();
            if (response.ok && data.success) {
                setPlanConfig(data.plans);
            }
        } catch (error) {
            console.error("Failed to fetch configs", error);
        }
    };

    useEffect(() => {
        fetchProfile();
        fetchConfig();
    }, []);

    // A helper for components to force refresh
    const refreshProfile = () => {
        fetchProfile();
    };

    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("name");
        localStorage.removeItem("email");
        setUser(null);
        // Note: keeping planConfig as it's just public plan data
    };

    return (
        <AuthContext.Provider value={{ user, planConfig, refreshProfile, logout }}>
            {props.children}
        </AuthContext.Provider>
    );
};

export default AuthState;
