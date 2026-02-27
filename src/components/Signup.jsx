import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const Signup = () => {
    const [credentials, setCredentials] = useState({ name: "", email: "", password: "" });
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            navigate("/");
        }
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        const response = await fetch("http://localhost:8000/api/accounts/auth/signup/", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(credentials),
        });
        const json = await response.json();
        if (json.success) {
            alert("Account created successfully!");
            setCredentials({ name: "", email: "", password: "" });
        } else {
            alert("Signup failed: " + json.error);
        }
    };

    const onChange = (e) => {
        setCredentials({ ...credentials, [e.target.name]: e.target.value });
    };

    return (
        <div className="container mt-5">
            <h2 className="mb-4">Signup</h2>

            <form onSubmit={handleSubmit}>
                <div className="mb-3">
                    <label htmlFor="name" className="form-label">Full Name</label>
                    <input type="text" className="form-control" id="name" name="name" value={credentials.name} onChange={onChange} required minLength={3} />
                </div>

                <div className="mb-3">
                    <label htmlFor="email" className="form-label">Email address</label>
                    <input type="email" className="form-control" id="email" name="email" value={credentials.email} onChange={onChange} required />
                </div>

                <div className="mb-3 position-relative">
                    <label htmlFor="password" className="form-label">Password</label>
                    <input type={showPassword ? "text" : "password"} className="form-control" id="password" name="password" value={credentials.password} onChange={onChange} required minLength={5} />
                    <button type="button" className="btn btn-outline-secondary btn-sm position-absolute" style={{ top: "38px", right: "10px" }} onClick={() => setShowPassword(!showPassword)}>{showPassword ? "Hide" : "Show"}</button>
                </div>

                <button type="submit" className="btn btn-primary">Signup</button>
            </form>
        </div>
    );
};

export default Signup;
