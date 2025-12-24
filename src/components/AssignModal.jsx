import React, { useState, useEffect } from 'react';

export default function AssignModal({ isOpen, onClose, onAssign }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [photographers, setPhotographers] = useState([]);
    const [selectedPhotog, setSelectedPhotog] = useState(null);
    const [selectedPackage, setSelectedPackage] = useState('');
    const [loading, setLoading] = useState(false);

    // REPLACE WITH YOUR API URL
    const API_URL = "https://wo8fo93m11.execute-api.us-east-1.amazonaws.com";

    // 1. Fetch All Photographers when modal opens
    useEffect(() => {
        if (isOpen) {
            fetch(`${API_URL}/photographers`)
                .then(res => res.json())
                .then(data => setPhotographers(data || []));
        }
    }, [isOpen]);

    // 2. Filter list based on search
    const filteredList = photographers.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // 3. Handle Assign Click
    const handleConfirm = () => {
        if (!selectedPhotog || !selectedPackage) {
            alert("Please select a photographer and a package");
            return;
        }
        onAssign(selectedPhotog.id, selectedPackage);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <h2 className="text-xl font-bold mb-4">Assign Photographer</h2>

                {/* STEP 1: SEARCH */}
                {!selectedPhotog ? (
                    <>
                        <input
                            type="text"
                            placeholder="Search by name..."
                            className="w-full border p-2 rounded mb-4"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                        <div className="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto">
                            {filteredList.map(p => (
                                <div key={p.id} className="flex items-center justify-between p-2 border rounded hover:bg-gray-50">
                                    <div className="flex items-center">
                                        <img 
                                            src={p.profilePic && p.profilePic.startsWith('http') ? p.profilePic : (p.profilePic ? `https://photo-assets-reggie-unique-dev.s3.amazonaws.com/${p.profilePic}` : "https://via.placeholder.com/40")} 
                                            className="w-10 h-10 rounded-full mr-3"
                                        />
                                        <div>
                                            <p className="font-bold">{p.name}</p>
                                            <p className="text-xs text-gray-500">{p.location}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setSelectedPhotog(p)}
                                        className="text-sm bg-indigo-100 text-indigo-700 px-3 py-1 rounded"
                                    >
                                        Select
                                    </button>
                                </div>
                            ))}
                        </div>
                    </>
                ) : (
                    /* STEP 2: SELECT PACKAGE */
                    <div className="animate-fade-in">
                        <button onClick={() => setSelectedPhotog(null)} className="text-sm text-gray-500 mb-4">&larr; Back to list</button>

                        <div className="flex items-center mb-6">
                            <img 
                                src={selectedPhotog.profilePic && selectedPhotog.profilePic.startsWith('http') ? selectedPhotog.profilePic : (selectedPhotog.profilePic ? `https://photo-assets-reggie-unique-dev.s3.amazonaws.com/${selectedPhotog.profilePic}` : "https://via.placeholder.com/150")} 
                                className="w-16 h-16 rounded-full mr-4"
                            />
                            <div>
                                <h3 className="font-bold text-lg">Booking: {selectedPhotog.name}</h3>
                                <p className="text-sm text-gray-500">Select a package to continue:</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                            {selectedPhotog.packages && selectedPhotog.packages.length > 0 ? (
                                selectedPhotog.packages.map((pkg, i) => (
                                    <div
                                        key={i}
                                        onClick={() => setSelectedPackage(`${pkg.name} ($${pkg.price})`)}
                                        className={`border p-4 rounded cursor-pointer ${selectedPackage.includes(pkg.name) ? 'border-indigo-500 bg-indigo-50' : 'hover:border-gray-400'}`}
                                    >
                                        <p className="font-bold">{pkg.name}</p>
                                        <p className="text-green-600 font-bold">${pkg.price}</p>
                                        <p className="text-xs text-gray-500">{pkg.features}</p>
                                    </div>
                                ))
                            ) : (
                                <p className="col-span-2 text-red-500">This photographer has no packages listed.</p>
                            )}
                        </div>

                        <div className="flex justify-end space-x-3">
                            <button onClick={onClose} className="text-gray-500">Cancel</button>
                            <button
                                onClick={handleConfirm}
                                disabled={!selectedPackage}
                                className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 disabled:opacity-50"
                            >
                                Send Invitation
                            </button>
                        </div>
                    </div>
                )}

                <div className="mt-4 flex justify-end">
                    {!selectedPhotog && <button onClick={onClose} className="text-gray-500">Cancel</button>}
                </div>
            </div>
        </div>
    );
}