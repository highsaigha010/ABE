import React, {useState, useEffect} from 'react';
import LandingPage from './components/LandingPage';
import Dashboard from './components/Dashboard';
import AuthForm from './components/AuthForm';
import VendorSignupForm from './components/VendorSignupForm';
import VendorSearchPage from './components/VendorSearchPage';
import BookingPage from './components/BookingPage';
import BookingDetails from './components/BookingDetails';
import VendorDashboard from "./components/VendorDashboard";
import AdminDashboard from "./components/AdminDashboard";
import SupportCenter from "./components/SupportCenter";
import TermsForESCROW from "./components/TermsForESCROW";
import LegalPage from "./components/LegalPage";
import NotificationToast from "./components/NotificationToast";
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
    const [notification, setNotification] = useState(null);

    // --- NOTIFICATION SYSTEM ---
    const showNotification = (message, type = 'info') => {
        const id = Date.now();
        setNotification({ id, message, type });

        // THE 'CHING!' SOUND
        if (type === 'success') {
            const audio = new Audio('https://codeskulptor-demos.commondatastorage.googleapis.com/descent/gotitem.mp3');
            audio.play().catch(e => console.log("Audio play failed:", e));
        }
    };

    // --- 1. THE SHARED DATABASE (Mock Data) ---
    // Dagdagan natin ng Users Database para sa Security System
    const [users, setUsers] = useState([
        { id: 'usr-001', name: 'Jennie Rose', email: 'jennie@example.com', role: 'client', strikes: 0, isBanned: false },
        { id: 'usr-002', name: 'Reggie Photography', email: 'reggie@vendor.com', role: 'vendor', strikes: 0, isBanned: false },
        { id: 'usr-003', name: 'Juan Dela Cruz', email: 'juan@example.com', role: 'client', strikes: 1, isBanned: false },
        { id: 'usr-004', name: 'Mabalacat Bridal Cars', email: 'boy@vendor.com', role: 'vendor', strikes: 2, isBanned: false },
        { id: 'usr-005', name: 'Scammer Abe', email: 'scam@example.com', role: 'client', strikes: 3, isBanned: true },
    ]);

    // Ito ang "Single Source of Truth". Konektado dito si Client at Vendor.
    const [bookings, setBookings] = useState([
        {
            id: 'txn-001',
            clientName: 'Jennie Rose',
            vendorName: 'Reggie Photography',
            date: 'Dec 25, 2025',
            package: 'Essential Experience',
            price: 50245,
            status: 'unpaid',
            city: 'Angeles',
            lat: 15.1441,
            lng: 120.5887,
            disputeReason: '',
            disputeEvidence: null,
            vendorAppeal: ''
        },
        {
            id: 'txn-002',
            clientName: 'Juan Dela Cruz',
            vendorName: 'Mabalacat Bridal Cars',
            date: 'Dec 20, 2025',
            package: 'Luxury Ride',
            price: 15000,
            status: 'disputed',
            city: 'San Fernando',
            lat: 15.0286,
            lng: 120.6898,
            disputeCategory: 'Late Arrival',
            disputeReason: 'Abe, halos dalawang oras silang late sa venue. Muntik na kaming hindi makarating sa simbahan.',
            disputeEvidence: 'https://images.unsplash.com/photo-1501747315-124a0eaca060?auto=format&fit=crop&q=80&w=300',
            vendorAppeal: 'Nagkaroon po ng hindi inaasahang heavy traffic sa San Fernando dahil sa parada.'
        },
        {
            id: 'txn-003',
            clientName: 'Cabalen Galing',
            vendorName: 'Reggie Photography',
            date: 'Dec 28, 2025',
            package: 'Premium Pack',
            price: 75000,
            status: 'released',
            city: 'Clark',
            lat: 15.1794,
            lng: 120.5275,
        },
        {
            id: 'txn-004',
            clientName: 'Maria Clara',
            vendorName: 'Mabalacat Bridal Cars',
            date: 'Dec 30, 2025',
            package: 'Standard',
            price: 25000,
            status: 'paid',
            city: 'Mabalacat',
            lat: 15.2215,
            lng: 120.5732,
        },
        {
            id: 'txn-005',
            clientName: 'Jose Rizal',
            vendorName: 'Reggie Photography',
            date: 'Dec 15, 2025',
            package: 'Essential',
            price: 45000,
            status: 'released',
            city: 'San Fernando',
            lat: 15.0348,
            lng: 120.6814,
        }
    ]);

    // Function para ma-update ang status (gagamitin ni BookingPage at VendorDashboard)
    const updateBookingStatus = async (bookingId, action, extraData = {}) => {
        return await callSmartEscrowAPI(bookingId, action, extraData);
    };

    // --- SMART ESCROW API SIMULATOR ---
    const callSmartEscrowAPI = async (targetId, action, extraData = {}) => {
        const normalizedAction = action.toUpperCase();
        console.log(`📡 Sending Request to API: [${normalizedAction}] for Target #${targetId}`, extraData);

        // Simulate Network Latency
        return new Promise((resolve) => {
            setTimeout(() => {
                const success = true;

                if (success) {
                    let notificationMsg = "Escrow Updated";
                    let notificationType = "success";

                    // Handle User Actions (Ban, Strike)
                    if (normalizedAction === 'BAN_USER') {
                        setUsers(prev => prev.map(u => 
                            u.id === targetId ? { ...u, isBanned: true } : u
                        ));
                        
                        // Hold active bookings of this user
                        const bannedUser = users.find(u => u.id === targetId);
                        setBookings(prev => prev.map(b => {
                            if (b.clientName === bannedUser?.name || b.vendorName === bannedUser?.name) {
                                if (b.status !== 'released' && b.status !== 'refunded') {
                                    return { ...b, status: 'disputed', disputeReason: 'Account suspended by Admin.' };
                                }
                            }
                            return b;
                        }));

                        notificationMsg = `Account ${targetId} has been BANNED.`;
                        notificationType = "error";
                    }

                    // Handle Booking Actions
                    setBookings(prev => prev.map(b => {
                        if (b.id === targetId) {
                            if (normalizedAction === 'PAY' || normalizedAction === 'PAID') {
                                notificationMsg = `Payment Secured for ${b.vendorName}!`;
                                return { ...b, status: 'paid' };
                            }

                            if (normalizedAction === 'DISPUTE') {
                                notificationMsg = `🚨 Dispute Filed for ${b.vendorName}. Funds Frozen.`;
                                return { 
                                    ...b, 
                                    status: 'disputed', 
                                    disputeCategory: extraData.category,
                                    disputeReason: extraData.reason,
                                    disputeEvidence: extraData.evidence 
                                };
                            }

                            if (normalizedAction === 'APPEAL') {
                                notificationMsg = `✅ Appeal Submitted for ${b.id}.`;
                                return { ...b, vendorAppeal: extraData.appeal };
                            }

                            if (normalizedAction === 'RELEASE_20') {
                                notificationMsg = `₱${(b.price * 0.20).toLocaleString()} Mobilization Released! Ching!`;
                                return { ...b, status: 'partially_released' };
                            }

                            if (normalizedAction === 'COMPLETE') {
                                notificationMsg = `Job Completed! Awaiting final release for ${b.vendorName}.`;
                                return { ...b, status: 'completed' };
                            }

                            if (normalizedAction === 'RELEASE' || normalizedAction === 'RELEASED') {
                                notificationMsg = `Transaction Finalized! ₱${(b.price * 0.8).toLocaleString()} sent to ${b.vendorName}.`;
                                return { ...b, status: 'released' };
                            }

                            if (normalizedAction === 'REFUNDED') {
                                notificationMsg = `Dispute Resolved: 100% Refund issued to ${b.clientName}.`;
                                
                                // Automatic Strike for Vendor
                                setUsers(prevUsers => prevUsers.map(u => {
                                    if (u.name === b.vendorName) {
                                        return { ...u, strikes: u.strikes + 1 };
                                    }
                                    return u;
                                }));

                                return { ...b, status: 'refunded' };
                            }

                            if (normalizedAction === 'SPLIT') {
                                notificationMsg = `Dispute Resolved: Payout split between Vendor and Client.`;
                                return { ...b, status: 'split' };
                            }
                        }
                        return b;
                    }));

                    showNotification(notificationMsg, notificationType);
                    resolve({ status: 200, message: "Action Success", success: true });
                } else {
                    showNotification("Action Failed", "error");
                    resolve({ status: 500, message: "Action Failed", success: false });
                }
            }, 1500);
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
        // I-check sa ating "database" kung banned ang user na ito
        const existingUser = users.find(u => u.email === userData.email);
        
        if (existingUser && existingUser.isBanned) {
            alert("Abe, ang account mo ay suspendido dahil sa paglabag sa aming Terms of Service.");
            return;
        }

        const role = userData.email.toLowerCase().includes('vendor') ? 'vendor' : 'client';
        const userWithRole = {
            ...userData, 
            role,
            strikes: existingUser ? existingUser.strikes : 0,
            isBanned: existingUser ? existingUser.isBanned : false
        };
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

    const renderNotification = () => {
        if (!notification) return null;
        return (
            <NotificationToast 
                notification={notification} 
                onClose={() => setNotification(null)} 
            />
        );
    };

    if (user && (user.id || user.email)) {

        // VENDOR VIEW (Pinagtibay na Logic)
        if (user.role === 'vendor') {
            // Dito natin sinisiguro na kahit ano pa ang 'currentView',
            // basta Vendor ang naka-login, lilitaw ang VendorDashboard.
            return (
                <>
                    <Analytics/>
                    {renderNotification()}
                    <VendorDashboard
                        user={user}
                        onLogout={handleLogout}
                        bookings={bookings}
                        onUpdateStatus={updateBookingStatus}
                        showNotification={showNotification}
                    />
                </>
            );
        }

        // CLIENT VIEWS (Keep this as is)
        if (currentView === 'vendor-profile') {
            return (
                <>
                    <Analytics/>
                    {renderNotification()}
                    <BookingPage
                        user={user}
                        bookingData={bookings[0]}
                        onUpdateStatus={updateBookingStatus}
                        onRedirectToLogin={() => setCurrentView('login')}
                        onBack={() => setCurrentView('dashboard')}
                        showNotification={showNotification}
                    />
                </>
            );
        }

        if (currentView === 'vendor-search') {
            return (
                <>
                    <Analytics/>
                    {renderNotification()}
                    <VendorSearchPage
                        users={users}
                        bookings={bookings}
                        onViewProfile={(id) => {
                            setSelectedVendorId(id);
                            setCurrentView('vendor-profile');
                        }}
                        onBack={() => setCurrentView('dashboard')}
                        showNotification={showNotification}
                    />
                </>
            );
        }

        return (
            <>
                <Analytics/>
                {renderNotification()}
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

    // --- 4. PUBLIC / GUEST / ADMIN VIEWS ---
    // Dito natin isinama ang 'admin-dashboard' sa listahan
    if (['vendor-signup', 'vendor-search', 'vendor-profile', 'privacy-policy', 'terms-of-escrow', 'support', 'admin-dashboard'].includes(currentView)) {
        return (
            <>
                <Analytics/>
                {renderNotification()}
                <div className="min-h-screen bg-white flex flex-col items-center font-sans selection:bg-indigo-100">
                    {/* Modern Header */}
                    <nav className="w-full bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50">
                        <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
                            <button
                                onClick={() => setCurrentView('landing')}
                                className="flex items-center gap-2 text-gray-400 hover:text-indigo-600 transition-colors group"
                            >
                                <span className="text-xl group-hover:-translate-x-1 transition-transform">←</span>
                                <span className="text-[10px] font-black uppercase tracking-widest">
                                    {/* Kapag admin dashboard ang view, "Exit Admin" ang nakasulat */}
                                    {currentView === 'admin-dashboard' ? 'Exit Admin' : 'Back'}
                                </span>
                            </button>
                            <span className="text-xl font-black text-gray-900 tracking-tighter uppercase">
                                ABE <span className="text-indigo-600 italic">Events</span>
                            </span>
                            <div className="w-16"></div>
                        </div>
                    </nav>

                    <div className="w-full">
                        {currentView === 'vendor-signup' && <VendorSignupForm/>}

                        {/* ETO YUNG DINAGDAG NATING ADMIN VIEW */}
                        {currentView === 'admin-dashboard' && (
                            <AdminDashboard
                                users={users}
                                bookings={bookings}
                                onUpdateStatus={updateBookingStatus}
                            />
                        )}

                        {currentView === 'vendor-search' && (
                            <VendorSearchPage 
                                users={users} 
                                onBack={() => setCurrentView('landing')}
                                onViewProfile={() => setCurrentView('vendor-profile')}
                            />
                        )}
                        {currentView === 'vendor-profile' && (
                            <BookingPage
                                user={user}
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

    // Sa loob ng App.jsx, hanapin ang LandingPage rendering part:
    return (
        <>
            <Analytics/>
            {renderNotification()}
            <LandingPage
                user={user}
                onLogin={() => setCurrentView('login')}
                onRegister={() => setCurrentView('register')}
                onVendorSignup={() => setCurrentView('vendor-signup')}
                onFindSuppliers={() => setCurrentView('vendor-search')}
                onPrivacyPolicy={() => setCurrentView('privacy-policy')}
                onTermsOfEscrow={() => setCurrentView('terms-of-escrow')}
                onSupport={() => setCurrentView('support')}
                // ETO YUNG DAGDAG BARKADA:
                onAdminAccess={() => {
                    const pass = prompt("Enter Admin Code:");
                    if(pass === "ABE2025") setCurrentView('admin-dashboard');
                }}
            />
        </>
    );
}