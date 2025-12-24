import React, { useState, useEffect } from 'react';
import ImageUpload from './ImageUpload'; // <--- IMPORT THE NEW COMPONENT

export default function ProfileEditor({ user, onSave }) {
    const [formData, setFormData] = useState({
        bio: '',
        location: '',
        profilePic: '', // New Field
        portfolio: [],  // New Field
        packages: [
            { name: 'Basic', price: '100', features: '2 Hours, 20 Photos' },
            { name: 'Standard', price: '300', features: '4 Hours, 50 Photos' },
            { name: 'Premium', price: '1000', features: 'Full Day, All Raw Files' }
        ]
    });
    const [loading, setLoading] = useState(false);

    // REPLACE WITH YOUR API URL (No trailing slash)
    const API_URL = "https://wo8fo93m11.execute-api.us-east-1.amazonaws.com";

    // 1. Load existing profile data
    useEffect(() => {
        async function fetchProfile() {
            try {
                const res = await fetch(`${API_URL}/profile/${user.id}`);
                if (res.ok) {
                    const data = await res.json();
                    setFormData(prev => ({
                        ...prev,
                        bio: data.bio || '',
                        location: data.location || '',
                        profilePic: data.profilePic || '',
                        portfolio: data.portfolio || [],
                        packages: data.packages && data.packages.length > 0 ? data.packages : prev.packages
                    }));
                }
            } catch (err) {
                console.error("Error loading profile", err);
            }
        }
        fetchProfile();
    }, [user.id]);

    const handlePackageChange = (index, field, value) => {
        const newPackages = [...formData.packages];
        newPackages[index][field] = value;
        setFormData({ ...formData, packages: newPackages });
    };

    // Helper to add uploaded image to portfolio list
    const addPortfolioImage = (url) => {
        setFormData(prev => ({
            ...prev,
            portfolio: [...prev.portfolio, url]
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch(`${API_URL}/profile`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: user.id,
                    ...formData
                }),
            });

            if (res.ok) {
                alert("Profile Saved!");
                onSave();
            } else {
                const errData = await res.json();
                alert(`Failed to save: ${errData.message || 'Unknown error'}`);
            }
        } catch (err) {
            alert("Network error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold mb-6">Edit Your Profile</h2>

            <form onSubmit={handleSubmit} className="space-y-8">

                {/* --- 1. PROFILE PICTURE SECTION --- */}
                <div className="flex items-center space-x-6 p-4 bg-gray-50 rounded-lg border border-gray-100">
                    <div className="shrink-0">
                        {formData.profilePic ? (
                            <img src={formData.profilePic} alt="Profile" className="h-24 w-24 object-cover rounded-full border-2 border-white shadow-sm" />
                        ) : (
                            <div className="h-24 w-24 rounded-full bg-gray-200 flex items-center justify-center text-gray-400">
                                No Pic
                            </div>
                        )}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Profile Picture</label>
                        <ImageUpload onUploadSuccess={(url) => setFormData({...formData, profilePic: url})} />
                        <p className="text-xs text-gray-500 mt-1">Recommended: Square JPG/PNG</p>
                    </div>
                </div>

                {/* --- 2. TEXT FIELDS --- */}
                <div className="grid grid-cols-1 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Location</label>
                        <input
                            type="text"
                            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                            value={formData.location}
                            onChange={e => setFormData({...formData, location: e.target.value})}
                            placeholder="e.g. Angeles City, Pampanga"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Bio</label>
                        <textarea
                            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                            rows="3"
                            value={formData.bio}
                            onChange={e => setFormData({...formData, bio: e.target.value})}
                            placeholder="Describe your style (e.g. Cinematic Wedding Photographer)..."
                        />
                    </div>
                </div>

                {/* --- 3. PORTFOLIO GALLERY --- */}
                <div className="border-t pt-6">
                    <label className="block text-lg font-medium text-gray-900 mb-4">Portfolio Gallery</label>

                    {/* Image Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        {formData.portfolio.map((img, i) => (
                            <div key={i} className="relative group aspect-square bg-gray-100 rounded overflow-hidden">
                                <img src={img} className="w-full h-full object-cover" alt="Portfolio" />
                                {/* Remove Button */}
                                <button
                                    type="button"
                                    onClick={() => {
                                        const newList = formData.portfolio.filter((_, idx) => idx !== i);
                                        setFormData({...formData, portfolio: newList});
                                    }}
                                    className="absolute top-1 right-1 bg-red-600 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition"
                                >
                                    Remove
                                </button>
                            </div>
                        ))}

                        {/* Upload Button Box */}
                        <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-4 hover:bg-gray-50">
                            <span className="text-sm text-gray-500 mb-2">Add Photo</span>
                            <ImageUpload onUploadSuccess={addPortfolioImage} />
                        </div>
                    </div>
                </div>

                {/* --- 4. PACKAGES --- */}
                <div className="border-t pt-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Service Packages</h3>
                    {formData.packages.map((pkg, index) => (
                        <div key={index} className="mb-4 p-4 border rounded bg-gray-50">
                            <div className="flex justify-between mb-2">
                                <h4 className="font-bold text-sm text-indigo-600">Package {index + 1}</h4>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <input
                                    placeholder="Name (e.g. Basic)"
                                    className="border p-2 rounded"
                                    value={pkg.name}
                                    onChange={e => handlePackageChange(index, 'name', e.target.value)}
                                />
                                <input
                                    placeholder="Price ($)"
                                    type="number"
                                    className="border p-2 rounded"
                                    value={pkg.price}
                                    onChange={e => handlePackageChange(index, 'price', e.target.value)}
                                />
                                <input
                                    placeholder="Features (e.g. 4 hours, 50 photos)"
                                    className="col-span-1 md:col-span-2 border p-2 rounded"
                                    value={pkg.features}
                                    onChange={e => handlePackageChange(index, 'features', e.target.value)}
                                />
                            </div>
                        </div>
                    ))}
                </div>

                {/* --- FOOTER BUTTONS --- */}
                <div className="flex justify-end space-x-3 pt-4 border-t">
                    <button
                        type="button"
                        onClick={onSave}
                        className="text-gray-500 hover:text-gray-700 font-medium px-4 py-2"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-indigo-600 text-white px-6 py-2 rounded shadow hover:bg-indigo-700 transition font-medium"
                    >
                        {loading ? 'Saving...' : 'Save Profile'}
                    </button>
                </div>
            </form>
        </div>
    );
}