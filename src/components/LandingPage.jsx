import React, { useState } from 'react';

const LandingPage = ({ onLogin, onRegister, onVendorSignup, onFindSuppliers, onPrivacyPolicy, onTermsOfEscrow, onSupport }) => {
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

                    {/* --- PARTNER LOGOS SECTION (BALANCED & FULL COLOR) --- */}
                    <div className="mt-16 pt-12 border-t border-gray-100 flex flex-wrap items-center justify-center gap-6 sm:gap-10 md:gap-16 opacity-95 transition-opacity">

                        {/* XENDIT - md:h-10 (Sapat na laki para mabasa) */}
                        <img
                            src="https://www.xendit.co/wp-content/uploads/2020/03/XENDIT-LOGOArtboard-1@2x-1024x441.png"
                            alt="Xendit"
                            className="h-8 md:h-10 w-auto object-contain"
                        />

                        {/* GCASH - Binabaan sa md:h-7 para pumantay ang visual weight */}
                        <img
                            src="https://upload.wikimedia.org/wikipedia/commons/5/52/GCash_logo.svg"
                            alt="GCash"
                            className="h-6 md:h-7 w-auto object-contain"
                        />

                        {/* MAYA - md:h-12 (Dahil pabilog, kailangan mas mataas ang height para magmukhang pantay) */}
                        <img
                            src="https://business.inquirer.net/wp-content/blogs.dir/5/files/2020/11/PayMaya-Logo_Vertical.png"
                            alt="Maya"
                            className="h-10 md:h-12 w-auto object-contain"
                            title="Accepted via Maya"
                            onError={(e) => { e.target.src = "https://www.maya.ph/hubfs/Maya-logo-02.png" }}
                        />

                        {/* AWS - Binabaan sa md:h-10 para hindi masyadong malaki ang "smile" logo */}
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
                        {/* Floating Text Overlay */}
                        <div className="absolute top-4 right-4 sm:top-8 sm:right-8 z-20">
                            <div className="bg-white/10 backdrop-blur-md border border-white/20 px-4 py-2 sm:px-6 sm:py-3 rounded-xl sm:rounded-2xl shadow-2xl transform rotate-3 hover:rotate-0 transition-transform duration-500">
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
                {/* Background Decor */}
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-[120px] -z-0"></div>
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-[120px] -z-0"></div>

                <div className="max-w-6xl mx-auto px-6 relative z-10">
            <div className="flex flex-col items-center mb-20">
                <div className="w-full max-w-4xl mb-12">
                    <div className="relative group">
                        <div className="absolute -inset-4 bg-amber-500/20 rounded-[3rem] blur-2xl group-hover:bg-amber-500/30 transition duration-1000"></div>
                        <img
                            src="/Company%20image/abe%20events%20&%20smart%20escrow.png"
                            alt="Smart Escrow Technology"
                            className="relative w-full h-auto object-contain drop-shadow-[0_20px_50px_rgba(245,158,11,0.3)] transition-transform duration-700 group-hover:scale-105 rounded-[3rem]"
                        />
                        {/* Vignetting Overlay */}
                        <div className="absolute inset-0 pointer-events-none rounded-[3rem] shadow-[inset_0_0_100px_rgba(0,0,0,0.8)] z-10"></div>
                    </div>
                </div>

                <div className="text-center">
                    <h3 className="text-amber-500 font-black text-[10px] tracking-[0.4em] uppercase mb-4">The Gold Standard</h3>
                    <h2 className="text-4xl md:text-5xl font-black text-white mb-6 tracking-tighter leading-tight">
                        How <span className="text-amber-400 italic">Smart Escrow™</span><br/> Protects You
                    </h2>
                    <p className="text-gray-400 text-lg leading-relaxed max-w-2xl mx-auto">
                        We've eliminated the fear of scams. Our proprietary escrow technology acts as a neutral vault, ensuring your money is only released when the job is perfectly done.
                    </p>
                </div>
            </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="bg-white/5 backdrop-blur-sm p-10 rounded-[2.5rem] border border-white/10 relative group hover:border-amber-500/30 transition-all">
                            <h3 className="text-xl font-black text-white mb-4 tracking-tight">1. Book & Secure</h3>
                            <p className="text-gray-400 text-sm leading-relaxed">
                                Choose your vendor and pay via GCash or Card. Your money is <span className="text-amber-400 font-bold">locked</span> in our secure gold vault.
                            </p>
                        </div>

                        <div className="bg-white/5 backdrop-blur-sm p-10 rounded-[2.5rem] border border-white/10 relative group hover:border-amber-500/30 transition-all">
                            <h3 className="text-xl font-black text-white mb-4 tracking-tight">2. Vendor Delivers</h3>
                            <p className="text-gray-400 text-sm leading-relaxed">
                                The vendor sees the funds are secured, so they start working with <span className="text-amber-400 font-bold">100% confidence</span>.
                            </p>
                        </div>

                        <div className="bg-gradient-to-br from-amber-500 to-amber-600 p-10 rounded-[2.5rem] shadow-2xl shadow-amber-500/20 relative group overflow-hidden">
                            <h3 className="text-xl font-black text-white mb-4 tracking-tight relative z-10">3. You Release</h3>
                            <p className="text-amber-50 text-sm leading-relaxed relative z-10">
                                Job done? You click <span className="font-black underline">"Release Funds"</span>. The money is instantly transferred to the vendor.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- NEW SECTION: VERIFICATION SHIELD (Strict Vetting) --- */}
            <div className="py-12 sm:py-20 bg-indigo-900 text-white overflow-hidden relative">
                <div className="max-w-6xl mx-auto px-6 relative z-10">
                    <div className="flex justify-center">
                        <div className="w-full max-w-4xl relative group">
                            <div className="absolute -inset-4 bg-indigo-500/20 rounded-[3rem] blur-2xl group-hover:bg-indigo-500/30 transition duration-1000"></div>
                            <img
                                src="/Zero%20Tolerance%20for%20Scams/Zero%20Tolerance%20for%20Scams.png"
                                alt="Zero Tolerance for Scams"
                                className="relative w-full h-auto object-contain drop-shadow-2xl rounded-[3rem] transition-transform duration-700 group-hover:scale-[1.02]"
                            />
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
                            <p className="text-gray-500 mt-2">Curated professionals for your big day.</p>
                        </div>
                        <button onClick={onFindSuppliers} className="text-indigo-600 font-bold hover:underline hidden md:block">View All Categories &rarr;</button>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                            { id: 'photography', name: "Photography", count: "120+ Vendors", img: "/landing_page_image/Events1.png" },
                            { id: 'makeup', name: "Hair & Makeup", count: "85+ Vendors", img: "https://images.unsplash.com/photo-1522335789183-b1120770768a?auto=format&fit=crop&w=400&q=80" },
                            { id: 'venues', name: "Venues", count: "40+ Locations", img: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=400&q=80" },
                            { id: 'djs', name: "Hosts & DJ", count: "60+ Artists", img: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=400&q=80" },
                        ].map((cat, i) => (
                            <div key={i} onClick={onFindSuppliers} className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer border border-gray-100 overflow-hidden group">
                                <div className="w-full h-40 bg-gray-200 overflow-hidden relative">
                                    <img
                                        src={cat.img}
                                        alt={cat.name}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                    />
                                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors"></div>
                                </div>
                                <div className="p-6">
                                    <h4 className="font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">{cat.name}</h4>
                                    <p className="text-xs text-gray-400 font-medium">{cat.count}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>


            {/* --- NEW: LIVE ACTIVITY FEED --- */}
            <div className="py-12 bg-white border-t border-gray-100 overflow-hidden">
                <div className="max-w-6xl mx-auto px-6">
                    <div className="flex items-center gap-3 mb-8">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
            </span>
                        <h3 className="font-bold text-gray-500 uppercase tracking-widest text-xs">Live Platform Activity</h3>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6">
                        {/* Activity 1 */}
                        <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-2xl animate-pulse">
                            <div className="text-2xl">📸</div>
                            <div>
                                <p className="text-sm font-bold text-gray-800">New Booking Secured</p>
                                <p className="text-xs text-gray-400">Wedding Shoot • ₱50,000 locked</p>
                            </div>
                            <span className="ml-auto text-[10px] text-gray-300 font-bold uppercase">2m ago</span>
                        </div>

                        {/* Activity 2 */}
                        <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-2xl">
                            <div className="text-2xl">💸</div>
                            <div>
                                <p className="text-sm font-bold text-gray-800">Payout Released</p>
                                <p className="text-xs text-gray-400">To Photographer via GCash</p>
                            </div>
                            <span className="ml-auto text-[10px] text-gray-300 font-bold uppercase">15m ago</span>
                        </div>

                        {/* Activity 3 */}
                        <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-2xl">
                            <div className="text-2xl">🛡️</div>
                            <div>
                                <p className="text-sm font-bold text-gray-800">Vendor Verified</p>
                                <p className="text-xs text-gray-400">Hair & Makeup Artist joined</p>
                            </div>
                            <span className="ml-auto text-[10px] text-gray-300 font-bold uppercase">1h ago</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- NEW: BETA COUNTDOWN BANNER --- */}
            <div className="bg-indigo-900 py-16 px-6 text-center">
                <div className="max-w-3xl mx-auto">
                    <h2 className="text-3xl font-bold text-white mb-4">Limited Slots for Beta Testing</h2>
                    <p className="text-indigo-200 mb-8">We are only accepting 15 pioneer photographers for this phase. Join the revolution of secure bookings today.</p>

                    {/* Progress Bar */}
                    <div className="w-full bg-indigo-800 rounded-full h-4 mb-4 border border-indigo-700">
                        <div className="bg-green-400 h-full rounded-full shadow-lg shadow-green-400/20" style={{ width: '60%' }}></div>
                    </div>
                    <div className="flex justify-between text-xs font-bold text-indigo-300 uppercase tracking-wider">
                        <span>9 Slots Registered</span>
                        <span>6 Slots Left</span>
                    </div>

                    <button
                        onClick={onVendorSignup}
                        className="mt-10 bg-white text-indigo-900 font-black px-10 py-4 rounded-full hover:bg-indigo-50 transition-all shadow-2xl"
                    >
                        RESERVE MY VENDOR SLOT
                    </button>
                </div>
            </div>

            {/* --- 5. FOOTER --- */}
            <footer className="bg-white border-t border-gray-200 py-12">
                <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="text-center md:text-left">
                        <span className="text-xl font-black text-indigo-900 uppercase tracking-tighter">ABE <span className="italic text-indigo-600">Events</span></span>
                        <p className="text-gray-400 text-sm mt-2">© 2025 All rights reserved. Gawang Kapampangan.</p>
                    </div>
                    <div className="flex gap-6 text-gray-500 text-sm font-medium">
                        <button onClick={onPrivacyPolicy} className="hover:text-indigo-600">Privacy Policy</button>
                        <button onClick={onTermsOfEscrow} className="hover:text-indigo-600">Terms of Escrow</button>
                        <button onClick={onSupport} className="hover:text-indigo-600">Support</button>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;