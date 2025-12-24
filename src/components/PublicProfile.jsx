import React, { useState, useEffect } from 'react';

export default function PublicProfile({ photographerId }) {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    // REPLACE WITH YOUR REAL API URL
    const API_URL = "https://wo8fo93m11.execute-api.us-east-1.amazonaws.com";

    useEffect(() => {
        async function loadProfile() {
            try {
                const res = await fetch(`${API_URL}/profile/${photographerId}`);
                if (!res.ok) throw new Error("Failed to fetch");
                const data = await res.json();
                setProfile(data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        }
        loadProfile();
    }, [photographerId]);

    if (loading) return <div className="p-10 text-center">Loading Profile...</div>;
    if (!profile) return <div className="p-10 text-center">Profile not found.</div>;

    return (
        <div className="max-w-5xl mx-auto bg-white min-h-screen shadow-xl rounded-lg overflow-hidden my-8">

            {/* A. HERO SECTION */}
            <div className="relative h-64 bg-gray-900">
                {/* If we had a cover photo, it would go here. For now, dark background. */}
                <div className="absolute inset-0 opacity-50 bg-gradient-to-b from-transparent to-black"></div>

                {/* Profile Pic */}
                <img
                    src={profile.profilePic && profile.profilePic.startsWith('http') ? profile.profilePic : (profile.profilePic ? `https://photo-assets-reggie-unique-dev.s3.amazonaws.com/${profile.profilePic}` : "https://via.placeholder.com/150?text=No+Img")}
                    className="absolute -bottom-16 left-8 w-32 h-32 rounded-full border-4 border-white shadow-lg object-cover bg-white"
                    alt="Profile"
                />
            </div>

            <div className="pt-20 px-8 pb-8">
                <h1 className="text-4xl font-bold text-gray-900 flex items-center">
                    {profile.name}
                    <span className="ml-2 text-blue-500 text-2xl" title="Verified">✓</span>
                </h1>
                <p className="text-gray-500 font-medium mt-1 flex items-center">
                    📍 {profile.location || "Location not set"}
                </p>
                <div className="mt-6 max-w-2xl text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-lg border border-gray-100">
                    {profile.bio || "This photographer hasn't written a bio yet."}
                </div>
            </div>

            {/* B. PORTFOLIO GALLERY */}
            <div className="px-8 mt-8">
                <h2 className="text-2xl font-bold mb-6 border-b pb-2">Portfolio</h2>

                {(!profile.portfolio || profile.portfolio.length === 0) ? (
                    <p className="text-gray-500 italic">No images uploaded yet.</p>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        {profile.portfolio.map((imgUrl, index) => {
                            const fullImgUrl = imgUrl && imgUrl.startsWith('http') ? imgUrl : `https://photo-assets-reggie-unique-dev.s3.amazonaws.com/${imgUrl}`;
                            return (
                                <div key={index} className="aspect-square bg-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition cursor-pointer">
                                    <img
                                        src={fullImgUrl}
                                        alt={`Portfolio ${index}`}
                                        className="w-full h-full object-cover hover:scale-105 transition duration-300"
                                        onClick={() => window.open(fullImgUrl, '_blank')}
                                    />
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* C. PACKAGES */}
            <div className="px-8 mt-16 mb-12">
                <h2 className="text-2xl font-bold mb-6 border-b pb-2">Services & Pricing</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {profile.packages && profile.packages.map((pkg, i) => (
                        <div key={i} className="border border-gray-200 p-6 rounded-xl shadow-sm hover:shadow-lg transition bg-white flex flex-col">
                            <h3 className="font-bold text-xl text-gray-900">{pkg.name}</h3>
                            <p className="text-3xl font-extrabold text-indigo-600 mt-4">${pkg.price}</p>
                            <p className="text-gray-600 mt-4 flex-grow text-sm leading-relaxed">{pkg.features}</p>
                            <button className="mt-6 w-full bg-gray-900 text-white py-3 rounded-lg font-semibold hover:bg-gray-800 transition">
                                Book Now
                            </button>
                        </div>
                    ))}
                </div>
            </div>

        </div>
    );
}