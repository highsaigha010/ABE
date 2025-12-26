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
import ChatWindow from "./components/ChatWindow";
import AgentDashboard from "./components/AgentDashboard";
import ClientSharedView from "./components/ClientSharedView";
import {Analytics} from '@vercel/analytics/react';
import sampleVendors from './data/sample_vendors.json';

export default function App() {
    // --- 1. SECURITY & ACCESS STATES ---
    const [user, setUser] = useState(null);
    const [hasAccess, setHasAccess] = useState(true); // Bypass for demo
    const [accessCode, setAccessCode] = useState('');
    const CORRECT_CODE = "ABE2025";
    
    // Admin Credentials for RBAC
    const adminCredentials = {
        email: "admin@abe.events",
        password: "ADMIN_PASSWORD_2025" // In a real app, this should be handled via backend
    };
    const [isAdminVerified, setIsAdminVerified] = useState(false);
    const [deferredPrompt, setDeferredPrompt] = useState(null);
    const [initialCategory, setInitialCategory] = useState(null);
    const [activeChatBookingId, setActiveChatBookingId] = useState(null);
    const [currentView, setCurrentView] = useState(() => {
        try {
            const path = window.location.pathname;
            if (path.startsWith('/shared/') || path.startsWith('/view-project/')) return 'shared-project';
            return 'landing';
        } catch (e) {
            return 'landing';
        }
    });
    const [selectedVendorId, setSelectedVendorId] = useState(null);
    const [notification, setNotification] = useState(null);

    // --- 1. THE SHARED DATABASE (Mock Data) ---
    const defaultData = {
        eventDate: '',
        totalBudget: 0,
        matchmakerData: null,
        users: [
            ...sampleVendors,
            { id: 'usr-001', name: 'Jennie Rose', email: 'jennie@example.com', role: 'client', strikes: 0, isBanned: false, balance: 0, city: 'Angeles' },
            { id: 'usr-002', name: 'Reggie Photography', email: 'reggie@vendor.com', role: 'vendor', strikes: 0, isBanned: false, balance: 150000, city: 'Angeles', category: 'Photographers', startingPrice: 20000, rating: 5, icon: "📸" },
            { id: 'usr-003', name: 'Juan Dela Cruz', email: 'juan@example.com', role: 'client', strikes: 1, isBanned: false, balance: 0, city: 'San Fernando' },
            { id: 'usr-004', name: 'Mabalacat Bridal Cars', email: 'boy@vendor.com', role: 'vendor', strikes: 2, isBanned: false, balance: 75000, city: 'Mabalacat', category: 'Transport', startingPrice: 10000, rating: 4, icon: "🚗" },
            { id: 'usr-005', name: 'Scammer Abe', email: 'scam@example.com', role: 'client', strikes: 3, isBanned: true, balance: 0, city: 'Clark' },
            { id: 'usr-006', name: 'Clark Convention Center', email: 'clark@vendor.com', role: 'vendor', strikes: 0, isBanned: false, balance: 500000, city: 'Clark', category: 'Venues', startingPrice: 100000, rating: 5, icon: "🏰" },
            { id: 'usr-007', name: 'Kapampangan Catering', email: 'food@vendor.com', role: 'vendor', strikes: 0, isBanned: false, balance: 20000, city: 'San Fernando', category: 'Catering', startingPrice: 15000, rating: 5, icon: "🍽️" },
        ],
        bookings: [
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
            },
            {
                id: 'txn-006',
                clientName: 'Agent Managed Client',
                vendorName: 'Reggie Photography',
                date: 'Jan 05, 2026',
                package: 'Agent Special',
                price: 100000,
                status: 'paid',
                city: 'Angeles',
                referralCode: 'usr-001' // Managed by Jennie Rose (if she upgrades)
            }
        ],
        payoutRequests: [
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
        ],
        verificationRequests: [
            {
                id: 'verify-001',
                businessName: 'Reggie Photography',
                files: {
                    dti: 'dti_reggie_2025.pdf',
                    permit: 'permit_angeles_2025.pdf',
                    id: 'id_reggie_back.jpg'
                },
                status: 'pending_verification',
                date: 'Dec 26, 2025'
            }
        ],
        projects: [
            {
                id: 'proj-001',
                name: "Maria Clara's Debut",
                clientName: 'Maria Clara',
                totalClientBudget: 500000,
                totalSupplierCost: 400000, // Split from client budget
                targetDate: '2025-12-30',
                serviceSlots: [
                    { id: 'slot-1', category: 'PHOTOGRAPHY', vendorName: 'Reggie Photography', budget: 50000, vendorInclusions: 'Unlimited shots, 100 edited', basePrice: 20000 },
                    { id: 'slot-2', category: 'VENUE', vendorName: 'Clark Convention Center', budget: 200000, vendorInclusions: 'Grand Ballroom', basePrice: 100000 }
                ],
                approvalStatus: 'PENDING',
                agentId: 'admin-001'
            }
        ],
        messages: [
            {
                id: 'msg-001',
                bookingId: 'txn-001',
                senderId: 'usr-002', // Reggie
                senderRole: 'VENDOR',
                text: "Hello Abe! Ready na ako para sa event mo sa Dec 25. Gusto mo na bang i-send ko ang contract quote?",
                timestamp: new Date().toLocaleTimeString(),
                isRead: true,
                type: 'text'
            }
        ]
    };

    const initialData = defaultData;

    const [eventDate, setEventDate] = useState(initialData.eventDate);
    const [totalBudget, setTotalBudget] = useState(initialData.totalBudget);
    const [matchmakerData, setMatchmakerData] = useState(initialData.matchmakerData);
    const [users, setUsers] = useState(initialData.users);
    const [bookings, setBookings] = useState(initialData.bookings);
    const [payoutRequests, setPayoutRequests] = useState(initialData.payoutRequests);
    const [verificationRequests, setVerificationRequests] = useState(initialData.verificationRequests);
    const [messages, setMessages] = useState(initialData.messages);
    const [projects, setProjects] = useState(initialData.projects);

    // 2. I-check kung naka-login na sa Access Gate o User session dati
    useEffect(() => {
        const handleBeforeInstallPrompt = (e) => {
            e.preventDefault();
            setDeferredPrompt(e);
        };
        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

        // Check if we are on a shared link
        const path = window.location.pathname;
        if (path.startsWith('/shared/') || path.startsWith('/view-project/')) {
            const parts = path.split('/');
            const hash = parts[parts.length - 1];
            if (hash) {
                setSelectedProjectId(hash);
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


    const [selectedProjectId, setSelectedProjectId] = useState(() => {
        try {
            const path = window.location.pathname;
            if (path.startsWith('/shared/') || path.startsWith('/view-project/')) {
                const parts = path.split('/');
                const lastPart = parts[parts.length - 1];
                return lastPart ? decodeURIComponent(lastPart) : null;
            }
        } catch (e) {
            console.error("Error initializing selectedProjectId:", e);
        }
        return null;
    });

    const handleProjectAction = (projectId, action, feedback) => {
        setProjects(prev => prev.map(p => {
            if (p.id === projectId) {
                if (action === 'APPROVED') {
                    showNotification(`Project ${p.name} Approved! Securing contracts...`, 'success');
                    return { ...p, approvalStatus: 'APPROVED' };
                }
                if (action === 'FEEDBACK') {
                    showNotification(`Feedback sent to Agent for ${p.name}`, 'info');
                    return { ...p, approvalStatus: 'CHANGES_REQUESTED', feedback };
                }
                if (action === 'REFUND_SURPLUS') {
                    showNotification(`Refund request for ${p.name} submitted!`, 'success');
                    return { ...p, refundStatus: 'PENDING_REFUND' };
                }
            }
            return p;
        }));
    };

    // --- MESSAGING SYSTEM STATE ---
    const playPopSound = () => {
        const audio = new Audio('https://codeskulptor-demos.commondatastorage.googleapis.com/descent/bomb.mp3'); // Mock pop sound
        audio.play().catch(e => console.log("Audio play failed:", e));
    };

    const playPingSound = () => {
        const audio = new Audio('https://codeskulptor-demos.commondatastorage.googleapis.com/descent/CrumbleSound.mp3'); // Mock ping sound
        audio.play().catch(e => console.log("Audio play failed:", e));
    };

    // Calculate Unread Messages and Latest Conversations
    const getUnreadCount = () => messages.filter(m => !m.isRead && m.senderId !== user?.id && m.senderId !== 'SYSTEM').length;
    const unreadCount = getUnreadCount();
    
    useEffect(() => {
        if (unreadCount > 0) {
            playPingSound();
        }
    }, [unreadCount]);

    const getLatestConversations = () => {
        const conversationMap = {};
        
        // Sort messages by timestamp descending
        const sortedMessages = [...messages].reverse();
        
        sortedMessages.forEach(msg => {
            if (!conversationMap[msg.bookingId]) {
                const booking = (bookings || []).find(b => b && b.id === msg.bookingId);
                if (booking) {
                    conversationMap[msg.bookingId] = {
                        bookingId: msg.bookingId,
                        lastMessage: msg,
                        senderName: user?.role === 'VENDOR' ? booking.clientName : (booking.vendorName || 'Vendor'),
                    };
                }
            }
        });
        
        return Object.values(conversationMap).slice(0, 5); // Latest 5
    };

    const latestConversations = getLatestConversations();

    const sendMessage = (bookingId, senderId, text, type = 'text', contractData = null) => {
        const RESTRICTED_KEYWORDS = ['labas', 'personal account', 'direct payment', 'gcash','outside','transfer', 'paymaya', 'number', 'contact', 'whatsapp', 'viber', 'telegram', 'messenger', 'fb', 'facebook'];
        const PHONE_REGEX = /(\+?\d{1,4}[-.\s]?)?(\(?\d{3}\)?[-.\s]?)?\d{3}[-.\s]?\d{4}/g;
        
        const lowerText = text.toLowerCase();
        const hasKeyword = RESTRICTED_KEYWORDS.some(word => lowerText.includes(word));
        const hasPhone = PHONE_REGEX.test(lowerText);
        const isFlagged = hasKeyword || hasPhone;

        const newMessage = {
            id: `msg-${Date.now()}`,
            bookingId,
            senderId,
            senderRole: user?.role || 'CLIENT', // Database-like structure
            text,
            type,
            contractData,
            timestamp: new Date().toLocaleTimeString(),
            isRead: false,
            isFlagged: isFlagged
        };
        setMessages(prev => [...prev, newMessage]);
        
        if (isFlagged) {
            console.warn(`ABE SECURITY ALERT: Message flagged in booking ${bookingId}`);
            // Dito pwede nating dagdagan ng Admin Notification logic sa future
        }

        if (senderId !== user?.id && senderId !== 'SYSTEM') {
            playPopSound();
        }
    };

    const handleAcceptContract = (bookingId, price) => {
        updateBookingStatus(bookingId, 'PAY');
        showNotification(`Contract Accepted! ₱${parseFloat(price).toLocaleString()} secured in Smart Escrow. Ching!`, "success");
        // Awtomatikong isara ang chat pagkatapos ng success payment (opsyonal, pero para sa UX)
        // setActiveChatBookingId(null); 
    };

    const handleUpgradeToAgent = () => {
        if (!user) return;
        const updatedUser = { ...user, role: 'AGENT' };
        setUser(updatedUser);
        setUsers(prev => prev.map(u => u.id === user.id ? updatedUser : u));
        // localStorage.setItem('photo_user', JSON.stringify(updatedUser));
        showNotification("Welcome to the Agent Program, Abe! Your dashboard has been upgraded.", "success");
    };

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
                                
                                // AGENT COMMISSION LOGIC (Zero-Kickback: Fixed 1% of Supplier Cost)
                                if (b.referralCode) {
                                    // Commission is strictly 1% of the supplier price, NOT the surplus
                                    const commission = (b.price || 0) * 0.01;
                                    setUsers(prevUsers => prevUsers.map(u => {
                                        if (u.id === b.referralCode) {
                                            return { 
                                                ...u, 
                                                commissionBalance: (u.commissionBalance || 0) + commission 
                                            };
                                        }
                                        return u;
                                    }));
                                    console.log(`💸 Zero-Kickback Commission: ₱${commission} credited to Agent ${b.referralCode}`);
                                }

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
        } else {
            alert("Maling code, Abe! Kontakin mo muna kami para sa access.");
        }
    };

    const handleLogout = () => {
        setUser(null);
        setIsAdminVerified(false);
        // localStorage.removeItem('photo_user');
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
                const foundUser = (users || []).find(u => u && u.email === email);
                if (foundUser) {
                    authenticatedUser = {
                        ...foundUser,
                        role: (foundUser.role || 'CLIENT').toUpperCase()
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
            const isBanned = (users || []).find(u => u && u.email === email)?.isBanned;
        if (isBanned) {
            alert("Abe, ang account mo ay suspendido dahil sa paglabag sa aming Terms of Service.");
            return;
        }

        // 3. PERSIST & REDIRECT
        if (authenticatedUser) {
            setUser(authenticatedUser);
            // localStorage.setItem('photo_user', JSON.stringify(authenticatedUser));

            // Abe, kung nasa shared project link tayo, wag nang mag-redirect sa dashboard
            if (currentView === 'shared-project') {
                showNotification(`Welcome back, ${authenticatedUser.name}! Opening shared project...`, 'success');
                return;
            }

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
                // localStorage.setItem('photo_user', JSON.stringify(updatedUser));
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
    const isClientView = window.location.pathname.includes('/view-project/') || window.location.pathname.startsWith('/shared/');

    // Initial check for shared project link on mount (para sa logic consistency)
    useEffect(() => {
        try {
            const path = window.location.pathname;
            if (path.startsWith('/shared/') || path.startsWith('/view-project/')) {
                const parts = path.split('/');
                const hash = parts[parts.length - 1];
                if (hash && hash !== selectedProjectId) {
                    setSelectedProjectId(decodeURIComponent(hash));
                }
            }
        } catch (e) {
            console.error("Error in shared project effect:", e);
        }
    }, [selectedProjectId]);

    if (isClientView) {
        return (
            <>
                <Analytics />
                {renderNotification()}
                {user ? (
                    <ClientSharedView
                        projectId={selectedProjectId}
                        agentProjects={projects || []}
                        bookings={bookings || []}
                        onAction={handleProjectAction}
                    />
                ) : (
                    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-20 px-6 font-sans">
                        <div className="max-w-md w-full">
                            <div className="text-center mb-8">
                                <div className="w-20 h-20 bg-indigo-600 rounded-full flex items-center justify-center text-3xl mx-auto mb-6 shadow-xl shadow-indigo-100">🔒</div>
                                <h2 className="text-3xl font-black text-gray-900 uppercase tracking-tighter italic">Login Required</h2>
                                <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mt-3 leading-relaxed">
                                    Abe, kailangan mong mag-login para ma-access ang <br /> Client Exclusive Portal ni Maria.
                                </p>
                            </div>
                            <div className="bg-white p-2 rounded-[2.5rem] shadow-2xl shadow-indigo-100/50">
                                <AuthForm initialMode="login" onAuthSuccess={handleLogin} />
                            </div>
                            <p className="text-center mt-8 text-[8px] font-black text-gray-300 uppercase tracking-[0.4em]">Secured by ABE Events Escrow</p>
                        </div>
                    </div>
                )}
            </>
        );
    }

    const renderNotification = () => {
        if (!notification) return null;
        return (
            <NotificationToast 
                notification={notification} 
                onClose={() => setNotification(null)} 
            />
        );
    };

    const renderChat = () => {
        // Ang Dashboard ay may sarili nang internal ChatWindow logic para sa Client
        // Pero para sa Vendor view, gagamit pa rin tayo ng global renderChat
        if (user?.role === 'CLIENT' && currentView === 'dashboard') return null;

        if (!activeChatBookingId || !user) return null;
        const booking = bookings.find(b => b.id === activeChatBookingId);
        if (!booking) return null;

        return (
            <ChatWindow 
                booking={booking}
                currentUser={user}
                messages={messages}
                onSendMessage={sendMessage}
                onAcceptContract={handleAcceptContract}
                onClose={() => setActiveChatBookingId(null)}
                className="z-50"
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
                    {renderChat()}
                        <VendorDashboard
                            user={user}
                            onLogout={handleLogout}
                            bookings={bookings || []}
                            onUpdateStatus={updateBookingStatus}
                            showNotification={showNotification}
                            payoutRequests={payoutRequests}
                            onAddPayoutRequest={(req) => setPayoutRequests(prev => [req, ...prev])}
                            showInstallButton={!!deferredPrompt}
                            onInstallApp={handleInstallApp}
                            onOpenChat={(id) => setActiveChatBookingId(id)}
                            unreadCount={unreadCount}
                            latestConversations={latestConversations}
                            messages={messages}
                        />
                    </>
                );
            }

        // AGENT VIEW
        if (user.role === 'AGENT') {
            return (
                <>
                    <Analytics/>
                    {renderNotification()}
                    <AgentDashboard 
                        user={user}
                        bookings={bookings || []}
                        users={users || []}
                        projects={projects}
                        setProjects={setProjects}
                        onLogout={handleLogout}
                        showNotification={showNotification}
                        onFindSuppliers={(cat) => {
                            setInitialCategory(cat);
                            setCurrentView('vendor-search');
                        }}
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
                                    users={users || []} 
                                    bookings={bookings || []} 
                                    projects={projects}
                                    onUpdateStatus={updateBookingStatus}
                                    isVerified={isAdminVerified}
                                    payoutRequests={payoutRequests}
                                    setPayoutRequests={setPayoutRequests}
                                    verificationRequests={verificationRequests}
                                    setVerificationRequests={setVerificationRequests}
                                    showNotification={showNotification}
                                    onPayoutAction={executePayoutAction}
                                    messages={messages}
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
                            bookingData={bookings?.find(b => b.id === (activeChatBookingId || (bookings && bookings[0]?.id))) || (bookings && bookings[0])}
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
                            users={users || []}
                            bookings={bookings || []}
                            projects={projects}
                            user={user}
                            showNotification={showNotification}
                            onViewProfile={(id) => {
                                setSelectedVendorId(id);
                                setCurrentView('vendor-profile');
                            }}
                            onBack={() => {
                                setCurrentView('dashboard');
                                setInitialCategory(null);
                            }}
                            initialCategory={initialCategory}
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
                        bookings={bookings || []}
                        users={users || []}
                        onLogout={handleLogout}
                        onFindSuppliers={() => setCurrentView('vendor-search')}
                        onViewBooking={() => setCurrentView('vendor-profile')}
                        showInstallButton={!!deferredPrompt}
                        onInstallApp={handleInstallApp}
                        onOpenChat={(id) => setActiveChatBookingId(id)}
                        messages={messages}
                        sendMessage={sendMessage}
                        handleAcceptContract={handleAcceptContract}
                        unreadCount={unreadCount}
                        latestConversations={latestConversations}
                        eventDate={eventDate}
                        setEventDate={setEventDate}
                        totalBudget={totalBudget}
                        setTotalBudget={setTotalBudget}
                        matchmakerData={matchmakerData}
                        setMatchmakerData={setMatchmakerData}
                        showNotification={showNotification}
                        onUpgradeToAgent={handleUpgradeToAgent}
                    />
                </>
            );
        }

    // --- 4. PUBLIC / GUEST / ADMIN VIEWS ---
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
                                    users={users || []}
                                    bookings={bookings || []}
                                    projects={projects}
                                    onUpdateStatus={updateBookingStatus}
                                    isVerified={isAdminVerified}
                                    payoutRequests={payoutRequests}
                                    setPayoutRequests={setPayoutRequests}
                                    verificationRequests={verificationRequests}
                                    setVerificationRequests={setVerificationRequests}
                                    showNotification={showNotification}
                                    onPayoutAction={executePayoutAction}
                                    messages={messages}
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
                                users={users || []} 
                                user={user}
                                bookings={bookings || []}
                                projects={projects}
                                showNotification={showNotification}
                                onBack={() => {
                                    setCurrentView('landing');
                                    setInitialCategory(null);
                                }}
                                onViewProfile={() => setCurrentView('vendor-profile')}
                                initialCategory={initialCategory}
                            />
                        )}
                        {currentView === 'vendor-profile' && (
                        <BookingPage
                                user={user}
                                bookingData={bookings?.find(b => b.id === (activeChatBookingId || (bookings && bookings[0]?.id))) || (bookings && bookings[0])}
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
                        // localStorage.setItem('photo_user', JSON.stringify(adminUser));
                        setCurrentView('admin-dashboard');
                    } else {
                        alert("Maling credentials, Abe! Restricted Area ito.");
                    }
                }}
            />
        </>
    );
}