import React, { useState, useEffect } from 'react';

export default function VendorSearchPage({ onViewProfile, users = [] }) {
    const [city, setCity] = useState('ANGELES');
    const [category, setCategory] = useState('PHOTO');
    const [vendors, setVendors] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [searched, setSearched] = useState(false);

    // Backend endpoint
    const API_URL = "https://wo8fo93m11.execute-api.us-east-1.amazonaws.com";

    const handleSearch = async (e) => {
        if (e) e.preventDefault();
        setLoading(true);
        setError('');
        setSearched(true);

        try {
            const response = await fetch(`${API_URL}/vendors?city=${city}&category=${category}`);
            const data = await response.json();

            if (response.ok) {
                // Merge with local security state (strikes/banned)
                const enhancedVendors = (data || []).map(v => {
                    const localUser = users.find(u => u.name === v.businessName);
                    return {
                        ...v,
                        strikes: localUser?.strikes || 0,
                        isBanned: localUser?.isBanned || false
                    };
                });
                setVendors(enhancedVendors);
            } else {
                setError(data.error || "Failed to fetch vendors. Please try again.");
            }
        } catch (err) {
            setError("Network error. Please check your connection and try again.");
        } finally {
            setLoading(false);
        }
    };

    // Perform initial search on mount
    useEffect(() => {
        handleSearch();
    }, []);

    return (
        <div className="min-h-screen bg-white font-sans text-gray-900 selection:bg-indigo-100">
            {/* 1. HERO BANNER WITH SEARCH BAR */}
            <section className="relative h-[450px] sm:h-[500px] md:h-[600px] flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <img 
                        src="https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=2000&q=80" 
                        alt="Event Background" 
                        className="w-full h-full object-cover scale-110"
                    />
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px]"></div>
                </div>
                
                <div className="relative z-10 max-w-5xl mx-auto text-center px-4">
                    <span className="inline-block px-4 py-1.5 bg-indigo-600/20 backdrop-blur-md rounded-full text-[10px] sm:text-xs font-black text-indigo-300 uppercase tracking-[0.3em] mb-6 sm:mb-8 border border-indigo-500/30">
                        ABE's Elite Marketplace
                    </span>
                    <h1 className="text-3xl sm:text-4xl md:text-7xl font-black text-white mb-6 sm:mb-8 tracking-tighter leading-tight">
                        Find Your Perfect <br/><span className="text-indigo-400">Event Team</span>
                    </h1>
                    <p className="text-sm sm:text-lg md:text-xl text-gray-200 mb-8 sm:mb-12 max-w-2xl mx-auto font-medium leading-relaxed">
                        Discover and book verified photography, catering, and venue professionals in Angeles, Clark, and San Fernando.
                    </p>

                    {/* Search Bar Card */}
                    <div className="bg-white/10 backdrop-blur-2xl p-2 rounded-[2rem] sm:rounded-[2.5rem] shadow-2xl border border-white/20 max-w-4xl mx-auto">
                        <div className="bg-white p-4 sm:p-8 rounded-[1.5rem] sm:rounded-[2rem] shadow-inner flex flex-col md:flex-row gap-4 sm:gap-6">
                            <div className="flex-1">
                                <label className="block text-left text-[8px] sm:text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 sm:mb-3 ml-1">Preferred City</label>
                                <select 
                                    value={city}
                                    onChange={(e) => setCity(e.target.value)}
                                    className="w-full px-4 sm:px-6 py-3 sm:py-4 rounded-xl sm:rounded-2xl border-2 border-gray-50 focus:border-indigo-500 focus:ring-0 outline-none bg-gray-50 font-bold transition-all appearance-none text-sm sm:text-base"
                                >
                                    <option value="ANGELES">Angeles City</option>
                                    <option value="SAN_FERNANDO">San Fernando</option>
                                    <option value="CLARK">Clark Freeport</option>
                                    <option value="MABALACAT">Mabalacat</option>
                                </select>
                            </div>
                            <div className="flex-1">
                                <label className="block text-left text-[8px] sm:text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 sm:mb-3 ml-1">Service Category</label>
                                <select 
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value)}
                                    className="w-full px-4 sm:px-6 py-3 sm:py-4 rounded-xl sm:rounded-2xl border-2 border-gray-50 focus:border-indigo-500 focus:ring-0 outline-none bg-gray-50 font-bold transition-all appearance-none text-sm sm:text-base"
                                >
                                    <option value="PHOTO">Photography</option>
                                    <option value="VIDEO">Video Production</option>
                                    <option value="CATERING">Catering Services</option>
                                    <option value="HMUA">Hair & Makeup</option>
                                    <option value="VENUE">Event Venue</option>
                                </select>
                            </div>
                            <div className="md:pt-8">
                                <button 
                                    onClick={handleSearch}
                                    disabled={loading}
                                    className="w-full md:w-auto px-8 sm:px-12 py-3 sm:py-4 bg-indigo-600 text-white rounded-xl sm:rounded-2xl font-black text-[10px] sm:text-sm uppercase tracking-widest hover:bg-gray-900 transition-all shadow-xl shadow-indigo-200 flex items-center justify-center gap-3"
                                >
                                    {loading ? (
                                        <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                    ) : (
                                        <>Search Now <span>&rarr;</span></>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 2. RESULTS GRID */}
            <main className="max-w-7xl mx-auto py-24 px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col md:flex-row justify-between items-center mb-16 gap-6">
                    <div>
                        <h2 className="text-4xl font-black text-gray-900 tracking-tight">Available <span className="text-indigo-600">Suppliers</span></h2>
                        <p className="text-gray-500 font-bold mt-2 italic">Showing results for {category.toLowerCase()} in {city.toLowerCase()}</p>
                    </div>
                    <div className="flex items-center gap-4 bg-gray-50 p-2 rounded-2xl border border-gray-100">
                        <span className="text-xs font-black text-gray-400 uppercase tracking-widest ml-4">Sort By:</span>
                        <select className="bg-transparent font-bold text-sm outline-none px-4 py-2 cursor-pointer">
                            <option>Recommended</option>
                            <option>Price: Low to High</option>
                            <option>Highest Rated</option>
                        </select>
                    </div>
                </div>

                {error && (
                    <div className="mb-12 p-6 bg-red-50 rounded-[2rem] border-2 border-red-100 text-red-700 flex items-center gap-4">
                        <span className="text-2xl">⚠️</span>
                        <p className="font-bold">{error}</p>
                    </div>
                )}

                {loading && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <div key={i} className="bg-white rounded-[2.5rem] overflow-hidden shadow-sm animate-pulse border border-gray-100">
                                <div className="h-72 bg-gray-100"></div>
                                <div className="p-8 space-y-6">
                                    <div className="h-8 bg-gray-100 rounded-xl w-3/4"></div>
                                    <div className="h-4 bg-gray-100 rounded-lg w-1/2"></div>
                                    <div className="h-14 bg-gray-100 rounded-2xl"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {searched && !loading && vendors.length === 0 && (
                    <div className="text-center py-32 bg-gray-50 rounded-[4rem] border-2 border-dashed border-gray-200">
                        <div className="text-7xl mb-8">🏜️</div>
                        <h2 className="text-3xl font-black text-gray-900 mb-4">No Suppliers Found</h2>
                        <p className="text-gray-500 font-bold max-w-sm mx-auto text-lg leading-relaxed uppercase tracking-widest">Try adjusting your filters to discover more talent.</p>
                    </div>
                )}

                {searched && !loading && vendors.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
                        {vendors.map((vendor, index) => {
                            const coverImageUrl = vendor.coverImage && vendor.coverImage.startsWith('http') 
                                ? vendor.coverImage 
                                : (vendor.coverImage ? `https://photo-assets-reggie-unique-dev.s3.amazonaws.com/${vendor.coverImage}` : 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=800&q=80');

                            return (
                                <div key={vendor.pk || index} className="bg-white rounded-[2.5rem] overflow-hidden shadow-xl shadow-gray-100 hover:shadow-2xl hover:shadow-indigo-100 transition-all duration-500 border border-gray-50 group flex flex-col">
                                    <div className="h-72 relative overflow-hidden">
                                        <img 
                                            src={coverImageUrl} 
                                            alt={vendor.businessName} 
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                                        />
                                        <div className="absolute top-6 right-6 bg-white/90 backdrop-blur-md px-4 py-1.5 rounded-full text-[10px] font-black text-indigo-600 uppercase tracking-widest shadow-lg">
                                            {vendor.gsi1sk?.replace('CATEGORY#', '') || 'Service'}
                                        </div>
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                                    </div>
                                    <div className="p-8 flex-1 flex flex-col">
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="text-2xl font-black text-gray-900 group-hover:text-indigo-600 transition tracking-tight">
                                                {vendor.businessName}
                                            </h3>
                                            <div className="flex flex-col items-end gap-1">
                                                <div className="text-blue-500 text-sm font-black bg-blue-50 w-6 h-6 rounded-full flex items-center justify-center border border-blue-100 shadow-sm" title="Verified">✓</div>
                                                {/* Reputation Badge */}
                                                <span className={`text-[8px] font-black uppercase tracking-tighter px-2 py-0.5 rounded ${
                                                    vendor.isBanned 
                                                        ? 'bg-black text-white' 
                                                        : (vendor.strikes > 0 ? 'bg-red-100 text-red-600 animate-pulse' : (vendor.basePrice > 20000 ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-500'))
                                                }`}>
                                                    {vendor.isBanned 
                                                        ? '🚫 Banned' 
                                                        : (vendor.strikes > 0 ? '⚠️ Under Review' : (vendor.basePrice > 20000 ? '⭐ Top Rated' : 'Verified'))}
                                                </span>
                                            </div>
                                        </div>
                                        <p className="text-gray-400 font-bold text-xs mb-8 uppercase tracking-widest flex items-center gap-2">
                                            <span className="text-indigo-600">📍</span> {vendor.gsi1pk?.replace('LOCATION#', '').replace('_', ' ') || 'Pampanga'}
                                        </p>
                                        
                                        <div className="mt-auto pt-6 border-t border-gray-50 flex items-center justify-between mb-8">
                                            <div>
                                                <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.2em] mb-1">Starting Rate</p>
                                                <span className="text-2xl font-black text-indigo-600 tracking-tighter italic">
                                                    ₱{vendor.basePrice?.toLocaleString() || '0'}
                                                </span>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.2em] mb-1">Reviews</p>
                                                <span className="text-sm font-black text-gray-900">⭐ 5.0</span>
                                            </div>
                                        </div>
                                        
                                        <button 
                                            onClick={() => onViewProfile && onViewProfile(vendor.pk?.replace('VENDOR#', ''))}
                                            className="w-full py-5 bg-gray-900 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-indigo-600 transition-all shadow-xl group/btn"
                                        >
                                            View Professional Profile <span className="inline-block transition-transform group-hover/btn:translate-x-1">&rarr;</span>
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </main>
        </div>
    );
}
