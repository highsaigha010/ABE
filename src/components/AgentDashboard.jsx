import React, { useState, useEffect } from 'react';

const AgentDashboard = ({ user, bookings, users = [], projects = [], setProjects, onLogout, showNotification, onFindSuppliers }) => {
    const [isWalletOpen, setIsWalletOpen] = useState(false);
    const [withdrawAmount, setWithdrawAmount] = useState('');
    const [activeProjectId, setActiveProjectId] = useState(null);
    const [selectedProjectDetailId, setSelectedProjectDetailId] = useState(null);
    const [showProjectModal, setShowProjectModal] = useState(false);
    const [modalStep, setModalStep] = useState('setup'); // 'setup' or 'review'
    const [architectResults, setArchitectResults] = useState([]);
    const [showServiceSlotForm, setShowServiceSlotForm] = useState(false);
    const [newSlotForm, setNewSlotForm] = useState({ category: 'PHOTOGRAPHY', budget: '' });

    // Use passed projects or internal if not provided (safety)
    const agentProjects = projects.filter(p => p.agentId === user.id);

    const [projectForm, setProjectForm] = useState({ 
        name: '', 
        clientName: '', 
        targetBookings: 5, 
        allocatedBudget: 0, 
        targetDate: '',
        serviceSlots: [],
        selectedServices: [] // Categories selected in architect flow
    });

    const categories = [
        { id: 'PHOTOGRAPHY', label: 'Photography', icon: '📸', weight: 0.20 },
        { id: 'VIDEOGRAPHY', label: 'Videography', icon: '🎥', weight: 0.15 },
        { id: 'VENUE', label: 'Venue', icon: '🏰', weight: 0.40 },
        { id: 'CATERING', label: 'Catering', icon: '🍽️', weight: 0.30 },
        { id: 'HOST', label: 'Host/MC', icon: '🎤', weight: 0.10 },
        { id: 'SOUNDS_AND_LIGHTS', label: 'Sounds & Lights', icon: '💡', weight: 0.15 }
    ];

    const handleArchitectAnalysis = () => {
        // Debug Logging - Abe, check natin kung load ang data
        console.log('Architect Analysis triggered');
        console.log('Available Users/Vendors:', users);
        console.log('Project Form:', projectForm);

        if (!projectForm.name || !projectForm.clientName || !projectForm.allocatedBudget || projectForm.selectedServices.length === 0) {
            showNotification('Abe, paki-kumpleto ang setup at pumili ng services!', 'error');
            return;
        }

        const totalWeight = projectForm.selectedServices.reduce((acc, catId) => {
            const cat = categories.find(c => c.id === catId);
            return acc + (cat ? cat.weight : 0);
        }, 0);

        const results = projectForm.selectedServices.map(catId => {
            const cat = categories.find(c => c.id === catId);
            // Proportional budget allocation
            const allocatedAmount = (cat.weight / totalWeight) * projectForm.allocatedBudget;
            
            // Find best match vendor - Abe, base on starting_price and category
            const matches = users.filter(u => {
                const isVendor = u.role?.toUpperCase() === 'VENDOR';
                const userCat = (u.category || '').toLowerCase();
                const targetCat = catId.toLowerCase();
                
                // Strict category matching
                const categoryMatches = userCat === targetCat;

                const price = u.starting_price || u.startingPrice || 0;
                return isVendor && categoryMatches && (price <= allocatedAmount);
            }).sort((a, b) => {
                const priceA = a.starting_price || a.startingPrice || 0;
                const priceB = b.starting_price || b.startingPrice || 0;
                if (priceB !== priceA) return priceB - priceA;
                return (b.rating || 0) - (a.rating || 0);
            });

            const bestMatch = matches[0];
            const basePrice = bestMatch?.starting_price || bestMatch?.startingPrice || 0;
            const isPadded = allocatedAmount > (basePrice * 1.5); // Logic: if allocated is 50% more than base, alert

            return {
                category: catId,
                label: cat.label,
                icon: cat.icon,
                allocatedBudget: allocatedAmount,
                basePrice: basePrice,
                isPadded: isPadded,
                match: bestMatch || null,
                alternatives: matches.slice(1, 4)
            };
        });

        setArchitectResults(results);
        setModalStep('review');
    };

    const handleReturnSurplusToClient = (projectId) => {
        const updatedProjects = projects.map(p => {
            if (p.id === projectId) {
                const totalAllocated = p.totalClientBudget || 0;
                const totalSpent = (p.serviceSlots || []).reduce((acc, s) => acc + (s.budget || 0), 0);
                const surplus = totalAllocated - totalSpent;

                if (surplus <= 0) {
                    showNotification('Abe, wala nang surplus na pwedeng i-refund!', 'info');
                    return p;
                }

                // Add to Audit Trail
                const historyEntry = {
                    id: 'trail_' + Date.now(),
                    type: 'REFUND',
                    amount: surplus,
                    description: 'Surplus budget returned to client.',
                    timestamp: new Date().toISOString()
                };

                return { 
                    ...p, 
                    totalSupplierCost: totalSpent, // Final cost is what was spent
                    refundStatus: 'REFUNDED',
                    auditTrail: [...(p.auditTrail || []), historyEntry]
                };
            }
            return p;
        });

        setProjects(updatedProjects);
        showNotification('Project Surplus has been marked as Refunded to Client, Abe!', 'success');
    };

    const handleCreateProject = () => {
        if (!projectForm.name || !projectForm.clientName || !projectForm.targetDate) {
            showNotification('Abe, paki-fill up lahat ng fields!', 'error');
            return;
        }

        // Convert architect results to service slots
        const slots = architectResults.map(res => ({
            id: 'slot_' + Math.random().toString(36).substr(2, 9),
            category: res.category,
            budget: res.allocatedBudget,
            basePrice: res.basePrice,
            occupiedBy: res.match ? res.match.id : null,
            vendorName: res.match ? (res.match.businessName || res.match.name) : null,
            vendorInclusions: res.match ? (res.match.bio || 'Professional service with full inclusions.') : null
        }));

        // Initial Audit Trail entries for matched vendors
        const initialTrail = slots.filter(s => s.occupiedBy).map(s => ({
            id: 'trail_' + Math.random().toString(36).substr(2, 9),
            type: 'SUPPLIER_PAYMENT',
            amount: s.budget,
            category: s.category,
            description: `Payment allocated for ${s.vendorName} (${s.category})`,
            timestamp: new Date().toISOString()
        }));

        const newProject = {
            id: 'proj_' + Math.random().toString(36).substr(2, 9),
            ...projectForm,
            totalClientBudget: projectForm.allocatedBudget,
            totalSupplierCost: slots.reduce((acc, s) => acc + (s.budget || 0), 0),
            serviceSlots: slots,
            shortlist: [],
            createdAt: new Date().toISOString(),
            auditTrail: initialTrail,
            agentId: user.id,
            approvalStatus: 'PENDING'
        };
        
        setProjects([...projects, newProject]);
        setActiveProjectId(newProject.id);
        setShowProjectModal(false);
        setModalStep('setup');
        setProjectForm({ 
            name: '', 
            clientName: '', 
            targetBookings: 5, 
            allocatedBudget: 0, 
            targetDate: '',
            serviceSlots: [],
            selectedServices: []
        });
        showNotification('Smart Project Team assembled and saved, Abe!', 'success');
    };

    // Derived State
    const myBookings = bookings.filter(b => b.agentId === user.id || b.projectId); 
    const activeProject = projects.find(p => p.id === activeProjectId);
    const selectedProjectForDetail = projects.find(p => p.id === selectedProjectDetailId);

    // Persistence
    useEffect(() => {
        if (modalStep === 'review' && architectResults.length > 0) {
            console.log('Force Refreshing Match Logic on Review Step...');
            // Re-run matching logic if data changes while on review
            const results = projectForm.selectedServices.map(catId => {
                const cat = categories.find(c => c.id === catId);
                const totalWeight = projectForm.selectedServices.reduce((acc, cid) => {
                    const c = categories.find(cat => cat.id === cid);
                    return acc + (c ? c.weight : 0);
                }, 0);
                const allocatedAmount = (cat.weight / totalWeight) * projectForm.allocatedBudget;
                
                const matches = users.filter(u => {
                    const isVendor = u.role?.toUpperCase() === 'VENDOR';
                    const userCat = (u.category || '').toLowerCase();
                    const targetCat = catId.toLowerCase();
                    
                    // Strict category matching - Abe, using strict equality as requested
                    const categoryMatches = userCat === targetCat;

                    const price = u.starting_price || 0;
                    return isVendor && categoryMatches && (price <= allocatedAmount);
                }).sort((a, b) => {
                    const priceA = a.starting_price || 0;
                    const priceB = b.starting_price || 0;
                    // Find Best Value: Primary sort by Price descending (closest to budget)
                    if (priceB !== priceA) return priceB - priceA;
                    return (b.rating || 0) - (a.rating || 0);
                });

                return {
                    category: catId,
                    label: cat.label,
                    icon: cat.icon,
                    allocatedBudget: allocatedAmount,
                    match: matches[0] || null,
                    alternatives: matches.slice(1, 4)
                };
            });
            setArchitectResults(results);
        }
    }, [modalStep, users, projectForm.allocatedBudget, projectForm.selectedServices]);

    const handleAddServiceSlot = (projectId, category, budget) => {
        const amount = parseFloat(budget);
        if (!amount || amount <= 0) {
            showNotification('Abe, paki-input ang tamang budget para sa slot!', 'error');
            return;
        }

        // Find base price for this category from vendors
        const categoryVendors = users.filter(u => u.role?.toUpperCase() === 'VENDOR' && (u.category || '').toUpperCase() === category.toUpperCase());
        const basePrice = categoryVendors.length > 0 
            ? Math.min(...categoryVendors.map(u => u.starting_price || u.startingPrice || 999999)) 
            : 0;

        const newSlot = {
            id: 'slot_' + Math.random().toString(36).substr(2, 9),
            category: category,
            budget: amount,
            basePrice: basePrice,
            occupiedBy: null,
            vendorName: null
        };

        const updatedProjects = projects.map(p => {
            if (p.id === projectId) {
                const newSlots = [...(p.serviceSlots || []), newSlot];
                return { 
                    ...p, 
                    serviceSlots: newSlots,
                    totalSupplierCost: newSlots.reduce((acc, s) => acc + (s.budget || 0), 0)
                };
            }
            return p;
        });

        setProjects(updatedProjects);
        setShowServiceSlotForm(false);
        setNewSlotForm({ category: 'PHOTOGRAPHY', budget: '' });
        showNotification(`${category} slot added to project!`, 'success');
    };

    const handleRemoveServiceSlot = (projectId, slotId) => {
        const updatedProjects = projects.map(p => {
            if (p.id === projectId) {
                return { ...p, serviceSlots: (p.serviceSlots || []).filter(s => s.id !== slotId) };
            }
            return p;
        });
        setProjects(updatedProjects);
        showNotification('Service slot removed, Abe.', 'info');
    };

    // Calculate total commissions (1% of each project price)
    const totalCommissions = myBookings.reduce((acc, b) => {
        if (['paid', 'released', 'completed'].includes(b.status)) {
            return acc + (b.price * 0.01);
        }
        return acc;
    }, 0);

    const handleWithdraw = () => {
        const amount = parseFloat(withdrawAmount);
        if (isNaN(amount) || amount <= 0) {
            showNotification('Abe, paki-input ang tamang halaga!', 'error');
            return;
        }
        
        // Strict Restriction: Only Affiliate Commission (1%) is withdrawable.
        // Project Budget is strictly for suppliers and remains in escrow.
        const withdrawableBalance = user.commissionBalance || totalCommissions;
        
        if (amount > withdrawableBalance) {
            showNotification('Abe, ang pwede mo lang i-withdraw ay ang iyong Affiliate Commission (1%). Ang Project Budget ay hindi pwedeng galawin!', 'error');
            return;
        }
        showNotification(`Withdrawal of ₱${amount.toLocaleString()} requested from Affiliate Commission! Wait for Admin approval, Abe.`, 'success');
        setWithdrawAmount('');
    };

    return (
        <div className="min-h-screen bg-white font-sans selection:bg-indigo-100">
            {/* --- ACTIVE PROJECT CONTEXT BAR --- */}
            {activeProject && (
                <div className="bg-indigo-600 text-white px-6 py-2 flex justify-between items-center animate-in slide-in-from-top duration-500">
                    <div className="flex items-center gap-4">
                        <span className="text-[10px] font-black uppercase tracking-widest bg-white/20 px-2 py-0.5 rounded">Active Project</span>
                        <p className="text-sm font-bold tracking-tight">
                            Working on: <span className="italic">{activeProject.name}</span> for <span className="underline decoration-indigo-300 underline-offset-4">{activeProject.clientName}</span>
                        </p>
                    </div>
                    <button 
                        onClick={() => setActiveProjectId(null)}
                        className="text-[10px] font-black uppercase tracking-widest hover:bg-white/10 px-3 py-1 rounded-lg transition-all"
                    >
                        Switch Project
                    </button>
                </div>
            )}

            {/* --- NAVBAR --- */}
            <nav className="bg-white/80 backdrop-blur-lg sticky top-0 z-50 border-b border-gray-100 px-6 h-20 flex items-center">
                <div className="max-w-7xl mx-auto w-full flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <span className="text-2xl font-black text-gray-900 tracking-tighter uppercase">
                            ABE <span className="text-indigo-600 italic">EVENTS</span>
                            <span className="ml-3 text-[10px] bg-indigo-50 text-indigo-600 px-2 py-1 rounded-md tracking-widest font-black uppercase">Agent Portal</span>
                        </span>
                    </div>

                    <div className="flex items-center gap-6">
                        <button 
                            onClick={() => setIsWalletOpen(true)}
                            className="text-right hidden sm:block hover:bg-gray-50 p-2 rounded-xl transition-all cursor-pointer border border-transparent hover:border-indigo-100 group"
                        >
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest group-hover:text-indigo-600">Agent Balance</p>
                            <p className="text-sm font-black text-indigo-600 italic">₱{(user.commissionBalance || totalCommissions).toLocaleString()}</p>
                        </button>
                        <button onClick={onLogout} className="text-[10px] font-black uppercase tracking-widest text-red-500 hover:bg-red-50 px-4 py-2 rounded-xl transition-all">End Session</button>
                    </div>
                </div>
            </nav>

            {/* --- HERO SECTION --- */}
            <div className="pt-20 pb-32 px-6 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-50 via-white to-white relative overflow-hidden">
                <div className="max-w-5xl mx-auto text-center relative z-10">
                    <span className="inline-flex items-center gap-2 py-1.5 px-4 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 text-[10px] font-black tracking-[0.2em] mb-8 uppercase">
                        Multi-Client Management System
                    </span>
                    <h1 className="text-4xl sm:text-6xl font-black mb-8 tracking-tighter text-gray-900 leading-[0.9]">
                        Hello, <span className="text-indigo-600 italic">{user.name}</span>.<br/>
                        Manage <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">Multiple Events.</span>
                    </h1>
                    
                    <button 
                        onClick={() => setShowProjectModal(true)}
                        className="bg-gray-900 text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-xl active:scale-95 flex items-center gap-2 mx-auto"
                    >
                        <span>+</span> New Event Project
                    </button>
                </div>
            </div>

            {/* --- MAIN CONTENT --- */}
            <div className="max-w-7xl mx-auto px-6 -mt-16 pb-24 relative z-20 space-y-8">
                
                {/* UNIFIED PORTFOLIO VIEW */}
                <div className="bg-white rounded-[2.5rem] p-8 shadow-2xl shadow-indigo-100/50 border border-gray-50">
                    <div className="flex justify-between items-center mb-8">
                        <h3 className="text-xl font-black text-gray-900 tracking-tighter italic uppercase">Portfolio</h3>
                        <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full uppercase">{projects.length}</span>
                    </div>

                    {projects.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {projects.map(project => {
                                const projectBookings = myBookings.filter(b => b.projectId === project.id);
                                const actualSpent = projectBookings.reduce((acc, b) => acc + (['paid', 'released', 'completed'].includes(b.status) ? b.price : 0), 0);
                                
                                // Services Progress: Occupied Slots vs Total Defined Slots
                                const totalSlots = (project.serviceSlots || []).length;
                                const occupiedSlots = (project.serviceSlots || []).filter(slot => 
                                    myBookings.some(b => b.projectId === project.id && b.vendorCategory === slot.category && b.price <= slot.budget)
                                ).length;
                                
                                const progress = totalSlots > 0 ? Math.min(Math.round((occupiedSlots / totalSlots) * 100), 100) : 0;
                                const budgetProgress = project.allocatedBudget > 0 ? Math.min(Math.round((actualSpent / project.allocatedBudget) * 100), 100) : 0;
                                
                                return (
                                    <div key={project.id} className={`p-8 rounded-[2rem] border ${activeProjectId === project.id ? 'border-indigo-500 bg-indigo-50/30' : 'border-gray-50 hover:border-indigo-100'} transition-all group flex flex-col`}>
                                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-14 h-14 bg-white shadow-sm rounded-2xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">📂</div>
                                                <div>
                                                    <h4 className="font-black text-gray-900 uppercase italic tracking-tight text-lg">{project.name}</h4>
                                                    <div className="flex items-center gap-2">
                                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Client: {project.clientName}</p>
                                                        {project.approvalStatus === 'APPROVED' && (
                                                            <span className="text-[8px] font-black bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded uppercase">Approved</span>
                                                        )}
                                                        {project.approvalStatus === 'FEEDBACK' && (
                                                            <span className="text-[8px] font-black bg-amber-50 text-amber-600 px-2 py-0.5 rounded uppercase animate-pulse">Feedback</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 gap-6 mb-8 flex-1">
                                            <div className="space-y-2">
                                                <div className="flex justify-between items-end">
                                                    <p className="text-[10px] font-black text-gray-900 uppercase tracking-widest">Services Progress</p>
                                                    <p className="text-sm font-black text-indigo-600 italic">{progress}%</p>
                                                </div>
                                                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                                                    <div 
                                                        className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-1000" 
                                                        style={{ width: `${progress}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                            
                                            <div className="space-y-2">
                                                <div className="flex justify-between items-end">
                                                    <p className="text-[10px] font-black text-gray-900 uppercase tracking-widest">Budget Used</p>
                                                    <p className={`text-sm font-black italic ${budgetProgress > 90 ? 'text-red-500' : 'text-emerald-600'}`}>₱{actualSpent.toLocaleString()} / ₱{(project.allocatedBudget || 0).toLocaleString()}</p>
                                                </div>
                                                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                                                    <div 
                                                        className={`h-full ${budgetProgress > 90 ? 'bg-red-500' : 'bg-emerald-500'} transition-all duration-1000`} 
                                                        style={{ width: `${budgetProgress}%` }}
                                                    ></div>
                                                </div>

                                                {/* Surplus Display */}
                                                {(project.allocatedBudget || 0) > actualSpent && (
                                                    <div className="mt-4 p-4 bg-indigo-50 rounded-2xl border border-indigo-100">
                                                        <div className="flex justify-between items-center mb-1">
                                                            <p className="text-[9px] font-black text-indigo-600 uppercase tracking-widest italic underline decoration-indigo-200">Project Surplus</p>
                                                            <span className="text-[7px] font-black text-white bg-indigo-600 px-1.5 py-0.5 rounded-full uppercase">Refundable</span>
                                                        </div>
                                                        <p className="text-xl font-black text-indigo-900 tracking-tighter italic">₱{((project.allocatedBudget || 0) - actualSpent).toLocaleString()}</p>
                                                        <p className="text-[7px] font-bold text-gray-400 mt-2 leading-tight uppercase italic">
                                                            Note: This amount is refundable to the client and cannot be withdrawn as commission.
                                                        </p>
                                                        {project.refundStatus !== 'REFUNDED' && (
                                                            <button 
                                                                onClick={() => handleReturnSurplusToClient(project.id)}
                                                                className="mt-3 w-full py-2 bg-white text-[8px] font-black text-indigo-600 uppercase tracking-widest rounded-xl border border-indigo-100 hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
                                                            >
                                                                Return Surplus to Client 💸
                                                            </button>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap gap-2 mt-auto">
                                            {activeProjectId !== project.id && (
                                                <button 
                                                    onClick={() => setActiveProjectId(project.id)}
                                                    className="text-[10px] font-black uppercase tracking-widest bg-gray-900 text-white px-4 py-2 rounded-xl hover:bg-indigo-600 transition-all"
                                                >
                                                    Select
                                                </button>
                                            )}
                                            <button 
                                                onClick={() => setSelectedProjectDetailId(project.id)}
                                                className="text-[10px] font-black uppercase tracking-widest bg-indigo-50 text-indigo-600 px-4 py-2 rounded-xl hover:bg-indigo-600 hover:text-white transition-all"
                                            >
                                                Details
                                            </button>
                                            <button 
                                                onClick={() => {
                                                    const hash = btoa(`${project.id}-${user.id}`).substring(0, 10);
                                                    const shareUrl = `${window.location.origin}/view-project/${hash}`;
                                                    navigator.clipboard.writeText(shareUrl);
                                                    showNotification('Shareable link copied to clipboard, Abe!', 'success');
                                                }}
                                                className="text-[10px] font-black uppercase tracking-widest bg-white border border-gray-100 text-gray-400 px-4 py-2 rounded-xl hover:text-indigo-600 hover:border-indigo-100 transition-all flex items-center gap-1"
                                                title="Share with Client"
                                            >
                                                <span>🔗</span> Share
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="py-20 text-center opacity-30">
                            <span className="text-4xl mb-4 block">📁</span>
                            <p className="text-[10px] font-black uppercase tracking-widest">No projects in portfolio yet, Abe.</p>
                            <button 
                                onClick={() => setShowProjectModal(true)}
                                className="mt-6 text-[10px] font-black text-indigo-600 border-b-2 border-indigo-600 pb-1 uppercase tracking-widest"
                            >
                                Create your first project
                            </button>
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* PROJECT DETAILS SECTION */}
                    <div className="lg:col-span-12">
                        {selectedProjectForDetail ? (
                            <div className="bg-white rounded-[2.5rem] p-8 shadow-2xl shadow-indigo-100 border-2 border-indigo-600 animate-in zoom-in duration-500 relative overflow-hidden h-full">
                                <button 
                                    onClick={() => setSelectedProjectDetailId(null)}
                                    className="absolute top-6 right-8 text-gray-400 hover:text-indigo-600 font-black text-xs uppercase tracking-widest"
                                >
                                    ✕
                                </button>

                                <div className="mb-8">
                                    <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full uppercase tracking-widest italic">Project details</span>
                                    <h3 className="text-2xl font-black text-gray-900 tracking-tighter italic uppercase mt-4 leading-none">
                                        {selectedProjectForDetail.name}
                                    </h3>
                                    <div className="flex gap-8 mt-6">
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                            Target Date: <span className="text-gray-900 italic font-black">{selectedProjectForDetail.targetDate || 'TBA'}</span>
                                        </p>
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                            Client: <span className="text-gray-900 italic font-black">{selectedProjectForDetail.clientName}</span>
                                        </p>
                                    </div>
                                    {selectedProjectForDetail.clientFeedback && (
                                        <div className="mt-6 p-4 bg-amber-50 border-l-4 border-amber-400 rounded-r-xl">
                                            <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-1">Client Feedback:</p>
                                            <p className="text-sm font-bold text-gray-900 italic">"{selectedProjectForDetail.clientFeedback}"</p>
                                        </div>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                                    {/* DYNAMIC SERVICE SLOTS */}
                                    {(selectedProjectForDetail.serviceSlots || []).map(slot => {
                                        const booking = myBookings.find(b => b.projectId === selectedProjectForDetail.id && b.vendorCategory === slot.category && b.price <= slot.budget);
                                        
                                        return (
                                            <div key={slot.id} className="bg-white border-2 border-gray-50 rounded-2xl p-4 hover:border-indigo-100 transition-all group relative">
                                                <button 
                                                    onClick={() => handleRemoveServiceSlot(selectedProjectForDetail.id, slot.id)}
                                                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-50 text-red-500 rounded-full flex items-center justify-center text-[10px] opacity-0 group-hover:opacity-100 transition-all shadow-sm z-10"
                                                >
                                                    ✕
                                                </button>
                                                <div className="flex justify-between items-center mb-3">
                                                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{slot.category}</p>
                                                    {booking && <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest bg-emerald-50 px-2 py-0.5 rounded">Secured</span>}
                                                </div>
                                                {booking ? (
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center text-lg shadow-sm">👤</div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-[10px] font-black text-gray-900 uppercase truncate">{booking.vendorName}</p>
                                                            <p className="text-[9px] font-bold text-indigo-600 uppercase tracking-widest mt-0.5">₱{(booking.price || 0).toLocaleString()}</p>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="space-y-3">
                                                        <p className="text-[10px] font-bold text-gray-900 italic">Budget: ₱{(slot.budget || 0).toLocaleString()}</p>
                                                        <button 
                                                            onClick={() => {
                                                                setActiveProjectId(selectedProjectForDetail.id);
                                                                onFindSuppliers(slot.category);
                                                                showNotification(`Searching for ${slot.category} within ₱${(slot.budget || 0).toLocaleString()}...`, 'success');
                                                            }}
                                                            className="w-full py-3 bg-indigo-600 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-gray-900 transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-100"
                                                        >
                                                            <span>🔍</span> Find Matches
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}

                                    {/* ADD NEW SERVICE SLOT BUTTON */}
                                    {!showServiceSlotForm ? (
                                        <button 
                                            onClick={() => setShowServiceSlotForm(true)}
                                            className="border-2 border-dashed border-gray-100 rounded-2xl p-8 flex flex-col items-center justify-center gap-2 hover:border-indigo-600 hover:bg-indigo-50 transition-all group min-h-[140px]"
                                        >
                                            <span className="text-2xl group-hover:scale-125 transition-transform">➕</span>
                                            <p className="text-[10px] font-black text-gray-400 group-hover:text-indigo-600 uppercase tracking-widest">Define Service Needed</p>
                                        </button>
                                    ) : (
                                        <div className="bg-indigo-50 border-2 border-indigo-200 rounded-2xl p-4 animate-in zoom-in-95 duration-200">
                                            <p className="text-[9px] font-black text-indigo-600 uppercase tracking-widest mb-3 italic">New Service Slot</p>
                                            <div className="space-y-3">
                                                <select 
                                                    value={newSlotForm.category}
                                                    onChange={(e) => setNewSlotForm({...newSlotForm, category: e.target.value})}
                                                    className="w-full bg-white border-none rounded-xl px-3 py-2 text-[10px] font-black uppercase outline-none"
                                                >
                                                    <option value="PHOTOGRAPHY">Photography</option>
                                                    <option value="VIDEOGRAPHY">Videography</option>
                                                    <option value="VENUE">Venue</option>
                                                    <option value="CATERING">Catering</option>
                                                    <option value="HOST">Host/MC</option>
                                                    <option value="SOUNDS_AND_LIGHTS">Sounds & Lights</option>
                                                </select>
                                                <div className="relative">
                                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-black text-gray-400">₱</span>
                                                    <input 
                                                        type="number" 
                                                        placeholder="Budget"
                                                        value={newSlotForm.budget}
                                                        onChange={(e) => setNewSlotForm({...newSlotForm, budget: e.target.value})}
                                                        className="w-full bg-white border-none rounded-xl pl-8 pr-3 py-2 text-[10px] font-black outline-none"
                                                    />
                                                </div>
                                                <div className="flex gap-2">
                                                    <button 
                                                        onClick={() => handleAddServiceSlot(selectedProjectForDetail.id, newSlotForm.category, newSlotForm.budget)}
                                                        className="flex-1 bg-indigo-600 text-white py-2 rounded-lg text-[9px] font-black uppercase"
                                                    >
                                                        Add Slot
                                                    </button>
                                                    <button 
                                                        onClick={() => setShowServiceSlotForm(false)}
                                                        className="px-3 bg-white text-gray-400 py-2 rounded-lg text-[9px] font-black uppercase"
                                                    >
                                                        ✕
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="pt-6 border-t border-gray-50">
                                    {(() => {
                                        const projectBookings = myBookings.filter(b => b.projectId === selectedProjectForDetail.id);
                                        const currentSpent = projectBookings.reduce((acc, b) => acc + b.price, 0);
                                        const totalBudget = selectedProjectForDetail.allocatedBudget || 0;
                                        
                                        // Dynamic Logic: Sum of Individual Service Budgets
                                        const sumOfServiceBudgets = (selectedProjectForDetail.serviceSlots || []).reduce((acc, s) => acc + s.budget, 0);
                                        const isOverBudget = sumOfServiceBudgets > totalBudget;
                                        
                                        const budgetPercent = totalBudget > 0 ? Math.min(Math.round((sumOfServiceBudgets / totalBudget) * 100), 100) : 0;
                                        
                                        return (
                                            <>
                                                <div className="flex justify-between items-end mb-3">
                                                    <div>
                                                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Budget Allocation Progress</p>
                                                        {isOverBudget && (
                                                            <p className="text-[8px] font-black text-red-500 uppercase tracking-widest animate-pulse mt-1">⚠️ Warning: Service budgets exceed total budget!</p>
                                                        )}
                                                    </div>
                                                    <p className={`text-xs font-black italic tracking-tighter ${isOverBudget ? 'text-red-500' : 'text-gray-900'}`}>
                                                        Sum: ₱{(sumOfServiceBudgets || 0).toLocaleString()} / Total: ₱{(totalBudget || 0).toLocaleString()}
                                                    </p>
                                                </div>
                                                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden p-0.5 shadow-inner">
                                                    <div 
                                                        className={`h-full rounded-full transition-all duration-1000 ${isOverBudget ? 'bg-red-500' : 'bg-gradient-to-r from-indigo-500 to-purple-500'}`}
                                                        style={{ width: `${budgetPercent}%` }}
                                                    ></div>
                                                </div>

                                                {/* Audit Trail Section */}
                                                <div className="mt-8 pt-8 border-t border-gray-100">
                                                    <h4 className="text-[10px] font-black text-gray-900 uppercase tracking-[0.2em] mb-4 italic">Project Audit Trail</h4>
                                                    <div className="space-y-3">
                                                        {(selectedProjectForDetail.auditTrail || []).length > 0 ? (
                                                            [...(selectedProjectForDetail.auditTrail)].reverse().map((entry, idx) => (
                                                                <div key={entry.id || idx} className="bg-gray-50 p-4 rounded-2xl border border-gray-100 flex justify-between items-center group hover:bg-white transition-all">
                                                                    <div className="flex gap-4 items-center">
                                                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs shadow-sm ${
                                                                            entry.type === 'SUPPLIER_PAYMENT' ? 'bg-indigo-50 text-indigo-600' : 
                                                                            entry.type === 'COMMISSION' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                                                                        }`}>
                                                                            {entry.type === 'SUPPLIER_PAYMENT' ? '💸' : entry.type === 'COMMISSION' ? '💰' : '↩️'}
                                                                        </div>
                                                                        <div>
                                                                            <p className="text-[10px] font-black text-gray-900 uppercase tracking-tight">{entry.description}</p>
                                                                            <p className="text-[8px] font-medium text-gray-400 uppercase">{new Date(entry.timestamp).toLocaleString()}</p>
                                                                        </div>
                                                                    </div>
                                                                    <p className="text-sm font-black italic tracking-tighter text-gray-900">
                                                                        ₱{entry.amount?.toLocaleString()}
                                                                    </p>
                                                                </div>
                                                            ))
                                                        ) : (
                                                            <div className="text-center py-6 opacity-30 italic text-[10px] font-black uppercase tracking-widest">No transaction records yet.</div>
                                                        )}
                                                    </div>
                                                </div>
                                            </>
                                        );
                                    })()}
                                </div>
                            </div>
                        ) : (
                            <div className="bg-white rounded-[2.5rem] p-8 shadow-xl border border-gray-50 flex flex-col items-center justify-center text-center py-20 opacity-30 h-full">
                                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-2xl mb-4">📊</div>
                                <h3 className="text-sm font-black text-gray-900 tracking-tighter italic uppercase">Select Project</h3>
                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-2 max-w-[120px] mx-auto">
                                    Detailed insights will appear here when you select a project.
                                </p>
                            </div>
                        )}
                    </div>

                </div>
            </div>

            {/* --- PROJECT ARCHITECT MODAL --- */}
            {showProjectModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                    <div className="absolute inset-0 bg-gray-950/60 backdrop-blur-md" onClick={() => { setShowProjectModal(false); setModalStep('setup'); }}></div>
                    <div className="bg-white w-full max-w-5xl rounded-[3rem] p-10 relative z-10 shadow-2xl animate-in zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto">
                        
                        {modalStep === 'setup' ? (
                            <>
                                <div className="flex justify-between items-start mb-8">
                                    <div>
                                        <h3 className="text-3xl font-black text-gray-900 tracking-tighter italic uppercase leading-none">Smart Project Architect</h3>
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-2">Design your event team with AI assistance, Abe!</p>
                                    </div>
                                    <button onClick={() => setShowProjectModal(false)} className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:text-red-500 transition-all">✕</button>
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                                    <div className="lg:col-span-6 space-y-6">
                                        <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100">
                                            <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-4 italic">Step 1: Project Basics</p>
                                            <div className="space-y-4">
                                                <input 
                                                    type="text" 
                                                    placeholder="Project Name (e.g. Santos Wedding)"
                                                    value={projectForm.name}
                                                    onChange={(e) => setProjectForm({...projectForm, name: e.target.value})}
                                                    className="w-full bg-white border-2 border-transparent focus:border-indigo-500 rounded-xl px-4 py-3 font-bold text-sm outline-none transition-all shadow-sm"
                                                />
                                                <input 
                                                    type="text" 
                                                    placeholder="Client Name"
                                                    value={projectForm.clientName}
                                                    onChange={(e) => setProjectForm({...projectForm, clientName: e.target.value})}
                                                    className="w-full bg-white border-2 border-transparent focus:border-indigo-500 rounded-xl px-4 py-3 font-bold text-sm outline-none transition-all shadow-sm"
                                                />
                                                <div className="grid grid-cols-2 gap-4">
                                                    <input 
                                                        type="date" 
                                                        value={projectForm.targetDate}
                                                        onChange={(e) => setProjectForm({...projectForm, targetDate: e.target.value})}
                                                        className="w-full bg-white border-2 border-transparent focus:border-indigo-500 rounded-xl px-4 py-3 font-bold text-sm outline-none transition-all shadow-sm"
                                                    />
                                                    <div className="relative">
                                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-black">₱</span>
                                                        <input 
                                                            type="number" 
                                                            placeholder="Total Budget"
                                                            value={projectForm.allocatedBudget}
                                                            onChange={(e) => setProjectForm({...projectForm, allocatedBudget: parseFloat(e.target.value) || 0})}
                                                            className="w-full bg-white border-2 border-transparent focus:border-indigo-500 rounded-xl pl-8 pr-4 py-3 font-bold text-sm outline-none transition-all shadow-sm"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="bg-indigo-600 p-8 rounded-[2rem] text-white shadow-xl shadow-indigo-100 relative overflow-hidden">
                                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                                            <h4 className="text-lg font-black italic uppercase tracking-tighter mb-4">Architect Tip</h4>
                                            <p className="text-[10px] font-medium text-indigo-100 leading-relaxed italic">
                                                Abe, piliin mo lang ang mga serbisyo na kailangan ni client. Ang aming Auto-Match engine ang maghahanap ng pinakamagandang suppliers na pasok sa iyong budget allocation!
                                            </p>
                                        </div>
                                    </div>

                                    <div className="lg:col-span-6">
                                        <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100 h-full">
                                            <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-6 italic">Step 2: Select Services Needed</p>
                                            <div className="grid grid-cols-2 gap-3">
                                                {categories.map(cat => (
                                                    <button
                                                        key={cat.id}
                                                        onClick={() => {
                                                            const isSelected = projectForm.selectedServices.includes(cat.id);
                                                            setProjectForm({
                                                                ...projectForm,
                                                                selectedServices: isSelected 
                                                                    ? projectForm.selectedServices.filter(id => id !== cat.id)
                                                                    : [...projectForm.selectedServices, cat.id]
                                                            });
                                                        }}
                                                        className={`p-4 rounded-2xl border-2 transition-all flex items-center gap-3 text-left ${
                                                            projectForm.selectedServices.includes(cat.id)
                                                                ? 'border-indigo-600 bg-white shadow-md'
                                                                : 'border-transparent bg-white/50 hover:bg-white hover:border-indigo-100'
                                                        }`}
                                                    >
                                                        <span className="text-2xl">{cat.icon}</span>
                                                        <div>
                                                            <p className="text-[10px] font-black text-gray-900 uppercase leading-none">{cat.label}</p>
                                                            {projectForm.selectedServices.includes(cat.id) && (
                                                                <span className="text-[8px] font-black text-indigo-600 uppercase tracking-widest">Selected</span>
                                                            )}
                                                        </div>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-10 flex justify-end">
                                    <button 
                                        onClick={handleArchitectAnalysis}
                                        className="bg-gray-900 text-white px-10 py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-xl active:scale-95 flex items-center gap-2"
                                    >
                                        Analyze & Match, Abe! 🚀
                                    </button>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="flex justify-between items-start mb-8">
                                    <div>
                                        <button 
                                            onClick={() => setModalStep('setup')}
                                            className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-2 flex items-center gap-1 hover:underline"
                                        >
                                            ← Back to Setup
                                        </button>
                                        <h3 className="text-3xl font-black text-gray-900 tracking-tighter italic uppercase leading-none">Review Team Proposal</h3>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Client Budget</p>
                                        <p className="text-2xl font-black text-indigo-600 italic">₱{projectForm.allocatedBudget.toLocaleString()}</p>
                                    </div>
                                </div>

                                <div className="space-y-4 mb-10">
                                    {architectResults.map((res, idx) => (
                                        <div key={idx} className="bg-gray-50 rounded-[2rem] p-6 border border-gray-100 flex flex-wrap items-center justify-between gap-6 hover:border-indigo-200 transition-all group">
                                            <div className="flex items-center gap-6">
                                                <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center text-3xl">{res.icon}</div>
                                                <div>
                                                    <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-1">{res.label}</p>
                                                    {res.match ? (
                                                        <div>
                                                            <h4 className="font-black text-gray-900 uppercase italic tracking-tight text-lg leading-none">{res.match.name}</h4>
                                                            <div className="flex items-center gap-2 mt-1">
                                                                <span className="text-amber-400 text-xs">★</span>
                                                                <span className="text-[10px] font-black text-gray-400">{res.match.rating || 'New'} Vendor</span>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="max-w-[200px]">
                                                            <h4 className="font-black text-red-400 uppercase italic tracking-tight text-lg leading-none">No Match Found</h4>
                                                            <p className="text-[8px] font-bold text-red-400 mt-1 leading-tight">
                                                                Abe, masyadong mababa ang budget para sa category na ito. Try increasing the allocation.
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-8">
                                                <div className="text-right">
                                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Supplier Price</p>
                                                    <p className="text-lg font-black text-gray-900 italic">₱{(res.match ? (res.match.starting_price || 0) : 0).toLocaleString()}</p>
                                                </div>
                                                <div className="h-10 w-px bg-gray-200"></div>
                                                <div className="text-right">
                                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Allocated</p>
                                                    <p className="text-lg font-black text-indigo-300 italic">₱{Math.round(res.allocatedBudget).toLocaleString()}</p>
                                                </div>
                                                <button 
                                                    className="w-10 h-10 rounded-xl bg-white text-gray-400 flex items-center justify-center hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
                                                    title="Review Inclusions"
                                                    onClick={() => {
                                                        if (res.match) {
                                                            alert(`Inclusions for ${res.match.name}:\n${res.match.bio || 'Professional service with full inclusions.'}`);
                                                        } else {
                                                            alert('Abe, kailangan nating mag-search manually para sa slot na ito.');
                                                        }
                                                    }}
                                                >
                                                    📄
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="bg-gray-900 rounded-[2.5rem] p-8 text-white flex flex-col sm:flex-row justify-between items-center gap-8">
                                    <div className="flex gap-10">
                                        <div>
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Calculated Total</p>
                                            <p className="text-3xl font-black italic tracking-tighter">
                                                ₱{architectResults.reduce((acc, r) => acc + (r.match ? (r.match.starting_price || 0) : 0), 0).toLocaleString()}
                                            </p>
                                        </div>
                                        <div className="flex items-center">
                                            <span className="text-2xl font-black text-gray-700">VS</span>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Target Budget</p>
                                            <p className="text-3xl font-black italic tracking-tighter text-indigo-400">
                                                ₱{projectForm.allocatedBudget.toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
                                    
                                    <button 
                                        onClick={handleCreateProject}
                                        className="bg-indigo-600 text-white px-10 py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-white hover:text-indigo-600 transition-all shadow-xl active:scale-95"
                                    >
                                        Finalize & Assemble Team, Abe!
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* --- WALLET MODAL --- */}
            {isWalletOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                    <div className="absolute inset-0 bg-gray-950/60 backdrop-blur-xl" onClick={() => setIsWalletOpen(false)}></div>
                    <div className="bg-gray-900 text-white w-full max-w-lg rounded-[3rem] p-10 relative z-10 shadow-[0_35px_60px_-15px_rgba(0,0,0,0.3)] animate-in zoom-in-95 duration-300 overflow-hidden">
                        {/* Decorative Background Element */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
                        
                        <div className="flex justify-between items-start mb-10 relative z-10">
                            <div className="flex-1">
                                <h3 className="text-3xl font-black italic uppercase tracking-tighter leading-none mb-6">Agent Wallet</h3>
                                
                                <div className="space-y-4 pr-4">
                                    <div className="bg-white/5 p-6 rounded-[2rem] border border-white/10">
                                        <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-2 italic">Withdrawable Balance</p>
                                        <div className="flex justify-between items-end">
                                            <div>
                                                <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest leading-none mb-1">Affiliate Commissions (1%)</p>
                                                <p className="text-3xl font-black text-white italic">₱{(user.commissionBalance || totalCommissions).toLocaleString()}</p>
                                            </div>
                                            <span className="text-[8px] font-black text-indigo-400 bg-indigo-400/10 px-2 py-1 rounded-full uppercase">Commissions Only</span>
                                        </div>
                                    </div>

                                    <div className="bg-white/5 p-6 rounded-[2rem] border border-white/10 opacity-60">
                                        <p className="text-[10px] font-black text-amber-400 uppercase tracking-widest mb-2 italic">Restricted Escrow Funds</p>
                                        <div className="flex justify-between items-end">
                                            <div>
                                                <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest leading-none mb-1">Active Projects Budget</p>
                                                <p className="text-2xl font-black text-gray-400 italic">₱{projects.reduce((acc, p) => acc + (p.allocatedBudget || 0), 0).toLocaleString()}</p>
                                            </div>
                                            <span className="text-[8px] font-black text-red-400 bg-red-400/10 px-2 py-1 rounded-full uppercase">Non-Withdrawable</span>
                                        </div>
                                        <p className="text-[8px] font-bold text-gray-500 mt-4 leading-relaxed italic">
                                            Note: The Project Budget is strictly for suppliers and remains in Smart Escrow.
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <button 
                                onClick={() => setIsWalletOpen(false)}
                                className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center hover:bg-white/10 transition-all border border-white/10 group mt-1"
                            >
                                <span className="text-gray-400 group-hover:text-white transition-colors">✕</span>
                            </button>
                        </div>

                        <div className="mb-12 relative z-10">
                            <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Withdrawable Balance</span>
                            <h2 className="text-6xl font-black tracking-tighter italic mt-4 text-white">
                                ₱{(user.commissionBalance || totalCommissions).toLocaleString()}
                            </h2>
                        </div>

                        {/* ESTIMATED COMMISSION DISPLAY */}
                        <div className="mb-10 p-8 bg-white/5 border border-white/10 rounded-[2rem] relative z-10">
                            <div className="flex justify-between items-center mb-4">
                                <span className="text-[10px] font-black text-indigo-300 uppercase tracking-widest">Potential Commissions</span>
                                <span className="text-[8px] font-black bg-indigo-500 text-white px-2 py-0.5 rounded tracking-widest">PROJECTION</span>
                            </div>
                            <h4 className="text-3xl font-black text-white italic tracking-tighter leading-none">
                                ₱{projects.reduce((acc, proj) => acc + ((proj.allocatedBudget || 0) * 0.01), 0).toLocaleString()}
                            </h4>
                            <p className="text-[10px] font-bold text-gray-400 mt-4 leading-relaxed">
                                Estimated Commission if all projects are fully booked In-App. 
                                <span className="text-amber-400 block mt-1">⚠️ Mawawala ito kung hindi dadaan sa Escrow, Abe!</span>
                            </p>
                        </div>

                        <div className="space-y-6 relative z-10">
                            <div className="relative">
                                <span className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 font-black text-lg">₱</span>
                                <input 
                                    type="number" 
                                    placeholder="Enter Amount to Withdraw"
                                    value={withdrawAmount}
                                    onChange={(e) => setWithdrawAmount(e.target.value)}
                                    className="w-full bg-white/5 border-2 border-white/10 rounded-[1.5rem] py-5 pl-12 pr-6 text-lg font-bold focus:outline-none focus:border-indigo-500 transition-all placeholder:text-gray-600"
                                />
                            </div>
                            <button 
                                onClick={handleWithdraw}
                                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-6 rounded-[1.5rem] font-black text-xs uppercase tracking-[0.2em] transition-all shadow-2xl shadow-indigo-900/20 active:scale-[0.98]"
                            >
                                Withdraw Commissions
                            </button>
                        </div>

                        {/* QUICK GUIDE INSIDE WALLET */}
                        <div className="mt-10 pt-10 border-t border-white/5 space-y-4 relative z-10">
                            <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] mb-4">Quick Guide & Policy</p>
                            <div className="grid grid-cols-1 gap-4">
                                <div className="flex gap-4 items-start">
                                    <span className="w-6 h-6 rounded-lg bg-white/5 text-indigo-400 flex items-center justify-center text-[10px] font-black shrink-0 border border-white/10">1</span>
                                    <p className="text-[10px] font-bold text-gray-400 leading-relaxed">Gamitin ang iyong <span className="text-white">Active Project</span> sa pag-book ng suppliers para ma-attribute ang commission.</p>
                                </div>
                                <div className="flex gap-4 items-start">
                                    <span className="w-6 h-6 rounded-lg bg-white/5 text-indigo-400 flex items-center justify-center text-[10px] font-black shrink-0 border border-white/10">2</span>
                                    <p className="text-[10px] font-bold text-gray-400 leading-relaxed">Ang <span className="text-white">1% Affiliate Commission</span> ay awtomatikong papasok sa wallet matapos ang full payment ng client.</p>
                                </div>
                                <div className="flex gap-4 items-start">
                                    <span className="w-6 h-6 rounded-lg bg-white/5 text-indigo-400 flex items-center justify-center text-[10px] font-black shrink-0 border border-white/10">3</span>
                                    <p className="text-[10px] font-bold text-gray-400 leading-relaxed">Siguraduhin na ang transaksyon ay dumaan sa <span className="text-indigo-400">Smart Escrow</span> para sa iyong proteksyon, Abe!</p>
                                </div>
                            </div>
                        </div>
                        
                        <p className="text-[8px] font-black text-gray-600 uppercase tracking-widest mt-10 text-center relative z-10">
                            Abe Events & Smart Escrow Protection System
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AgentDashboard;
