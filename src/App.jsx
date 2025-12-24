import React, {useState, useEffect} from 'react';
import LandingPage from './components/LandingPage';
import Dashboard from './components/Dashboard';
import AuthForm from './components/AuthForm';
import VendorSignupForm from './components/VendorSignupForm';
import VendorSearchPage from './components/VendorSearchPage';
import BookingPage from './components/BookingPage';
import BookingDetails from './components/BookingDetails';
import VendorDashboard from "./components/VendorDashboard";
import SupportCenter from "./components/SupportCenter";
import TermsForESCROW from "./components/TermsForESCROW";
import LegalPage from "./components/LegalPage";
import {Analytics} from '@vercel/analytics/react';

export default function App() {
    // --- 1. SECURITY & ACCESS STATES (Dapat nandito 'to) ---
    const [hasAccess, setHasAccess] = useState(false);
    const [accessCode, setAccessCode] = useState('');
    const CORRECT_CODE = "ABE2025";

    // 2. I-check kung naka-login na sa Access Gate dati
    useEffect(() => {
        const savedAccess = localStorage.getItem('abe_beta_access');
        if (savedAccess === 'true') {
            setHasAccess(true);
        }
    }, []);


    // --- OTHER STATES ---
    const [user, setUser] = useState(null);
    const [currentView, setCurrentView] = useState('landing');
    const [selectedVendorId, setSelectedVendorId] = useState(null);

    // --- 1. THE SHARED DATABASE (Mock Data) ---
    // Ito ang "Single Source of Truth". Konektado dito si Client at Vendor.
    const [bookings, setBookings] = useState([
        {
            id: 'txn-001',
            clientName: 'Jennie Rose',
            vendorName: 'Reggie Photography',
            date: 'Dec 25, 2025',
            package: 'Essential Experience',
            price: 50245,
            status: 'unpaid' // options: 'unpaid', 'paid', 'completed', 'released'
        }
    ]);

    // Function para ma-update ang status (gagamitin ni BookingPage at VendorDashboard)
    const updateBookingStatus = async (bookingId, action) => {
        return await callSmartEscrowAPI(bookingId, action);
    };

    // --- SMART ESCROW API SIMULATOR ---
    const callSmartEscrowAPI = async (bookingId, action) => {
        const normalizedAction = action.toUpperCase();
        console.log(`📡 Sending Request to API: [${normalizedAction}] for Booking #${bookingId}`);

        // Simulate Network Latency (Kunwari bumibiyahe ang data sa AWS)
        return new Promise((resolve) => {
            setTimeout(() => {
                const success = true; // Dito mo pwedeng i-test yung error handling mamaya

                if (success) {
                    setBookings(prev => prev.map(b => {
                        if (b.id === bookingId) {
                            if (normalizedAction === 'PAY' || normalizedAction === 'PAID') return {
                                ...b,
                                status: 'paid'
                            };
                            if (normalizedAction === 'COMPLETE') return {...b, status: 'completed'};
                            if (normalizedAction === 'RELEASE' || normalizedAction === 'RELEASED') return {
                                ...b,
                                status: 'released'
                            };
                        }
                        return b;
                    }));
                    resolve({status: 200, message: "Escrow Updated", success: true});
                }
            }, 1500); // 1.5 seconds delay
        });
    };

    // --- AUTH LOGIC ---
    useEffect(() => {
        const storedUser = localStorage.getItem('photo_user');
        if (storedUser) setUser(JSON.parse(storedUser));
    }, []);

    const handleAccessSubmit = (e) => {
        e.preventDefault();
        if (accessCode.toUpperCase() === CORRECT_CODE) {
            setHasAccess(true);
            localStorage.setItem('abe_beta_access', 'true');
        } else {
            alert("Maling code, Abe! Kontakin mo muna kami para sa access.");
        }
    };

    const handleLogout = () => {
        setUser(null);
        localStorage.removeItem('photo_user');
        setCurrentView('landing');
    };

    const handleAuthSuccess = (userData) => {
        const role = userData.email.toLowerCase().includes('vendor') ? 'vendor' : 'client';
        const userWithRole = {...userData, role};
        setUser(userWithRole);
        localStorage.setItem('photo_user', JSON.stringify(userWithRole));
        setCurrentView('dashboard');
    };

    // --- ACCESS GATE UI ---
    if (!hasAccess) {
        return (
            <>
                <Analytics/>
                <div className="min-h-screen bg-indigo-900 flex items-center justify-center p-6 text-white font-sans">
                    <div className="max-w-md w-full text-center">
                        <img src="/Company%20image/ABE%20EVENTS.png" alt="AbeEvents"
                             className="h-24 mx-auto mb-8 rounded-full shadow-2xl"/>
                        <h1 className="text-3xl font-black mb-4 uppercase tracking-tighter">BETA ACCESS ONLY</h1>
                        <p className="text-indigo-200 mb-8 leading-relaxed">
                            Abe! Ang platform na ito ay kasalukuyang nasa **Private Beta Phase**. Mangyaring ilagay ang
                            iyong access code para makapasok.
                        </p>
                        <form onSubmit={handleAccessSubmit} className="space-y-4">
                            <input
                                type="text"
                                placeholder="Enter Access Code"
                                value={accessCode}
                                onChange={(e) => setAccessCode(e.target.value)}
                                className="w-full bg-white/10 border border-white/20 rounded-2xl py-4 px-6 text-center text-xl font-bold tracking-[0.5em] focus:outline-none focus:ring-2 focus:ring-indigo-400"
                            />
                            <button
                                className="w-full bg-white text-indigo-900 font-black py-4 rounded-2xl hover:bg-indigo-50 transition-all uppercase tracking-widest">
                                Unlock Access
                            </button>
                        </form>
                        <p className="mt-8 text-xs text-indigo-400 uppercase tracking-widest font-bold">
                            Gawang Kapampangan. Secured by Smart Escrow™
                        </p>
                    </div>
                </div>
            </>
        );
    }

    // --- RENDER LOGIC ---

    if (user && (user.id || user.email)) {

        // VENDOR VIEW (Connected to Database)
        if (user.role === 'vendor') {
            return (
                <>
                    <Analytics/>
                    <VendorDashboard
                        user={user}
                        onLogout={handleLogout}
                        bookings={bookings} // PASS THE DATA
                        onUpdateStatus={updateBookingStatus} // PASS THE CONTROL
                    />
                </>
            );
        }

        // CLIENT VIEWS
        if (currentView === 'vendor-profile') {
            // Pass the first booking as sample target
            return (
                <>
                    <Analytics/>
                    <BookingPage
                        user={user}
                        bookingData={bookings[0]} // Pass the specific booking
                        onUpdateStatus={updateBookingStatus}
                        onRedirectToLogin={() => setCurrentView('login')}
                        onBack={() => setCurrentView('dashboard')}
                    />
                </>
            );
        }

        if (currentView === 'vendor-search') {
            return (
                <>
                    <Analytics/>
                    <VendorSearchPage
                        onViewProfile={(id) => {
                            setSelectedVendorId(id);
                            setCurrentView('vendor-profile');
                        }}
                        onBack={() => setCurrentView('dashboard')}
                    />
                </>
            );
        }

        return (
            <>
                <Analytics/>
                <Dashboard
                    user={user}
                    bookings={bookings}
                    onLogout={handleLogout}
                    onFindSuppliers={() => setCurrentView('vendor-search')}
                    onViewBooking={() => setCurrentView('vendor-profile')}
                />
            </>
        );
    }

    // PUBLIC / GUEST VIEWS
    if (['vendor-signup', 'vendor-search', 'vendor-profile', 'privacy-policy', 'terms-of-escrow', 'support'].includes(currentView)) {
        return (
            <>
                <Analytics/>
                <div className="min-h-screen bg-white flex flex-col items-center font-sans selection:bg-indigo-100">
                    {/* Modern Header */}
                    <nav className="w-full bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50">
                        <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
                            <button
                                onClick={() => setCurrentView('landing')}
                                className="flex items-center gap-2 text-gray-400 hover:text-indigo-600 transition-colors group"
                            >
                                <span className="text-xl group-hover:-translate-x-1 transition-transform">←</span>
                                <span className="text-[10px] font-black uppercase tracking-widest">Back</span>
                            </button>
                            <span className="text-xl font-black text-gray-900 tracking-tighter">ABE <span
                                className="text-indigo-600 italic">EVENTS</span></span>
                            <div className="w-16"></div>
                        </div>
                    </nav>

                    <div className="w-full">
                        {currentView === 'vendor-signup' && <VendorSignupForm/>}
                        {currentView === 'vendor-search' && (
                            <VendorSearchPage onViewProfile={() => setCurrentView('vendor-profile')}/>
                        )}
                        {currentView === 'vendor-profile' && (
                            <BookingPage
                                user={user} // null if guest
                                bookingData={bookings[0]}
                                onUpdateStatus={updateBookingStatus}
                                onRedirectToLogin={() => setCurrentView('login')}
                                onBack={() => setCurrentView('landing')}
                            />
                        )}
                        {currentView === 'privacy-policy' && <LegalPage/>}
                        {currentView === 'terms-of-escrow' && <TermsForESCROW/>}
                        {currentView === 'support' && <SupportCenter/>}
                    </div>
                </div>
            </>
        );
    }

    // AUTH & LANDING
    if (currentView === 'login' || currentView === 'register') {
        return (
            <>
                <Analytics/>
                <div className="min-h-screen flex items-center justify-center bg-gray-50">
                    <AuthForm initialMode={currentView} onAuthSuccess={handleAuthSuccess}/>
                </div>
            </>
        );
    }

    return (
        <>
            <Analytics/>
            <LandingPage
                user={user}
                onLogin={() => setCurrentView('login')}
                onRegister={() => setCurrentView('register')}
                onVendorSignup={() => setCurrentView('vendor-signup')}
                onFindSuppliers={() => setCurrentView('vendor-search')}
                onPrivacyPolicy={() => setCurrentView('privacy-policy')}
                onTermsOfEscrow={() => setCurrentView('terms-of-escrow')}
                onSupport={() => setCurrentView('support')}
            />
        </>
    );
}