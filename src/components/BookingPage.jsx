import React, { useState } from 'react';

const BookingPage = ({ user, bookingData, onUpdateStatus, onRedirectToLogin, onBack }) => {
  const [selectedPkg, setSelectedPkg] = useState('essential');
  const [isLoading, setIsLoading] = useState(false);
  const [isReleasing, setIsReleasing] = useState(false);

  // LOCAL STATE FOR DISPUTE (Visual for Demo)
  const [isDisputed, setIsDisputed] = useState(false);

  // Status Checks
  const isPaid = bookingData.status !== 'unpaid';
  const isJobDone = bookingData.status === 'completed';
  const isMoneyReleased = bookingData.status === 'released';

  const handlePay = () => {
    if (!user) {
      alert("🔒 Login Required");
      onRedirectToLogin();
      return;
    }
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      onUpdateStatus(bookingData.id, 'paid');
    }, 2000);
  };

  const handleReleaseFunds = () => {
    if (confirm("Are you sure? This will transfer the money to the Vendor's wallet instantly.")) {
      setIsReleasing(true);
      setTimeout(() => {
        setIsReleasing(false);
        onUpdateStatus(bookingData.id, 'released');
        alert("Funds Released! Transaction Closed.");
      }, 2000);
    }
  };

  // --- DISPUTE LOGIC ---
  const handleReportProblem = () => {
    // 1. Ask for reason
    const reason = prompt("Please tell us why you are reporting this vendor:");

    if (reason) {
      setIsLoading(true);
      // 2. Simulate Admin Process
      setTimeout(() => {
        setIsLoading(false);
        setIsDisputed(true); // Trigger Red Badge
        alert(`🚨 DISPUTE FILED. \n\nReason: "${reason}"\n\nFunds have been FROZEN. Our support team will contact you within 24 hours.`);
      }, 1500);
    }
  };

  // --- SUCCESS VIEW (ESCROW DASHBOARD) ---
  if (isPaid) {
    return (
        <div className="min-h-screen bg-gray-950 flex items-center justify-center p-6 selection:bg-amber-100">
          <div className="bg-gray-900 p-12 rounded-[3rem] w-full max-w-lg border border-amber-500/10 shadow-2xl shadow-amber-500/5 relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-amber-500 to-amber-600"></div>
            <button onClick={onBack} className="absolute top-8 right-8 w-10 h-10 rounded-xl bg-white/5 text-gray-400 hover:text-white flex items-center justify-center transition-colors font-black text-sm border border-white/10">✕</button>

            <div className="text-center mb-10">
              {/* DYNAMIC ICON */}
              <div className={`w-24 h-24 rounded-3xl flex items-center justify-center mx-auto mb-8 text-5xl shadow-2xl transition-all duration-700 group-hover:scale-110 group-hover:rotate-3
                    ${isMoneyReleased ? 'bg-amber-600 text-white shadow-amber-900/40' :
                  isDisputed ? 'bg-red-500 text-white shadow-red-900/40' : 'bg-amber-500 text-white shadow-amber-900/40'}`}>

                {isMoneyReleased ? '🤝' : (isDisputed ? '⛔' : '🛡️')}
              </div>

              <h3 className="text-[10px] font-black text-amber-500 uppercase tracking-[0.3em] mb-2">Escrow Status Center</h3>
              <h2 className="text-4xl font-black text-white tracking-tighter">
                {isMoneyReleased ? 'Order Complete' : (isDisputed ? 'Payment Frozen' : 'Payment Secured')}
              </h2>
              <p className="text-gray-400 font-medium mt-3 italic text-sm">
                {isMoneyReleased ? 'The professional has been paid.' :
                    (isDisputed ? 'Abe Support is reviewing your case.' : 'Protected by Smart Escrow™ Gold')}
              </p>
            </div>

            {/* STATUS BADGE - DYNAMIC COLORS */}
            <div className={`p-8 rounded-[2rem] mb-10 transition-all border
                ${isMoneyReleased ? 'bg-amber-500/5 border-amber-500/20' :
                isDisputed ? 'bg-red-500/5 border-red-500/20' : 'bg-amber-500/10 border-amber-500/30'}`}>

              <div className="flex items-center justify-between mb-4">
                    <span className={`font-black tracking-widest text-[10px] uppercase 
                        ${isMoneyReleased ? 'text-amber-400' : (isDisputed ? 'text-red-400' : 'text-amber-500')}`}>
                        Live Status
                    </span>

                {isMoneyReleased ? (
                    <span className="bg-amber-500/10 px-3 py-1 rounded-full text-amber-400 font-black text-[10px] uppercase tracking-widest border border-amber-500/20">Success</span>
                ) : isDisputed ? (
                    <span className="bg-red-500/10 px-3 py-1 rounded-full text-red-400 font-black text-[10px] uppercase tracking-widest border border-red-500/20 animate-pulse">On Hold</span>
                ) : isJobDone ? (
                    <span className="bg-amber-500/20 px-3 py-1 rounded-full text-amber-400 font-black text-[10px] uppercase tracking-widest border border-amber-500/30 animate-bounce">Verify Now</span>
                ) : (
                    <span className="bg-amber-500/10 px-3 py-1 rounded-full text-amber-400 font-black text-[10px] uppercase tracking-widest border border-amber-500/20">Locked</span>
                )}
              </div>

              <p className="text-xs text-gray-400 font-bold leading-relaxed">
                {isMoneyReleased
                    ? "Transaction concluded. Your payment has been successfully transmitted to the vendor's digital wallet."
                    : isDisputed
                        ? "Transaction paused. Funds are frozen in our secure vault until our dispute team verifies the service delivery."
                        : (isJobDone
                            ? "The vendor has submitted their deliverables. Please verify the quality and authorize the final payout."
                            : "Protected. The vendor cannot access the ")}
                {!isMoneyReleased && !isDisputed && !isJobDone && <span className="text-amber-400 font-black">₱{bookingData.price.toLocaleString()}</span>}
                {!isMoneyReleased && !isDisputed && !isJobDone && " until you confirm service delivery."}
              </p>
            </div>

            <div className="space-y-4 text-xs font-black uppercase tracking-widest mb-10">
              <div className="flex justify-between border-b border-white/5 pb-4">
                <span className="text-gray-500">Tracking #</span>
                <span className="text-amber-400">{bookingData.id.toUpperCase()}</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-4">
                <span className="text-gray-500">Professional</span>
                <span className="text-white italic">{bookingData.vendorName}</span>
              </div>
            </div>

            {/* BUTTONS AREA */}
            <div className="space-y-4">
              {isMoneyReleased ? (
                  <button className="w-full bg-amber-600 text-white py-6 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-amber-500 transition-all shadow-xl shadow-amber-900/20">
                    Download Final Invoice
                  </button>
              ) : (
                  <>
                    <button
                        onClick={handleReleaseFunds}
                        disabled={!isJobDone || isReleasing || isDisputed}
                        className={`w-full py-6 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-2xl transition-all
                                ${(!isJobDone || isDisputed)
                            ? 'bg-gray-800 text-gray-500 cursor-not-allowed border border-white/5'
                            : 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-900/40 transform hover:-translate-y-1 active:scale-95'}`}
                    >
                      {isReleasing ? 'Transmitting Funds...' : (isJobDone ? 'Authorize Final Payout' : 'Awaiting Deliverables')}
                    </button>

                    {/* THE DISPUTE BUTTON */}
                    {!isDisputed && (
                        <div className="text-center pt-4">
                          <button
                              onClick={handleReportProblem}
                              className="text-[10px] text-red-500/70 hover:text-red-500 font-black uppercase tracking-widest transition-colors"
                          >
                            File a Service Dispute
                          </button>
                        </div>
                    )}
                  </>
              )}
            </div>

          </div>
        </div>
    );
  }

  // --- PAYMENT SELECTION VIEW (UNCHANGED) ---
  return (
      <div className="max-w-5xl mx-auto p-12 bg-white rounded-[3rem] shadow-2xl shadow-gray-100 border border-gray-50 my-12 selection:bg-indigo-100">
        <div className="flex justify-between items-center mb-12">
          <div>
            <h3 className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.3em] mb-2">Checkout Process</h3>
            <h2 className="text-4xl font-black text-gray-900 tracking-tighter">Secure Payment</h2>
          </div>
          <button onClick={onBack} className="w-12 h-12 rounded-2xl bg-gray-50 text-gray-400 hover:text-gray-900 flex items-center justify-center transition-colors font-black text-xl">✕</button>
        </div>

        <div className="grid md:grid-cols-2 gap-12">
          <div className="space-y-8">
            <div className="bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-indigo-50 via-white to-white p-10 rounded-[2.5rem] border border-indigo-100 shadow-xl shadow-indigo-100/20 relative overflow-hidden group">
              <div className="relative z-10">
                <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] mb-4">Selected Package</p>
                <h3 className="text-3xl font-black text-gray-900 tracking-tighter mb-2 italic group-hover:text-indigo-600 transition-colors">{bookingData.package}</h3>
                <p className="text-gray-500 font-bold uppercase tracking-widest text-xs mb-8">{bookingData.vendorName}</p>
                <div className="h-px w-full bg-gradient-to-r from-indigo-100 to-transparent mb-8"></div>
                <div className="text-5xl font-black text-indigo-600 tracking-tighter italic">₱{bookingData.price.toLocaleString()}</div>
              </div>
              <div className="absolute top-0 right-0 p-10 text-6xl opacity-5 group-hover:scale-110 transition-transform">💎</div>
            </div>

            <div>
                <p className="text-[10px] text-gray-400 mb-4 font-black uppercase tracking-[0.2em] ml-2">Preferred Method</p>
                <div className="space-y-4">
                <label className="flex items-center gap-5 p-6 border-2 border-indigo-600 bg-indigo-50/50 rounded-2xl cursor-pointer shadow-lg shadow-indigo-100/50 transition-all hover:scale-[1.01]">
                    <div className="w-6 h-6 rounded-full border-2 border-indigo-600 flex items-center justify-center bg-white">
                        <div className="w-2.5 h-2.5 bg-indigo-600 rounded-full"></div>
                    </div>
                    <div>
                        <span className="font-black text-gray-900 uppercase tracking-widest text-xs block">eWallet (GCash / Maya)</span>
                        <span className="text-[10px] text-indigo-600 font-bold uppercase tracking-widest mt-1">Instant Activation</span>
                    </div>
                </label>
                <label className="flex items-center gap-5 p-6 border-2 border-gray-50 bg-gray-50/30 rounded-2xl cursor-pointer hover:border-gray-200 transition-all">
                    <div className="w-6 h-6 rounded-full border-2 border-gray-200 flex items-center justify-center bg-white"></div>
                    <div>
                        <span className="font-black text-gray-400 uppercase tracking-widest text-xs block">Credit / Debit Card</span>
                        <span className="text-[10px] text-gray-300 font-bold uppercase tracking-widest mt-1">VISA / Mastercard / AMEX</span>
                    </div>
                </label>
                </div>
            </div>
          </div>
          <div className="flex flex-col">
            <div className="mb-8 flex justify-center bg-gray-950 rounded-[2.5rem] overflow-hidden border border-amber-500/20 shadow-2xl shadow-amber-500/5 h-[340px]">
                <img
                    src="/Company%20image/Smart%20ESCROW.png"
                    alt="Smart Escrow Protection"
                    className="w-full h-full object-cover rounded-xl"
                />
            </div>
            <div className="bg-gray-950 p-8 rounded-[2rem] mb-6 text-xs text-gray-400 border border-amber-500/20 relative overflow-hidden group shadow-2xl shadow-amber-500/5">
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>
              <div className="relative z-10">
                <p className="mb-3 font-black text-amber-500 uppercase tracking-[0.2em] flex items-center gap-2">
                    <span className="text-lg">🛡️</span> Smart Escrow™ Gold Protection
                </p>
                <p className="font-medium leading-relaxed text-gray-400">
                    Your payment is held securely in our <span className="text-amber-400 font-bold">neutral vault</span>. It is only released to the vendor after you confirm the event is successfully completed.
                </p>
              </div>
            </div>

            <button
                onClick={handlePay}
                disabled={isLoading}
                className={`w-full py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-2xl transition-all 
                ${isLoading ? 'bg-gray-800 text-white cursor-wait' : 'bg-gray-900 hover:bg-amber-600 text-white transform hover:-translate-y-1 active:scale-95 shadow-amber-900/20'}`}
            >
              {isLoading ? (
                  <span className="flex items-center justify-center gap-3">
                    <svg className="animate-spin h-5 w-5 text-amber-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Securing Funds...
                  </span>
              ) : (user ? `Secure Booking ₱${bookingData.price.toLocaleString()}` : '🔒 Login to Continue')}
            </button>
          </div>
        </div>
      </div>
  );
};

export default BookingPage;