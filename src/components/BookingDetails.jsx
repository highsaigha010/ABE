import React, { useState, useEffect } from 'react';

const API_URL = "https://wo8fo93m11.execute-api.us-east-1.amazonaws.com";

export default function BookingDetails({ bookingId, user, onBack }) {
    const [escrow, setEscrow] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchEscrowStatus = async () => {
        try {
            const response = await fetch(`${API_URL}/escrow/${bookingId}`);
            if (response.ok) {
                const data = await response.json();
                setEscrow(data);
            } else {
                // If not found, maybe initialize a demo one for the mockup flow
                console.log("Escrow not found, initializing demo...");
                await initializeDemoEscrow();
            }
        } catch (err) {
            setError("Failed to fetch booking details");
        } finally {
            setLoading(false);
        }
    };

    const initializeDemoEscrow = async () => {
        try {
            const res = await fetch(`${API_URL}/escrow`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    bookingId: bookingId,
                    amount: 15000,
                })
            });
            if (res.ok) {
                const data = await res.json();
                setEscrow(data);
            }
        } catch (e) {
            setError("Failed to initialize demo");
        }
    };

    useEffect(() => {
        fetchEscrowStatus();
    }, [bookingId]);

    const handlePayNow = async () => {
        try {
            const response = await fetch(`${API_URL}/escrow/${bookingId}/deposit`, { method: 'POST' });
            if (response.ok) {
                fetchEscrowStatus();
            }
        } catch (err) {
            alert("Payment failed");
        }
    };

    const handleRelease = async () => {
        try {
            const response = await fetch(`${API_URL}/escrow/${bookingId}/release`, { method: 'POST' });
            if (response.ok) {
                fetchEscrowStatus();
            }
        } catch (err) {
            alert("Release failed");
        }
    };

    if (loading) return <div className="p-20 text-center font-black animate-pulse text-indigo-600">LOADING VAULT...</div>;
    if (error) return <div className="p-20 text-center text-red-500 font-bold">{error}</div>;

    const status = escrow?.status || 'PENDING';

    return (
        <div className="max-w-4xl mx-auto px-4 py-12 font-sans">
            {/* Header / Nav Mockup compatibility */}
            <div className="mb-8 flex items-center justify-between">
                <button onClick={onBack} className="text-gray-500 hover:text-indigo-600 font-bold flex items-center transition">
                    &larr; Back to Dashboard
                </button>
                <div className="flex items-center gap-2">
                    <img src="/Smart_ESCROW.png" alt="Smart Escrow" className="h-8 w-auto" />
                    <span className="text-[10px] font-black text-green-600 uppercase tracking-widest">Verified & Secure</span>
                </div>
            </div>

            <div className="bg-white rounded-[3rem] shadow-2xl overflow-hidden border border-gray-100">
                <div className="p-10 md:p-16">
                    <div className="flex justify-between items-start mb-12">
                        <div>
                            <h1 className="text-3xl md:text-5xl font-black text-gray-900 mb-2 tracking-tight">Order #1023</h1>
                            <p className="text-xl text-gray-500 font-bold">Wedding Photography - Juan Photo</p>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">Total Investment</p>
                            <p className="text-3xl font-black text-indigo-600">₱{escrow?.amount?.toLocaleString()}</p>
                        </div>
                    </div>

                    {/* SCENARIO A: PENDING */}
                    {status === 'PENDING' && (
                        <div className="bg-gray-50 rounded-[2.5rem] p-10 border-2 border-dashed border-gray-200 animate-in fade-in slide-in-from-bottom-4">
                            <div className="flex items-center gap-4 mb-6">
                                <span className="h-4 w-4 bg-gray-300 rounded-full animate-pulse"></span>
                                <span className="text-sm font-black text-gray-500 uppercase tracking-widest">STATUS: ⚪ WAITING FOR PAYMENT</span>
                            </div>
                            <p className="text-xl text-gray-600 font-medium mb-10 leading-relaxed">
                                "Please initiate payment. Funds will be held safely in the Smart Escrow Vault."
                            </p>
                            <button 
                                onClick={handlePayNow}
                                className="w-full md:w-auto px-12 py-5 bg-indigo-600 text-white rounded-2xl font-black text-sm uppercase tracking-[0.2em] hover:bg-indigo-700 transition shadow-xl shadow-indigo-100"
                            >
                                Pay Now (Demo)
                            </button>
                        </div>
                    )}

                    {/* SCENARIO B: HELD */}
                    {status === 'HELD' && (
                        <div className="bg-yellow-50 rounded-[2.5rem] p-10 border-2 border-yellow-100 animate-in zoom-in duration-500">
                            <div className="flex items-center gap-4 mb-6">
                                <span className="text-xl">🔒</span>
                                <span className="text-sm font-black text-yellow-700 uppercase tracking-widest">STATUS: 🟡 SECURED (FUNDS LOCKED)</span>
                            </div>
                            <p className="text-xl text-yellow-900 font-medium mb-10 leading-relaxed">
                                "Relax! We are holding your payment securely. The supplier sees that you have paid, but they cannot touch the money until the event is done."
                            </p>
                            <div className="flex flex-col md:flex-row gap-4">
                                <button 
                                    onClick={handleRelease}
                                    className="px-12 py-5 bg-green-600 text-white rounded-2xl font-black text-sm uppercase tracking-[0.2em] hover:bg-green-700 transition shadow-xl shadow-green-100"
                                >
                                    Mark Job Complete (Release Money)
                                </button>
                                <button className="px-8 py-5 bg-white border border-yellow-200 text-yellow-700 rounded-2xl font-black text-[10px] uppercase tracking-widest opacity-50 cursor-not-allowed">
                                    Dispute Shield Protected
                                </button>
                            </div>
                        </div>
                    )}

                    {/* SCENARIO C: RELEASED / AUTO_RELEASED */}
                    {(status === 'RELEASED' || status === 'AUTO_RELEASED') && (
                        <div className="bg-green-50 rounded-[2.5rem] p-10 border-2 border-green-100 animate-in fade-in scale-95 duration-700">
                            <div className="flex items-center gap-4 mb-6">
                                <span className="text-xl">✅</span>
                                <span className="text-sm font-black text-green-700 uppercase tracking-widest">
                                    STATUS: 🟢 {status === 'AUTO_RELEASED' ? 'AUTO-RELEASED TO VENDOR' : 'RELEASED TO VENDOR'}
                                </span>
                            </div>
                            <p className="text-xl text-green-900 font-medium mb-6 leading-relaxed">
                                {status === 'AUTO_RELEASED' 
                                    ? "Transaction automatically completed after 24 hours. The funds have been transferred to the Vendor's wallet."
                                    : "Transaction Complete. The funds have been transferred to the Vendor's wallet."
                                }
                            </p>
                            <div className="flex items-center gap-2 text-[10px] font-black text-green-600 uppercase tracking-widest bg-white w-fit px-4 py-2 rounded-full border border-green-200">
                                <span className="w-2 h-2 bg-green-500 rounded-full"></span> Immutable Ledger Updated
                            </div>
                        </div>
                    )}
                </div>

                <div className="bg-gray-900 p-8 md:p-12 flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="flex items-center gap-4">
                        <img src="/Smart_ESCROW.png" alt="Smart Escrow" className="h-12 w-auto brightness-0 invert" />
                        <div>
                            <p className="text-white font-black text-sm uppercase tracking-widest">Smart Escrow™ Technology</p>
                            <p className="text-gray-400 text-[10px] font-medium uppercase tracking-widest">Powered by AWS Serverless Architecture</p>
                        </div>
                    </div>
                    <div className="text-center md:text-right">
                        <p className="text-indigo-400 text-[10px] font-black uppercase tracking-[0.3em] mb-1">Security Rating</p>
                        <p className="text-white font-black text-lg tracking-tighter italic">BANK-GRADE ENCRYPTION</p>
                    </div>
                </div>
            </div>
        </div>
    );
}