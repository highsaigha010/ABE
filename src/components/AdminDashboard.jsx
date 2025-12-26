import React, { useState } from 'react';

const AdminDashboard = ({ users, bookings, onUpdateStatus }) => {
    const [activeTab, setActiveTab] = useState('vendors'); // 'vendors' or 'bookings'
    const [confirmModal, setConfirmModal] = useState({ show: false, targetId: null, action: null, label: '' });
    const [expandedBookingId, setExpandedBookingId] = useState(null);

    // Filter vendors from the global users list
    const vendorList = users.filter(u => u.role === 'vendor');

    const handleActionClick = (targetId, action, label) => {
        setConfirmModal({ show: true, targetId, action, label });
    };

    const executeDecision = async () => {
        const { targetId, action } = confirmModal;
        setConfirmModal({ ...confirmModal, show: false });
        
        await onUpdateStatus(targetId, action);
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] font-sans relative">
            {/* Confirmation Modal */}
            {confirmModal.show && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                    <div className="absolute inset-0 bg-indigo-950/40 backdrop-blur-sm" onClick={() => setConfirmModal({ ...confirmModal, show: false })}></div>
                    <div className="bg-white rounded-[2rem] p-8 max-w-sm w-full relative shadow-2xl border border-indigo-50 text-center">
                        <div className="text-4xl mb-4">⚖️</div>
                        <h3 className="text-xl font-black text-gray-900 uppercase tracking-tighter italic mb-2">Justice System</h3>
                        <p className="text-gray-600 text-sm mb-8 font-medium">
                            Abe, sigurado ka na ba sa desisyon mo? Final na ito at hindi na mababawi.
                            <br/>
                            <span className="text-indigo-600 font-bold uppercase text-[10px] tracking-widest mt-2 block">Action: {confirmModal.label}</span>
                        </p>
                        <div className="flex flex-col gap-3">
                            <button 
                                onClick={executeDecision}
                                className="w-full bg-gray-900 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-xl shadow-indigo-100"
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
                                onClick={() => setActiveTab('vendors')}
                                className={`text-lg font-black uppercase tracking-tighter italic transition-all ${activeTab === 'vendors' ? 'text-indigo-600 border-b-4 border-indigo-600' : 'text-gray-300 hover:text-gray-400'}`}
                            >
                                Verification Queue
                            </button>
                            <button 
                                onClick={() => setActiveTab('bookings')}
                                className={`text-lg font-black uppercase tracking-tighter italic transition-all ${activeTab === 'bookings' ? 'text-indigo-600 border-b-4 border-indigo-600' : 'text-gray-300 hover:text-gray-400'}`}
                            >
                                Dispute Mediation
                            </button>
                        </div>
                        <input type="text" placeholder="Search Cabalen..." className="bg-gray-50 border-none rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500 w-64" />
                    </div>

                    <div className="overflow-x-auto">
                        {activeTab === 'vendors' ? (
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
                        ) : (
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