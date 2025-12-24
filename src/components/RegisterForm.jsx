import React, { useState } from 'react';

export default function RegisterForm({ onSwitchToLogin }) {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'CLIENT' // Default role
    });

    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // ⚠️ REPLACE THIS WITH YOUR API GATEWAY URL
    const API_URL = "https://wo8fo93m11.execute-api.us-east-1.amazonaws.com";

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage('');

        try {
            const response = await fetch(`${API_URL}/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (response.ok) {
                setMessage("Success! Account created.");
                // Optional: clear form or switch to login automatically
                setTimeout(() => {
                    if (onSwitchToLogin) onSwitchToLogin();
                }, 1500);
            } else {
                setMessage(`Error: ${data.message || "Registration failed"}`);
            }
        } catch (error) {
            setMessage("Network error. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center">
            <div className="w-full max-w-sm rounded-lg bg-white p-6 shadow-md border border-gray-100">
                <h2 className="mb-6 text-center text-2xl font-bold text-gray-800">
                    Create Account
                </h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Full Name</label>
                        <input
                            name="name"
                            type="text"
                            required
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                    </div>

                    {/* Email */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Email</label>
                        <input
                            name="email"
                            type="email"
                            required
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                    </div>

                    {/* Password */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Password</label>
                        <input
                            name="password"
                            type="password"
                            required
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                    </div>

                    {/* Role Selector (Critical for your business) */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">I am a...</label>
                        <select
                            name="role"
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border border-gray-300 p-2 bg-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        >
                            <option value="CLIENT">Client (I want to hire)</option>
                            <option value="PHOTOGRAPHER">Photographer (I take photos)</option>
                            <option value="EDITOR">Editor (I edit photos)</option>
                        </select>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className={`w-full rounded-md px-4 py-2 text-white font-medium transition 
              ${isLoading ? 'bg-blue-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
                    >
                        {isLoading ? 'Creating Account...' : 'Register'}
                    </button>
                </form>

                {/* Link to switch back to Login */}
                <p className="mt-4 text-center text-sm text-gray-600">
                    Already have an account?{' '}
                    <button
                        onClick={onSwitchToLogin}
                        className="font-medium text-blue-600 hover:text-blue-500"
                    >
                        Sign In
                    </button>
                </p>

                {message && (
                    <div className={`mt-4 p-2 text-center text-sm rounded 
            ${message.includes('Success') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {message}
                    </div>
                )}
            </div>
        </div>
    );
}