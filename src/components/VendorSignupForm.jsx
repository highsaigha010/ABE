import React, { useState } from 'react';
import ImageUploader from './ImageUploader';

export default function VendorSignupForm() {
    const [formData, setFormData] = useState({
        businessName: '',
        city: 'ANGELES',
        category: 'PHOTO',
        description: '',
        basePrice: '',
        cover_image: ''
    });

    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    // Backend endpoint as specified in requirements
    const API_URL = "https://wo8fo93m11.execute-api.us-east-1.amazonaws.com";

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'basePrice' ? parseFloat(value) || '' : value
        }));
    };

    const validateForm = () => {
        if (!formData.businessName.trim()) return "Business Name is required";
        if (!formData.description.trim()) return "Description is required";
        if (!formData.basePrice) return "Base Price is required";
        return null;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        
        const validationError = validateForm();
        if (validationError) {
            setError(validationError);
            return;
        }

        setLoading(true);

        try {
            const response = await fetch(`${API_URL}/vendors`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    business_name: formData.businessName,
                    city: formData.city,
                    category: formData.category,
                    description: formData.description,
                    base_price: formData.basePrice,
                    cover_image: formData.cover_image
                }),
            });

            const data = await response.json();

            if (response.ok) {
                setSuccess(true);
            } else {
                setError(data.message || "Failed to register as a vendor. Please try again.");
            }
        } catch (err) {
            setError("Network error. Please check your connection and try again.");
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="max-w-md mx-auto mt-10 p-8 bg-white rounded-2xl shadow-xl text-center border border-gray-100">
                <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-4xl mx-auto mb-6">
                    ✓
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Registration Successful!</h2>
                <p className="text-gray-600 mb-8">Your vendor profile has been created. We'll review your details and get back to you soon.</p>
                <button 
                    onClick={() => window.location.reload()} 
                    className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition shadow-lg"
                >
                    Back to Home
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto my-6 md:my-12 p-6 md:p-10 bg-white rounded-2xl md:rounded-[2.5rem] shadow-2xl border border-gray-50 mx-4 sm:mx-auto">
            <div className="text-center mb-10">
                <h1 className="text-3xl md:text-4xl font-black text-gray-900 mb-2 tracking-tight">Become a <span className="text-indigo-600">Vendor</span></h1>
                <p className="text-gray-500 font-medium">Join the best event marketplace in ABE and grow your business.</p>
            </div>

            {error && (
                <div className="mb-8 p-4 bg-red-50 border-2 border-red-100 rounded-xl text-red-600 text-xs font-bold text-center animate-pulse">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
                <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-1">Business Name</label>
                    <input
                        type="text"
                        name="businessName"
                        value={formData.businessName}
                        onChange={handleChange}
                        placeholder="e.g. Juan's Catering"
                        className="w-full px-5 py-4 rounded-2xl border-2 border-gray-50 focus:border-indigo-500 focus:bg-white bg-gray-50 outline-none font-bold transition-all text-sm placeholder-gray-400"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-1">City Location</label>
                        <div className="relative">
                            <select
                                name="city"
                                value={formData.city}
                                onChange={handleChange}
                                className="w-full px-5 py-4 rounded-2xl border-2 border-gray-50 focus:border-indigo-500 focus:bg-white bg-gray-50 outline-none font-bold transition-all text-sm appearance-none cursor-pointer"
                            >
                                <option value="ANGELES">Angeles</option>
                                <option value="SAN_FERNANDO">San Fernando</option>
                                <option value="CLARK">Clark</option>
                                <option value="MABALACAT">Mabalacat</option>
                            </select>
                            <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-gray-400">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7"></path></svg>
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-1">Service Category</label>
                        <div className="relative">
                            <select
                                name="category"
                                value={formData.category}
                                onChange={handleChange}
                                className="w-full px-5 py-4 rounded-2xl border-2 border-gray-50 focus:border-indigo-500 focus:bg-white bg-gray-50 outline-none font-bold transition-all text-sm appearance-none cursor-pointer"
                            >
                                <option value="PHOTO">Photography</option>
                                <option value="VIDEO">Video</option>
                                <option value="CATERING">Catering</option>
                                <option value="HMUA">Hair & Makeup</option>
                                <option value="VENUE">Venue</option>
                            </select>
                            <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-gray-400">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7"></path></svg>
                            </div>
                        </div>
                    </div>
                </div>

                <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-1">Service Description</label>
                    <textarea
                        name="description"
                        rows="4"
                        value={formData.description}
                        onChange={handleChange}
                        placeholder="Tell us about your services, experience, and what makes you unique..."
                        className="w-full px-5 py-4 rounded-2xl border-2 border-gray-50 focus:border-indigo-500 focus:bg-white bg-gray-50 outline-none font-bold transition-all text-sm placeholder-gray-400 resize-none"
                    />
                </div>

                <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-1">Starting Price (₱)</label>
                    <div className="relative">
                        <span className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm">₱</span>
                        <input
                            type="number"
                            name="basePrice"
                            value={formData.basePrice}
                            onChange={handleChange}
                            placeholder="5000"
                            className="w-full pl-10 pr-5 py-4 rounded-2xl border-2 border-gray-50 focus:border-indigo-500 focus:bg-white bg-gray-50 outline-none font-bold transition-all text-sm placeholder-gray-400"
                        />
                    </div>
                </div>

                <div className="bg-indigo-50/50 p-6 md:p-8 rounded-[2rem] border-2 border-dashed border-indigo-100">
                    <label className="block text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] mb-4 text-center">Business Cover Image</label>
                    <ImageUploader onUploadSuccess={(key) => setFormData({...formData, cover_image: key})} />
                    <p className="mt-4 text-[10px] text-indigo-400 font-bold text-center">High-quality photos (min. 1200x800px) perform best.</p>
                </div>

                <div className="pt-4">
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-gray-900 transition-all shadow-2xl shadow-indigo-100 flex items-center justify-center gap-3 group"
                    >
                        {loading ? (
                            <>
                                <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Submitting Application...
                            </>
                        ) : (
                            <>Complete Registration <span className="group-hover:translate-x-1 transition-transform">&rarr;</span></>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}
