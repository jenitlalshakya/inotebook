import React from "react";
import Notes from "./Notes";
import PublicHome from "./PublicHome";

const Home = () => {
    const token = localStorage.getItem("token");

    if (!token) {
        return <PublicHome />;
    }

    return <Notes />;
};

export default Home;
