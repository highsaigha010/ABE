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
    // --- 1. SECURITY & ACCESS STATES ---
    const [hasAccess, setHasAccess] = useState(false);
    const [accessCode, setAccessCode] = useState('');
    const CORRECT_CODE = "ABE2025";
    
    // Admin Credentials for RBAC
    const adminCredentials = {
        email: "admin@abe.events",
        password: "ADMIN_PASSWORD_2025" // In a real app, this should be handled via backend
    };
    const [isAdminVerified, setIsAdminVerified] = useState(false);
    const [deferredPrompt, setDeferredPrompt] = useState(null);

    // 2. I-check kung naka-login na sa Access Gate o User session dati
    useEffect(() => {
        const handleBeforeInstallPrompt = (e) => {
            e.preventDefault();
            setDeferredPrompt(e);
        };
        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

        const savedAccess = localStorage.getItem('abe_beta_access');
        if (savedAccess === 'true') {
            setHasAccess(true);
        }

        const storedUser = localStorage.getItem('photo_user');
        if (storedUser) {
            const parsedUser = JSON.parse(storedUser);
            setUser(parsedUser);
            if (parsedUser.role === 'ADMIN') {
                setIsAdminVerified(true);
            }
        }

        return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    }, []);

    const handleInstallApp = async () => {
        if (!deferredPrompt) return;
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
            setDeferredPrompt(null);
        }
    };


    // --- OTHER STATES ---
    const [user, setUser] = useState(null);
    const [currentView, setCurrentView] = useState('landing');
    const [selectedVendorId, setSelectedVendorId] = useState(null);
    const [notification, setNotification] = useState(null);
    const [payoutRequests, setPayoutRequests] = useState([
        {
            id: 'payout-001',
            vendorId: 'usr-002',
            vendorName: 'Reggie Photography',
            amount: 5000,
            bankName: 'GCash',
            accountNumber: '09123456789',
            status: 'pending_withdrawal',
            date: 'Dec 26, 2025'
        }
    ]);

    const [verificationRequests, setVerificationRequests] = useState([
        {
            id: 'verify-001',
            businessName: 'Reggie Photography',
            files: {
                dti: 'dti_reggie_2025.pdf',
                permit: 'permit_angeles_2025.pdf',
                id: 'id_reggie_back.jpg'
            },
            paymentInfo: {
                bankName: 'GCash',
                accountNumber: '09123456789'
            },
            status: 'pending_verification',
            date: 'Dec 26, 2025'
        }
    ]);

    // Handle verification request globally
    useEffect(() => {
        window.addVerificationRequest = (data) => {
            setVerificationRequests(prev => [data, ...prev]);
        };
    }, []);

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
        { id: 'usr-001', name: 'Jennie Rose', email: 'jennie@example.com', role: 'client', strikes: 0, isBanned: false, balance: 0 },
        { id: 'usr-002', name: 'Reggie Photography', email: 'reggie@vendor.com', role: 'vendor', strikes: 0, isBanned: false, balance: 150000 },
        { id: 'usr-003', name: 'Juan Dela Cruz', email: 'juan@example.com', role: 'client', strikes: 1, isBanned: false, balance: 0 },
        { id: 'usr-004', name: 'Mabalacat Bridal Cars', email: 'boy@vendor.com', role: 'vendor', strikes: 2, isBanned: false, balance: 75000 },
        { id: 'usr-005', name: 'Scammer Abe', email: 'scam@example.com', role: 'client', strikes: 3, isBanned: true, balance: 0 },
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
    // Persistent Login moved to useEffect at top

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
        setIsAdminVerified(false);
        localStorage.removeItem('photo_user');
        setCurrentView('landing');
    };

    const handleLogin = (credentials) => {
        const { email, password, name } = credentials;

        // 1. HARDCODED CREDENTIALS VERIFICATION
        let authenticatedUser = null;

        if (email === "admin@abevents.ph" && password === "ABE_Master2025!") {
            authenticatedUser = {
                id: 'admin-001',
                name: 'System Admin',
                email: email,
                role: 'ADMIN',
                balance: 0
            };
            setIsAdminVerified(true);
        } else if (email === "reggie@vendor.com" && password === "VendorPass123") {
            authenticatedUser = {
                id: 'usr-002',
                name: 'Reggie Photography',
                email: email,
                role: 'VENDOR',
                balance: 150000
            };
        } else {
            // For other users in the mock database (Demo purposes)
            const foundUser = users.find(u => u.email === email);
            if (foundUser) {
                authenticatedUser = {
                    ...foundUser,
                    role: foundUser.role.toUpperCase()
                };
            } else {
                // Mock Register/Login for new clients
                authenticatedUser = {
                    id: Date.now(),
                    name: name || "New Client",
                    email: email,
                    role: 'CLIENT',
                    balance: 0
                };
            }
        }

        // 2. CHECK IF BANNED
        const isBanned = users.find(u => u.email === email)?.isBanned;
        if (isBanned) {
            alert("Abe, ang account mo ay suspendido dahil sa paglabag sa aming Terms of Service.");
            return;
        }

        // 3. PERSIST & REDIRECT
        if (authenticatedUser) {
            setUser(authenticatedUser);
            localStorage.setItem('photo_user', JSON.stringify(authenticatedUser));

            if (authenticatedUser.role === 'ADMIN') {
                setCurrentView('admin-dashboard');
            } else if (authenticatedUser.role === 'VENDOR') {
                setCurrentView('dashboard'); // Dashboard will handle VENDOR view
            } else {
                setCurrentView('dashboard');
            }
        } else {
            alert("Maling credentials, Abe! Subukan mo ulit.");
        }
    };

    const executePayoutAction = (requestId, action, data) => {
        if (action === 'APPROVE') {
            setPayoutRequests(prev => prev.map(req => 
                req.id === requestId ? { ...req, status: 'withdrawal_completed' } : req
            ));
            
            // Bawasan ang balance ng Vendor sa global state
            setUsers(prev => prev.map(u => 
                u.id === data.vendorId ? { ...u, balance: u.balance - data.amount } : u
            ));

            // I-update din ang current user kung siya ang apektado
            if (user && user.id === data.vendorId) {
                const updatedUser = { ...user, balance: user.balance - data.amount };
                setUser(updatedUser);
                localStorage.setItem('photo_user', JSON.stringify(updatedUser));
            }

            showNotification(`Payout of ₱${data.amount.toLocaleString()} approved for ${data.vendorName}! Ching!`, "success");
        } else if (action === 'DECLINE') {
            setPayoutRequests(prev => prev.map(req => 
                req.id === requestId ? { ...req, status: 'declined' } : req
            ));
            showNotification(`Payout declined for ${data.vendorName}. Funds remain in balance.`, "error");
        }
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
        // RBAC: Protected Routes Logic
        if (currentView === 'admin-dashboard' && user.role !== 'ADMIN') {
            alert('Abe, Restricted Area ito!');
            setCurrentView('dashboard');
        }

        // VENDOR VIEW (Pinagtibay na Logic)
        if (user.role === 'VENDOR') {
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
                        payoutRequests={payoutRequests}
                        onAddPayoutRequest={(req) => setPayoutRequests(prev => [req, ...prev])}
                        showInstallButton={!!deferredPrompt}
                        onInstallApp={handleInstallApp}
                    />
                </>
            );
        }

        // ADMIN VIEW
        if (user.role === 'ADMIN' || currentView === 'admin-dashboard') {
             // Re-verify if trying to access admin dashboard
             if (user.role !== 'ADMIN') {
                 alert('Abe, Restricted Area ito!');
                 setCurrentView('dashboard');
             } else {
                return (
                    <>
                        <Analytics/>
                        {renderNotification()}
                        <div className="min-h-screen bg-white flex flex-col items-center font-sans">
                            <nav className="w-full bg-white border-b border-gray-100 sticky top-0 z-50">
                                <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
                                    <button onClick={handleLogout} className="text-xs font-black uppercase tracking-widest text-red-500">Log Out</button>
                                    <span className="text-xl font-black text-gray-900 uppercase">ABE <span className="text-indigo-600 italic">Admin</span></span>
                                    <div className="w-16"></div>
                                </div>
                            </nav>
                            <AdminDashboard 
                                users={users} 
                                bookings={bookings} 
                                onUpdateStatus={updateBookingStatus}
                                isVerified={isAdminVerified}
                                payoutRequests={payoutRequests}
                                setPayoutRequests={setPayoutRequests}
                                verificationRequests={verificationRequests}
                                setVerificationRequests={setVerificationRequests}
                                showNotification={showNotification}
                                onPayoutAction={executePayoutAction}
                            />
                    </div>
                </>
            );
         }
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
                    showInstallButton={!!deferredPrompt}
                    onInstallApp={handleInstallApp}
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
                             user && user.role === 'ADMIN' ? (
                                <AdminDashboard
                                    users={users}
                                    bookings={bookings}
                                    onUpdateStatus={updateBookingStatus}
                                    isVerified={isAdminVerified}
                                    payoutRequests={payoutRequests}
                                    setPayoutRequests={setPayoutRequests}
                                    verificationRequests={verificationRequests}
                                    setVerificationRequests={setVerificationRequests}
                                    showNotification={showNotification}
                                    onPayoutAction={executePayoutAction}
                                />
                             ) : (
                                <div className="p-20 text-center">
                                    <h2 className="text-2xl font-black text-red-600 uppercase tracking-tighter">Abe, Restricted Area ito!</h2>
                                    <p className="text-gray-500 mt-4">Wala kang sapat na pahintulot para pasukin ang Admin Dashboard.</p>
                                    <button onClick={() => setCurrentView('landing')} className="mt-8 bg-gray-900 text-white px-8 py-3 rounded-2xl font-black uppercase tracking-widest">Balik sa Home</button>
                                </div>
                             )
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
                    <AuthForm initialMode={currentView} onAuthSuccess={handleLogin}/>
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
                    const email = prompt("Enter Admin Email:");
                    const pass = prompt("Enter Admin Password:");
                    if(email === "admin@abevents.ph" && pass === "ABE_Master2025!") {
                        const adminUser = {
                            id: 'admin-001',
                            name: 'System Admin',
                            email: email,
                            role: 'ADMIN'
                        };
                        setUser(adminUser);
                        setIsAdminVerified(true);
                        localStorage.setItem('photo_user', JSON.stringify(adminUser));
                        setCurrentView('admin-dashboard');
                    } else {
                        alert("Maling credentials, Abe! Restricted Area ito.");
                    }
                }}
            />
        </>
    );
}