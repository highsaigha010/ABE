import React, { useState } from 'react';

// DAGDAG: Isinama natin si 'onAdminAccess' sa props list sa ibaba
const LandingPage = ({
                         onLogin,
                         onRegister,
                         onVendorSignup,
                         onFindSuppliers,
                         onPrivacyPolicy,
                         onTermsOfEscrow,
                         onSupport,
                         onAdminAccess // <--- Eto yung nawawala kaya nag-white screen!
                     }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <div className="min-h-screen font-sans text-gray-900">

            {/* --- 1. NAVBAR --- */}
            <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-lg border-b border-gray-100 z-50">
                <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <span className="text-2xl font-black text-gray-900 tracking-tighter uppercase">
                        ABE <span className="text-indigo-600 italic">Events</span>
                        </span>
                    </div>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center gap-8">
                        <button
                            onClick={onVendorSignup}
                            className="text-gray-400 hover:text-indigo-600 font-black text-[10px] uppercase tracking-[0.2em] transition-colors"
                        >
                            Become a Vendor
                        </button>
                        <div className="h-4 w-px bg-gray-100"></div>
                        <button
                            onClick={onLogin}
                            className="text-gray-900 font-black text-[10px] uppercase tracking-[0.2em] hover:text-indigo-600 transition-colors"
                        >
                            Log In
                        </button>
                        <button
                            onClick={onRegister}
                            className="bg-gray-900 hover:bg-indigo-600 text-white px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-gray-200 transition-all transform hover:-translate-y-0.5 active:scale-95"
                        >
                            Sign Up Free
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
                    <div className="md:hidden bg-white border-b border-gray-100 absolute top-20 left-0 w-full p-6 space-y-4 shadow-xl animate-in fade-in slide-in-from-top-4 duration-300">
                        <button
                            onClick={() => { onVendorSignup(); setIsMenuOpen(false); }}
                            className="block w-full text-left text-gray-900 font-black text-xs uppercase tracking-[0.2em] py-3 border-b border-gray-50"
                        >
                            Become a Vendor
                        </button>
                        <button
                            onClick={() => { onLogin(); setIsMenuOpen(false); }}
                            className="block w-full text-left text-gray-900 font-black text-xs uppercase tracking-[0.2em] py-3 border-b border-gray-50"
                        >
                            Log In
                        </button>
                        <button
                            onClick={() => { onRegister(); setIsMenuOpen(false); }}
                            className="w-full bg-gray-900 hover:bg-indigo-600 text-white px-6 py-4 rounded-xl font-black text-xs uppercase tracking-[0.2em] shadow-xl transition-all"
                        >
                            Sign Up Free
                        </button>
                    </div>
                )}
            </nav>

            {/* --- 2. HERO SECTION --- */}
            <div className="pt-32 pb-20 px-6 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-100 via-white to-white relative overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-indigo-50/50 rounded-full blur-3xl -z-10 animate-pulse"></div>
                <div className="max-w-5xl mx-auto text-center relative z-10">
                    <span className="inline-flex items-center gap-2 py-1.5 px-4 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 text-[10px] font-black tracking-[0.2em] mb-8 uppercase">
                        <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                        </span>
                        ABE'S FIRST SECURE EVENT PLATFORM
                    </span>
                    <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tighter mb-8 text-gray-900 leading-[0.9] md:leading-[1.1]">
                        Book trusted suppliers.<br/>
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">Pay with confidence.</span>
                    </h1>

                    <p className="text-lg md:text-xl text-gray-500 mb-12 max-w-2xl mx-auto leading-relaxed font-medium">
                        Experience the gold standard in event planning. Our <strong>Smart Escrow™</strong> technology ensures your peace of mind from booking to the final delivery.
                    </p>

                    <div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-6">
                        <button
                            onClick={onFindSuppliers}
                            className="bg-gray-900 text-white text-xs sm:text-sm uppercase tracking-widest font-black px-6 sm:px-10 py-4 sm:py-5 rounded-2xl shadow-2xl hover:bg-indigo-600 transition-all transform hover:-translate-y-1 active:scale-95"
                        >
                            Explore Marketplace
                        </button>
                        <button
                            onClick={onVendorSignup}
                            className="bg-white text-gray-900 border-2 border-gray-100 text-xs sm:text-sm uppercase tracking-widest font-black px-6 sm:px-10 py-4 sm:py-5 rounded-2xl hover:border-indigo-100 hover:bg-indigo-50 transition-all transform hover:-translate-y-1 active:scale-95"
                        >
                            Join as a Supplier
                        </button>
                    </div>

                    {/* --- PARTNER LOGOS SECTION --- */}
                    <div className="mt-16 pt-12 border-t border-gray-100 flex flex-wrap items-center justify-center gap-6 sm:gap-10 md:gap-16 opacity-95">
                        <img
                            src="https://www.xendit.co/wp-content/uploads/2020/03/XENDIT-LOGOArtboard-1@2x-1024x441.png"
                            alt="Xendit"
                            className="h-8 md:h-10 w-auto object-contain"
                        />
                        <img
                            src="https://upload.wikimedia.org/wikipedia/commons/5/52/GCash_logo.svg"
                            alt="GCash"
                            className="h-6 md:h-7 w-auto object-contain"
                        />
                        <img
                            src="https://business.inquirer.net/wp-content/blogs.dir/5/files/2020/11/PayMaya-Logo_Vertical.png"
                            alt="Maya"
                            className="h-10 md:h-12 w-auto object-contain"
                        />
                        <img
                            src="https://upload.wikimedia.org/wikipedia/commons/9/93/Amazon_Web_Services_Logo.svg"
                            alt="AWS"
                            className="h-7 md:h-10 w-auto object-contain"
                        />
                    </div>
                </div>

                <div className="mt-20 max-w-6xl mx-auto relative group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-[1.5rem] sm:rounded-[2.5rem] blur opacity-20 group-hover:opacity-30 transition duration-1000 group-hover:duration-200"></div>
                    <div className="relative w-full h-[300px] sm:h-[450px] md:h-[650px] rounded-[1.5rem] sm:rounded-[2rem] overflow-hidden shadow-2xl border-4 sm:border-8 border-white bg-gray-100">
                        <img
                            src="/landing_page_image/Events2.png"
                            alt="Beautiful Wedding in ABE"
                            className="absolute inset-0 w-full h-full object-cover"
                        />
                        <div className="absolute top-4 right-4 sm:top-8 sm:right-8 z-20">
                            <div className="bg-white/10 backdrop-blur-md border border-white/20 px-4 py-2 sm:px-6 sm:py-3 rounded-xl sm:rounded-2xl shadow-2xl transform rotate-3">
                                <p className="text-white text-sm sm:text-lg md:text-xl font-black tracking-widest italic text-right drop-shadow-2xl">
                                    "Selebrasyun a masaya,<br/>
                                    king scam malaut ya."
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- 3. HOW IT WORKS --- */}
            <div className="py-24 bg-gray-950 relative overflow-hidden">
                <div className="max-w-6xl mx-auto px-6 relative z-10">
                    <div className="flex flex-col items-center mb-20">
                        <div className="w-full max-w-4xl mb-12 relative group">
                            <img
                                src="/Company%20image/abe%20events%20&%20smart%20escrow.png"
                                alt="Smart Escrow Technology"
                                className="relative w-full h-auto object-contain rounded-[3rem]"
                            />
                        </div>
                        <div className="text-center">
                            <h2 className="text-4xl md:text-5xl font-black text-white mb-6 tracking-tighter">
                                How <span className="text-amber-400 italic">Smart Escrow™</span> Protects You
                            </h2>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
                        <div className="bg-white/5 p-10 rounded-[2.5rem] border border-white/10">
                            <h3 className="text-xl font-black text-white mb-4">1. Book & Secure</h3>
                            <p className="text-gray-400 text-sm italic">Locked in our secure vault via GCash/Card.</p>
                        </div>
                        <div className="bg-white/5 p-10 rounded-[2.5rem] border border-white/10">
                            <h3 className="text-xl font-black text-white mb-4">2. Vendor Delivers</h3>
                            <p className="text-gray-400 text-sm italic">Vendors work with 100% confidence.</p>
                        </div>
                        <div className="bg-amber-500 p-10 rounded-[2.5rem] shadow-2xl">
                            <h3 className="text-xl font-black text-white mb-4">3. You Release</h3>
                            <p className="text-amber-50 text-sm font-bold italic">Money is instantly transferred upon approval.</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- 4. CATEGORIES PREVIEW --- */}
            <div className="py-20 bg-gray-50 border-t border-gray-200">
                <div className="max-w-6xl mx-auto px-6">
                    <div className="flex justify-between items-end mb-12">
                        <div>
                            <h2 className="text-3xl font-bold text-gray-900">Browse Top Categories</h2>
                        </div>
                        <button onClick={onFindSuppliers} className="text-indigo-600 font-bold hidden md:block italic underline">View All Categories &rarr;</button>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                            { id: 'photography', name: "Photography", count: "120+ Vendors", img: "/landing_page_image/Events1.png" },
                            { id: 'makeup', name: "Hair & Makeup", count: "85+ Vendors", img: "https://images.unsplash.com/photo-1522335789183-b1120770768a?auto=format&fit=crop&w=400&q=80" },
                            { id: 'venues', name: "Venues", count: "40+ Locations", img: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=400&q=80" },
                            { id: 'djs', name: "Hosts & DJ", count: "60+ Artists", img: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=400&q=80" },
                        ].map((cat, i) => (
                            <div key={i} onClick={onFindSuppliers} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden group cursor-pointer">
                                <div className="w-full h-40 overflow-hidden relative">
                                    <img src={cat.img} alt={cat.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                </div>
                                <div className="p-6">
                                    <h4 className="font-bold text-gray-900">{cat.name}</h4>
                                    <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">{cat.count}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* --- 5. BETA BANNER --- */}
            <div className="bg-indigo-900 py-16 px-6 text-center text-white">
                <div className="max-w-3xl mx-auto">
                    <h2 className="text-3xl font-bold mb-4 italic">Limited Slots for Beta Testing</h2>
                    <div className="w-full bg-indigo-800 rounded-full h-4 mb-4 border border-indigo-700">
                        <div className="bg-green-400 h-full rounded-full shadow-lg" style={{ width: '60%' }}></div>
                    </div>
                    <div className="flex justify-between text-xs font-bold text-indigo-300 uppercase italic">
                        <span>9 Slots Registered</span>
                        <span>6 Slots Left</span>
                    </div>
                    <button onClick={onVendorSignup} className="mt-10 bg-white text-indigo-900 font-black px-10 py-4 rounded-full hover:shadow-2xl transition-all active:scale-95">RESERVE MY VENDOR SLOT</button>
                </div>
            </div>

            {/* --- 6. FOOTER --- */}
            <footer className="bg-white border-t border-gray-200 py-12">
                <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6 text-center md:text-left">
                    <div>
                        <span className="text-xl font-black text-indigo-900 uppercase">ABE <span className="italic text-indigo-600">Events</span></span>
                        <p className="text-gray-400 text-[10px] font-bold mt-2 uppercase tracking-widest italic">Gawang Kapampangan.</p>
                    </div>
                    <div className="flex gap-6 text-gray-400 text-[10px] font-black uppercase tracking-widest">
                        <button onClick={onPrivacyPolicy} className="hover:text-indigo-600 transition-colors">Privacy Policy</button>
                        <button onClick={onTermsOfEscrow} className="hover:text-indigo-600 transition-colors">Terms of Escrow</button>
                        <button onClick={onSupport} className="hover:text-indigo-600 transition-colors">Support</button>
                        {/* SECRET ADMIN BUTTON */}
                        <button onClick={onAdminAccess} className="opacity-0 hover:opacity-100 text-gray-200 transition-opacity">Admin</button>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;