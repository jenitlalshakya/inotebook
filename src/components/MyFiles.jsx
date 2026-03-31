import React, { useContext, useEffect, useState, useRef } from "react";
import AuthContext from "../context/auth/AuthContext";
import { Link } from "react-router-dom";
import Layout from "./Layout";

const MyFiles = () => {
    const { user, planConfig, refreshProfile } = useContext(AuthContext);
    const host = import.meta.env.VITE_BACKEND_URL || "http://localhost:8000";
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState("");
    const fileInputRef = useRef(null);

    const isPro = user?.plan && user.plan !== "free";
    const planData = user && planConfig ? planConfig[user.plan] || planConfig["free"] : null;
    const storageLimitBytes = planData ? planData.storage_limit_bytes : 100 * 1024 * 1024;
    const storageUsed = user ? user.storage_used : 0;

    // Percentage
    let storagePercent = Math.round((storageUsed / storageLimitBytes) * 100);
    if (storagePercent > 100) storagePercent = 100;

    const fetchFiles = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${host}/api/files/list/`, {
                headers: {
                    "Authorization": `Bearer ${localStorage.getItem("token")}`
                }
            });
            const data = await res.json();
            if (data.success) {
                setFiles(data.files);
            }
        } catch (e) {
            console.error(e);
        }
        setLoading(false);
    };

    useEffect(() => {
        if (isPro) fetchFiles();
    }, [isPro]);

    const handleUploadClick = () => {
        if (!isPro) {
            setError("File upload is only available for Pro users.");
            return;
        }
        fileInputRef.current?.click();
    };

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (storageUsed + file.size > storageLimitBytes) {
            setError(`Storage limit exceeded. Cannot upload ${file.name}.`);
            return;
        }

        setError("");
        setUploading(true);

        const formData = new FormData();
        formData.append("file", file);

        try {
            const res = await fetch(`${host}/api/files/upload/`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${localStorage.getItem("token")}`
                },
                body: formData
            });
            const data = await res.json();

            if (data.success) {
                fetchFiles();
                refreshProfile();
            } else {
                setError(data.error || "Failed to upload file.");
            }
        } catch (err) {
            setError("Error uploading file.");
        }
        setUploading(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const handleDownload = async (fileId, fileName) => {
        try {
            const res = await fetch(`${host}/api/files/download/${fileId}/`, {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${localStorage.getItem("token")}`
                }
            });

            if (!res.ok) throw new Error("Download failed");

            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", fileName);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);

        } catch (err) {
            console.error(err);
            alert("Failed to download file");
        }
    };

    const handleDelete = async (fileId) => {
        if (!window.confirm("Are you sure you want to delete this file?")) return;

        try {
            const res = await fetch(`${host}/api/files/delete/${fileId}/`, {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${localStorage.getItem("token")}`
                }
            });
            const data = await res.json();
            if (data.success) {
                fetchFiles();
                refreshProfile();
            } else {
                setError(data.error || "Failed to delete file.");
            }
        } catch (err) {
            setError("Error deleting file.");
        }
    };

    const formatBytes = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const formattings = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + formattings[i];
    };

    return (
        <Layout>
            <main className="dashboard-main">
                {/* Top Profile Bar */}
                <div className="dashboard-top">
                    <div className="search-container" style={{ visibility: 'hidden' }}>
                        {/* Placeholder for alignment */}
                    </div>
                    <div className="profile-container">
                        <div className="profile-info">
                            <div className="profile-name">{user?.name || localStorage.getItem("name") || "User"}</div>
                            <div className="profile-status text-capitalize">
                                {user?.plan === "free" ? "Free Member" : "Pro Member"}
                            </div>
                        </div>
                        <div className="profile-avatar">
                            <Link to="/profile"><i className="bi bi-person-fill" style={{ color: '#c2410c' }}></i></Link>
                        </div>
                    </div>
                </div>

                {/* Page Title */}
                <h2 className="notes-section-title mb-4">
                    <i className="bi bi-folder2-open me-2"></i> My Files
                </h2>

                {error && <div className="alert alert-danger">{error}</div>}

                {/* Storage Usage Bar */}
                {user && planData && (
                    <div className="card mb-4 shadow-sm">
                        <div className="card-body">
                            <h5 className="card-title text-secondary mb-3">Storage Usage ({storagePercent}%)</h5>
                            <div className="progress" style={{ height: "25px" }}>
                                <div
                                    className={`progress-bar ${storagePercent > 90 ? 'bg-danger' : 'bg-primary'}`}
                                    role="progressbar"
                                    style={{ width: `${storagePercent}%` }}
                                    aria-valuenow={storagePercent}
                                    aria-valuemin="0"
                                    aria-valuemax="100"
                                >
                                </div>
                            </div>
                            <p className="mt-2 mb-0 text-muted">
                                {formatBytes(storageUsed)} / {formatBytes(storageLimitBytes)} used
                            </p>
                        </div>
                    </div>
                )}

                {/* Free Plan Upgrade Prompt */}
                {!isPro ? (
                    <div className="alert alert-warning p-4 text-center">
                        <h4>Unlock File Attachments!</h4>
                        <p className="mb-3">Upgrade to Pro to upload files and access 5GB of storage.</p>
                        <Link to="/subscription" className="btn btn-warning fw-bold">Upgrade Now</Link>
                    </div>
                ) : (
                    <>
                        <div className="d-flex justify-content-end mb-3">
                            <input type="file" ref={fileInputRef} className="d-none" onChange={handleFileChange} />
                            <button className="btn btn-primary" onClick={handleUploadClick} disabled={uploading}>
                                {uploading ? "Uploading..." : <><i className="bi bi-upload me-2"></i> Upload File</>}
                            </button>
                        </div>

                        <div className="table-responsive">
                            <table className="table table-hover align-middle">
                                <thead className="table-light">
                                    <tr>
                                        <th>File Name</th>
                                        <th>Size</th>
                                        <th>Uploaded At</th>
                                        <th className="text-end">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading && (
                                        <tr>
                                            <td colSpan="4" className="text-center py-4">Loading files...</td>
                                        </tr>
                                    )}
                                    {!loading && files.length === 0 && (
                                        <tr>
                                            <td colSpan="4" className="text-center py-4 text-muted">No files uploaded yet.</td>
                                        </tr>
                                    )}
                                    {!loading && files.map(f => (
                                        <tr key={f.id}>
                                            <td>
                                                <a href={host + f.file_url} target="_blank" rel="noreferrer" className="text-decoration-none">
                                                    <i className="bi bi-file-earmark-text me-2"></i>
                                                    {f.file_name}
                                                </a>
                                            </td>
                                            <td>{formatBytes(f.file_size)}</td>
                                            <td>{new Date(f.created_at).toLocaleString()}</td>
                                            <td className="text-end">
                                                <button className="btn btn-sm btn-outline-info me-2" onClick={() => handleDownload(f.id, f.file_name)}>
                                                    <i className="bi bi-download"></i>
                                                </button>
                                                <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(f.id)}>
                                                    <i className="bi bi-trash"></i>
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}
            </main>
        </Layout>
    );
};

export default MyFiles;
