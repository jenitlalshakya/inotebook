import React, { useContext, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import AuthContext from "../context/auth/AuthContext";

const Payment = () => {
    const { planConfig, refreshProfile } = useContext(AuthContext);
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

    const triggerPaymentSuccess = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${host}/api/subscription/success`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem("token")}`
                },
                body: JSON.stringify({ plan })
            });
            const data = await res.json();
            if (data.success) {
                setMsg("Payment Successful! Upgrading plan...");
                refreshProfile();
                setTimeout(() => navigate("/"), 2000);
            } else {
                setMsg("Payment processing error. " + data.error);
            }
        } catch (error) {
            setMsg("Error triggering success.");
        }
        setLoading(false);
    }

    const triggerPaymentFailure = async () => {
        setLoading(true);
        try {
            await fetch(`${host}/api/subscription/failure`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem("token")}`
                }
            });
            setMsg("Payment Failed/Cancelled.");
            setTimeout(() => navigate("/subscription"), 2000);
        } catch (error) {
            setMsg("Error triggering failure.");
        }
        setLoading(false);
    }

    return (
        <div className="container mt-5 text-center">
            <h2 className="mb-4">eSewa Demo Payment Checkout</h2>
            {msg && <div className="alert alert-info">{msg}</div>}
            
            <div className="card shadow mx-auto" style={{ maxWidth: "400px" }}>
                <div className="card-header bg-success text-white">
                    <h5>eSewa Mock Gateway</h5>
                </div>
                <div className="card-body">
                    <p className="fs-5">Product: <strong>{planData.name}</strong></p>
                    <p className="display-6">Rs. {planData.price}</p>
                    
                    <button className="btn btn-success mt-4 w-100" onClick={triggerPaymentSuccess} disabled={loading}>
                        Pay with eSewa (Simulate Success)
                    </button>
                    
                    <button className="btn btn-outline-danger mt-3 w-100" onClick={triggerPaymentFailure} disabled={loading}>
                        Cancel Payment (Simulate Failure)
                    </button>
                    
                </div>
            </div>
        </div>
    );
};

export default Payment;
