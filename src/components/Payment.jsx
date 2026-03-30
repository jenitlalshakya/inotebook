import React, { useContext, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import AuthContext from "../context/auth/AuthContext";

const Payment = () => {
    const { planConfig } = useContext(AuthContext);
    const location = useLocation();
    const navigate = useNavigate();
    const queryParams = new URLSearchParams(location.search);
    const plan = queryParams.get("plan");
    const host = import.meta.env.VITE_BACKEND_URL || "http://localhost:8000";

    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState("");

    useEffect(() => {
        if (!plan || !["pro_monthly", "pro_yearly"].includes(plan)) {
            navigate("/subscription");
        }
    }, [plan, navigate]);

    if (!planConfig) return <div>Loading...</div>;

    const planData = planConfig[plan];
    
    if (!planData) {
        return <div>Invalid Plan</div>;
    }

    const initiatePayment = () => {
        setLoading(true);
        setMsg("Redirecting to secure payment gateway...");
        const token = localStorage.getItem("token");
        window.location.href = `${host}/api/subscription/payment/?plan=${plan}&token=${token}`;
    };

    return (
        <div className="container mt-5 text-center">
            <h2 className="mb-4">Complete Payment</h2>
            {msg && <div className="alert alert-info">{msg}</div>}
            
            <div className="card shadow mx-auto" style={{ maxWidth: "400px" }}>
                <div className="card-header text-white" style={{backgroundColor: "#60bb46"}}>
                    <h5 className="mb-0">Secure Checkout with eSewa</h5>
                </div>
                <div className="card-body">
                    <p className="fs-5">Product: <strong>{planData.name}</strong></p>
                    <p className="display-6 mt-3">Rs. {planData.price}</p>
                    
                    <button 
                        className="btn mt-4 w-100 fw-bold shadow-sm"
                        style={{backgroundColor: "#60bb46", color: "white"}}
                        onClick={initiatePayment} 
                        disabled={loading}
                    >
                        {loading ? "Redirecting..." : "Pay with eSewa"}
                    </button>
                    
                    <button className="btn btn-outline-secondary mt-3 w-100" onClick={() => navigate("/subscription")} disabled={loading}>
                        Cancel
                    </button>
                    
                </div>
            </div>
        </div>
    );
};

export default Payment;
