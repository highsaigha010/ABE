import React, { useState } from 'react';
import { 
    ComposableMap, 
    Geographies, 
    Geography, 
    Marker,
    ZoomableGroup
} from "react-simple-maps";

const PAMPANGA_GEO_URL = "https://raw.githubusercontent.com/deldersveld/topojson/master/countries/philippines/pampanga.json";

const AdminDashboard = ({ users, bookings, onUpdateStatus, isVerified, payoutRequests, setPayoutRequests, verificationRequests, setVerificationRequests, showNotification, onPayoutAction, messages }) => {
    const [activeTab, setActiveTab] = useState('verification'); // 'verification', 'vendors', 'bookings', 'analytics', or 'payouts'
    const [confirmModal, setConfirmModal] = useState({ show: false, targetId: null, action: null, label: '', data: null });
    const [rejectionModal, setRejectionModal] = useState({ show: false, targetId: null, reason: '', feedback: '' });
    const [chatLogModal, setChatLogModal] = useState({ show: false, bookingId: null });
    const rejectionReasons = [
        'Expired Permit',
        'Name Mismatch (ID vs Bank)',
        'Blurred Image/Documents',
        'Invalid DTI Registration',
        'Selfie Mismatch',
        'Other (See Feedback)'
    ];
    const [previewModal, setPreviewModal] = useState({ show: false, file: null, type: null, requestId: null, label: '' });
    const [zoom, setZoom] = useState(1);
    const [rotation, setRotation] = useState(0);
    const [checklist, setChecklist] = useState({
        nameMatch: false,
        expiryValid: false,
        clearDoc: false
    });
    const [expandedBookingId, setExpandedBookingId] = useState(null);
    const [tooltipContent, setTooltipContent] = useState(null);
    const [hoveredBookingId, setHoveredBookingId] = useState(null);

    // Helper to mask sensitive data
    const maskData = (data, prefix = '') => {
        if (isVerified) return `${prefix}${data}`;
        return `${prefix}₱,*** (Verify to View)`;
    };

    // --- ANALYTICS CALCULATIONS ---
    const totalGMV = bookings.reduce((sum, b) => sum + b.price, 0);
    const totalEscrowSecured = bookings
        .filter(b => b.status === 'paid' || b.status === 'partially_released' || b.status === 'completed')
        .reduce((sum, b) => sum + b.price, 0);
    const totalRevenue = bookings
        .filter(b => b.status === 'released')
        .reduce((sum, b) => sum + (b.price * 0.02), 0);
    const activeDisputesCount = bookings.filter(b => b.status === 'disputed').length;

    // Heatmap / City Analytics
    const cityPerformance = bookings.reduce((acc, b) => {
        const city = b.city || 'Unknown';
        if (!acc[city]) acc[city] = { revenue: 0, volume: 0 };
        acc[city].volume += 1;
        acc[city].revenue += b.price;
        return acc;
    }, {});

    const topPerformanceCities = Object.entries(cityPerformance)
        .sort((a, b) => b[1].revenue - a[1].revenue)
        .slice(0, 5);

    const vendorCount = users.filter(u => u.role === 'vendor').length;
    const clientCount = users.filter(u => u.role === 'client').length;

    const topVendors = users.filter(u => {
        if (u.role !== 'vendor' || u.strikes > 0) return false;
        const vendorBookings = bookings.filter(b => b.vendorName === u.name && b.status === 'released');
        return vendorBookings.length > 0;
    }).map(u => ({
        ...u,
        completedCount: bookings.filter(b => b.vendorName === u.name && b.status === 'released').length
    })).sort((a, b) => b.completedCount - a.completedCount).slice(0, 5);

    // Status Distribution
    const statusCounts = bookings.reduce((acc, b) => {
        acc[b.status] = (acc[b.status] || 0) + 1;
        return acc;
    }, {});

    // CSV Export Logic
    const exportToCSV = () => {
        const headers = ["Booking ID", "Client", "Vendor", "Status", "Amount", "Platform Fee (2%)"];
        const rows = bookings.map(b => [
            b.id,
            b.clientName,
            b.vendorName,
            b.status.toUpperCase(),
            b.price,
            (b.price * 0.02).toFixed(2)
        ]);

        const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `Abe_Financial_Report_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Filter vendors from the global users list
    const vendorList = users.filter(u => u.role === 'vendor');

    const handleActionClick = (targetId, action, label) => {
        setConfirmModal({ show: true, targetId, action, label });
    };

    const executeDecision = async () => {
        const { targetId, action, data } = confirmModal;
        setConfirmModal({ ...confirmModal, show: false });
        
        if (action === 'APPROVE_PAYOUT') {
            onPayoutAction(targetId, 'APPROVE', data);
        } else if (action === 'DECLINE_PAYOUT') {
            onPayoutAction(targetId, 'DECLINE', data);
        } else {
            await onUpdateStatus(targetId, action);
        }
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] font-sans relative">
            {/* Document Preview Modal */}
            {previewModal.show && (
                <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 md:p-10">
                    <div className="absolute inset-0 bg-gray-950/90 backdrop-blur-xl" onClick={() => setPreviewModal({ ...previewModal, show: false })}></div>
                    
                    <div className="bg-white rounded-[2.5rem] w-full max-w-6xl h-full max-h-[90vh] relative shadow-2xl overflow-hidden flex flex-col md:flex-row border border-white/20">
                        {/* Left Side: Viewer */}
                        <div className="flex-1 bg-gray-100 relative flex items-center justify-center overflow-hidden border-r border-gray-100">
                            <div className="absolute top-6 left-6 z-10 flex gap-2">
                                <button onClick={() => setZoom(prev => Math.min(prev + 0.2, 3))} className="w-10 h-10 rounded-xl bg-white/80 backdrop-blur shadow-sm flex items-center justify-center text-lg hover:bg-white transition-all">➕</button>
                                <button onClick={() => setZoom(prev => Math.max(prev - 0.2, 0.5))} className="w-10 h-10 rounded-xl bg-white/80 backdrop-blur shadow-sm flex items-center justify-center text-lg hover:bg-white transition-all">➖</button>
                                <button onClick={() => setRotation(prev => prev + 90)} className="w-10 h-10 rounded-xl bg-white/80 backdrop-blur shadow-sm flex items-center justify-center text-lg hover:bg-white transition-all">🔄</button>
                                <button onClick={() => { setZoom(1); setRotation(0); }} className="px-4 h-10 rounded-xl bg-white/80 backdrop-blur shadow-sm flex items-center justify-center text-[10px] font-black uppercase tracking-widest hover:bg-white transition-all">Reset</button>
                            </div>

                            <div 
                                className="transition-transform duration-200 ease-out"
                                style={{ transform: `scale(${zoom}) rotate(${rotation}deg)` }}
                            >
                                {previewModal.file?.toLowerCase().endsWith('.pdf') ? (
                                    <div className="w-[800px] h-[600px] bg-white shadow-2xl flex items-center justify-center">
                                        <iframe 
                                            src={`/mock-docs/${previewModal.file}`} 
                                            className="w-full h-full border-none"
                                            title="PDF Preview"
                                        ></iframe>
                                    </div>
                                ) : (
                                    <img 
                                        src={previewModal.file?.startsWith('http') ? previewModal.file : `https://placehold.co/800x1200/4f46e5/white?text=${previewModal.label}`} 
                                        alt="Document Preview" 
                                        className="max-h-[80vh] shadow-2xl rounded-lg"
                                    />
                                )}
                            </div>
                        </div>

                        {/* Right Side: Checklist & Decisions */}
                        <div className="w-full md:w-80 bg-white p-8 flex flex-col">
                            <div className="mb-8">
                                <h3 className="text-xl font-black text-gray-900 uppercase tracking-tighter italic mb-1">Inspection</h3>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{previewModal.label}</p>
                            </div>

                            <div className="space-y-6 flex-1">
                                <div className="space-y-4">
                                    <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Review Checklist</p>
                                    
                                    <label className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl cursor-pointer hover:bg-indigo-50 transition-colors group">
                                        <input 
                                            type="checkbox" 
                                            checked={checklist.nameMatch}
                                            onChange={() => setChecklist(prev => ({ ...prev, nameMatch: !prev.nameMatch }))}
                                            className="w-5 h-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                        />
                                        <span className="text-[10px] font-bold text-gray-600 uppercase tracking-tight group-hover:text-indigo-900">Name matches ID?</span>
                                    </label>

                                    <label className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl cursor-pointer hover:bg-indigo-50 transition-colors group">
                                        <input 
                                            type="checkbox" 
                                            checked={checklist.expiryValid}
                                            onChange={() => setChecklist(prev => ({ ...prev, expiryValid: !prev.expiryValid }))}
                                            className="w-5 h-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                        />
                                        <span className="text-[10px] font-bold text-gray-600 uppercase tracking-tight group-hover:text-indigo-900">Expiry date is valid?</span>
                                    </label>

                                    <label className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl cursor-pointer hover:bg-indigo-50 transition-colors group">
                                        <input 
                                            type="checkbox" 
                                            checked={checklist.clearDoc}
                                            onChange={() => setChecklist(prev => ({ ...prev, clearDoc: !prev.clearDoc }))}
                                            className="w-5 h-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                        />
                                        <span className="text-[10px] font-bold text-gray-600 uppercase tracking-tight group-hover:text-indigo-900">Clear & Not Edited?</span>
                                    </label>
                                </div>
                            </div>

                            <div className="pt-8 border-t border-gray-100 space-y-3">
                                <button 
                                    onClick={() => {
                                        showNotification(`${previewModal.label} Verified!`, "success");
                                        setPreviewModal({ ...previewModal, show: false });
                                    }}
                                    className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all"
                                >
                                    Approve Document
                                </button>
                                <button 
                                    onClick={() => {
                                        showNotification(`${previewModal.label} Flagged as Suspicious!`, "error");
                                        setPreviewModal({ ...previewModal, show: false });
                                    }}
                                    className="w-full bg-red-50 text-red-600 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-red-100 transition-all"
                                >
                                    Flag as Suspicious
                                </button>
                                <button 
                                    onClick={() => setPreviewModal({ ...previewModal, show: false })}
                                    className="w-full text-[10px] font-black text-gray-400 uppercase tracking-widest mt-2"
                                >
                                    Close Preview
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Chat Log Modal */}
            {chatLogModal.show && (
                <div className="fixed inset-0 z-[130] flex items-center justify-center p-6">
                    <div className="absolute inset-0 bg-gray-950/80 backdrop-blur-sm" onClick={() => setChatLogModal({ show: false, bookingId: null })}></div>
                    <div className="bg-white rounded-[2.5rem] w-full max-w-2xl h-[80vh] flex flex-col relative shadow-2xl border border-gray-100 overflow-hidden">
                        <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-white">
                            <div>
                                <h3 className="text-xl font-black text-gray-900 uppercase tracking-tighter italic">Chat Logs: {chatLogModal.bookingId}</h3>
                                <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mt-1">Dispute Mediation Oversight</p>
                            </div>
                            <button onClick={() => setChatLogModal({ show: false, bookingId: null })} className="w-10 h-10 rounded-xl bg-gray-50 text-gray-400 flex items-center justify-center font-black">✕</button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-8 space-y-4 bg-gray-50">
                            {messages.filter(m => m.bookingId === chatLogModal.bookingId).map(msg => (
                                <div key={msg.id} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">{msg.senderId}</span>
                                        <span className="text-[8px] font-bold text-gray-400 uppercase">{msg.timestamp}</span>
                                    </div>
                                    <p className="text-sm text-gray-700 font-medium">{msg.text}</p>
                                    {msg.type === 'contract' && (
                                        <div className="mt-3 p-3 bg-indigo-50 rounded-xl border border-indigo-100 text-[10px] font-bold text-indigo-600 uppercase tracking-widest">
                                            📄 Contract Offer: ₱{parseFloat(msg.contractData?.price || 0).toLocaleString()}
                                        </div>
                                    )}
                                </div>
                            ))}
                            {messages.filter(m => m.bookingId === chatLogModal.bookingId).length === 0 && (
                                <div className="text-center py-20 text-gray-400 italic">No chat history found for this booking.</div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Rejection Reason Modal */}
            {rejectionModal.show && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
                    <div className="absolute inset-0 bg-red-950/40 backdrop-blur-sm" onClick={() => setRejectionModal({ show: false, targetId: null, reason: '', feedback: '' })}></div>
                    <div className="bg-white rounded-[2rem] p-8 max-w-sm w-full relative shadow-2xl border border-red-50">
                        <h3 className="text-xl font-black text-gray-900 uppercase tracking-tighter italic mb-4">Rejection Reason</h3>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-6">Pumili ng rason at magbigay ng feedback, Abe.</p>
                        
                        <div className="space-y-2 mb-6 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
                            {rejectionReasons.map(reason => (
                                <button 
                                    key={reason}
                                    onClick={() => setRejectionModal({ ...rejectionModal, reason })}
                                    className={`w-full text-left px-5 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${rejectionModal.reason === reason ? 'bg-red-600 text-white shadow-lg' : 'bg-gray-50 text-gray-400 hover:bg-gray-100'}`}
                                >
                                    {reason}
                                </button>
                            ))}
                        </div>

                        <div className="mb-8">
                            <label className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 block ml-1">Feedback for Vendor</label>
                            <textarea 
                                placeholder="Abe, sabihin mo dito kung bakit rejected (e.g., Blurred yung Selfie mo, paki-ulit)."
                                value={rejectionModal.feedback}
                                onChange={(e) => setRejectionModal({ ...rejectionModal, feedback: e.target.value })}
                                className="w-full bg-gray-50 border-none rounded-2xl p-4 text-sm text-gray-900 placeholder-gray-300 focus:ring-2 focus:ring-red-500 h-24 resize-none"
                            ></textarea>
                        </div>

                        <div className="flex gap-3">
                            <button 
                                onClick={() => {
                                    if (!rejectionModal.reason) return alert("Pumili muna ng rason, Abe.");
                                    const finalReason = rejectionModal.reason === 'Other (See Feedback)' ? rejectionModal.feedback : rejectionModal.reason;
                                    setVerificationRequests(prev => prev.map(r => r.id === rejectionModal.targetId ? {...r, status: 'rejected', rejectionReason: finalReason, feedback: rejectionModal.feedback} : r));
                                    showNotification(`Rejected application. Reason: ${finalReason}`, "error");
                                    setRejectionModal({ show: false, targetId: null, reason: '', feedback: '' });
                                }}
                                className="flex-1 bg-gray-900 text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-red-600 transition-all shadow-xl shadow-red-100"
                            >
                                Confirm Reject
                            </button>
                            <button 
                                onClick={() => setRejectionModal({ show: false, targetId: null, reason: '', feedback: '' })}
                                className="px-6 bg-gray-50 text-gray-400 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* Confirmation Modal */}
            {confirmModal.show && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                    <div className="absolute inset-0 bg-indigo-950/40 backdrop-blur-sm" onClick={() => setConfirmModal({ ...confirmModal, show: false })}></div>
                    <div className="bg-white rounded-[2rem] p-8 max-w-sm w-full relative shadow-2xl border border-indigo-50 text-center">
                        <div className="text-4xl mb-4">⚖️</div>
                        <h3 className="text-xl font-black text-gray-900 uppercase tracking-tighter italic mb-2">Justice System</h3>
                        {!isVerified && (
                            <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-[10px] font-black uppercase tracking-widest mb-4">
                                ⚠️ Abe! Verify Admin Session to take actions.
                            </div>
                        )}
                        <p className="text-gray-600 text-sm mb-8 font-medium">
                            Abe, sigurado ka na ba sa desisyon mo? Final na ito at hindi na mababawi.
                            <br/>
                            <span className="text-indigo-600 font-bold uppercase text-[10px] tracking-widest mt-2 block">Action: {confirmModal.label}</span>
                        </p>
                        <div className="flex flex-col gap-3">
                            <button 
                                onClick={executeDecision}
                                disabled={!isVerified}
                                className={`w-full py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl ${!isVerified ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-gray-900 text-white hover:bg-indigo-600 shadow-indigo-100'}`}
                            >
                                Confirm Decision
                            </button>
                            <button 
                                onClick={() => setConfirmModal({ ...confirmModal, show: false })}
                                className="w-full bg-gray-50 text-gray-400 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-gray-100 transition-all"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* Top Stats Overview */}
            <div className="bg-indigo-900 p-10 pb-24">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-black text-white italic tracking-tighter uppercase">Abe Admin Portal</h1>
                        <p className="text-indigo-200 text-sm font-medium">Monitoring events across Pampanga</p>
                    </div>
                    <div className="flex gap-4">
                        <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10">
                            <p className="text-[10px] text-indigo-300 font-bold uppercase tracking-widest">Total Escrow Balance</p>
                            <p className="text-xl font-black text-white">₱145,000.00</p>
                        </div>
                        <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10">
                            <p className="text-[10px] text-indigo-300 font-bold uppercase tracking-widest">Active Disputes</p>
                            <p className="text-xl font-black text-white">{bookings.filter(b => b.status === 'disputed').length}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content (Table) */}
            <div className="max-w-7xl mx-auto px-6 -mt-16">
                <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-indigo-100 overflow-hidden border border-gray-100">
                    <div className="p-8 border-b border-gray-50 flex justify-between items-center">
                        <div className="flex gap-8">
                            <button 
                                onClick={() => setActiveTab('verification')}
                                className={`text-lg font-black uppercase tracking-tighter italic transition-all ${activeTab === 'verification' ? 'text-indigo-600 border-b-4 border-indigo-600' : 'text-gray-300 hover:text-gray-400'}`}
                            >
                                Verification Queue
                            </button>
                            <button 
                                onClick={() => setActiveTab('vendors')}
                                className={`text-lg font-black uppercase tracking-tighter italic transition-all ${activeTab === 'vendors' ? 'text-indigo-600 border-b-4 border-indigo-600' : 'text-gray-300 hover:text-gray-400'}`}
                            >
                                Active Suppliers
                            </button>
                            <button 
                                onClick={() => setActiveTab('bookings')}
                                className={`text-lg font-black uppercase tracking-tighter italic transition-all ${activeTab === 'bookings' ? 'text-indigo-600 border-b-4 border-indigo-600' : 'text-gray-300 hover:text-gray-400'}`}
                            >
                                Dispute Mediation
                            </button>
                            <button 
                                onClick={() => setActiveTab('payouts')}
                                className={`text-lg font-black uppercase tracking-tighter italic transition-all ${activeTab === 'payouts' ? 'text-indigo-600 border-b-4 border-indigo-600' : 'text-gray-300 hover:text-gray-400'}`}
                            >
                                Payouts
                            </button>
                            <button 
                                onClick={() => setActiveTab('analytics')}
                                className={`text-lg font-black uppercase tracking-tighter italic transition-all ${activeTab === 'analytics' ? 'text-indigo-600 border-b-4 border-indigo-600' : 'text-gray-300 hover:text-gray-400'}`}
                            >
                                Analytics
                            </button>
                        </div>
                        <input type="text" placeholder="Search Cabalen..." className="bg-gray-50 border-none rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500 w-64" />
                    </div>

                    <div className="overflow-x-auto">
                        {activeTab === 'verification' ? (
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-gray-50/50 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
                                        <th className="px-8 py-5">Business Name</th>
                                        <th className="px-8 py-5">Documents</th>
                                        <th className="px-8 py-5">Payment Info</th>
                                        <th className="px-8 py-5">Status</th>
                                        <th className="px-8 py-5 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {verificationRequests.map((req) => (
                                        <tr key={req.id} className="hover:bg-indigo-50/30 transition-colors">
                                            <td className="px-8 py-6">
                                                <div className="flex flex-col">
                                                    <span className="font-black text-gray-900 uppercase tracking-tight">{req.businessName}</span>
                                                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Owner: {req.ownerName || 'N/A'}</span>
                                                    <div className="flex gap-2 mt-3">
                                                        <a 
                                                            href={`https://bnrs.dti.gov.ph/search?q=${encodeURIComponent(req.businessName)}`} 
                                                            target="_blank" 
                                                            rel="noopener noreferrer"
                                                            className="text-[9px] font-black text-indigo-500 uppercase tracking-widest hover:underline"
                                                        >
                                                            🔍 DTI Search
                                                        </a>
                                                        <a 
                                                            href={`https://www.facebook.com/search/top?q=${encodeURIComponent(req.businessName)}`} 
                                                            target="_blank" 
                                                            rel="noopener noreferrer"
                                                            className="text-[9px] font-black text-blue-500 uppercase tracking-widest hover:underline"
                                                        >
                                                            📘 FB Search
                                                        </a>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex flex-col gap-2">
                                                    <button 
                                                        onClick={() => {
                                                            setPreviewModal({ show: true, file: req.files.dti, type: 'pdf', requestId: req.id, label: 'DTI Certificate' });
                                                            setZoom(1); setRotation(0);
                                                            setChecklist({ nameMatch: false, expiryValid: false, clearDoc: false });
                                                        }}
                                                        className="text-[9px] font-black text-indigo-600 uppercase tracking-tighter hover:bg-indigo-50 p-1 rounded transition-colors text-left flex items-center gap-2"
                                                    >
                                                        📄 DTI: {req.files.dti} <span className="text-[8px] bg-indigo-100 px-1 rounded">View</span>
                                                    </button>
                                                    <button 
                                                        onClick={() => {
                                                            setPreviewModal({ show: true, file: req.files.permit, type: 'pdf', requestId: req.id, label: 'Business Permit' });
                                                            setZoom(1); setRotation(0);
                                                            setChecklist({ nameMatch: false, expiryValid: false, clearDoc: false });
                                                        }}
                                                        className="text-[9px] font-black text-indigo-600 uppercase tracking-tighter hover:bg-indigo-50 p-1 rounded transition-colors text-left flex items-center gap-2"
                                                    >
                                                        📄 Permit: {req.files.permit} <span className="text-[8px] bg-indigo-100 px-1 rounded">View</span>
                                                    </button>
                                                    <button 
                                                        onClick={() => {
                                                            setPreviewModal({ show: true, file: req.files.id, type: 'image', requestId: req.id, label: 'Government ID' });
                                                            setZoom(1); setRotation(0);
                                                            setChecklist({ nameMatch: false, expiryValid: false, clearDoc: false });
                                                        }}
                                                        className="text-[9px] font-black text-indigo-600 uppercase tracking-tighter hover:bg-indigo-50 p-1 rounded transition-colors text-left flex items-center gap-2"
                                                    >
                                                        🪪 ID: {req.files.id} <span className="text-[8px] bg-indigo-100 px-1 rounded">View</span>
                                                    </button>
                                                    {req.files.selfie && (
                                                        <button 
                                                            onClick={() => {
                                                                setPreviewModal({ show: true, file: req.files.selfie, type: 'image', requestId: req.id, label: 'Selfie Verification' });
                                                                setZoom(1); setRotation(0);
                                                                setChecklist({ nameMatch: false, expiryValid: false, clearDoc: false });
                                                            }}
                                                            className="text-[9px] font-black text-purple-600 uppercase tracking-tighter hover:bg-purple-50 p-1 rounded transition-colors text-left flex items-center gap-2"
                                                        >
                                                            🤳 Selfie: {req.files.selfie} <span className="text-[8px] bg-purple-100 px-1 rounded">View</span>
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex flex-col">
                                                    <span className="text-xs font-black text-gray-900">{req.paymentInfo.bankName}</span>
                                                    <span className="text-[10px] text-gray-400 font-bold">{isVerified ? req.paymentInfo.accountNumber : '**** **** ****'}</span>
                                                    <span className="text-[9px] text-indigo-600 font-black uppercase mt-1 italic">Acc: {req.paymentInfo.accountName || 'N/A'}</span>

                                                    {req.ownerName && req.paymentInfo.accountName && 
                                                     req.ownerName.toLowerCase() !== req.paymentInfo.accountName.toLowerCase() && (
                                                        <span className="mt-2 bg-red-100 text-red-600 px-2 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest">
                                                            ⚠️ Name Mismatch Warning
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex flex-col gap-1">
                                                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                                                        req.status === 'pending_verification' ? 'bg-orange-100 text-orange-600' : 
                                                        req.status === 'verified' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                                                    }`}>
                                                        {req.status.replace('_', ' ')}
                                                    </span>
                                                    {req.status === 'rejected' && req.rejectionReason && (
                                                        <span className="text-[8px] font-black text-red-400 uppercase tracking-tighter text-center">
                                                            Reason: {req.rejectionReason}
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                {req.status === 'pending_verification' ? (
                                                    <div className="flex justify-end gap-2">
                                                        <button 
                                                            onClick={() => {
                                                                setVerificationRequests(prev => prev.map(r => r.id === req.id ? {...r, status: 'verified'} : r));
                                                                showNotification(`Abe, verified na ang ${req.businessName}!`, "success");
                                                            }}
                                                            className="bg-green-600 text-white px-3 py-2 rounded-lg font-black text-[9px] uppercase tracking-tighter hover:bg-green-700 transition-all"
                                                        >
                                                            ✅ Approve
                                                        </button>
                                                        <button 
                                                            onClick={() => {
                                                                setRejectionModal({ show: true, targetId: req.id, reason: '' });
                                                            }}
                                                            className="bg-red-600 text-white px-3 py-2 rounded-lg font-black text-[9px] uppercase tracking-tighter hover:bg-red-700 transition-all"
                                                        >
                                                            ❌ Reject
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <span className="text-[10px] font-bold text-gray-300 uppercase italic">Decision Made</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                    {verificationRequests.length === 0 && (
                                        <tr>
                                            <td colSpan="5" className="px-8 py-20 text-center">
                                                <span className="text-4xl block mb-4">✨</span>
                                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Queue is clear, Abe! No pending verifications.</p>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        ) : activeTab === 'vendors' ? (
                            <table className="w-full text-left">
                                <thead>
                                <tr className="bg-gray-50/50 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
                                    <th className="px-8 py-5">Supplier Info</th>
                                    <th className="px-8 py-5">Strikes</th>
                                    <th className="px-8 py-5 text-center">Status</th>
                                    <th className="px-8 py-5 text-right">Actions</th>
                                </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                {vendorList.map((vendor) => (
                                    <tr key={vendor.id} className={`hover:bg-indigo-50/30 transition-colors group ${vendor.isBanned ? 'bg-red-50/50 opacity-60' : ''}`}>
                                        <td className="px-8 py-6">
                                            <div className="flex flex-col">
                                                <span className="font-black text-gray-900 group-hover:text-indigo-600 transition-colors">{vendor.name}</span>
                                                <span className="text-xs text-gray-400">{vendor.email}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-1">
                                                {[...Array(3)].map((_, i) => (
                                                    <span key={i} className={`text-lg ${i < vendor.strikes ? 'grayscale-0' : 'grayscale opacity-20'}`}>❌</span>
                                                ))}
                                                <span className="ml-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">{vendor.strikes} Strikes</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-center">
                                            <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                                                vendor.isBanned ? 'bg-black text-white' : (vendor.strikes >= 2 ? 'bg-orange-100 text-orange-600' : 'bg-green-100 text-green-600')
                                            }`}>
                                                {vendor.isBanned ? 'Banned' : (vendor.strikes >= 2 ? 'Under Review' : 'Good Standing')}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <div className="flex justify-end gap-3">
                                                {!vendor.isBanned && (
                                                    <button
                                                        onClick={() => handleActionClick(vendor.id, 'BAN_USER', `Ban ${vendor.name}`)}
                                                        className="bg-red-50 text-red-600 px-5 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all active:scale-95 border border-red-100"
                                                    >
                                                        🚫 Ban Account
                                                    </button>
                                                )}
                                                {vendor.isBanned && (
                                                    <span className="text-[10px] font-black text-red-600 uppercase tracking-widest">🚨 Restricted</span>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        ) : activeTab === 'bookings' ? (
                            <table className="w-full text-left">
                                <thead>
                                <tr className="bg-gray-50/50 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
                                    <th className="px-8 py-5">Booking Details</th>
                                    <th className="px-8 py-5">Amount</th>
                                    <th className="px-8 py-5 text-center">Escrow Status</th>
                                    <th className="px-8 py-5 text-right">Mediation Actions</th>
                                </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                {bookings.map((booking) => (
                                    <React.Fragment key={booking.id}>
                                    <tr className={`hover:bg-indigo-50/30 transition-colors group ${booking.status === 'disputed' ? 'bg-red-50/30' : ''}`}>
                                        <td className="px-8 py-6">
                                            <div className="flex flex-col">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-black text-gray-900 uppercase tracking-tight">{booking.vendorName}</span>
                                                    {booking.status === 'disputed' && (
                                                        <button 
                                                            onClick={() => setExpandedBookingId(expandedBookingId === booking.id ? null : booking.id)}
                                                            className="text-[9px] bg-red-100 text-red-600 px-2 py-0.5 rounded-md font-black uppercase tracking-tighter hover:bg-red-200 transition-all"
                                                        >
                                                            {expandedBookingId === booking.id ? 'Hide Case' : 'View Case'}
                                                        </button>
                                                    )}
                                                </div>
                                                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Client: {booking.clientName} • {booking.id}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className="text-sm font-black text-gray-900 italic">₱{booking.price.toLocaleString()}</span>
                                        </td>
                                        <td className="px-8 py-6 text-center">
                                            <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                                                booking.status === 'disputed' ? 'bg-red-600 text-white animate-pulse' : 
                                                booking.status === 'released' || booking.status === 'refunded' || booking.status === 'split' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'
                                            }`}>
                                                {booking.status === 'disputed' ? '⚠️ Disputed' : booking.status}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            {booking.status === 'disputed' ? (
                                                <div className="flex justify-end gap-2">
                                                    <button 
                                                        onClick={() => setChatLogModal({ show: true, bookingId: booking.id })}
                                                        className="bg-white text-gray-400 px-3 py-2 rounded-lg font-black text-[9px] uppercase tracking-tighter hover:bg-gray-100 transition-all border border-gray-100"
                                                        title="View Logs"
                                                    >
                                                        💬 Logs
                                                    </button>
                                                    <button 
                                                        onClick={() => handleActionClick(booking.id, 'RELEASE', 'Final Release')}
                                                        className="bg-green-600 text-white px-3 py-2 rounded-lg font-black text-[9px] uppercase tracking-tighter hover:bg-green-700 transition-all"
                                                        title="Favor Vendor"
                                                    >
                                                        ✅ Release
                                                    </button>
                                                    <button 
                                                        onClick={() => handleActionClick(booking.id, 'REFUNDED', 'Refund Client')}
                                                        className="bg-orange-500 text-white px-3 py-2 rounded-lg font-black text-[9px] uppercase tracking-tighter hover:bg-orange-600 transition-all"
                                                        title="Favor Client"
                                                    >
                                                        🔙 Refund
                                                    </button>
                                                    <button 
                                                        onClick={() => handleActionClick(booking.id, 'SPLIT', 'Split Payout')}
                                                        className="bg-indigo-600 text-white px-3 py-2 rounded-lg font-black text-[9px] uppercase tracking-tighter hover:bg-indigo-700 transition-all"
                                                        title="50/50 Split"
                                                    >
                                                        ⚖️ Split
                                                    </button>
                                                </div>
                                            ) : (
                                                <span className="text-[10px] font-bold text-gray-300 uppercase italic">Case Closed</span>
                                            )}
                                        </td>
                                    </tr>
                                    {/* DISPUTE DETAILS ROW */}
                                    {expandedBookingId === booking.id && (
                                        <tr className="bg-gray-50/50">
                                            <td colSpan="4" className="px-8 py-8">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                    {/* Client Side */}
                                                    <div className="bg-white p-6 rounded-2xl border border-red-100 shadow-sm">
                                                        <div className="flex justify-between items-center mb-4">
                                                            <h4 className="text-[10px] font-black text-red-600 uppercase tracking-widest">Client Complaint</h4>
                                                            <span className="bg-red-50 text-red-600 px-2 py-0.5 rounded text-[9px] font-black uppercase">{booking.disputeCategory}</span>
                                                        </div>
                                                        <p className="text-gray-700 text-sm italic mb-4 leading-relaxed">"{booking.disputeReason}"</p>
                                                        {booking.disputeEvidence && (
                                                            <div className="mt-4">
                                                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">Attached Evidence:</p>
                                                                <img src={booking.disputeEvidence} alt="Evidence" className="w-32 h-32 object-cover rounded-xl border border-gray-100 shadow-sm" />
                                                            </div>
                                                        )}
                                                    </div>
                                                    {/* Vendor Side */}
                                                    <div className="bg-white p-6 rounded-2xl border border-indigo-100 shadow-sm">
                                                        <h4 className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-4">Vendor Appeal</h4>
                                                        {booking.vendorAppeal ? (
                                                            <p className="text-gray-700 text-sm italic leading-relaxed">"{booking.vendorAppeal}"</p>
                                                        ) : (
                                                            <div className="flex flex-col items-center justify-center h-full py-4 text-gray-300">
                                                                <span className="text-2xl mb-2">⏳</span>
                                                                <p className="text-[10px] font-bold uppercase">Awaiting vendor response...</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                    </React.Fragment>
                                ))}
                                </tbody>
                            </table>
                        ) : activeTab === 'payouts' ? (
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-gray-50/50 text-[10px] font-black uppercase tracking-widest text-gray-400">
                                        <th className="px-8 py-6">Vendor Name</th>
                                        <th className="px-8 py-6">Amount</th>
                                        <th className="px-8 py-6">Bank Details</th>
                                        <th className="px-8 py-6">Date</th>
                                        <th className="px-8 py-6 text-center">Status</th>
                                        <th className="px-8 py-6 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {payoutRequests.map(req => (
                                        <tr key={req.id} className="hover:bg-indigo-50/30 transition-all group">
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-black text-xs uppercase italic">
                                                        {req.vendorName.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-black text-gray-900">{req.vendorName}</p>
                                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{req.vendorId}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 font-black text-sm text-indigo-600">
                                                {maskData(req.amount.toLocaleString(), '₱')}
                                            </td>
                                            <td className="px-8 py-6">
                                                <p className="text-xs font-bold text-gray-900">{req.bankName}</p>
                                                <p className="text-[10px] text-gray-400 font-medium tracking-widest uppercase">{req.accountNumber}</p>
                                            </td>
                                            <td className="px-8 py-6 text-xs text-gray-500 font-medium">
                                                {req.date}
                                            </td>
                                            <td className="px-8 py-6 text-center">
                                                <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                                                    req.status === 'pending_withdrawal' ? 'bg-amber-100 text-amber-600' :
                                                    req.status === 'withdrawal_completed' ? 'bg-green-100 text-green-600' :
                                                    'bg-red-100 text-red-600'
                                                }`}>
                                                    {req.status.replace('_', ' ')}
                                                </span>
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                {req.status === 'pending_withdrawal' && (
                                                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button 
                                                            onClick={() => setConfirmModal({ 
                                                                show: true, 
                                                                targetId: req.id, 
                                                                action: 'APPROVE_PAYOUT', 
                                                                label: 'Approve Payout', 
                                                                data: req 
                                                            })}
                                                            className="bg-green-600 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-green-700 shadow-lg shadow-green-100"
                                                        >
                                                            ✅ Approve
                                                        </button>
                                                        <button 
                                                            onClick={() => setConfirmModal({ 
                                                                show: true, 
                                                                targetId: req.id, 
                                                                action: 'DECLINE_PAYOUT', 
                                                                label: 'Decline Payout', 
                                                                data: req 
                                                            })}
                                                            className="bg-red-500 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-600 shadow-lg shadow-red-100"
                                                        >
                                                            ❌ Decline
                                                        </button>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                    {payoutRequests.length === 0 && (
                                        <tr>
                                            <td colSpan="6" className="p-20 text-center italic text-gray-400 text-sm">Walang pending payout requests, Abe.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        ) : (
                            <div className="p-8 space-y-12">
                                {/* KPI Section */}
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm group hover:border-indigo-500 transition-all">
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Total GMV</p>
                                        <h4 className="text-2xl font-black text-gray-900 tracking-tighter italic">₱{totalGMV.toLocaleString()}</h4>
                                        <div className="mt-4 h-1 w-full bg-gray-50 rounded-full overflow-hidden">
                                            <div className="h-full bg-indigo-500 w-3/4"></div>
                                        </div>
                                    </div>
                                    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm group hover:border-amber-500 transition-all">
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Escrow Secured</p>
                                        <h4 className="text-2xl font-black text-gray-900 tracking-tighter italic">₱{totalEscrowSecured.toLocaleString()}</h4>
                                        <div className="mt-4 h-1 w-full bg-gray-50 rounded-full overflow-hidden">
                                            <div className="h-full bg-amber-500 w-1/2"></div>
                                        </div>
                                    </div>
                                    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm group hover:border-green-500 transition-all">
                                        <p className="text-[10px] font-black text-green-600 uppercase tracking-widest mb-2">Net Revenue (2%)</p>
                                        <h4 className="text-2xl font-black text-gray-900 tracking-tighter italic">₱{totalRevenue.toLocaleString()}</h4>
                                        <div className="mt-4 h-1 w-full bg-gray-50 rounded-full overflow-hidden">
                                            <div className="h-full bg-green-500 w-1/4"></div>
                                        </div>
                                    </div>
                                    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm group hover:border-red-500 transition-all">
                                        <p className="text-[10px] font-black text-red-600 uppercase tracking-widest mb-2">Active Disputes</p>
                                        <h4 className="text-2xl font-black text-gray-900 tracking-tighter italic">{activeDisputesCount} Cases</h4>
                                        <div className="mt-4 h-1 w-full bg-gray-50 rounded-full overflow-hidden">
                                            <div className="h-full bg-red-500" style={{ width: `${(activeDisputesCount / bookings.length) * 100}%` }}></div>
                                        </div>
                                    </div>
                                </div>

                                {/* Charts, Stats & Map Row */}
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                                    {/* Left: Status Distribution (1 Column) */}
                                    <div className="bg-gray-50/50 p-8 rounded-[2.5rem] border border-gray-100 h-full">
                                        <h4 className="text-xs font-black text-gray-900 uppercase tracking-widest mb-8">Transaction Distribution</h4>
                                        <div className="space-y-6">
                                            {Object.entries(statusCounts).map(([status, count]) => (
                                                <div key={status}>
                                                    <div className="flex justify-between items-end mb-2">
                                                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{status}</span>
                                                        <span className="text-sm font-black text-gray-900">{count}</span>
                                                    </div>
                                                    <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                                                        <div 
                                                            className={`h-full transition-all duration-1000 ${
                                                                status === 'released' ? 'bg-green-500' : 
                                                                status === 'disputed' ? 'bg-red-500' : 'bg-indigo-400'
                                                            }`}
                                                            style={{ width: `${(count / bookings.length) * 100}%` }}
                                                        ></div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Right: Pampanga Activity Map (2 Columns) */}
                                    <div className="lg:col-span-2 bg-[#0F172A] rounded-[2.5rem] p-8 shadow-2xl overflow-hidden relative border border-white/5 min-h-[450px]">
                                        <div className="absolute top-8 left-8 z-20">
                                            <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">Live Venue Monitoring</h4>
                                            <h2 className="text-xl font-black text-white tracking-tighter italic leading-none">Pampanga Activity Map</h2>
                                        </div>

                                        <div className="w-full h-full flex items-center justify-center">
                                            <ComposableMap
                                                projection="geoMercator"
                                                projectionConfig={{
                                                    scale: 35000,
                                                    center: [120.6, 15.1]
                                                }}
                                                style={{ width: "100%", height: "100%", maxHeight: "400px" }}
                                            >
                                                <ZoomableGroup center={[120.6, 15.1]} zoom={1} minZoom={1} maxZoom={4}>
                                                    <Geographies geography={PAMPANGA_GEO_URL}>
                                                        {({ geographies }) =>
                                                            geographies.map((geo) => (
                                                                <Geography
                                                                    key={geo.rsmKey}
                                                                    geography={geo}
                                                                    fill="#1E293B"
                                                                    stroke="#334155"
                                                                    strokeWidth={0.5}
                                                                    style={{
                                                                        default: { outline: "none" },
                                                                        hover: { fill: "#334155", outline: "none" },
                                                                        pressed: { outline: "none" },
                                                                    }}
                                                                />
                                                            ))
                                                        }
                                                    </Geographies>

                                                    {bookings.filter(b => b.lat && b.lng).map((booking) => (
                                                        <Marker 
                                                            key={booking.id} 
                                                            coordinates={[booking.lng, booking.lat]}
                                                            onMouseEnter={() => {
                                                                setTooltipContent(booking);
                                                                setHoveredBookingId(booking.id);
                                                            }}
                                                            onMouseLeave={() => {
                                                                setTooltipContent(null);
                                                                setHoveredBookingId(null);
                                                            }}
                                                        >
                                                            <circle 
                                                                r={6} 
                                                                fill={
                                                                    booking.status === 'released' ? '#22C55E' : 
                                                                    booking.status === 'disputed' ? '#EF4444' : 
                                                                    (booking.status === 'paid' || booking.status === 'partially_released' || booking.status === 'completed' ? '#3B82F6' : '#94A3B8')
                                                                }
                                                                className={`transition-all duration-300 cursor-pointer ${hoveredBookingId === booking.id ? 'r-8 stroke-[4px] stroke-white' : 'stroke-2 stroke-[#0F172A]'}`}
                                                            />
                                                            {booking.status === 'disputed' && (
                                                                <circle r={12} fill="none" stroke="#EF4444" strokeWidth={2} className="animate-pulse" />
                                                            )}
                                                        </Marker>
                                                    ))}
                                                </ZoomableGroup>
                                            </ComposableMap>
                                        </div>

                                        {/* Tooltip Overlay */}
                                        {tooltipContent && (
                                            <div className="absolute top-8 right-8 z-30 bg-black/80 backdrop-blur-md p-4 rounded-2xl border border-white/10 shadow-2xl animate-in fade-in zoom-in duration-200">
                                                <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">{tooltipContent.city}</p>
                                                <p className="text-sm font-black text-white italic">Client: {tooltipContent.clientName}</p>
                                                <div className="flex justify-between items-center mt-2 gap-4">
                                                    <span className="text-xs font-bold text-gray-400">₱{tooltipContent.price.toLocaleString()}</span>
                                                    <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded ${
                                                        tooltipContent.status === 'released' ? 'bg-green-500/20 text-green-400' :
                                                        tooltipContent.status === 'disputed' ? 'bg-red-500/20 text-red-400' : 'bg-blue-500/20 text-blue-400'
                                                    }`}>
                                                        {tooltipContent.status}
                                                    </span>
                                                </div>
                                            </div>
                                        )}
                                        
                                        {/* Legend */}
                                        <div className="absolute bottom-6 left-6 z-20 flex gap-4 bg-black/40 backdrop-blur-md p-3 rounded-xl border border-white/5">
                                            <div className="flex items-center gap-2">
                                                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                                <span className="text-[9px] font-black text-white uppercase tracking-tighter">Released</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                                <span className="text-[9px] font-black text-white uppercase tracking-tighter">Paid/Escrow</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="w-2 h-2 rounded-full bg-red-500"></div>
                                                <span className="text-[9px] font-black text-white uppercase tracking-tighter">Disputed</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* User Growth & Top Vendors Row */}
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                    <div className="flex gap-4">
                                        <div className="flex-1 bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm">
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Vendors</p>
                                            <h4 className="text-2xl font-black text-gray-900">{vendorCount}</h4>
                                        </div>
                                        <div className="flex-1 bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm">
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Clients</p>
                                            <h4 className="text-2xl font-black text-gray-900">{clientCount}</h4>
                                        </div>
                                    </div>
                                    <div className="bg-white p-8 rounded-[2rem] border border-indigo-50 shadow-xl shadow-indigo-100/20">
                                        <h4 className="text-xs font-black text-indigo-600 uppercase tracking-widest mb-6 flex items-center gap-2">
                                            ⭐ Top Rated Vendors
                                        </h4>
                                        <div className="space-y-4">
                                            {topVendors.length > 0 ? topVendors.map((v, i) => (
                                                <div key={v.id} className="flex justify-between items-center p-3 rounded-xl hover:bg-indigo-50 transition-colors">
                                                    <div className="flex items-center gap-3">
                                                        <span className="w-6 h-6 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-[10px] font-black">{i + 1}</span>
                                                        <span className="text-sm font-bold text-gray-900">{v.name}</span>
                                                    </div>
                                                    <span className="text-[10px] font-black text-green-600 bg-green-50 px-3 py-1 rounded-full uppercase tracking-tighter">
                                                        {v.completedCount} Success
                                                    </span>
                                                </div>
                                            )) : (
                                                <p className="text-xs text-gray-400 italic text-center py-4">No top vendors yet, Abe.</p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Transaction Breakdown Table */}
                                <div className="bg-white rounded-[2rem] border border-gray-100 overflow-hidden shadow-sm">
                                    <div className="p-6 border-b border-gray-50 flex justify-between items-center bg-gray-50/30">
                                        <h4 className="text-xs font-black text-gray-900 uppercase tracking-widest">Financial Breakdown</h4>
                                        <button 
                                            onClick={exportToCSV}
                                            className="bg-gray-900 text-white px-5 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-600 transition-all flex items-center gap-2"
                                        >
                                            📥 Download CSV
                                        </button>
                                    </div>
                                    <table className="w-full text-left">
                                        <thead>
                                            <tr className="bg-gray-50/50 text-[9px] font-black uppercase tracking-widest text-gray-400">
                                                <th className="px-6 py-4">TXN ID</th>
                                                <th className="px-6 py-4 text-center">Status</th>
                                                <th className="px-6 py-4 text-right">Amount</th>
                                                <th className="px-6 py-4 text-right">Fee (2%)</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50">
                                            {bookings.map(b => (
                                                <tr 
                                                    key={b.id} 
                                                    className={`hover:bg-gray-50 transition-all duration-300 ${hoveredBookingId === b.id ? 'bg-indigo-50/80 ring-2 ring-indigo-500 ring-inset scale-[1.01] z-10' : ''}`}
                                                    onMouseEnter={() => setHoveredBookingId(b.id)}
                                                    onMouseLeave={() => setHoveredBookingId(null)}
                                                >
                                                    <td className="px-6 py-4 text-[10px] font-bold text-gray-400">{b.id}</td>
                                                    <td className="px-6 py-4 text-center">
                                                        <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${
                                                            b.status === 'released' ? 'bg-green-100 text-green-600' : 
                                                            b.status === 'disputed' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'
                                                        }`}>
                                                            {b.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-right font-black text-sm text-gray-900">{maskData(b.price.toLocaleString(), '₱')}</td>
                                                    <td className="px-6 py-4 text-right font-black text-sm text-indigo-600">{maskData((b.price * 0.02).toLocaleString(), '₱')}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>
                </div>


                {/* Footer Note */}
                <p className="text-center text-gray-400 text-[10px] font-bold uppercase tracking-[0.3em] mt-10">
                    ABE Events Admin Layer v1.0 • Secure DynamoDB Connection
                </p>
            </div>
        </div>
    );
};

export default AdminDashboard;