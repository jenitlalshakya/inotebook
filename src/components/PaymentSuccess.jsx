import React, { useContext, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import AuthContext from "../context/auth/AuthContext";

const PaymentSuccess = () => {
    const { refreshProfile } = useContext(AuthContext);
    const location = useLocation();
    const navigate = useNavigate();
    const queryParams = new URLSearchParams(location.search);
    const data = queryParams.get("data");
    const host = import.meta.env.VITE_BACKEND_URL || "http://localhost:8000";

    const [status, setStatus] = useState("verifying");
    const [msg, setMsg] = useState("Verifying your payment with eSewa...");

    useEffect(() => {
        if (!data) {
            setStatus("error");
            setMsg("Invalid callback URL. No payment data found.");
            return;
        }

        const verifyPayment = async () => {
            try {
                const res = await fetch(`${host}/api/subscription/success`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${localStorage.getItem("token")}`
                    },
                    body: JSON.stringify({ data })
                });
                const result = await res.json();
                
                if (result.success) {
                    setStatus("success");
                    setMsg(result.message || "Payment Successful! Upgrading plan...");
                    refreshProfile();
                    setTimeout(() => navigate("/profile"), 3000);
                } else {
                    setStatus("error");
                    setMsg("Payment verification failed: " + result.error);
                }
            } catch (error) {
                setStatus("error");
                setMsg("Network error verifying payment.");
            }
        };

        verifyPayment();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [data, host]);

    return (
        <div className="container mt-5 text-center">
            <div className="card shadow mx-auto p-4" style={{ maxWidth: "500px" }}>
                {status === "verifying" && (
                    <>
                        <div className="spinner-border text-primary mx-auto mb-3" style={{width: "3rem", height: "3rem"}} role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                        <h3>Processing Payment</h3>
                        <p className="text-muted">{msg}</p>
                    </>
                )}
                {status === "success" && (
                    <>
                        <i className="bi bi-check-circle-fill text-success" style={{fontSize: "4rem"}}></i>
                        <h3 className="mt-3 text-success">Verification Complete</h3>
                        <p className="fs-5">{msg}</p>
                        <p className="text-muted">Redirecting to your profile...</p>
                        <button className="btn btn-primary mt-3" onClick={() => navigate("/profile")}>Go to Profile Now</button>
                    </>
                )}
                {status === "error" && (
                    <>
                        <i className="bi bi-x-circle-fill text-danger" style={{fontSize: "4rem"}}></i>
                        <h3 className="mt-3 text-danger">Verification Failed</h3>
                        <p className="fs-5">{msg}</p>
                        <button className="btn btn-outline-primary mt-3" onClick={() => navigate("/subscription")}>Return to Subscriptions</button>
                    </>
                )}
            </div>
        </div>
    );
};

export default PaymentSuccess;
