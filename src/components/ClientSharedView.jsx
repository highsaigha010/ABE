import React, { useState, useEffect } from 'react';

const ClientSharedView = ({ projectId, agentProjects, bookings, onAction }) => {
    const [feedback, setFeedback] = useState('');
    const [showFeedbackForm, setShowFeedbackForm] = useState(false);

    // No-Scroll Security
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, []);

    // Find project by ID or by Hash
    const project = (agentProjects || []).find(p => {
        if (!p) return false;
        if (p.id === projectId) return true;
        // Try matching by the shareable hash
        try {
            const hash = btoa(`${p.id}-${p.agentId}`).substring(0, 10);
            return hash === projectId;
        } catch (e) {
            return false;
        }
    });

    if (!projectId || !agentProjects || agentProjects.length === 0) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center p-6 text-center font-sans">
                <div className="max-w-md w-full animate-pulse">
                    <div className="w-20 h-20 bg-gray-100 rounded-full mx-auto mb-8"></div>
                    <div className="h-4 bg-gray-100 rounded w-3/4 mx-auto mb-4"></div>
                    <div className="h-3 bg-gray-100 rounded w-1/2 mx-auto"></div>
                </div>
            </div>
        );
    }

    if (!project) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center p-6 text-center">
                <div className="bg-white p-12 rounded-[3rem] shadow-2xl border border-gray-50">
                    <h1 className="text-4xl font-black text-gray-900 mb-4 tracking-tighter uppercase italic">Project Not Found</h1>
                    <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Abe, it looks like this link is invalid or has expired.</p>
                </div>
            </div>
        );
    }

    const projectBookings = (bookings || []).filter(b => b && (b.projectId === project?.id || b.referralCode === project?.agentId));
    const totalSlots = (project?.serviceSlots || []).length;
    const securedSlots = (project?.serviceSlots || []).filter(slot => 
        slot && projectBookings.some(b => b && (b.vendorCategory === slot.category || (b.vendorName && b.vendorName === slot.vendorName)))
    ).length;
    
    const progress = totalSlots > 0 ? Math.min(Math.round((securedSlots / totalSlots) * 100), 100) : 0;

    const totalBudget = project?.totalClientBudget || 0;
    const supplierCost = (project?.serviceSlots || []).reduce((acc, s) => acc + (s?.budget || 0), 0);
    const surplus = totalBudget - supplierCost;

    const handleApprove = () => {
        if (project?.id) {
            onAction(project.id, 'APPROVED');
        }
    };

    const handleFeedback = () => {
        if (!feedback.trim() || !project?.id) return;
        onAction(project.id, 'FEEDBACK', feedback);
        setShowFeedbackForm(false);
        setFeedback('');
    };

    const handleRefundRequest = () => {
        if (surplus > 0 && project?.id) {
            onAction(project.id, 'REFUND_SURPLUS');
            alert(`Abe, ang iyong refund request para sa ₱${surplus.toLocaleString()} ay ipinadala na sa Smart Escrow. Wait for GCash processing!`);
        }
    };

    return (
        <div className="min-h-screen bg-white font-sans selection:bg-indigo-100 pb-20">
            {/* --- TRANSPARENCY BANNER --- */}
            <div className="bg-indigo-600 text-white px-6 py-3 text-center">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] italic">
                    🛡️ Zero-Kickback Platform: Secured by Smart Escrow.
                </p>
            </div>

            <nav className="bg-white/80 backdrop-blur-lg border-b border-gray-100 h-20 flex items-center px-6 sticky top-0 z-50">
                <div className="max-w-5xl mx-auto w-full flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <span className="text-2xl font-black text-gray-900 tracking-tighter uppercase">
                            ABE <span className="text-indigo-600 italic">EVENTS</span>
                        </span>
                    </div>
                    <div className="flex items-center gap-4">
                        {project.approvalStatus === 'APPROVED' ? (
                            <div className="px-4 py-1.5 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-100 flex items-center gap-2">
                                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                                Team Confirmed
                            </div>
                        ) : (
                            <div className="px-4 py-1.5 bg-amber-50 text-amber-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-amber-100">
                                Review Required
                            </div>
                        )}
                    </div>
                </div>
            </nav>

            <header className="pt-20 pb-32 px-6 relative overflow-hidden text-center flex flex-col items-center justify-center min-h-[60vh]">
                <div className="max-w-4xl mx-auto relative z-10">
                    <span className="inline-flex items-center gap-2 py-1.5 px-4 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 text-[10px] font-black tracking-[0.2em] mb-8 uppercase">
                        Client Exclusive Portal
                    </span>
                    <h1 className="text-4xl sm:text-6xl font-black mb-6 tracking-tighter text-gray-900 leading-none uppercase italic">
                        Financial Transparency: <span className="text-indigo-600">{project.name}</span>
                    </h1>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 max-w-5xl mx-auto">
                        {/* TOTAL BUDGET CARD */}
                        <div className="bg-gray-900 p-8 rounded-[2.5rem] border border-gray-800 shadow-xl text-left relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-10 text-4xl">💰</div>
                            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Total Paid (Client)</p>
                            <h2 className="text-3xl font-black text-white italic tracking-tighter">₱{totalBudget.toLocaleString()}</h2>
                        </div>

                        {/* SUPPLIER COST CARD */}
                        <div className="bg-white p-8 rounded-[2.5rem] border-2 border-indigo-50 shadow-xl text-left relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-10 text-4xl text-indigo-600">📑</div>
                            <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-2">Total Supplier Cost</p>
                            <h2 className="text-3xl font-black text-indigo-600 italic tracking-tighter">₱{supplierCost.toLocaleString()}</h2>
                        </div>

                        {/* SURPLUS CARD */}
                        <div className="bg-indigo-600 p-8 rounded-[2.5rem] border-4 border-indigo-400 shadow-2xl text-left relative overflow-hidden group">
                            <div className="absolute -top-4 -right-4 w-16 h-16 bg-white text-indigo-600 rounded-full flex items-center justify-center text-2xl shadow-xl transform rotate-12 group-hover:scale-110 transition-transform">✨</div>
                            <p className="text-[10px] font-black text-indigo-200 uppercase tracking-widest mb-2 italic">Your Surplus (Savings)</p>
                            <h2 className="text-4xl font-black text-white italic tracking-tighter">₱{surplus.toLocaleString()}</h2>
                        </div>
                    </div>

                    <div className="mt-12">
                        {project.refundStatus === 'REFUNDED' ? (
                            <div className="max-w-lg mx-auto py-6 bg-emerald-500 rounded-3xl border-4 border-emerald-400 shadow-xl">
                                <p className="text-[14px] font-black text-white uppercase tracking-widest italic flex items-center justify-center gap-3">
                                    <span>✅</span> Surplus Refunded to GCash
                                </p>
                            </div>
                        ) : (
                            surplus > 0 && (
                                <button 
                                    onClick={handleRefundRequest}
                                    className="max-w-lg w-full py-8 bg-gray-900 text-white rounded-[2.5rem] font-black text-[16px] uppercase tracking-[0.2em] hover:bg-indigo-600 transition-all shadow-2xl active:scale-95 flex items-center justify-center gap-3 border-4 border-gray-800"
                                >
                                    REQUEST REFUND NOW 💸
                                </button>
                            )
                        )}
                    </div>
                    
                    {/* Event Progress Bar */}
                    <div className="max-w-md mx-auto mt-16 space-y-3">
                        <div className="flex justify-between items-end">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Booking Progress</p>
                            <p className="text-lg font-black text-indigo-600 italic">{progress}% Booked</p>
                        </div>
                        <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden p-1 shadow-inner">
                            <div 
                                className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-1000"
                                style={{ width: `${progress}%` }}
                            ></div>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-6xl mx-auto px-6 -mt-16 relative z-20 grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* LEFT COL: VERIFIED TEAM */}
                <div className="lg:col-span-8 space-y-8">
                    <div className="bg-white rounded-[3rem] p-10 shadow-2xl shadow-indigo-100/50 border border-gray-50">
                        <div className="flex justify-between items-center mb-10">
                            <div>
                                <h3 className="text-2xl font-black text-gray-900 tracking-tighter italic uppercase">Supplier Breakdown</h3>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Verified Receipts & Costs</p>
                            </div>
                            <span className="text-[10px] font-black bg-indigo-600 text-white px-4 py-2 rounded-xl uppercase">
                                {securedSlots} / {totalSlots} Secured
                            </span>
                        </div>

                        <div className="grid grid-cols-1 gap-6">
                            {(project.serviceSlots || []).map(slot => {
                                const isSecured = projectBookings.some(b => b.vendorCategory === slot.category);
                                const isPadded = slot.budget > (slot.basePrice * 1.5);
                                return (
                                    <div key={slot.id} className={`p-8 rounded-[2.5rem] border-2 transition-all flex flex-col md:flex-row md:items-center justify-between gap-6 ${isSecured ? 'bg-white border-indigo-100 shadow-xl' : 'bg-gray-50 border-gray-50 opacity-60'}`}>
                                        <div className="flex items-center gap-6">
                                            <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center text-3xl shadow-inner">
                                                {slot.category === 'PHOTOGRAPHY' ? '📸' : 
                                                 slot.category === 'VIDEOGRAPHY' ? '🎥' :
                                                 slot.category === 'VENUE' ? '🏰' :
                                                 slot.category === 'CATERING' ? '🍽️' : 
                                                 slot.category === 'HOST' ? '🎤' : '👤'}
                                            </div>
                                            <div>
                                                <p className="text-[9px] font-black text-indigo-600 uppercase tracking-widest mb-1">{slot.category}</p>
                                                <h4 className="font-black text-gray-900 uppercase italic tracking-tight text-lg leading-tight">
                                                    {slot.vendorName || 'Slot Reserved'}
                                                </h4>
                                                {isSecured && (
                                                    <span className="inline-flex mt-2 text-[8px] font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md uppercase tracking-widest items-center gap-1 border border-emerald-100">
                                                        ✅ ABE Verified
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        <div className="text-right">
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Contract Amount</p>
                                            <p className={`text-2xl font-black tracking-tighter italic ${isPadded ? 'text-amber-500' : 'text-gray-900'}`}>
                                                ₱{(slot.budget || 0).toLocaleString()}
                                            </p>
                                            {isPadded && (
                                                <div className="mt-2 inline-flex items-center gap-1.5 py-1 px-3 bg-amber-50 rounded-full border border-amber-100">
                                                    <span className="animate-pulse w-2 h-2 bg-amber-500 rounded-full"></span>
                                                    <span className="text-[8px] font-black text-amber-600 uppercase tracking-widest">Price Variance Alert</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* DECISION CENTER FOR CLIENT */}
                    {project.approvalStatus !== 'APPROVED' && (
                        <div className="bg-gray-50 rounded-[3rem] p-10 border border-gray-100">
                            <h3 className="text-xl font-black text-gray-900 tracking-tighter italic uppercase mb-8 text-center">Your Feedback Matters</h3>
                            <div className="flex flex-col sm:flex-row gap-4">
                                <button 
                                    onClick={handleApprove}
                                    className="flex-1 bg-emerald-600 text-white py-6 rounded-[2rem] font-black text-xs uppercase tracking-widest hover:bg-emerald-500 transition-all shadow-xl active:scale-95"
                                >
                                    Approve This Team 🚀
                                </button>
                                
                                {!showFeedbackForm ? (
                                    <button 
                                        onClick={() => setShowFeedbackForm(true)}
                                        className="flex-1 bg-white text-gray-400 py-6 rounded-[2rem] font-black text-xs uppercase tracking-widest border border-gray-100 hover:text-gray-900 transition-all"
                                    >
                                        Request Changes
                                    </button>
                                ) : (
                                    <div className="flex-[2] space-y-3 animate-in slide-in-from-right-4 duration-300">
                                        <textarea 
                                            placeholder="Abe, anong gusto mong palitan? (e.g. 'Dagdagan natin ng budget sa Catering')"
                                            value={feedback}
                                            onChange={(e) => setFeedback(e.target.value)}
                                            className="w-full bg-white border-2 border-transparent focus:border-indigo-100 rounded-2xl p-6 text-xs font-bold outline-none resize-none min-h-[120px] shadow-sm"
                                        />
                                        <div className="flex gap-2">
                                            <button 
                                                onClick={handleFeedback}
                                                className="flex-1 bg-gray-900 text-white py-4 rounded-xl text-[10px] font-black uppercase tracking-widest"
                                            >
                                                Send Feedback to Agent
                                            </button>
                                            <button 
                                                onClick={() => setShowFeedbackForm(false)}
                                                className="px-6 bg-white text-gray-400 rounded-xl text-[10px] font-black uppercase tracking-widest border border-gray-100"
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

            </main>
        </div>
    );
};

export default ClientSharedView;
