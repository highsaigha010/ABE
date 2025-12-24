import React, { useState, useEffect } from 'react';

const API_URL = "https://wo8fo93m11.execute-api.us-east-1.amazonaws.com";

export default function EscrowDashboard({ user }) {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);

    // For simulation/demo purposes, we'll try to fetch a specific escrow if we have a booking ID
    // In a real app, you'd list all transactions for the user.
    // For this roadmap, we'll implement the "Status Dashboard" as a visual tracking system.

    const mockBookingID = "BOOK-12345"; // Example

    useEffect(() => {
        async function fetchEscrow() {
            try {
                const response = await fetch(`${API_URL}/escrow/${mockBookingID}`);
                if (response.ok) {
                    const data = await response.json();
                    setTransactions([data]);
                }
            } catch (err) {
                console.error("Failed to fetch escrow", err);
            } finally {
                setLoading(false);
            }
        }
        fetchEscrow();
    }, []);

    const handleDeposit = async (id) => {
        try {
            const response = await fetch(`${API_URL}/escrow/${id}/deposit`, { method: 'POST' });
            if (response.ok) {
                // Refresh
                window.location.reload();
            }
        } catch (err) {
            alert("Deposit failed");
        }
    };

    const handleRelease = async (id) => {
        try {
            const response = await fetch(`${API_URL}/escrow/${id}/release`, { method: 'POST' });
            if (response.ok) {
                // Refresh
                window.location.reload();
            }
        } catch (err) {
            alert("Release failed");
        }
    };

    const handleRefund = async (id) => {
        if(!window.confirm("Dispute this transaction? This will trigger the Dispute Shield refund logic.")) return;
        try {
            const response = await fetch(`${API_URL}/escrow/${id}/refund`, { method: 'POST' });
            if (response.ok) {
                window.location.reload();
            }
        } catch (err) {
            alert("Refund failed");
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'HELD':
                return <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-bold border border-yellow-200">🟡 Funds Secured</span>;
            case 'RELEASED':
                return <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-bold border border-green-200">🟢 Funds Released</span>;
            case 'PENDING':
                return <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-bold border border-gray-200">⚪ Awaiting Payment</span>;
            case 'REFUNDED':
                return <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-bold border border-red-200">🛡️ Refunded (Dispute Shield)</span>;
            default:
                return <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-bold">{status}</span>;
        }
    };

    return (
        <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
            <div className="flex justify-between items-start mb-6">
                <h2 className="text-2xl font-black text-gray-900 flex items-center gap-3">
                    <span className="text-3xl">🛡️</span> Smart Escrow™ Vault
                </h2>
                <div className="flex flex-col items-end">
                    <img src="/Smart_ESCROW.png" alt="Smart Escrow" className="h-10 w-auto object-contain mb-1" />
                    <span className="text-[10px] font-black text-green-600 uppercase tracking-widest flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span> Verified & Secure
                    </span>
                </div>
            </div>
            
            <div className="space-y-6">
                {transactions.length === 0 && !loading && (
                    <div className="text-center py-12 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                        <p className="text-gray-500 font-bold">No active escrow transactions found.</p>
                        <button 
                            onClick={async () => {
                                await fetch(`${API_URL}/escrow`, {
                                    method: 'POST',
                                    body: JSON.stringify({
                                        bookingId: mockBookingID,
                                        amount: 10000,
                                    })
                                });
                                window.location.reload();
                            }}
                            className="mt-4 text-indigo-600 font-black hover:underline"
                        >
                            Initialize Demo Transaction (₱10,000)
                        </button>
                    </div>
                )}

                {transactions.map(tx => (
                    <div key={tx.bookingId} className="p-6 rounded-2xl bg-gray-50 border border-gray-100 flex flex-col md:flex-row justify-between items-center gap-6">
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-4">
                                <span className="text-sm font-black text-indigo-600">#{tx.bookingId}</span>
                                {getStatusBadge(tx.status)}
                            </div>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                                <div>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Gross Amount</p>
                                    <h3 className="text-xl font-black text-gray-900">₱{tx.amount?.toLocaleString()}</h3>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Platform Fee (10%)</p>
                                    <h3 className="text-lg font-black text-indigo-500">₱{tx.commissionAmount?.toLocaleString() || (tx.amount * 0.1).toLocaleString()}</h3>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Vendor Payout</p>
                                    <h3 className="text-xl font-black text-green-600">₱{tx.netAmount?.toLocaleString() || (tx.amount * 0.9).toLocaleString()}</h3>
                                </div>
                            </div>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-6 italic flex items-center gap-2">
                                <img src="/Smart_ESCROW.png" alt="Smart Escrow" className="h-3 w-auto opacity-50" />
                                Payments are 100% Protected by Smart Escrow™ • Bank-Grade Security Active
                            </p>
                        </div>

                        <div className="flex flex-col gap-3">
                            {tx.status === 'PENDING' && (
                                <button 
                                    onClick={() => handleDeposit(tx.bookingId)}
                                    className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 transition shadow-lg shadow-indigo-100"
                                >
                                    Secure Deposit
                                </button>
                            )}
                            {tx.status === 'HELD' && (
                                <>
                                    <button 
                                        onClick={() => handleRelease(tx.bookingId)}
                                        className="px-6 py-3 bg-green-600 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-green-700 transition shadow-lg shadow-green-100"
                                    >
                                        Release Payout
                                    </button>
                                    <button 
                                        onClick={() => handleRefund(tx.bookingId)}
                                        className="px-6 py-3 bg-white border border-red-200 text-red-500 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-red-50 transition"
                                    >
                                        Dispute Shield
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-8 pt-8 border-t border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">System Operational</span>
                </div>
                <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Smart Escrow™ v1.0 Serverless</p>
            </div>
        </div>
    );
}
