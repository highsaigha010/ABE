import React, { useState } from 'react';
import { generateInvoice } from '../utils/invoiceGenerator';

const Dashboard = ({ user, bookings, onLogout, onFindSuppliers, onViewBooking }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const activeBooking = bookings && bookings.length > 0 ? bookings[0] : null;

    // Mock Categories para mukhang buhay ang app
    const categories = [
        { name: "Photographers", icon: "📸", color: "bg-purple-100 text-purple-600" },
        { name: "Venues", icon: "🏰", color: "bg-blue-100 text-blue-600" },
        { name: "Catering", icon: "🍽️", color: "bg-orange-100 text-orange-600" },
        { name: "Hosts/Emcees", icon: "🎤", color: "bg-pink-100 text-pink-600" },
    ];

    return (
        <div className="min-h-screen bg-white font-sans selection:bg-indigo-100">

            {/* --- NAVBAR --- */}
            <nav className="bg-white/80 backdrop-blur-lg sticky top-0 z-50 border-b border-gray-100 px-6 h-20 flex items-center">
                <div className="max-w-7xl mx-auto w-full flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <span className="text-2xl font-black text-gray-900 tracking-tighter uppercase">
                            ABE <span className="text-indigo-600 italic">EVENTS</span>
                        </span>
                    </div>

                    <div className="hidden md:flex items-center gap-8">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
                            Member <span className="text-gray-900 ml-2">{user?.name || 'Guest'}</span>
                        </span>
                        <div className="h-4 w-px bg-gray-100"></div>
                        <button
                            onClick={onLogout}
                            className="text-[10px] font-black uppercase tracking-[0.2em] text-red-500 hover:text-white hover:bg-red-500 border border-red-100 px-5 py-2.5 rounded-xl transition-all active:scale-95"
                        >
                            End Session
                        </button>
                    </div>

                    {/* Mobile Menu Toggle */}
                    <button 
                        className="md:hidden p-2 text-gray-900 focus:outline-none"
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            {isMenuOpen ? (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            ) : (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
                            )}
                        </svg>
                    </button>
                </div>

                {/* Mobile Menu Overlay */}
                {isMenuOpen && (
                    <div className="md:hidden bg-white border-b border-gray-100 absolute top-20 left-0 w-full p-6 space-y-4 shadow-xl animate-in fade-in slide-in-from-top-4 duration-300 z-50">
                        <div className="py-3 border-b border-gray-50">
                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Logged in as</p>
                            <p className="text-sm font-bold text-gray-900 mt-1">{user?.name || 'Guest'}</p>
                        </div>
                        <button
                            onClick={onLogout}
                            className="w-full bg-red-50 text-red-600 px-6 py-4 rounded-xl font-black text-xs uppercase tracking-[0.2em] transition-all text-center"
                        >
                            End Session
                        </button>
                    </div>
                )}
            </nav>

            {/* --- HERO SECTION (Welcome) --- */}
            <div className="pt-20 pb-32 px-6 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-50 via-white to-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-50/50 rounded-full blur-3xl -z-10 animate-pulse"></div>
                
                <div className="max-w-5xl mx-auto text-center relative z-10">
                    <span className="inline-flex items-center gap-2 py-1.5 px-4 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 text-[10px] font-black tracking-[0.2em] mb-8 uppercase">
                        Client Control Center
                    </span>
                    <h1 className="text-4xl sm:text-6xl md:text-7xl font-black mb-8 tracking-tighter text-gray-900 leading-[0.9] md:leading-[1.1]">
                        Your Vision, <br className="hidden md:block"/> 
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">Perfectly Executed.</span>
                    </h1>
                    <p className="text-lg md:text-xl text-gray-500 mb-12 max-w-2xl mx-auto leading-relaxed font-medium">
                        Manage your elite event team and monitor your <strong>Smart Escrow™</strong> protected bookings in real-time.
                    </p>

                    <button
                        onClick={onFindSuppliers}
                        className="bg-gray-900 text-white text-xs sm:text-sm uppercase tracking-widest font-black px-6 sm:px-10 py-4 sm:py-5 rounded-2xl shadow-2xl hover:bg-indigo-600 transition-all transform hover:-translate-y-1 active:scale-95"
                    >
                        Explore Marketplace
                    </button>
                </div>
            </div>

            {/* --- MAIN CONTENT --- */}
            <div className="max-w-6xl mx-auto px-6 -mt-16 pb-24 relative z-20">

                {/* Categories Grid */}
                <div className="mb-16">
                    <div className="flex justify-between items-end mb-8">
                        <div>
                            <h3 className="text-sm font-black text-gray-400 uppercase tracking-[0.3em]">Services Marketplace</h3>
                            <h2 className="text-3xl font-black text-gray-900 tracking-tighter mt-2">Browse Categories</h2>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {categories.map((cat, index) => (
                            <div key={index} className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-gray-100/50 border border-gray-50 hover:shadow-2xl hover:shadow-indigo-100 transition-all cursor-pointer flex flex-col items-center justify-center gap-6 group border-b-4 border-b-transparent hover:border-b-indigo-500">
                                <div className={`w-20 h-20 rounded-3xl flex items-center justify-center text-4xl transition-all group-hover:scale-110 group-hover:rotate-3 duration-500 ${cat.color} shadow-inner`}>
                                    {cat.icon}
                                </div>
                                <span className="font-black text-gray-900 uppercase tracking-widest text-[10px]">{cat.name}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Current Bookings Section */}
                <div className="bg-white rounded-[2rem] sm:rounded-[3rem] p-6 sm:p-12 shadow-2xl shadow-indigo-100/20 border border-gray-50 overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50/50 rounded-full -mr-32 -mt-32 blur-3xl"></div>
                    
                    <div className="flex flex-col lg:flex-row justify-between items-center mb-8 sm:mb-12 relative z-10 gap-6">
                        <div className="text-center lg:text-left">
                            <h3 className="text-[10px] sm:text-sm font-black text-indigo-600 uppercase tracking-[0.3em] mb-2">Escrow Management</h3>
                            <h2 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tighter">Active Bookings</h2>
                        </div>
                        <div className="flex items-center gap-3 bg-green-50 px-4 sm:px-6 py-2 sm:py-3 rounded-2xl border border-green-100">
                            <span className="text-base sm:text-lg">🔒</span>
                            <span className="text-[8px] sm:text-[10px] font-black text-green-700 uppercase tracking-widest">
                                Gold Standard Protection Active
                            </span>
                        </div>
                    </div>

                    {activeBooking ? (
                        <div className="bg-white p-6 sm:p-10 rounded-[2rem] border-2 border-indigo-50 shadow-xl relative overflow-hidden group">
                            <div className="flex flex-col md:flex-row justify-between items-center gap-8">
                                <div className="flex items-center gap-6">
                                    <div className="w-20 h-20 bg-indigo-600 text-white rounded-3xl flex items-center justify-center text-3xl shadow-lg shadow-indigo-200">
                                        📸
                                    </div>
                                    <div className="text-center md:text-left">
                                        <h4 className="text-2xl font-black text-gray-900 tracking-tight">{activeBooking.vendorName}</h4>
                                        <p className="text-indigo-600 font-bold uppercase tracking-widest text-[10px] mt-1">{activeBooking.package}</p>
                                        <div className="flex items-center gap-4 mt-4 text-gray-400 font-medium text-xs">
                                            <span>📅 {activeBooking.date}</span>
                                            <span>•</span>
                                            <span className="text-gray-900 font-bold">₱{activeBooking.price.toLocaleString()}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
                                    <div className="px-6 py-2.5 rounded-full bg-amber-50 text-amber-600 font-black text-[10px] uppercase tracking-widest border border-amber-100 flex items-center gap-2">
                                        <span className="relative flex h-2 w-2">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                                        </span>
                                        {activeBooking.status === 'unpaid' ? 'Awaiting Payment' : 
                                         activeBooking.status === 'released' ? 'Order Complete' : 'Payment Secured'}
                                    </div>

                                    {activeBooking.status === 'released' && (
                                        <button
                                            onClick={() => generateInvoice(activeBooking)}
                                            className="w-full md:w-auto bg-amber-600 text-white font-black text-[10px] uppercase tracking-[0.2em] px-8 py-4 rounded-2xl shadow-xl hover:bg-amber-500 transition-all transform hover:-translate-y-1 active:scale-95"
                                        >
                                            Download Receipt
                                        </button>
                                    )}

                                    <button
                                        onClick={onViewBooking}
                                        className="w-full md:w-auto bg-gray-900 text-white font-black text-[10px] uppercase tracking-[0.2em] px-8 py-4 rounded-2xl shadow-xl hover:bg-indigo-600 transition-all transform hover:-translate-y-1 active:scale-95"
                                    >
                                        {activeBooking.status === 'unpaid' ? 'Secure Booking Now' : 'Manage Booking'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-12 sm:py-24 border-2 border-dashed border-gray-100 rounded-[2rem] sm:rounded-[2.5rem] bg-gray-50/30 relative">
                            <div className="w-16 h-16 sm:w-24 h-24 bg-white rounded-full flex items-center justify-center text-3xl sm:text-5xl mx-auto mb-6 sm:mb-8 shadow-xl border border-gray-50 grayscale opacity-40 group-hover:grayscale-0 transition-all">
                                📅
                            </div>
                            <h4 className="text-xl sm:text-2xl font-black text-gray-900 mb-3 tracking-tight">No Active Events</h4>
                            <p className="text-xs sm:text-sm text-gray-400 font-medium mb-8 sm:mb-10 max-w-xs mx-auto leading-relaxed">
                                Your itinerary is currently empty. Secure your first professional vendor through our marketplace.
                            </p>

                            <button
                                onClick={onFindSuppliers}
                                className="bg-indigo-600 text-white font-black text-[10px] sm:text-xs uppercase tracking-[0.2em] px-8 sm:px-10 py-4 sm:py-5 rounded-2xl shadow-xl shadow-indigo-200 hover:bg-gray-900 transition-all transform hover:-translate-y-1 active:scale-95"
                            >
                                Start Your Search <span>&rarr;</span>
                            </button>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
};

export default Dashboard;