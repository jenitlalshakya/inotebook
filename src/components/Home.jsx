import React from "react";
import { Navigate } from "react-router-dom";
import Notes from "./Notes";

const Home = () => {
    const token = localStorage.getItem("token");

    if (!token) {
        return <Navigate to="/login" />;
    }

    return <Notes />;
};

export default Home;
