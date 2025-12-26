import React, { useState } from 'react';
import { 
    ComposableMap, 
    Geographies, 
    Geography, 
    Marker,
    ZoomableGroup
} from "react-simple-maps";

const PAMPANGA_GEO_URL = "https://raw.githubusercontent.com/deldersveld/topojson/master/countries/philippines/pampanga.json";

const AdminDashboard = ({ users, bookings, onUpdateStatus }) => {
    const [activeTab, setActiveTab] = useState('vendors'); // 'vendors', 'bookings', or 'analytics'
    const [confirmModal, setConfirmModal] = useState({ show: false, targetId: null, action: null, label: '' });
    const [expandedBookingId, setExpandedBookingId] = useState(null);
    const [tooltipContent, setTooltipContent] = useState(null);
    const [hoveredBookingId, setHoveredBookingId] = useState(null);

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
                                                    <td className="px-6 py-4 text-right font-black text-sm text-gray-900">₱{b.price.toLocaleString()}</td>
                                                    <td className="px-6 py-4 text-right font-black text-sm text-indigo-600">₱{(b.price * 0.02).toLocaleString()}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* --- VISUAL MAP SECTION --- */}
                {activeTab === 'analytics' && (
                    <div className="mt-12 bg-[#0F172A] rounded-[3rem] p-10 shadow-2xl overflow-hidden relative border border-white/5">
                        <div className="flex flex-col lg:flex-row gap-10 relative z-10">
                            {/* Left: Interactive Map */}
                            <div className="flex-[2] bg-indigo-950/30 rounded-[2rem] border border-white/10 relative min-h-[500px] flex flex-col items-center justify-center overflow-hidden group">
                                <div className="absolute top-8 left-8 z-20">
                                    <h4 className="text-xs font-black text-indigo-400 uppercase tracking-widest mb-1">Live Venue Monitoring</h4>
                                    <h2 className="text-2xl font-black text-white tracking-tighter italic">Pampanga Activity Map</h2>
                                </div>

                                {/* Map Legend */}
                                <div className="absolute bottom-8 left-8 z-20 flex gap-4 bg-black/40 backdrop-blur-md p-4 rounded-2xl border border-white/10">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]"></div>
                                        <span className="text-[10px] font-black text-white uppercase tracking-widest">Released</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]"></div>
                                        <span className="text-[10px] font-black text-white uppercase tracking-widest">In Escrow</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]"></div>
                                        <span className="text-[10px] font-black text-white uppercase tracking-widest">Disputed</span>
                                    </div>
                                </div>

                                {/* Tooltip Popup */}
                                {tooltipContent && (
                                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 bg-white p-4 rounded-2xl shadow-2xl border border-indigo-50 animate-in fade-in zoom-in duration-200 pointer-events-none w-48">
                                        <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-1">{tooltipContent.city}</p>
                                        <p className="text-sm font-black text-gray-900 mb-2">Client: {tooltipContent.clientName}</p>
                                        <div className="flex justify-between items-center pt-2 border-t border-gray-50">
                                            <span className="text-lg font-black italic text-gray-900">₱{tooltipContent.price.toLocaleString()}</span>
                                            <span className={`text-[8px] font-black px-2 py-0.5 rounded uppercase ${
                                                tooltipContent.status === 'released' ? 'bg-green-100 text-green-600' :
                                                tooltipContent.status === 'disputed' ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'
                                            }`}>
                                                {tooltipContent.status === 'partially_released' ? 'On-Site' : tooltipContent.status}
                                            </span>
                                        </div>
                                    </div>
                                )}

                                <ComposableMap 
                                    projection="geoMercator"
                                    projectionConfig={{
                                        rotate: [-120.6, -15.1, 0],
                                        scale: 45000
                                    }}
                                    className="w-full h-full cursor-grab active:cursor-grabbing"
                                >
                                    <ZoomableGroup zoom={1} maxZoom={2}>
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
                                                            pressed: { fill: "#475569", outline: "none" },
                                                        }}
                                                    />
                                                ))
                                            }
                                        </Geographies>

                                        {bookings.filter(b => b.lat && b.lng).map((booking) => (
                                            <Marker 
                                                key={booking.id} 
                                                coordinates={[booking.lng, booking.lat]}
                                                onMouseEnter={() => setTooltipContent(booking)}
                                                onMouseLeave={() => setTooltipContent(null)}
                                            >
                                                <g transform="translate(-12, -24)">
                                                    {/* Animated Pulse */}
                                                    <circle 
                                                        cx="12" 
                                                        cy="12" 
                                                        r="8" 
                                                        fill={
                                                            booking.status === 'released' ? '#22c55e' : 
                                                            booking.status === 'disputed' ? '#ef4444' : '#f59e0b'
                                                        } 
                                                        className="animate-ping opacity-20"
                                                    />
                                                    {/* Pin Path */}
                                                    <path
                                                        d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"
                                                        fill={
                                                            booking.status === 'released' ? '#22c55e' : 
                                                            booking.status === 'disputed' ? '#ef4444' : '#f59e0b'
                                                        }
                                                        stroke="#ffffff"
                                                        strokeWidth="1"
                                                    />
                                                </g>
                                            </Marker>
                                        ))}
                                    </ZoomableGroup>
                                </ComposableMap>
                            </div>

                            {/* Right: Heatmap Intelligence */}
                            <div className="flex-1 space-y-8">
                                <div className="bg-white/5 backdrop-blur-md rounded-[2rem] p-8 border border-white/10">
                                    <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-6">Heatmap Intelligence</h4>
                                    <h3 className="text-xl font-black text-white mb-8 tracking-tight">Top Performance Cities</h3>
                                    
                                    <div className="space-y-6">
                                        {topPerformanceCities.map(([cityName, data], index) => (
                                            <div key={cityName} className="group cursor-default">
                                                <div className="flex justify-between items-center mb-3">
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-lg font-black text-white/20 italic">{index + 1}</span>
                                                        <span className="font-black text-white group-hover:text-indigo-400 transition-colors">{cityName}</span>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-xs font-black text-white italic tracking-tighter">₱{data.revenue.toLocaleString()}</p>
                                                        <p className="text-[9px] font-bold text-white/40 uppercase">{data.volume} Bookings</p>
                                                    </div>
                                                </div>
                                                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                                    <div 
                                                        className="h-full bg-gradient-to-r from-indigo-500 to-indigo-400 transition-all duration-1000 group-hover:from-indigo-400 group-hover:to-white"
                                                        style={{ width: `${(data.revenue / totalGMV) * 100 * 2}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="bg-gradient-to-br from-indigo-600 to-indigo-900 rounded-[2rem] p-8 text-white shadow-xl">
                                    <p className="text-[10px] font-black uppercase tracking-widest mb-2 opacity-60">Regional Outlook</p>
                                    <p className="text-sm font-medium leading-relaxed italic">
                                        "Abe, lumalakas ang booking volume sa <span className="text-white font-black underline underline-offset-4 decoration-indigo-400">{topPerformanceCities[0]?.[0]}</span>. Posibleng kailanganin dito ng higit pang verified vendors para sa peak season."
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Background Decor */}
                        <div className="absolute -top-24 -right-24 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none"></div>
                        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none"></div>
                    </div>
                )}

                {/* Footer Note */}
                <p className="text-center text-gray-400 text-[10px] font-bold uppercase tracking-[0.3em] mt-10">
                    ABE Events Admin Layer v1.0 • Secure DynamoDB Connection
                </p>
            </div>
        </div>
    );
};

export default AdminDashboard;