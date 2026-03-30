import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthContext from "../context/auth/AuthContext";

const Subscription = () => {
    const { user, planConfig } = useContext(AuthContext);
    const navigate = useNavigate();
    const [billingCycle, setBillingCycle] = useState("monthly"); // "monthly" or "yearly"

    useEffect(() => {
        if (!localStorage.getItem("token")) {
            navigate("/login");
        }
    }, [navigate]);

    if (!planConfig) {
        return (
            <div className="container mt-5 text-center">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    const freePlan = planConfig["free"];
    const proPlan = billingCycle === "monthly" ? planConfig["pro_monthly"] : planConfig["pro_yearly"];
    const planId = billingCycle === "monthly" ? "pro_monthly" : "pro_yearly";

    const isPro = user?.plan && user.plan !== "free";
    const currentStorageStr = user ? (user.storage_used / (1024 * 1024)).toFixed(2) : "0";

    const handleUpgrade = () => {
        navigate(`/subscription/payment?plan=${planId}`);
    };

    return (
        <div className="container mt-5">
            <div className="text-center mb-5">
                <h2>Choose Your Subscription Plan</h2>
                <p className="text-muted">Unleash the full potential of iNotebook</p>
                
                {user && (
                    <div className="alert alert-info d-inline-block mt-2">
                        <strong>Current Plan:</strong> {user.plan === "free" ? "Free" : "Pro"} | 
                        <strong> Storage Used:</strong> {currentStorageStr} MB
                    </div>
                )}
            </div>

            {!isPro && (
                <div className="d-flex justify-content-center mb-4">
                    <div className="btn-group" role="group">
                        <input type="radio" className="btn-check" name="btnradio" id="btnradio1" autoComplete="off" 
                               checked={billingCycle === "monthly"} onChange={() => setBillingCycle("monthly")} />
                        <label className="btn btn-outline-primary" htmlFor="btnradio1">Monthly (Rs. 299/mo)</label>

                        <input type="radio" className="btn-check" name="btnradio" id="btnradio2" autoComplete="off" 
                               checked={billingCycle === "yearly"} onChange={() => setBillingCycle("yearly")} />
                        <label className="btn btn-outline-primary" htmlFor="btnradio2">Yearly (Rs. 2999/yr)</label>
                    </div>
                </div>
            )}

            <div className="row justify-content-center">
                {/* Free Plan */}
                <div className="col-md-5 mb-4">
                    <div className={`card h-100 ${!isPro ? "border-primary shadow" : "border-secondary"}`}>
                        <div className="card-header text-center bg-transparent border-bottom-0 pb-0 pt-4">
                            <h4>{freePlan.name}</h4>
                            <h2 className="display-4 mb-0">Free</h2>
                        </div>
                        <div className="card-body mt-4">
                            <ul className="list-group list-group-flush fs-5">
                                <li className="list-group-item"><i className="bi bi-check text-success me-2"></i> Up to {freePlan.notes_limit} Notes</li>
                                <li className="list-group-item"><i className="bi bi-check text-success me-2"></i> {freePlan.words_limit} Words per Note</li>
                                <li className="list-group-item"><i className="bi bi-check text-success me-2"></i> {freePlan.storage_limit_mb} MB Storage</li>
                                <li className="list-group-item text-muted"><i className="bi bi-x text-danger me-2"></i> File Attachments</li>
                            </ul>
                        </div>
                        <div className="card-footer text-center bg-transparent border-top-0 pb-4">
                            {!isPro ? (
                                <button className="btn btn-lg btn-outline-primary w-100" disabled>Current Plan</button>
                            ) : null}
                        </div>
                    </div>
                </div>

                {/* Pro Plan */}
                <div className="col-md-5 mb-4">
                    <div className={`card h-100 ${isPro ? "border-primary shadow" : "border-secondary"}`}>
                        {isPro && (
                            <div className="position-absolute top-0 end-0 p-2">
                                <span className="badge bg-primary">Active</span>
                            </div>
                        )}
                        <div className="card-header text-center bg-transparent border-bottom-0 pb-0 pt-4">
                            <h4>{isPro ? "Pro Plan" : proPlan.name}</h4>
                            <h2 className="display-4 mb-0">Rs. {isPro ? "---" : proPlan.price}</h2>
                        </div>
                        <div className="card-body mt-4">
                            <ul className="list-group list-group-flush fs-5">
                                <li className="list-group-item"><i className="bi bi-check text-success me-2"></i> Unlimited Notes</li>
                                <li className="list-group-item"><i className="bi bi-check text-success me-2"></i> Unlimited Words</li>
                                <li className="list-group-item"><i className="bi bi-check text-success me-2"></i> 5 GB Storage</li>
                                <li className="list-group-item"><i className="bi bi-check text-success me-2"></i> File Attachments</li>
                            </ul>
                        </div>
                        <div className="card-footer text-center bg-transparent border-top-0 pb-4">
                            {isPro ? (
                                <p className="text-success fw-bold">You are enjoying Pro benefits!</p>
                            ) : (
                                <button className="btn btn-lg btn-primary w-100" onClick={handleUpgrade}>Upgrade to Pro</button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Subscription;
