import React from "react";
import { useNavigate } from "react-router-dom";

const PaymentFailure = () => {
    const navigate = useNavigate();

    return (
        <div className="container mt-5 text-center">
            <div className="card shadow mx-auto p-4" style={{ maxWidth: "500px" }}>
                <i className="bi bi-exclamation-triangle-fill text-warning" style={{fontSize: "4rem"}}></i>
                <h3 className="mt-3">Payment Cancelled</h3>
                <p className="fs-5 text-muted mt-2">
                    Your payment process was aborted or failed. No charges were made.
                </p>
                <div className="mt-4">
                    <button className="btn btn-primary" onClick={() => navigate("/subscription")}>
                        Return to Subscriptions
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PaymentFailure;
