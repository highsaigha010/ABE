import React, { useState, useEffect } from 'react';

const PlannerSettings = ({ 
    isOpen, 
    onClose, 
    eventDate, 
    totalBudget, 
    matchmakerData, 
    onSave, 
    bookings = [] 
}) => {
    const [formData, setFormData] = useState({
        eventType: matchmakerData?.eventType || '',
        services: matchmakerData?.services || [],
        date: eventDate || '',
        budget: totalBudget || 0
    });

    const [errors, setErrors] = useState({});

    // Calculate total escrow secured (paid bookings)
    const totalEscrowSecured = bookings.reduce((acc, b) => {
        const isPaidInEscrow = ['paid', 'partially_released', 'completed', 'released'].includes(b.status);
        return isPaidInEscrow ? acc + b.price : acc;
    }, 0);

    useEffect(() => {
        setFormData({
            eventType: matchmakerData?.eventType || '',
            services: matchmakerData?.services || [],
            date: eventDate || '',
            budget: totalBudget || 0
        });
    }, [isOpen, eventDate, totalBudget, matchmakerData]);

    const validate = () => {
        const newErrors = {};
        
        // 1. Budget Validation
        if (formData.budget < totalEscrowSecured) {
            newErrors.budget = `Abe, hindi pwedeng mas mababa sa ₱${totalEscrowSecured.toLocaleString()} (secured escrow) ang budget!`;
        }

        // 2. Date Validation
        const selectedDate = new Date(formData.date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (selectedDate < today) {
            newErrors.date = "Abe, hindi pwedeng past date ang event!";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSave = () => {
        if (validate()) {
            onSave(formData);
        }
    };

    const toggleService = (service) => {
        setFormData(prev => {
            const services = prev.services.includes(service)
                ? prev.services.filter(s => s !== service)
                : [...prev.services, service];
            return { ...prev, services };
        });
    };

    const categories = [
        "Photographers", "Venues", "Catering", "Hosts/Emcees", "Transport", "Florists", "Gowns & Suits"
    ];

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[150] flex justify-end">
            <div className="absolute inset-0 bg-gray-950/40 backdrop-blur-sm" onClick={onClose}></div>
            
            <div className="bg-white w-full max-w-md h-full relative z-10 shadow-2xl animate-in slide-in-from-right duration-500 overflow-y-auto custom-scrollbar flex flex-col">
                <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-white sticky top-0 z-20">
                    <div>
                        <h3 className="text-2xl font-black text-gray-900 tracking-tighter italic uppercase">Planner Settings</h3>
                        <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mt-1">Update your event vision</p>
                    </div>
                    <button onClick={onClose} className="w-10 h-10 rounded-xl bg-gray-50 text-gray-400 hover:text-gray-900 flex items-center justify-center font-bold">✕</button>
                </div>

                <div className="p-8 space-y-8 flex-1">
                    {/* Event Type */}
                    <div className="space-y-4">
                        <label className="text-[10px] font-black text-gray-900 uppercase tracking-widest ml-1">Event Type</label>
                        <div className="grid grid-cols-2 gap-3">
                            {['Wedding', 'Birthday', 'Corporate', 'Debut'].map(type => (
                                <button 
                                    key={type}
                                    onClick={() => setFormData({...formData, eventType: type})}
                                    className={`py-3 px-4 rounded-xl border-2 font-bold text-xs transition-all ${formData.eventType === type ? 'border-indigo-600 bg-indigo-50 text-indigo-600' : 'border-gray-50 text-gray-400 hover:border-gray-200'}`}
                                >
                                    {type}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Services */}
                    <div className="space-y-4">
                        <label className="text-[10px] font-black text-gray-900 uppercase tracking-widest ml-1">Categories Needed</label>
                        <div className="flex flex-wrap gap-2">
                            {categories.map(service => (
                                <button 
                                    key={service}
                                    onClick={() => toggleService(service)}
                                    className={`px-4 py-2 rounded-full border-2 text-[10px] font-black uppercase tracking-wider transition-all ${formData.services.includes(service) ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-gray-50 text-gray-400 hover:border-gray-200'}`}
                                >
                                    {service}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Date & Budget */}
                    <div className="space-y-6 pt-4 border-t border-gray-50">
                        <div>
                            <label className="text-[10px] font-black text-gray-900 uppercase tracking-widest ml-1 mb-2 block">Event Date</label>
                            <input 
                                type="date" 
                                value={formData.date}
                                onChange={(e) => setFormData({...formData, date: e.target.value})}
                                className={`w-full bg-gray-50 border-2 rounded-2xl px-6 py-4 font-bold text-sm outline-none transition-all ${errors.date ? 'border-red-500' : 'border-transparent focus:border-indigo-500'}`}
                            />
                            {errors.date && <p className="text-[10px] text-red-500 font-bold mt-2 ml-1">{errors.date}</p>}
                        </div>

                        <div>
                            <label className="text-[10px] font-black text-gray-900 uppercase tracking-widest ml-1 mb-2 block">Total Budget (₱)</label>
                            <div className="relative">
                                <span className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 font-black">₱</span>
                                <input 
                                    type="number" 
                                    value={formData.budget || ''}
                                    onChange={(e) => setFormData({...formData, budget: Number(e.target.value)})}
                                    className={`w-full bg-gray-50 border-2 rounded-2xl pl-12 pr-6 py-4 font-bold text-sm outline-none transition-all ${errors.budget ? 'border-red-500' : 'border-transparent focus:border-indigo-500'}`}
                                />
                            </div>
                            {errors.budget && <p className="text-[10px] text-red-500 font-bold mt-2 ml-1">{errors.budget}</p>}
                        </div>
                    </div>
                </div>

                <div className="p-8 bg-gray-50/50 sticky bottom-0 z-20 border-t border-gray-50">
                    <button 
                        onClick={handleSave}
                        className="w-full bg-indigo-600 text-white py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:bg-gray-900 transition-all active:scale-95"
                    >
                        Save & Refresh Matches
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PlannerSettings;