import React, { useState } from 'react';
import { generateInvoice } from '../utils/invoiceGenerator';

const VendorDashboard = ({ user, onLogout, bookings, onUpdateStatus, showNotification, payoutRequests, onAddPayoutRequest }) => {

  const currentJob = bookings[0];

  // STATE: Pera at Withdrawal Logic
  const balance = user?.balance || 0;
  const [showWithdrawModal, setShowWithdrawModal] = useState(false); // Para sa Popup
  const [selectedMethod, setSelectedMethod] = useState('gcash');   // Default selection
  const [isProcessing, setIsProcessing] = useState(false);         // Loading state
  const [showAppealModal, setShowAppealModal] = useState(false);
  const [appealText, setAppealText] = useState('');

  // Fields for Withdrawal Form
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [accountNumber, setAccountNumber] = useState('');

  // --- NEW GPS LOGIC START ---
  const [isCheckingIn, setIsCheckingIn] = useState(false);

  // Haversine formula para sa mas tumpak na distansya
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3; // Radius ng Earth sa meters
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distansya sa meters
  };

  const handleGPSCheckIn = () => {
    if (!navigator.geolocation) {
      showNotification("Abe, hindi supported ang GPS sa browser mo!", "error");
      return;
    }

    setIsCheckingIn(true);

    // TARGET VENUE COORDINATES
    const VENUE_LAT = 15.1794;
    const VENUE_LNG = 120.5275;

    navigator.geolocation.getCurrentPosition(async (position) => {
      const userLat = position.coords.latitude;
      const userLng = position.coords.longitude;

      const distance = calculateDistance(userLat, userLng, VENUE_LAT, VENUE_LNG);

      // Threshold: 500 meters
      if (distance <= 7000) {
        try {
          const response = await onUpdateStatus(currentJob.id, 'RELEASE_20');
          // Note: Balance update is now handled by the mock API simulator or global state if needed.
          // In this mock, we let the notification show the release.
        } catch (error) {
          showNotification("❌ Error updating escrow status, Abe. Subukan mo ulit.", "error");
        }
      } else {
        showNotification(`Abe, malayo ka pa! (Distansya: ${Math.round(distance)}m). Dapat nasa loob ka ng 500m radius ng venue.`, "error");
      }
      setIsCheckingIn(false);
    }, () => {
      showNotification("E makuha ing lokasyon mu, Abe! I-on me ing GPS mu.", "error");
      setIsCheckingIn(false);
    });
  };
  // --- NEW GPS LOGIC END ---

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
      showNotification("No funds available to withdraw.", "error");
      return;
    }
    setShowWithdrawModal(true);
  };

  // STEP 2: Process the Transfer
  const handleConfirmTransfer = () => {
    const amount = parseFloat(withdrawAmount);

    if (isNaN(amount) || amount <= 0) {
      showNotification("Abe, maglagay ka ng tamang halaga.", "error");
      return;
    }

    if (amount > balance) {
      showNotification("Abe, hindi sapat ang iyong balance.", "error");
      return;
    }

    if (!accountNumber) {
      showNotification("Paki-lagay ang iyong Account Number.", "error");
      return;
    }

    setIsProcessing(true); // Start spinner

    // Simulate Bank Delay (2 seconds)
    setTimeout(() => {
      const method = payoutMethods.find(m => m.id === selectedMethod);
      
      const newRequest = {
          id: `payout-${Date.now()}`,
          vendorId: user.id,
          vendorName: user.name,
          amount: amount,
          bankName: method.name,
          accountNumber: accountNumber,
          status: 'pending_withdrawal',
          date: new Date().toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })
      };

      onAddPayoutRequest(newRequest);
      setIsProcessing(false);
      setShowWithdrawModal(false); // Close Modal
      
      // Reset fields
      setWithdrawAmount('');
      setAccountNumber('');

      // Show Success Toast with Details
      showNotification(`Withdrawal Request Sent! Please wait for Admin approval.`, "success");
    }, 2000);
  };

  const handleMarkComplete = () => {
    if (confirm("Are you sure the event is done? This will notify the client to release funds.")) {
      onUpdateStatus(currentJob.id, 'COMPLETE');
    }
  };

  const submitAppeal = async () => {
    if (appealText.length < 20) {
      showNotification("Abe, pakihabaan naman ng konti ang depensa mo.", "error");
      return;
    }

    setIsProcessing(true);
    setShowAppealModal(false);

    setTimeout(async () => {
      const disputedBooking = bookings.find(b => b.status === 'disputed');
      await onUpdateStatus(disputedBooking.id, 'APPEAL', { appeal: appealText });
      setIsProcessing(false);
      setAppealText('');
    }, 1500);
  };

  return (
      <div className="min-h-screen bg-white font-sans selection:bg-indigo-100">

        {/* --- NAVBAR --- */}
        <nav className="bg-white/80 backdrop-blur-lg sticky top-0 z-50 border-b border-gray-100 px-6 h-20 flex items-center">
          <div className="max-w-7xl mx-auto w-full flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-black text-gray-900 tracking-tighter uppercase">
                ABE <span className="text-indigo-600 italic">EVENTS</span>
                <span className="ml-3 text-[10px] bg-indigo-50 text-indigo-600 px-2 py-1 rounded-md tracking-widest font-black uppercase">Vendor Portal</span>
              </span>
            </div>

            <div className="flex items-center gap-8">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 hidden md:block">
                Partner <span className="text-gray-900 ml-2">{user?.name || 'Supplier'}</span>
              </span>
              <div className="h-4 w-px bg-gray-100 hidden md:block"></div>
              <button
                  onClick={onLogout}
                  className="text-[10px] font-black uppercase tracking-[0.2em] text-red-500 hover:text-white hover:bg-red-500 border border-red-100 px-5 py-2.5 rounded-xl transition-all active:scale-95"
              >
                Log Out
              </button>
            </div>
          </div>
        </nav>

        <div className="max-w-6xl mx-auto p-6 md:p-12">
          <div className="mb-12">
            <h3 className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.3em] mb-2">Performance Analytics</h3>
            <h1 className="text-5xl font-black text-gray-900 tracking-tighter">Vendor Dashboard</h1>
            <p className="text-gray-400 font-medium mt-2">Manage your professional bookings and secure payouts.</p>
          </div>

          {/* STATS ROW */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">

            {/* DARK CARD: EARNINGS */}
            <div className="bg-gray-900 p-10 rounded-[2.5rem] shadow-2xl shadow-gray-200 text-white relative overflow-hidden group">
              <div className="relative z-10">
                <p className="text-indigo-400 text-[10px] font-black uppercase tracking-[0.2em] mb-4">Available Balance</p>
                <p className="text-5xl font-black tracking-tighter italic mb-10">₱{balance.toLocaleString()}</p>

                <button
                    onClick={handleOpenWithdraw}
                    className="w-full py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] bg-white text-gray-900 hover:bg-indigo-50 shadow-xl transition-all transform hover:-translate-y-1 active:scale-95"
                >
                  Withdraw Funds
                </button>
              </div>
              <div className="absolute -top-24 -right-24 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl group-hover:bg-indigo-500/20 transition-colors"></div>
            </div>

            {/* ESCROW CARD (Modified to show 20% Release Status) */}
            <div className={`p-10 rounded-[2.5rem] shadow-xl border-2 transition-all duration-500 flex flex-col justify-between relative overflow-hidden
                ${currentJob.status === 'paid' || currentJob.status === 'partially_released' ? 'bg-amber-50 border-amber-200' : 'bg-white border-gray-50 opacity-60'}`}>
              <div>
                <p className={`text-[10px] font-black uppercase tracking-[0.2em] ${currentJob.status === 'paid' || currentJob.status === 'partially_released' ? 'text-amber-600' : 'text-gray-400'}`}>
                  Funds in Escrow
                </p>
                <p className={`text-4xl font-black tracking-tighter mt-4 ${currentJob.status === 'paid' || currentJob.status === 'partially_released' ? 'text-gray-900' : 'text-gray-200'}`}>
                  {currentJob.status === 'paid' || currentJob.status === 'partially_released' 
                    ? `₱${(currentJob.status === 'partially_released' ? currentJob.price * 0.8 : currentJob.price).toLocaleString()}` 
                    : '₱0.00'}
                </p>
                {currentJob.status === 'partially_released' && (
                  <p className="text-[10px] font-bold text-green-600 uppercase mt-2 italic">20% Mobilization Released ✅</p>
                )}
              </div>
              {(currentJob.status === 'paid' || currentJob.status === 'partially_released') && (
                <div className="mt-8 flex items-center gap-2">
                  <span className="text-xl">🔒</span>
                  <span className="text-[10px] font-black text-amber-700 uppercase tracking-widest">Smart Escrow Locked</span>
                </div>
              )}
               <div className="absolute top-0 right-0 p-8 text-4xl opacity-10">🛡️</div>
            </div>

            {/* WHITE CARD: COMPLETED */}
            <div className="bg-white p-10 rounded-[2.5rem] shadow-xl border border-gray-50 flex flex-col justify-between">
              <div>
                <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.2em]">Total Deliveries</p>
                <h3 className="text-4xl font-black text-gray-900 tracking-tighter mt-4">12</h3>
              </div>
              <div className="mt-8">
                <span className="bg-green-50 text-green-600 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-green-100">
                    +2 New Reviews
                </span>
              </div>
            </div>
          </div>

          {/* DISPUTE ALERT */}
          {bookings.some(b => b.status === 'disputed') && (
            <div className="mb-12 bg-red-50 border border-red-100 rounded-[2rem] p-8 flex flex-col md:flex-row items-center justify-between gap-6 animate-in fade-in slide-in-from-top-4 duration-700">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 bg-red-600 rounded-2xl flex items-center justify-center text-3xl shadow-lg shadow-red-200 animate-pulse">
                  🚨
                </div>
                <div>
                  <h4 className="text-red-600 font-black uppercase tracking-widest text-xs mb-1">Dispute Filed</h4>
                  {bookings.filter(b => b.status === 'disputed').map(b => (
                    <div key={b.id} className="text-gray-900">
                      <p className="font-bold text-lg leading-tight">
                        {b.disputeCategory} - <span className="text-gray-500 font-medium italic">"{b.disputeReason}"</span>
                      </p>
                      <p className="text-[10px] text-gray-400 font-black uppercase mt-1">Client: {b.clientName} • Transaction ID: {b.id}</p>
                    </div>
                  ))}
                </div>
              </div>
              <button 
                onClick={() => setShowAppealModal(true)}
                className="bg-gray-900 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-red-600 transition-all shadow-xl shadow-gray-200 active:scale-95 whitespace-nowrap"
              >
                Appeal Decision
              </button>
            </div>
          )}

          {/* JOB LIST */}
          <div className="flex justify-between items-end mb-8">
            <div>
                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Operational Flow</h3>
                <h2 className="text-3xl font-black text-gray-900 tracking-tighter mt-2">Active Bookings</h2>
            </div>
          </div>
          
          <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-gray-100/50 overflow-hidden border border-gray-50">
            <table className="w-full text-left">
              <thead className="bg-gray-50/50 text-[10px] text-gray-400 uppercase tracking-[0.2em] border-b border-gray-50">
              <tr>
                <th className="px-10 py-6 font-black">Client Details</th>
                <th className="px-10 py-6 font-black">Escrow Status</th>
                <th className="px-10 py-6 font-black text-right">Action</th>
              </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
              <tr className="hover:bg-indigo-50/30 transition-colors">
                <td className="px-10 py-8">
                  <p className="font-black text-gray-900 text-lg tracking-tight">{currentJob.clientName}</p>
                  <p className="text-xs text-indigo-600 font-bold uppercase tracking-widest mt-1">{currentJob.date}</p>
                </td>
                <td className="px-10 py-8">
                  {currentJob.status === 'unpaid' && (
                      <span className="bg-gray-100 text-gray-500 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-gray-200">
                        ⏳ Awaiting Payment
                      </span>
                  )}
                  {currentJob.status === 'paid' && (
                      <span className="bg-amber-100 text-amber-700 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-amber-200 animate-pulse">
                        🔒 Secured in Escrow
                      </span>
                  )}
                  {currentJob.status === 'partially_released' && (
                      <span className="bg-blue-100 text-blue-700 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-blue-200">
                        📍 On-Site / 20% Released
                      </span>
                  )}
                  {currentJob.status === 'completed' && (
                      <span className="bg-indigo-100 text-indigo-700 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-indigo-200">
                        📫 Pending Release
                      </span>
                  )}
                  {currentJob.status === 'released' && (
                      <span className="bg-green-100 text-green-700 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-green-200">
                        ✅ Transaction Finalized
                      </span>
                  )}
                </td>
                <td className="px-10 py-8 text-right flex flex-col sm:flex-row justify-end gap-2">
                  {currentJob.status === 'paid' && (
                      <button
                          onClick={handleGPSCheckIn}
                          disabled={isCheckingIn}
                          className="bg-indigo-600 text-white px-6 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 shadow-lg flex items-center gap-2"
                      >
                        {isCheckingIn ? "📍 Verifying..." : "📍 Check-in Venue"}
                      </button>
                  )}

                  {(currentJob.status === 'paid' || currentJob.status === 'partially_released') && (
                      <button
                          onClick={handleMarkComplete}
                          className="bg-gray-900 text-white px-6 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-black shadow-lg"
                      >
                        Confirm Delivery
                      </button>
                  )}
                  {currentJob.status === 'released' && (
                    <div className="flex flex-col items-end gap-2">
                      <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Completed</span>
                      <button
                        onClick={() => generateInvoice(currentJob)}
                        className="text-indigo-600 hover:text-indigo-800 font-black text-[10px] uppercase underline tracking-widest"
                      >
                        Download Receipt
                      </button>
                    </div>
                  )}
                </td>
              </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* APPEAL MODAL */}
        {showAppealModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <div className="absolute inset-0 bg-indigo-950/40 backdrop-blur-sm" onClick={() => setShowAppealModal(false)}></div>
            <div className="bg-white rounded-[2.5rem] p-10 w-full max-w-lg relative shadow-2xl border border-indigo-50">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-600 to-indigo-400"></div>
              <h3 className="text-2xl font-black text-gray-900 italic tracking-tighter uppercase mb-2">Vendor Appeal</h3>
              <p className="text-gray-400 text-xs mb-8 font-medium italic">Ibigay ang iyong panig, Abe. Ang Admin ang magdedesisyon base sa ebidensya.</p>

              <div className="space-y-6">
                <div>
                  <label className="text-[10px] font-black text-indigo-600 uppercase tracking-widest block mb-2">Ang iyong depensa</label>
                  <textarea 
                    placeholder="Abe, ipaliwanag ang nangyari sa iyong panig... (Min 20 characters)"
                    value={appealText}
                    onChange={(e) => setAppealText(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-100 rounded-3xl py-4 px-6 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[150px] transition-all"
                  ></textarea>
                </div>

                <div className="flex gap-4 pt-4">
                  <button 
                    onClick={submitAppeal}
                    className="flex-1 bg-gray-900 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-xl shadow-indigo-100 active:scale-95"
                  >
                    Submit Appeal
                  </button>
                  <button 
                    onClick={() => setShowAppealModal(false)}
                    className="px-8 bg-gray-50 text-gray-400 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-gray-100 transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- WITHDRAWAL POPUP MODAL --- */}
        {showWithdrawModal && (
            <div className="fixed inset-0 bg-gray-900/80 backdrop-blur-md z-50 flex items-center justify-center p-6 animate-fade-in">
              <div className="bg-white rounded-[3rem] w-full max-w-lg shadow-2xl overflow-hidden border border-white/20">

                {/* Modal Header */}
                <div className="bg-white p-10 pb-6 flex justify-between items-center border-b border-gray-50">
                  <div>
                    <h3 className="text-3xl font-black text-gray-900 tracking-tighter">Payout Settings</h3>
                    <p className="text-gray-400 text-xs font-medium mt-1 uppercase tracking-widest">Select your preferred destination</p>
                  </div>
                  <button onClick={() => setShowWithdrawModal(false)} className="w-12 h-12 rounded-2xl bg-gray-50 text-gray-400 hover:text-gray-900 flex items-center justify-center transition-colors font-black text-xl">✕</button>
                </div>

                {/* Modal Body */}
                <div className="p-10">
                  <div className="mb-8 p-6 bg-indigo-50 rounded-[2rem] border border-indigo-100 space-y-4">
                    <div className="flex justify-between items-center">
                        <span className="text-[10px] font-black text-indigo-900 uppercase tracking-widest">Available Balance</span>
                        <span className="text-xl font-black text-indigo-600 tracking-tighter italic">₱{balance.toLocaleString()}</span>
                    </div>
                    <div className="pt-4 border-t border-indigo-100 flex flex-col gap-2">
                        <label className="text-[10px] font-black text-indigo-900 uppercase tracking-widest ml-1">Amount to Withdraw</label>
                        <div className="relative">
                            <span className="absolute left-6 top-1/2 -translate-y-1/2 text-lg font-black text-gray-400">₱</span>
                            <input 
                                type="number" 
                                placeholder="0.00"
                                value={withdrawAmount}
                                onChange={(e) => setWithdrawAmount(e.target.value)}
                                className="w-full bg-white border-2 border-indigo-100 rounded-2xl py-4 pl-12 pr-6 text-xl font-black text-gray-900 focus:outline-none focus:border-indigo-600 transition-all"
                            />
                        </div>
                    </div>
                  </div>

                  {/* Bank Selection Grid */}
                  <div className="grid grid-cols-2 gap-4 mb-8">
                    {payoutMethods.map((method) => (
                        <div
                            key={method.id}
                            onClick={() => setSelectedMethod(method.id)}
                            className={`p-6 rounded-[2rem] border-2 cursor-pointer transition-all flex flex-col items-center gap-3 relative overflow-hidden
                                    ${selectedMethod === method.id
                                ? 'border-indigo-600 bg-indigo-50/50 shadow-xl shadow-indigo-100/30'
                                : 'border-gray-50 hover:border-gray-100 bg-gray-50/30'}`}
                        >
                          <span className="text-3xl grayscale group-hover:grayscale-0">{method.icon}</span>
                          <span className={`text-[10px] font-black uppercase tracking-widest ${selectedMethod === method.id ? 'text-indigo-900' : 'text-gray-400'}`}>
                                    {method.name}
                                </span>
                          {selectedMethod === method.id && (
                              <div className="absolute top-2 right-2 w-2 h-2 bg-indigo-600 rounded-full"></div>
                          )}
                        </div>
                    ))}
                  </div>

                  {/* Account Input */}
                  <div className="mb-10">
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-1">Account Number / Mobile Number</label>
                    <input
                        type="text"
                        placeholder="e.g. 0917 XXX XXXX or 1234 5678 XXXX"
                        value={accountNumber}
                        onChange={(e) => setAccountNumber(e.target.value)}
                        className="w-full px-8 py-5 rounded-2xl bg-gray-50 border-2 border-gray-50 focus:border-indigo-500 focus:bg-white outline-none font-bold transition-all text-sm placeholder-gray-300"
                    />
                    <p className="mt-4 text-[9px] text-gray-400 font-bold uppercase tracking-widest flex items-center gap-2">
                      🔒 Secure Payout via Smart Escrow™ Payout Engine
                    </p>
                  </div>

                  {/* Action Button */}
                  <button
                      onClick={handleConfirmTransfer}
                      disabled={isProcessing}
                      className={`w-full py-6 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-2xl transition-all flex justify-center items-center gap-4
                            ${isProcessing
                          ? 'bg-gray-200 text-gray-400 cursor-wait'
                          : 'bg-gray-900 hover:bg-indigo-600 text-white transform hover:-translate-y-1 active:scale-95 shadow-indigo-200'}`}
                  >
                    {isProcessing ? (
                        <>
                          <svg className="animate-spin h-5 w-5 text-indigo-500" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          <span>Processing...</span>
                        </>
                    ) : (
                        <>
                          <span>Send Request</span>
                          <span className="text-xl">🚀</span>
                        </>
                    )}
                  </button>
                </div>
              </div>
            </div>
        )}

      </div>
  );
};

export default VendorDashboard;