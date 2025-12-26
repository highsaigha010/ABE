import React, { useState } from 'react';
import { generateInvoice } from '../utils/invoiceGenerator';
import ChatWindow from './ChatWindow';
import PlannerSettings from './PlannerSettings';

const Dashboard = ({ user, bookings, users, onLogout, onFindSuppliers, onViewBooking, showInstallButton, onInstallApp, onOpenChat, messages, sendMessage, handleAcceptContract, unreadCount, latestConversations, eventDate, setEventDate, totalBudget, setTotalBudget, matchmakerData, setMatchmakerData, showNotification, onUpgradeToAgent }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [isMsgDropdownOpen, setIsMsgDropdownOpen] = useState(false);
    const [showSetupModal, setShowSetupModal] = useState(false);
    const [isPlannerSettingsOpen, setIsPlannerSettingsOpen] = useState(false);
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);
    
    // --- SMART MATCHMAKER STATE ---
    const [showMatchmaker, setShowMatchmaker] = useState(!matchmakerData && user?.role === 'CLIENT');
    const [matchStep, setMatchStep] = useState(1);
    const [isMatching, setIsMatching] = useState(false);
    const [matchForm, setMatchForm] = useState(matchmakerData || {
        eventType: '',
        services: [],
        date: eventDate || '',
        budget: totalBudget || 0
    });

    const activeBooking = bookings && bookings.length > 0 ? bookings[0] : null;

    // Helper para sa Smart Sorting
    const getTopPicks = () => {
        if (!matchmakerData) return [];
        
        const currentUsers = Array.isArray(users) ? users : [];
        return currentUsers
            .filter(u => u && u.role === 'vendor' && u.strikes === 0 && !u.isBanned)
            .filter(v => {
                // Filter by category if matchmakerData has services selected
                if (matchmakerData.services && Array.isArray(matchmakerData.services) && matchmakerData.services.length > 0) {
                    return matchmakerData.services.includes(v.category);
                }
                return true;
            })
            .sort((a, b) => {
                // 1. City Match (Near City)
                const cityMatchA = a.city === user?.city ? 1 : 0;
                const cityMatchB = b.city === user?.city ? 1 : 0;
                if (cityMatchA !== cityMatchB) return cityMatchB - cityMatchA;
                
                // 2. Budget Match (Starting Price <= Budget)
                const budgetMatchA = a.startingPrice <= (matchmakerData.budget || 0) ? 1 : 0;
                const budgetMatchB = b.startingPrice <= (matchmakerData.budget || 0) ? 1 : 0;
                if (budgetMatchA !== budgetMatchB) return budgetMatchB - budgetMatchA;
                
                // 3. Rating (Highest first)
                return (b.rating || 0) - (a.rating || 0);
            })
            .slice(0, 3);
    };

    const topPicks = getTopPicks();

    const handleMatchmakerSubmit = () => {
        setIsMatching(true);
        // "Abe is finding the best suppliers for you..." animation delay
        setTimeout(() => {
            setMatchmakerData(matchForm);
            if (matchForm.date) setEventDate(matchForm.date);
            if (matchForm.budget) setTotalBudget(matchForm.budget);
            setIsMatching(false);
            setShowMatchmaker(false);
        }, 2500);
    };

    const handleSaveSettings = (newData) => {
        setEventDate(newData.date);
        setTotalBudget(newData.budget);
        setMatchmakerData(newData);
        setIsPlannerSettingsOpen(false);
        if (showNotification) {
            showNotification('Event Details Updated, Abe! Refreshing matches...', 'success');
        }
    };

    const toggleService = (service) => {
        setMatchForm(prev => {
            const services = prev.services.includes(service)
                ? prev.services.filter(s => s !== service)
                : [...prev.services, service];
            return { ...prev, services };
        });
    };

    // Helper para sa Countdown
    const getDaysUntil = (dateStr) => {
        const targetDate = dateStr ? new Date(dateStr) : (eventDate ? new Date(eventDate) : null);
        if (!targetDate) return 0;
        const today = new Date();
        const diffTime = targetDate - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays > 0 ? diffDays : 0;
    };

    // Helper para sa Budget Tracker (Zero-Kickback Version)
    const getBudgetStats = (bookingsArr) => {
        const total = totalBudget || 0;
        const currentBookings = Array.isArray(bookingsArr) ? bookingsArr : [];
        
        // Sum up all bookings (Total Supplier Contracts)
        const supplierCost = currentBookings.reduce((acc, b) => acc + (b.price || 0), 0);

        // Sum up all paid bookings (Escrow Balance Secured)
        const paid = currentBookings.reduce((acc, b) => {
            const isPaidInEscrow = ['paid', 'partially_released', 'completed', 'released'].includes(b.status);
            return isPaidInEscrow ? acc + (b.price || 0) : acc;
        }, 0);

        const surplus = total - supplierCost;
        const remainingToPay = supplierCost - paid; // Magkano pa ang utang sa vendors
        const percent = total > 0 ? (paid / total) * 100 : 0;
        
        return { total, paid, supplierCost, remainingToPay, surplus, percent };
    };

    const budget = getBudgetStats(bookings);

    // Helper para sa Timeline Step
    const getTimelineStep = (status) => {
        if (['released', 'refunded', 'split'].includes(status)) return 4;
        if (status === 'completed') return 3;
        if (['paid', 'partially_released'].includes(status)) return 2;
        return 1; // Booked / Unpaid
    };

    const currentStep = activeBooking ? getTimelineStep(activeBooking.status) : 0;

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
                        <div className="relative">
                            <button 
                                onClick={() => setIsMsgDropdownOpen(!isMsgDropdownOpen)}
                                className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center text-xl hover:bg-gray-100 transition-all relative group"
                            >
                                💬
                                {unreadCount > 0 && (
                                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white animate-bounce">
                                        {unreadCount}
                                    </span>
                                )}
                            </button>

                            {/* Messaging Dropdown */}
                            {isMsgDropdownOpen && (
                                <div className="absolute top-full right-0 mt-4 w-80 bg-white rounded-3xl shadow-2xl border border-gray-100 py-6 z-50 animate-in fade-in slide-in-from-top-4 duration-300">
                                    <div className="px-6 mb-4 flex justify-between items-center">
                                        <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-400">Recent Messages</h4>
                                        <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">{unreadCount} New</span>
                                    </div>
                                    
                                    <div className="max-h-96 overflow-y-auto px-2">
                                        {latestConversations.length > 0 ? latestConversations.map((conv, idx) => {
                                            const isContract = conv.lastMessage.type === 'contract';
                                            return (
                                                <button 
                                                    key={idx}
                                                    onClick={() => {
                                                        onOpenChat(conv.bookingId);
                                                        setIsChatOpen(true);
                                                        setIsMsgDropdownOpen(false);
                                                    }}
                                                    className={`w-full flex gap-4 p-4 rounded-2xl hover:bg-gray-50 transition-all text-left group mb-1 ${isContract ? 'bg-indigo-50/50 border border-indigo-100' : ''}`}
                                                >
                                                    <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-lg shrink-0 border border-gray-100">
                                                        {isContract ? '📜' : '👤'}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex justify-between items-start mb-0.5">
                                                            <p className="text-sm font-black text-gray-900 truncate tracking-tight uppercase italic">{conv.senderName}</p>
                                                            <span className="text-[8px] font-bold text-gray-400 shrink-0">{conv.lastMessage.timestamp}</span>
                                                        </div>
                                                        <p className={`text-xs truncate ${conv.lastMessage.isRead ? 'text-gray-400 font-medium' : 'text-gray-900 font-bold'}`}>
                                                            {isContract ? `Contract: ${conv.lastMessage.text}` : conv.lastMessage.text}
                                                        </p>
                                                        {isContract && (
                                                            <span className="inline-block mt-2 px-2 py-0.5 bg-amber-100 text-amber-700 text-[8px] font-black uppercase tracking-widest rounded-full">Action Required</span>
                                                        )}
                                                    </div>
                                                </button>
                                            );
                                        }) : (
                                            <div className="py-10 text-center">
                                                <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">No messages yet Abe</p>
                                            </div>
                                        )}
                                    </div>

                                    <div className="px-6 mt-4 pt-4 border-t border-gray-50">
                                        <button 
                                            onClick={() => {
                                                if (activeBooking) {
                                                    onOpenChat(activeBooking.id);
                                                    setIsChatOpen(true);
                                                    setIsMsgDropdownOpen(false);
                                                }
                                            }}
                                            className="w-full text-center text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:text-gray-900 transition-colors"
                                        >
                                            View All Messages →
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
                            Member <span className="text-gray-900 ml-2">{user?.name || 'Guest'}</span>
                        </span>
                        <div className="h-4 w-px bg-gray-100"></div>
                        {user?.role === 'CLIENT' && (
                            <button
                                onClick={() => setShowUpgradeModal(true)}
                                className="text-[10px] font-black uppercase tracking-[0.2em] bg-indigo-600 text-white hover:bg-gray-900 px-5 py-2.5 rounded-xl transition-all shadow-lg active:scale-95 flex items-center gap-2"
                            >
                                <span>Professional Mode 💼</span>
                            </button>
                        )}
                        <button
                            onClick={onLogout}
                            className="text-[10px] font-black uppercase tracking-[0.2em] text-red-500 hover:text-white hover:bg-red-500 border border-red-100 px-5 py-2.5 rounded-xl transition-all active:scale-95"
                        >
                            End Session
                        </button>
                        {showInstallButton && (
                            <button
                                onClick={onInstallApp}
                                className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-indigo-700 transition-all shadow-lg active:scale-95 flex items-center gap-2"
                            >
                                <span>Install App</span>
                                <span className="text-sm">📲</span>
                            </button>
                        )}
                    </div>

                        {/* Mobile Menu Toggle */}
                        <div className="flex items-center gap-4 md:hidden">
                            <div className="relative">
                                <button 
                                    onClick={() => setIsMsgDropdownOpen(!isMsgDropdownOpen)}
                                    className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-lg hover:bg-gray-100 transition-all relative"
                                >
                                    💬
                                    {unreadCount > 0 && (
                                        <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[8px] font-black rounded-full flex items-center justify-center border-2 border-white">
                                            {unreadCount}
                                        </span>
                                    )}
                                </button>
                                {isMsgDropdownOpen && (
                                    <div className="absolute top-full right-0 mt-4 w-[280px] bg-white rounded-3xl shadow-2xl border border-gray-100 py-6 z-[100] animate-in fade-in slide-in-from-top-4 duration-300">
                                        <div className="px-6 mb-4 flex justify-between items-center">
                                            <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-400">Messages</h4>
                                            <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">{unreadCount}</span>
                                        </div>
                                        <div className="max-h-60 overflow-y-auto px-2">
                                            {latestConversations.length > 0 ? latestConversations.map((conv, idx) => (
                                                <button 
                                                    key={idx}
                                                    onClick={() => {
                                                        onOpenChat(conv.bookingId);
                                                        setIsChatOpen(true);
                                                        setIsMsgDropdownOpen(false);
                                                    }}
                                                    className="w-full flex gap-3 p-3 rounded-xl hover:bg-gray-50 transition-all text-left mb-1"
                                                >
                                                    <div className="w-10 h-10 bg-white rounded-lg shadow-sm flex items-center justify-center text-sm shrink-0 border border-gray-100">👤</div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-[10px] font-black text-gray-900 truncate uppercase">{conv.senderName}</p>
                                                        <p className="text-[10px] text-gray-400 truncate">{conv.lastMessage.text}</p>
                                                    </div>
                                                </button>
                                            )) : (
                                                <p className="text-center py-4 text-[10px] font-black text-gray-300 uppercase">Walang Messages</p>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                            <button 
                                className="p-2 text-gray-900 focus:outline-none"
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
                    </div>

                {/* Mobile Menu Overlay */}
                {isMenuOpen && (
                    <div className="md:hidden bg-white border-b border-gray-100 absolute top-20 left-0 w-full p-6 space-y-4 shadow-xl animate-in fade-in slide-in-from-top-4 duration-300 z-50">
                        <div className="py-3 border-b border-gray-50">
                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Logged in as</p>
                            <p className="text-sm font-bold text-gray-900 mt-1">{user?.name || 'Guest'}</p>
                        </div>
                        {user?.role === 'CLIENT' && (
                            <button
                                onClick={() => {
                                    setShowUpgradeModal(true);
                                    setIsMenuOpen(false);
                                }}
                                className="w-full bg-indigo-600 text-white px-6 py-4 rounded-xl font-black text-xs uppercase tracking-[0.2em] transition-all text-center shadow-lg"
                            >
                                Become Agent 💼
                            </button>
                        )}
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
                    <div className="absolute top-0 right-0">
                        <button 
                            onClick={() => setIsPlannerSettingsOpen(true)}
                            className="w-12 h-12 bg-white rounded-2xl shadow-xl flex items-center justify-center text-xl hover:bg-indigo-50 transition-all active:scale-95 border border-indigo-50"
                            title="Edit Event Settings"
                        >
                            ⚙️
                        </button>
                    </div>
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
                        onClick={matchmakerData ? onFindSuppliers : () => setShowMatchmaker(true)}
                        className="bg-gray-900 text-white text-xs sm:text-sm uppercase tracking-widest font-black px-6 sm:px-10 py-4 sm:py-5 rounded-2xl shadow-2xl hover:bg-indigo-600 transition-all transform hover:-translate-y-1 active:scale-95 flex items-center gap-3 mx-auto"
                    >
                        <span>{matchmakerData ? 'Explore Marketplace' : 'Find My Perfect Team ✨'}</span>
                    </button>
                </div>
            </div>

            {/* --- MAIN CONTENT --- */}
            <div className="max-w-6xl mx-auto px-6 -mt-16 pb-24 relative z-20">

                {/* Conditional Chat Window Rendering */}
                {isChatOpen && activeBooking && (
                    <ChatWindow 
                        booking={activeBooking}
                        currentUser={user}
                        messages={messages || []}
                        onSendMessage={sendMessage}
                        onAcceptContract={handleAcceptContract}
                        onClose={() => setIsChatOpen(false)}
                    />
                )}

                {/* EVENT TIMELINE & BUDGET TRACKER */}
                {activeBooking && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
                        {/* Timeline */}
                        <div className="lg:col-span-2 bg-white rounded-[2.5rem] p-8 sm:p-10 shadow-2xl shadow-indigo-100/50 border border-gray-50 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110"></div>
                            <div className="relative z-10">
                                <div className="flex justify-between items-start mb-10">
                                    <div>
                                        <h3 className="text-2xl font-black text-gray-900 tracking-tighter italic uppercase">Event Timeline</h3>
                                        <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mt-1">Road to {eventDate || activeBooking.date}</p>
                                    </div>
                                    <div className="text-right">
                                        <span className="block text-4xl font-black text-gray-900 tracking-tighter">{getDaysUntil()}</span>
                                        <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Days to Go</span>
                                    </div>
                                </div>

                                <div className="relative">
                                    {/* Horizontal Line */}
                                    <div className="absolute top-5 left-0 w-full h-0.5 bg-gray-100 -z-10"></div>
                                    <div 
                                        className="absolute top-5 left-0 h-0.5 bg-indigo-600 -z-10 transition-all duration-1000"
                                        style={{ width: `${((currentStep - 1) / 3) * 100}%` }}
                                    ></div>
                                    
                                    <div className="flex justify-between">
                                        {[
                                            { label: 'Booked', icon: '📝' },
                                            { label: 'Escrow Paid', icon: '🔒' },
                                            { label: 'Event Day', icon: '🎉' },
                                            { label: 'Final Release', icon: '✨' }
                                        ].map((step, idx) => {
                                            const stepNum = idx + 1;
                                            const isCompleted = currentStep > stepNum;
                                            const isActive = currentStep === stepNum;
                                            
                                            return (
                                                <div key={idx} className="flex flex-col items-center gap-4 text-center">
                                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm transition-all duration-500 shadow-lg ${
                                                        isCompleted ? 'bg-indigo-600 text-white' : 
                                                        isActive ? 'bg-indigo-50 text-indigo-600 border-2 border-indigo-600 ring-4 ring-indigo-50 scale-110' : 
                                                        'bg-white text-gray-300 border-2 border-gray-50'
                                                    }`}>
                                                        {isCompleted ? '✓' : step.icon}
                                                    </div>
                                                    <span className={`text-[9px] font-black uppercase tracking-tighter max-w-[60px] transition-colors ${
                                                        isCompleted || isActive ? 'text-gray-900' : 'text-gray-300'
                                                    }`}>
                                                        {step.label}
                                                    </span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Budget Tracker (Zero-Kickback Version) */}
                        <div className="bg-white rounded-[2.5rem] p-8 sm:p-10 shadow-2xl shadow-indigo-100/50 border border-gray-50 flex flex-col justify-between">
                            <div>
                                <h3 className="text-2xl font-black text-gray-900 tracking-tighter italic uppercase mb-1">Financial Transparency</h3>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-8 flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                                    Zero-Kickback Ledger Powered by Smart Escrow™
                                </p>
                                
                                <div className="space-y-6">
                                    <div className="flex justify-between items-end border-b border-gray-50 pb-4">
                                        <div className="flex flex-col">
                                            <span className="text-[9px] font-black text-indigo-600 uppercase tracking-widest">Total Budget Given</span>
                                            <span className="text-2xl font-black text-gray-900 tracking-tighter italic">₱{budget.total.toLocaleString()}</span>
                                        </div>
                                    </div>

                                    <div className="flex justify-between items-end border-b border-gray-50 pb-4">
                                        <div className="flex flex-col">
                                            <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Total Supplier Cost</span>
                                            <span className="text-xl font-black text-gray-900 tracking-tighter italic">₱{budget.supplierCost.toLocaleString()}</span>
                                        </div>
                                    </div>

                                    <div className="bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest italic underline decoration-indigo-200">Surplus Tracker</span>
                                            <span className="text-[8px] font-black text-white bg-indigo-600 px-2 py-0.5 rounded-full uppercase">Your Savings</span>
                                        </div>
                                        <p className="text-2xl font-black text-indigo-900 tracking-tighter italic">₱{budget.surplus.toLocaleString()}</p>
                                    </div>

                                    <div className="w-full h-2 bg-gray-50 rounded-full overflow-hidden">
                                        <div 
                                            className="h-full bg-indigo-600 transition-all duration-1000 ease-out"
                                            style={{ width: `${(budget.supplierCost / budget.total) * 100}%` }}
                                        ></div>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-10 flex flex-col gap-3">
                                {budget.surplus > 0 && (
                                    <button 
                                        onClick={() => showNotification(`Refund request for ₱${budget.surplus.toLocaleString()} submitted to Escrow!`, 'success')}
                                        className="w-full py-4 bg-gray-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-xl active:scale-95"
                                    >
                                        Request Refund of Surplus 💸
                                    </button>
                                )}
                                <button 
                                    onClick={onViewBooking}
                                    className="w-full py-4 bg-indigo-50 text-indigo-600 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-100 transition-all"
                                >
                                    Detailed Billing History
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* ABE'S TOP PICKS (Smart Match Results) */}
                {matchmakerData && topPicks.length > 0 && (
                    <div className="mb-16 animate-in fade-in slide-in-from-bottom-8 duration-700">
                        <div className="flex justify-between items-end mb-8">
                            <div>
                                <h3 className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.3em] mb-2">Smart Matchmaker Results</h3>
                                <h2 className="text-3xl font-black text-gray-900 tracking-tighter italic uppercase">Abe's Top Picks for You</h2>
                            </div>
                            <button 
                                onClick={() => {
                                    setMatchStep(1);
                                    setShowMatchmaker(true);
                                }}
                                className="text-[10px] font-black text-indigo-600 uppercase tracking-widest bg-indigo-50 px-4 py-2 rounded-xl hover:bg-indigo-600 hover:text-white transition-all border border-indigo-100"
                            >
                                Re-run Matchmaker ↺
                            </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {topPicks.map((vendor) => (
                                <div key={vendor.id} className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-indigo-100/20 border border-gray-50 hover:shadow-2xl transition-all group relative overflow-hidden flex flex-col justify-between">
                                    <div className="absolute top-0 right-0 p-6 transition-transform group-hover:scale-125 duration-500">
                                        <span className="text-2xl">{vendor.icon}</span>
                                    </div>
                                    <div className="mb-6">
                                        <div className="flex items-center gap-1 mb-2">
                                            {[...Array(5)].map((_, i) => (
                                                <span key={i} className={i < (vendor.rating || 5) ? "text-amber-400 text-[10px]" : "text-gray-200 text-[10px]"}>★</span>
                                            ))}
                                        </div>
                                        <h4 className="text-xl font-black text-gray-900 tracking-tight uppercase italic">{vendor.name}</h4>
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{vendor.category} • {vendor.city}</p>
                                    </div>
                                    <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-50">
                                        <div>
                                            <p className="text-[8px] font-black text-gray-300 uppercase tracking-widest">Starts at</p>
                                            <p className="text-lg font-black text-indigo-600 tracking-tighter italic">₱{vendor.startingPrice?.toLocaleString()}</p>
                                        </div>
                                        <button 
                                            onClick={() => onFindSuppliers()}
                                            className="px-6 py-3 bg-gray-900 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-600 transition-all active:scale-95"
                                        >
                                            View Profile
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

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

            {/* --- EVENT SETUP MODAL --- */}
            {showSetupModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                    <div className="absolute inset-0 bg-gray-950/40 backdrop-blur-md" onClick={() => (eventDate && totalBudget) && setShowSetupModal(false)}></div>
                    <div className="bg-white w-full max-w-md rounded-[2.5rem] p-10 relative z-10 shadow-2xl animate-in zoom-in-95 duration-300">
                        <div className="text-center mb-10">
                            <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-3xl flex items-center justify-center text-3xl mx-auto mb-6">
                                📅
                            </div>
                            <h3 className="text-3xl font-black text-gray-900 tracking-tighter italic uppercase leading-none">Event Setup</h3>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-4 leading-relaxed">
                                Abe, i-setup muna natin ang iyong event details para sa mas tumpak na monitoring.
                            </p>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <label className="text-[10px] font-black text-gray-900 uppercase tracking-widest ml-1 mb-2 block">Target Event Date</label>
                                <input 
                                    type="date" 
                                    value={eventDate}
                                    onChange={(e) => setEventDate(e.target.value)}
                                    className="w-full bg-gray-50 border-2 border-transparent focus:border-indigo-500 rounded-2xl px-6 py-4 font-bold text-sm transition-all outline-none"
                                />
                            </div>

                            <div>
                                <label className="text-[10px] font-black text-gray-900 uppercase tracking-widest ml-1 mb-2 block">Total Event Budget (₱)</label>
                                <div className="relative">
                                    <span className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 font-black">₱</span>
                                    <input 
                                        type="number" 
                                        placeholder="0.00"
                                        value={totalBudget || ''}
                                        onChange={(e) => setTotalBudget(Number(e.target.value))}
                                        className="w-full bg-gray-50 border-2 border-transparent focus:border-indigo-500 rounded-2xl pl-12 pr-6 py-4 font-bold text-sm transition-all outline-none"
                                    />
                                </div>
                                <p className="text-[8px] font-bold text-gray-400 mt-2 ml-1 italic">
                                    Ito ang gagamitin natin bilang denominator sa iyong Budget Tracker.
                                </p>
                            </div>

                            <button 
                                onClick={() => {
                                    if (!eventDate || !totalBudget) {
                                        alert("Abe, paki-fill up lahat ng fields!");
                                        return;
                                    }
                                    setShowSetupModal(false);
                                }}
                                className="w-full bg-gray-900 text-white py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:bg-indigo-600 transition-all active:scale-95 mt-4"
                            >
                                Save Settings
                            </button>
                            
                            {(eventDate && totalBudget) && (
                                <button 
                                    onClick={() => setShowSetupModal(false)}
                                    className="w-full bg-transparent text-gray-400 py-2 font-black text-[10px] uppercase tracking-widest hover:text-gray-900 transition-all"
                                >
                                    Cancel
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
            {/* --- SMART MATCHMAKER MODAL --- */}
            {showMatchmaker && (
                <div className="fixed inset-0 z-[150] flex items-center justify-center p-6">
                    <div className="absolute inset-0 bg-gray-950/60 backdrop-blur-xl" onClick={() => !isMatching && matchmakerData && setShowMatchmaker(false)}></div>
                    
                    <div className="bg-white w-full max-w-lg rounded-[3rem] overflow-hidden relative z-10 shadow-2xl animate-in zoom-in-95 duration-500">
                        {isMatching ? (
                            <div className="p-20 text-center flex flex-col items-center justify-center min-h-[500px]">
                                <div className="w-24 h-24 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center text-5xl animate-bounce mb-8">
                                    🔍
                                </div>
                                <h3 className="text-2xl font-black text-gray-900 tracking-tighter italic uppercase mb-4 leading-tight">Abe is finding the best suppliers for you...</h3>
                                <div className="flex gap-2">
                                    <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                    <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                    <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce"></div>
                                </div>
                            </div>
                        ) : (
                            <div className="p-10 sm:p-12">
                                {/* Header */}
                                <div className="mb-10 text-center">
                                    <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-4 py-1.5 rounded-full uppercase tracking-widest mb-4 inline-block">Step {matchStep} of 3</span>
                                    <h3 className="text-3xl font-black text-gray-900 tracking-tighter italic uppercase leading-none">Smart Matchmaker</h3>
                                    <p className="text-xs text-gray-400 font-medium mt-3 italic">Tulungan kitang mahanap ang perpektong team, Abe!</p>
                                </div>

                                {/* Step 1: Event Type */}
                                {matchStep === 1 && (
                                    <div className="space-y-8 animate-in slide-in-from-right-8 duration-500">
                                        <label className="text-xs font-black text-gray-900 uppercase tracking-widest text-center block">Anong event ang pinaplano natin?</label>
                                        <div className="grid grid-cols-2 gap-4">
                                            {[
                                                { id: 'Wedding', icon: '💍' },
                                                { id: 'Birthday', icon: '🎂' },
                                                { id: 'Corporate', icon: '🏢' },
                                                { id: 'Debut', icon: '👸' }
                                            ].map(type => (
                                                <button 
                                                    key={type.id}
                                                    onClick={() => {
                                                        setMatchForm({...matchForm, eventType: type.id});
                                                        setMatchStep(2);
                                                    }}
                                                    className={`p-8 rounded-[2rem] border-2 transition-all flex flex-col items-center gap-4 group ${matchForm.eventType === type.id ? 'border-indigo-600 bg-indigo-50/50 shadow-lg' : 'border-gray-50 hover:border-indigo-200'}`}
                                                >
                                                    <span className="text-4xl group-hover:scale-125 transition-transform duration-500">{type.icon}</span>
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-900">{type.id}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Step 2: Services */}
                                {matchStep === 2 && (
                                    <div className="space-y-8 animate-in slide-in-from-right-8 duration-500">
                                        <label className="text-xs font-black text-gray-900 uppercase tracking-widest text-center block">Anong mga serbisyo ang kailangan mo?</label>
                                        <div className="grid grid-cols-1 gap-2 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                                            {[
                                                "Photographers", "Venues", "Catering", "Hosts/Emcees", "Transport", "Florists", "Gowns & Suits"
                                            ].map(service => (
                                                <button 
                                                    key={service}
                                                    onClick={() => toggleService(service)}
                                                    className={`w-full p-5 rounded-2xl border-2 flex items-center justify-between transition-all ${matchForm.services.includes(service) ? 'border-indigo-600 bg-indigo-50/50' : 'border-gray-50 hover:border-indigo-100'}`}
                                                >
                                                    <span className="text-sm font-bold text-gray-900">{service}</span>
                                                    <div className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all ${matchForm.services.includes(service) ? 'bg-indigo-600 text-white' : 'bg-gray-100'}`}>
                                                        {matchForm.services.includes(service) && '✓'}
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                        <button 
                                            onClick={() => setMatchStep(3)}
                                            disabled={matchForm.services.length === 0}
                                            className="w-full bg-gray-900 text-white py-5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-xl disabled:opacity-50"
                                        >
                                            Next: Date & Budget →
                                        </button>
                                        <button onClick={() => setMatchStep(1)} className="w-full text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-gray-900 transition-colors">Back</button>
                                    </div>
                                )}

                                {/* Step 3: Date & Budget */}
                                {matchStep === 3 && (
                                    <div className="space-y-8 animate-in slide-in-from-right-8 duration-500">
                                        <label className="text-xs font-black text-gray-900 uppercase tracking-widest text-center block">Kailan ang date at magkano ang target budget?</label>
                                        <div className="space-y-6">
                                            <div>
                                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block">Event Date</label>
                                                <input 
                                                    type="date" 
                                                    value={matchForm.date}
                                                    onChange={(e) => setMatchForm({...matchForm, date: e.target.value})}
                                                    className="w-full bg-gray-50 border-2 border-transparent focus:border-indigo-500 rounded-2xl px-6 py-4 font-bold text-sm outline-none"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block">Target Budget (₱)</label>
                                                <div className="relative">
                                                    <span className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 font-black">₱</span>
                                                    <input 
                                                        type="number" 
                                                        value={matchForm.budget || ''}
                                                        onChange={(e) => setMatchForm({...matchForm, budget: Number(e.target.value)})}
                                                        placeholder="0.00"
                                                        className="w-full bg-gray-50 border-2 border-transparent focus:border-indigo-500 rounded-2xl pl-12 pr-6 py-4 font-bold text-sm outline-none"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                        <button 
                                            onClick={handleMatchmakerSubmit}
                                            disabled={!matchForm.date || !matchForm.budget}
                                            className="w-full bg-indigo-600 text-white py-5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-gray-900 transition-all shadow-xl shadow-indigo-100 disabled:opacity-50"
                                        >
                                            Find My Matches ✨
                                        </button>
                                        <button onClick={() => setMatchStep(2)} className="w-full text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-gray-900 transition-colors">Back</button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* --- AGENT UPGRADE MODAL --- */}
            {showUpgradeModal && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
                    <div className="absolute inset-0 bg-gray-950/40 backdrop-blur-md" onClick={() => setShowUpgradeModal(false)}></div>
                    <div className="bg-white w-full max-w-md rounded-[2.5rem] p-10 relative z-10 shadow-2xl animate-in zoom-in-95 duration-300 border border-indigo-50">
                        <div className="text-center mb-10">
                            <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-3xl flex items-center justify-center text-4xl mx-auto mb-6 shadow-inner">
                                💼
                            </div>
                            <h3 className="text-3xl font-black text-gray-900 tracking-tighter italic uppercase leading-none">Become an Agent</h3>
                            <p className="text-[11px] font-bold text-gray-500 mt-6 leading-relaxed">
                                Abe, handa ka na bang maging Event Agent? <br/>
                                <span className="text-indigo-600 font-black">You can manage multiple clients and earn 1% commission!</span>
                            </p>
                        </div>

                        <div className="space-y-4">
                            <button 
                                onClick={() => {
                                    onUpgradeToAgent();
                                    setShowUpgradeModal(false);
                                }}
                                className="w-full bg-indigo-600 text-white py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-indigo-100 hover:bg-gray-900 transition-all active:scale-95"
                            >
                                Handa na ako, Abe! 🚀
                            </button>
                            <button 
                                onClick={() => setShowUpgradeModal(false)}
                                className="w-full bg-transparent text-gray-400 py-2 font-black text-[10px] uppercase tracking-widest hover:text-gray-900 transition-all"
                            >
                                Hindi pa muna
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* --- PLANNER SETTINGS SIDEBAR --- */}
            <PlannerSettings 
                isOpen={isPlannerSettingsOpen}
                onClose={() => setIsPlannerSettingsOpen(false)}
                eventDate={eventDate}
                totalBudget={totalBudget}
                matchmakerData={matchmakerData}
                onSave={handleSaveSettings}
                bookings={bookings}
            />
        </div>
    );
};

export default Dashboard;