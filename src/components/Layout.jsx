import React from "react";
import Sidebar from "./Sidebar";

/**
 * Shared dashboard layout.
 * Wraps every authenticated page with the sidebar + main-content shell.
 *
 * Usage:
 *   <Layout>
 *       <main className="dashboard-main">
 *           …page content…
 *       </main>
 *   </Layout>
 */
const Layout = ({ children }) => {
    return (
        <div className="dashboard-container">
            <Sidebar />
            {children}
        </div>
    );
};

export default Layout;
