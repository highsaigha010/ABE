import React, { useState } from 'react';

const VendorDashboard = ({ user, onLogout, bookings, onUpdateStatus }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const currentJob = bookings[0];

  // STATE: Pera at Withdrawal Logic
  const [balance, setBalance] = useState(150000);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false); // Para sa Popup
  const [selectedMethod, setSelectedMethod] = useState('gcash');   // Default selection
  const [isProcessing, setIsProcessing] = useState(false);         // Loading state

  // BANK OPTIONS (Mock Data)
  const payoutMethods = [
    { id: 'gcash', name: 'GCash E-Wallet', icon: '🔵', fee: 'Free' },
    { id: 'maya', name: 'Maya Wallet', icon: '🟢', fee: 'Free' },
    { id: 'bdo', name: 'BDO Unibank', icon: '🏦', fee: '₱15.00' },
    { id: 'bpi', name: 'BPI Express', icon: '🔴', fee: '₱15.00' },
  ];

  // STEP 1: Buksan ang Modal
  const handleOpenWithdraw = () => {
    if (balance <= 0) {
      alert("No funds available to withdraw.");
      return;
    }
    setShowWithdrawModal(true);
  };

  // STEP 2: Process the Transfer
  const handleConfirmTransfer = () => {
    const amount = 50000; // Mock amount

    if (balance < amount) return;

    setIsProcessing(true); // Start spinner

    // Simulate Bank Delay (2.5 seconds)
    setTimeout(() => {
      setBalance(prev => prev - amount);
      setIsProcessing(false);
      setShowWithdrawModal(false); // Close Modal

      // Show Success Alert with Details
      const method = payoutMethods.find(m => m.id === selectedMethod);
      alert(`✅ TRANSFER SUCCESSFUL!\n\nSent ₱${amount.toLocaleString()} to ${method.name}.\nReference: TR-${Math.floor(Math.random()*100000)}`);
    }, 2500);
  };

  // Baguhin natin ito para maging specific sa Escrow API call
  const handleMarkComplete = async () => {
    if (confirm("Confirm event delivery? This notifies the client to release funds.")) {
      setIsProcessing(true); // Eto yung bubuhay sa spinner sa baba (the Authorization button)

      try {
        // TAWAG NA SA API SIMULATOR NATIN SA APP.JSX
        const response = await onUpdateStatus(currentJob.id, 'COMPLETE');

        if (response.success) {
          alert("✅ SUCCESS: Event marked as Completed. Notification sent to Client!");
        }
      } catch (error) {
        alert("❌ ERROR: Smart Escrow server is busy. Please try again.");
      } finally {
        setIsProcessing(false); // Patay na ang spinner
      }
    }
  };

  return (
      <div className="min-h-screen bg-white font-sans selection:bg-indigo-100">

        {/* --- NAVBAR --- */}
        <nav className="bg-white/80 backdrop-blur-lg sticky top-0 z-50 border-b border-gray-100 px-6 h-20 flex items-center">
          <div className="max-w-7xl mx-auto w-full flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-black text-gray-900 tracking-tighter uppercase">
                ABE <span className="text-indigo-600 italic">EVENTS</span>
                <span className="ml-3 text-[10px] bg-indigo-50 text-indigo-600 px-2 py-1 rounded-md tracking-widest font-black uppercase hidden sm:inline-block">Vendor Portal</span>
              </span>
            </div>

            <div className="hidden md:flex items-center gap-8">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
                Partner <span className="text-gray-900 ml-2">{user?.name || 'Supplier'}</span>
              </span>
              <div className="h-4 w-px bg-gray-100"></div>
              <button
                  onClick={onLogout}
                  className="text-[10px] font-black uppercase tracking-[0.2em] text-red-500 hover:text-white hover:bg-red-500 border border-red-100 px-5 py-2.5 rounded-xl transition-all active:scale-95"
              >
                Log Out
              </button>
            </div>

            {/* Mobile Menu Toggle */}
            <button 
                className="md:hidden p-2 text-gray-900 focus:outline-none"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {isMenuOpen ? (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    ) : (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
                    )}
                </svg>
            </button>
          </div>

          {/* Mobile Menu Overlay */}
          {isMenuOpen && (
              <div className="md:hidden bg-white border-b border-gray-100 absolute top-20 left-0 w-full p-6 space-y-4 shadow-xl animate-in fade-in slide-in-from-top-4 duration-300 z-50">
                  <div className="py-3 border-b border-gray-50">
                      <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Partner</p>
                      <p className="text-sm font-bold text-gray-900 mt-1">{user?.name || 'Supplier'}</p>
                      <span className="mt-2 inline-block text-[8px] bg-indigo-50 text-indigo-600 px-2 py-1 rounded-md tracking-widest font-black uppercase">Vendor Portal</span>
                  </div>
                  <button
                      onClick={onLogout}
                      className="w-full bg-red-50 text-red-600 px-6 py-4 rounded-xl font-black text-xs uppercase tracking-[0.2em] transition-all text-center"
                  >
                      Log Out
                  </button>
              </div>
          )}
        </nav>

        <div className="max-w-6xl mx-auto p-6 md:p-12">
          <div className="mb-12 text-center md:text-left">
            <h3 className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.3em] mb-2">Performance Analytics</h3>
            <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tighter">Vendor Dashboard</h1>
            <p className="text-gray-400 font-medium mt-2 text-sm md:text-base">Manage your professional bookings and secure payouts.</p>
          </div>

          {/* STATS ROW */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">

            {/* DARK CARD: EARNINGS */}
            <div className="bg-gray-900 p-8 sm:p-10 rounded-[2.5rem] shadow-2xl shadow-gray-200 text-white relative overflow-hidden group">
              <div className="relative z-10">
                <p className="text-indigo-400 text-[10px] font-black uppercase tracking-[0.2em] mb-4">Available Balance</p>
                <p className="text-4xl sm:text-5xl font-black tracking-tighter italic mb-8 sm:mb-10">₱{balance.toLocaleString()}</p>

                <button
                    onClick={handleOpenWithdraw}
                    className="w-full py-4 sm:py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] bg-white text-gray-900 hover:bg-indigo-50 shadow-xl transition-all transform hover:-translate-y-1 active:scale-95"
                >
                  Withdraw Funds
                </button>
              </div>
              <div className="absolute -top-24 -right-24 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl group-hover:bg-indigo-500/20 transition-colors"></div>
            </div>

            {/* YELLOW CARD: ESCROW */}
            <div className={`p-8 sm:p-10 rounded-[2.5rem] shadow-xl border-2 transition-all duration-500 flex flex-col justify-between relative overflow-hidden
                ${currentJob.status === 'paid' ? 'bg-amber-50 border-amber-200' : 'bg-white border-gray-50 opacity-60'}`}>
              <div>
                <p className={`text-[10px] font-black uppercase tracking-[0.2em] ${currentJob.status === 'paid' ? 'text-amber-600' : 'text-gray-400'}`}>
                  Funds in Escrow
                </p>
                <p className={`text-4xl font-black tracking-tighter mt-4 ${currentJob.status === 'paid' ? 'text-gray-900' : 'text-gray-200'}`}>
                  {currentJob.status === 'paid' ? `₱${currentJob.price.toLocaleString()}` : '₱0.00'}
                </p>
              </div>
              {currentJob.status === 'paid' && (
                <div className="mt-8 flex items-center gap-2">
                  <span className="text-xl">🔒</span>
                  <span className="text-[10px] font-black text-amber-700 uppercase tracking-widest">Smart Escrow Locked</span>
                </div>
              )}
               <div className="absolute top-0 right-0 p-8 text-4xl opacity-10">🛡️</div>
            </div>

            {/* WHITE CARD: COMPLETED */}
            <div className="bg-white p-8 sm:p-10 rounded-[2.5rem] shadow-xl border border-gray-50 flex flex-col justify-between">
              <div>
                <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.2em]">Total Deliveries</p>
                <h3 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tighter mt-4">12</h3>
              </div>
              <div className="mt-8">
                <span className="bg-green-50 text-green-600 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-green-100">
                    +2 New Reviews
                </span>
              </div>
            </div>
          </div>

          {/* ACTIVE JOB SECTION - Updated for responsiveness */}
          <div className="flex justify-between items-end mb-8">
            <div>
                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Operational Flow</h3>
                <h2 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tighter mt-2">Active Bookings</h2>
            </div>
          </div>
          
          <div className="bg-white rounded-[2rem] sm:rounded-[2.5rem] shadow-2xl shadow-gray-100/50 overflow-x-auto border border-gray-50">
            <table className="w-full text-left min-w-[600px]">
              <thead className="bg-gray-50/50 text-[10px] text-gray-400 uppercase tracking-[0.2em] border-b border-gray-50">
              <tr>
                <th className="px-6 sm:px-10 py-6 font-black">Client Details</th>
                <th className="px-6 sm:px-10 py-6 font-black">Escrow Status</th>
                <th className="px-6 sm:px-10 py-6 font-black text-right">Action</th>
              </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
              <tr className="hover:bg-indigo-50/30 transition-colors">
                <td className="px-6 sm:px-10 py-8">
                  <p className="font-black text-gray-900 text-base sm:text-lg tracking-tight">{currentJob.clientName}</p>
                  <p className="text-[10px] sm:text-xs text-indigo-600 font-bold uppercase tracking-widest mt-1">{currentJob.date}</p>
                </td>
                <td className="px-6 sm:px-10 py-8">
                  {currentJob.status === 'unpaid' && (
                      <span className="bg-gray-100 text-gray-500 px-3 sm:px-4 py-1.5 rounded-full text-[8px] sm:text-[10px] font-black uppercase tracking-widest border border-gray-200">
                        ⏳ Awaiting Payment
                      </span>
                  )}
                  {currentJob.status === 'paid' && (
                      <span className="bg-amber-100 text-amber-700 px-3 sm:px-4 py-1.5 rounded-full text-[8px] sm:text-[10px] font-black uppercase tracking-widest border border-amber-200 animate-pulse">
                        🔒 Secured in Escrow
                      </span>
                  )}
                  {currentJob.status === 'completed' && (
                      <span className="bg-indigo-100 text-indigo-700 px-3 sm:px-4 py-1.5 rounded-full text-[8px] sm:text-[10px] font-black uppercase tracking-widest border border-indigo-200">
                        📫 Pending Release
                      </span>
                  )}
                  {currentJob.status === 'released' && (
                      <span className="bg-green-100 text-green-700 px-3 sm:px-4 py-1.5 rounded-full text-[8px] sm:text-[10px] font-black uppercase tracking-widest border border-green-200">
                        ✅ Transaction Finalized
                      </span>
                  )}
                </td>
                <td className="px-6 sm:px-10 py-8 text-right">
                  {currentJob.status === 'paid' && (
                      <button 
                        onClick={handleMarkComplete} 
                        className="bg-gray-900 text-white px-5 sm:px-8 py-3 sm:py-4 rounded-xl text-[8px] sm:text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-lg active:scale-95 transform hover:-translate-y-0.5"
                      >
                        Confirm Delivery
                      </button>
                  )}
                  {currentJob.status === 'released' && <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Completed</span>}
                </td>
              </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* --- WITHDRAWAL POPUP MODAL --- */}
        {showWithdrawModal && (
            <div className="fixed inset-0 bg-gray-900/80 backdrop-blur-sm sm:backdrop-blur-md z-[60] flex items-center justify-center p-4 sm:p-6 animate-fade-in overflow-y-auto">
              <div className="bg-white rounded-[2rem] sm:rounded-[3rem] w-full max-w-lg shadow-2xl overflow-hidden border border-white/20 my-auto">

                {/* Modal Header */}
                <div className="bg-white p-6 sm:p-10 pb-4 sm:pb-6 flex justify-between items-center border-b border-gray-50">
                  <div>
                    <h3 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tighter">Payout Settings</h3>
                    <p className="text-gray-400 text-[10px] sm:text-xs font-medium mt-1 uppercase tracking-widest">Select your preferred destination</p>
                  </div>
                  <button onClick={() => setShowWithdrawModal(false)} className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gray-50 text-gray-400 hover:text-gray-900 flex items-center justify-center transition-colors font-black text-lg sm:text-xl">✕</button>
                </div>

                {/* Modal Body */}
                <div className="p-6 sm:p-10">
                  <div className="mb-6 sm:mb-8 p-4 sm:p-6 bg-indigo-50 rounded-[1.5rem] sm:rounded-[2rem] border border-indigo-100 flex justify-between items-center">
                    <span className="text-[10px] sm:text-xs font-black text-indigo-900 uppercase tracking-widest">Amount to Transfer</span>
                    <span className="text-xl sm:text-2xl font-black text-indigo-600 tracking-tighter italic">₱50,000.00</span>
                  </div>

                  {/* Bank Selection Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8 sm:mb-10">
                    {payoutMethods.map((method) => (
                        <div
                            key={method.id}
                            onClick={() => setSelectedMethod(method.id)}
                            className={`p-4 sm:p-6 rounded-[1.5rem] sm:rounded-[2rem] border-2 cursor-pointer transition-all flex flex-row sm:flex-col items-center gap-4 sm:gap-3 relative overflow-hidden
                                    ${selectedMethod === method.id
                                ? 'border-indigo-600 bg-indigo-50/50 shadow-xl shadow-indigo-100/30'
                                : 'border-gray-50 hover:border-gray-100 bg-gray-50/30'}`}
                        >
                          <span className="text-2xl sm:text-3xl grayscale group-hover:grayscale-0">{method.icon}</span>
                          <span className={`text-[10px] font-black uppercase tracking-widest ${selectedMethod === method.id ? 'text-indigo-900' : 'text-gray-400'}`}>
                                    {method.name}
                                </span>
                          {selectedMethod === method.id && (
                              <div className="absolute top-2 right-2 w-2 h-2 bg-indigo-600 rounded-full"></div>
                          )}
                        </div>
                    ))}
                  </div>

                  {/* Dummy Account Input */}
                  <div className="mb-8 sm:mb-10">
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-1">Receiving Account Details</label>
                    <input
                        type="text"
                        placeholder="Mobile # or Account Number"
                        className="w-full px-6 sm:px-8 py-4 sm:py-5 bg-gray-50 border-2 border-gray-50 rounded-2xl font-bold text-sm focus:outline-none focus:border-indigo-500 transition-all placeholder-gray-300"
                    />
                  </div>

                  {/* Action Button */}
                  <button
                      onClick={handleConfirmTransfer}
                      disabled={isProcessing}
                      className={`w-full py-5 sm:py-6 rounded-2xl font-black text-xs sm:text-sm uppercase tracking-[0.2em] shadow-2xl transition-all flex justify-center items-center gap-4
                            ${isProcessing
                          ? 'bg-gray-200 text-gray-400 cursor-wait'
                          : 'bg-gray-900 hover:bg-indigo-600 text-white transform hover:-translate-y-1 active:scale-95 shadow-indigo-200'}`}
                  >
                    {isProcessing ? (
                        <>
                            <svg className="animate-spin h-5 w-5 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Transmitting Funds...
                        </>
                    ) : 'Authorize Payout'}
                  </button>
                </div>
              </div>
            </div>
        )}

      </div>
  );
};

export default VendorDashboard;