import React, { useState, useEffect } from 'react';
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

export default function App() {
    useEffect(() => {
        // 1. I-disable ang Right-Click
        const handleContextMenu = (e) => {
            e.preventDefault();
        };

        // 2. I-disable ang Keyboard Shortcuts para sa Inspect Element
        const handleKeyDown = (e) => {
            if (
                e.keyCode === 123 || // F12
                (e.ctrlKey && e.shiftKey && e.keyCode === 73) || // Ctrl+Shift+I
                (e.ctrlKey && e.shiftKey && e.keyCode === 74) || // Ctrl+Shift+J
                (e.ctrlKey && e.keyCode === 85) // Ctrl+U (View Source)
            ) {
                e.preventDefault();
                alert("Abe, Beta Phase pa tayo. Secured muna ang system. 😉");
            }
        };

        document.addEventListener('contextmenu', handleContextMenu);
        document.addEventListener('keydown', handleKeyDown);

        // Cleanup pag-close ng app
        return () => {
            document.removeEventListener('contextmenu', handleContextMenu);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, []);

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
    const updateBookingStatus = (id, newStatus) => {
        setBookings(prev => prev.map(b =>
            b.id === id ? { ...b, status: newStatus } : b
        ));
    };

    // --- AUTH LOGIC ---
    useEffect(() => {
        const storedUser = localStorage.getItem('photo_user');
        if (storedUser) setUser(JSON.parse(storedUser));
    }, []);

    const handleLogout = () => {
        setUser(null);
        localStorage.removeItem('photo_user');
        setCurrentView('landing');
    };

    const handleAuthSuccess = (userData) => {
        const role = userData.email.toLowerCase().includes('vendor') ? 'vendor' : 'client';
        const userWithRole = { ...userData, role };
        setUser(userWithRole);
        localStorage.setItem('photo_user', JSON.stringify(userWithRole));
        setCurrentView('dashboard');
    };

    // --- RENDER LOGIC ---

    if (user && (user.id || user.email)) {

        // VENDOR VIEW (Connected to Database)
        if (user.role === 'vendor') {
            return (
                <VendorDashboard
                    user={user}
                    onLogout={handleLogout}
                    bookings={bookings} // PASS THE DATA
                    onUpdateStatus={updateBookingStatus} // PASS THE CONTROL
                />
            );
        }

        // CLIENT VIEWS
        if (currentView === 'vendor-profile') {
            // Pass the first booking as sample target
            return (
                <BookingPage
                    user={user}
                    bookingData={bookings[0]} // Pass the specific booking
                    onUpdateStatus={updateBookingStatus}
                    onRedirectToLogin={() => setCurrentView('login')}
                    onBack={() => setCurrentView('dashboard')}
                />
            );
        }

        if (currentView === 'vendor-search') {
            return (
                <VendorSearchPage
                    onViewProfile={(id) => {
                        setSelectedVendorId(id);
                        setCurrentView('vendor-profile');
                    }}
                    onBack={() => setCurrentView('dashboard')}
                />
            );
        }

        return (
            <Dashboard
                user={user}
                onLogout={handleLogout}
                onFindSuppliers={() => setCurrentView('vendor-search')}
            />
        );
    }

    // PUBLIC / GUEST VIEWS
    if (['vendor-signup', 'vendor-search', 'vendor-profile', 'privacy-policy', 'terms-of-escrow', 'support'].includes(currentView)) {
        return (
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
                        <span className="text-xl font-black text-gray-900 tracking-tighter">ABE <span className="text-indigo-600 italic">EVENTS</span></span>
                        <div className="w-16"></div>
                    </div>
                </nav>

                <div className="w-full">
                    {currentView === 'vendor-signup' && <VendorSignupForm />}
                    {currentView === 'vendor-search' && (
                        <VendorSearchPage onViewProfile={() => setCurrentView('vendor-profile')} />
                    )}
                    {currentView === 'vendor-profile' && (
                        <BookingPage
                            user={user} // null if guest
                            bookingData={bookings[0]}
                            onUpdateStatus={updateBookingStatus}
                            onRedirectToLogin={() => setCurrentView('login')}
                        />
                    )}
                    {currentView === 'privacy-policy' && <LegalPage />}
                    {currentView === 'terms-of-escrow' && <TermsForESCROW />}
                    {currentView === 'support' && <SupportCenter />}
                </div>
            </div>
        );
    }

    // AUTH & LANDING
    if (currentView === 'login' || currentView === 'register') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <AuthForm initialMode={currentView} onAuthSuccess={handleAuthSuccess} />
            </div>
        );
    }

    return (
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
    );
}