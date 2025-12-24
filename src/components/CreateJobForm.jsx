import React, { useState } from 'react';

export default function CreateJobForm({ user, onJobCreated, onCancel }) {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        price: '',
    });
    const [isLoading, setIsLoading] = useState(false);

    // REPLACE WITH YOUR API GATEWAY URL
    const API_URL = "https://wo8fo93m11.execute-api.us-east-1.amazonaws.com";

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const response = await fetch(`${API_URL}/jobs`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    clientId: user.id // We attach the logged-in user's email/ID
                }),
            });

            if (response.ok) {
                onJobCreated(); // Tell parent to close form and refresh list
            } else {
                alert("Failed to create job");
            }
        } catch (error) {
            alert("Network error");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow mb-6">
            <h3 className="text-lg font-bold mb-4">Post a New Project</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Project Title</label>
                    <input
                        required
                        className="mt-1 block w-full rounded-md border border-gray-300 p-2"
                        value={formData.title}
                        onChange={e => setFormData({...formData, title: e.target.value})}
                        placeholder="e.g., Wedding Photoshoot in Bali"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Description</label>
                    <textarea
                        required
                        className="mt-1 block w-full rounded-md border border-gray-300 p-2"
                        rows="3"
                        value={formData.description}
                        onChange={e => setFormData({...formData, description: e.target.value})}
                        placeholder="Details about the shoot..."
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Budget ($)</label>
                    <input
                        required
                        type="number"
                        className="mt-1 block w-full rounded-md border border-gray-300 p-2"
                        value={formData.price}
                        onChange={e => setFormData({...formData, price: e.target.value})}
                        placeholder="500"
                    />
                </div>

                <div className="flex justify-end space-x-3">
                    <button type="button" onClick={onCancel} className="text-gray-500 hover:text-gray-700">Cancel</button>
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
                    >
                        {isLoading ? 'Posting...' : 'Post Job'}
                    </button>
                </div>
            </form>
        </div>
    );
}