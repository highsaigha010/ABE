import React from 'react';

const LandingPage = ({ onLogin, onRegister, onVendorSignup, onFindSuppliers, onPrivacyPolicy, onTermsOfEscrow, onSupport }) => {
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

                    <div className="flex items-center gap-8">
                        <button
                            onClick={onVendorSignup}
                            className="hidden md:block text-gray-400 hover:text-indigo-600 font-black text-[10px] uppercase tracking-[0.2em] transition-colors"
                        >
                            Become a Vendor
                        </button>
                        <div className="h-4 w-px bg-gray-100 hidden md:block"></div>
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
                </div>
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
                    <h1 className="text-6xl md:text-7xl font-black tracking-tighter mb-8 text-gray-900 leading-[0.9] md:leading-[1.1]">
                        Book trusted suppliers.<br/>
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">Pay with confidence.</span>
                    </h1>

                    <p className="text-xl text-gray-500 mb-12 max-w-2xl mx-auto leading-relaxed font-medium">
                        Experience the gold standard in event planning. Our <strong>Smart Escrow™</strong> technology ensures your peace of mind from booking to the final delivery.
                    </p>

                    <div className="flex flex-col md:flex-row justify-center gap-6">
                        <button
                            onClick={onFindSuppliers}
                            className="bg-gray-900 text-white text-sm uppercase tracking-widest font-black px-10 py-5 rounded-2xl shadow-2xl hover:bg-indigo-600 transition-all transform hover:-translate-y-1 active:scale-95"
                        >
                            Explore Marketplace
                        </button>
                        <button
                            onClick={onVendorSignup}
                            className="bg-white text-gray-900 border-2 border-gray-100 text-sm uppercase tracking-widest font-black px-10 py-5 rounded-2xl hover:border-indigo-100 hover:bg-indigo-50 transition-all transform hover:-translate-y-1 active:scale-95"
                        >
                            Join as a Supplier
                        </button>
                    </div>

                    {/* --- PARTNER LOGOS SECTION (BALANCED & FULL COLOR) --- */}
                    <div className="mt-16 pt-12 border-t border-gray-100 flex flex-wrap items-center justify-center gap-10 md:gap-16 opacity-95 transition-opacity">

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
                    <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-[2.5rem] blur opacity-20 group-hover:opacity-30 transition duration-1000 group-hover:duration-200"></div>
                    <div className="relative w-full h-[450px] md:h-[650px] rounded-[2rem] overflow-hidden shadow-2xl border-8 border-white bg-gray-100">
                        <img
                            src="/landing_page_image/Events2.png"
                            alt="Beautiful Wedding in ABE"
                            className="absolute inset-0 w-full h-full object-cover"
                        />
                        {/* Floating Text Overlay */}
                        <div className="absolute top-8 right-8 z-20">
                            <div className="bg-white/10 backdrop-blur-md border border-white/20 px-6 py-3 rounded-2xl shadow-2xl transform rotate-3 hover:rotate-0 transition-transform duration-500">
                                <p className="text-white text-lg md:text-xl font-black tracking-widest italic text-right drop-shadow-2xl">
                                    "Selebrasyun a masaya,<br/>
                                    <span className="text-white">king scam malaut ya."</span>
                                </p>
                            </div>
                        </div>

                    </div>

                </div>

            </div>

            {/* --- 3. HOW IT WORKS --- */}
            <div className="py-20 bg-white">
                <div className="max-w-6xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">How Smart Escrow™ Protects You</h2>
                        <p className="text-gray-500">We bridged the trust gap between Clients and Vendors.</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="bg-gray-50 p-8 rounded-3xl border border-gray-100 relative text-center">
                            <div className="w-24 h-24 mx-auto mb-6 overflow-hidden">
                                <img
                                    src="/How_Smart_Escrow/Book & Secure.png"
                                    alt="Book & Secure"
                                    className="w-full h-full object-contain"
                                />
                            </div>
                            <h3 className="text-xl font-bold mb-3">Book & Secure</h3>
                            <p className="text-gray-500 text-sm leading-relaxed">
                                Choose your vendor and pay via GCash or Card. Your money is <strong>locked</strong> in our secure vault.
                            </p>
                        </div>
                        <div className="bg-gray-50 p-8 rounded-3xl border border-gray-100 relative text-center">
                            <div className="w-24 h-24 mx-auto mb-6 overflow-hidden">
                                <img
                                    src="/How_Smart_Escrow/Vendor Delivers.png"
                                    alt="Vendor Delivers"
                                    className="w-full h-full object-contain"
                                />

                            </div>
                            <h3 className="text-xl font-bold mb-3">Vendor Delivers</h3>
                            <p className="text-gray-500 text-sm leading-relaxed">
                                The vendor sees the funds are secured, so they start working confidently.
                            </p>
                        </div>
                        <div className="bg-indigo-600 text-white p-8 rounded-3xl shadow-xl relative transform md:-translate-y-4 text-center">
                            <div className="w-24 h-24 mx-auto mb-6 overflow-hidden">
                                <img
                                    src="/How_Smart_Escrow/You Release.png"
                                    alt="You Release"
                                    className="w-full h-full object-contain"
                                />
                            </div>
                            <h3 className="text-xl font-bold mb-3">You Release</h3>
                            <p className="text-indigo-100 text-sm leading-relaxed">
                                Job done? You click <strong>"Release Funds"</strong>. The money is instantly transferred to the vendor.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- NEW SECTION: VERIFICATION SHIELD (Strict Vetting) --- */}
            <div 
                className="py-20 bg-indigo-900 text-white overflow-hidden relative"
                style={{
                    backgroundImage: 'linear-gradient(rgba(30, 27, 75, 0.85), rgba(30, 27, 75, 0.85)), url("/Company image/abe events & smart escrow.png")',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundAttachment: 'fixed'
                }}
            >
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
                <div className="max-w-6xl mx-auto px-6 relative z-10">
                    <div className="flex flex-col md:flex-row items-center gap-12">
                        <div className="md:w-1/2">
                            <span className="text-indigo-400 font-black text-[10px] tracking-[0.3em] uppercase mb-4 block">Zero Tolerance for Scams</span>
                            <h2 className="text-4xl font-black tracking-tighter mb-6 leading-tight">
                                Hindi lahat ng supplier,<br/> pwedeng maging <span className="text-indigo-400 italic">Abe</span>.
                            </h2>
                            <p className="text-indigo-100/70 mb-8 leading-relaxed">
                                Bawat supplier sa aming platform ay dumadaan sa <strong>Strict Verification Process</strong>. Sinisiguro namin na legal, rehistrado, at may integridad ang bawat isa sa kanila.
                            </p>
                            <div className="space-y-4">
                                <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/10">
                                    <div className="text-2xl text-indigo-400">🛡️</div>
                                    <div>
                                        <h4 className="font-bold text-sm uppercase">Business Compliance</h4>
                                        <p className="text-xs text-indigo-200/60 font-medium">Verified DTI, SEC, at Mayor's Business Permits.</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/10">
                                    <div className="text-2xl text-indigo-400">👤</div>
                                    <div>
                                        <h4 className="font-bold text-sm uppercase">Identity Verification</h4>
                                        <p className="text-xs text-indigo-200/60 font-medium">1-on-1 KYC (Know Your Client) at Valid Govt IDs.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="md:w-1/2 relative">
                            <div className="bg-gradient-to-tr from-indigo-500 to-purple-600 p-1 rounded-[2.5rem] shadow-2xl rotate-3">
                                <div className="bg-indigo-900 rounded-[2.4rem] p-8 text-center">
                                    <div className="text-6xl mb-4 italic font-black">100%</div>
                                    <p className="text-indigo-300 font-bold uppercase tracking-widest text-xs">Vetted Professionals</p>
                                    <div className="mt-8 pt-8 border-t border-white/10 grid grid-cols-2 gap-4">
                                        <div className="text-center">
                                            <div className="text-lg font-bold">120+</div>
                                            <div className="text-[10px] text-indigo-400 uppercase">Registered DTI</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-lg font-bold">Safe</div>
                                            <div className="text-[10px] text-indigo-400 uppercase">Secured System</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
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