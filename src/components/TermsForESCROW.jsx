import React, { useState } from 'react';

const TermsForESCROW = () => {
    // Sample state para sa demo
    const [status, setStatus] = useState('locked'); // locked, mobilization_released, completed

    return (
        <div className="min-h-screen bg-white py-20 px-4 md:px-8 font-sans selection:bg-indigo-100">
            <div className="max-w-xl mx-auto">

                {/* Header Card */}
                <div className="bg-gray-900 rounded-t-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                    <div className="flex justify-between items-center relative z-10">
                        <h1 className="text-sm font-black uppercase tracking-[0.3em] text-indigo-400">ABE ESCROW</h1>
                        <span className="bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/10">Secure Payment Layer</span>
                    </div>
                    <div className="mt-10 relative z-10">
                        <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.2em] mb-2">Total Project Budget</p>
                        <h2 className="text-5xl font-black tracking-tighter italic">₱50,000.00</h2>
                    </div>
                </div>

                {/* Main Escrow Status Card */}
                <div className="bg-white rounded-b-[2.5rem] p-10 shadow-2xl shadow-gray-100 border-x border-b border-gray-50">

                    {/* Status Tracker (The Visual "Money Flow") */}
                    <div className="relative mb-12 mt-4 ml-2">
                        <div className="absolute left-4 top-0 h-full w-0.5 bg-gray-100"></div>

                        {/* Step 1: Locked */}
                        <div className="relative mb-10 flex items-start">
                            <div className={`z-10 w-8 h-8 rounded-full flex items-center justify-center border-4 border-white shadow-lg transition-colors duration-500 ${status === 'locked' || status === 'mobilization_released' || status === 'completed' ? 'bg-indigo-600' : 'bg-gray-200'}`}>
                                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20"><path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/></svg>
                            </div>
                            <div className="ml-8">
                                <h3 className="font-black text-gray-900 uppercase tracking-widest text-[11px] mb-1">Funds Secured</h3>
                                <p className="text-sm text-gray-500 font-medium">Full amount held in digital vault.</p>
                                <p className="text-[10px] text-indigo-600 font-black mt-2 bg-indigo-50 inline-block px-2 py-0.5 rounded">₱50,000.00 LOCKED</p>
                            </div>
                        </div>

                        {/* Step 2: Mobilization */}
                        <div className="relative mb-10 flex items-start">
                            <div className={`z-10 w-8 h-8 rounded-full flex items-center justify-center border-4 border-white shadow-lg transition-colors duration-500 ${status === 'mobilization_released' || status === 'completed' ? 'bg-indigo-600' : 'bg-gray-200'}`}>
                                <span className="text-white text-[10px] font-black uppercase">20%</span>
                            </div>
                            <div className="ml-8">
                                <h3 className={`font-black uppercase tracking-widest text-[11px] mb-1 ${status === 'mobilization_released' || status === 'completed' ? 'text-gray-900' : 'text-gray-300'}`}>Mobilization</h3>
                                <p className="text-sm text-gray-500 font-medium leading-relaxed">Released after GPS Check-in at Venue.</p>
                            </div>
                        </div>

                        {/* Step 3: Final Release */}
                        <div className="relative flex items-start">
                            <div className={`z-10 w-8 h-8 rounded-full flex items-center justify-center border-4 border-white shadow-lg transition-colors duration-500 ${status === 'completed' ? 'bg-indigo-600' : 'bg-gray-200'}`}>
                                <span className="text-white text-[10px] font-black uppercase">80%</span>
                            </div>
                            <div className="ml-8">
                                <h3 className={`font-black uppercase tracking-widest text-[11px] mb-1 ${status === 'completed' ? 'text-gray-900' : 'text-gray-300'}`}>Final Handover</h3>
                                <p className="text-sm text-gray-500 font-medium leading-relaxed">Released after client approval of deliverables.</p>
                            </div>
                        </div>
                    </div>

                    {/* Action Area (Admin/Client View) */}
                    <div className="border-t border-gray-50 pt-10">
                        <div className="bg-gray-50 p-6 rounded-3xl mb-8 border border-gray-100">
                            <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em] mb-3 text-center">Current Phase</p>
                            <p className="text-center font-black text-gray-900 uppercase tracking-widest text-xs">
                                {status === 'locked' && "Awaiting Event Day & GPS Verification"}
                                {status === 'mobilization_released' && "Event Ongoing / Deliverables Pending"}
                                {status === 'completed' && "Transaction Successfully Completed"}
                            </p>
                        </div>

                        {/* Control Buttons for Demo */}
                        <div className="grid grid-cols-1 gap-4">
                            <button
                                onClick={() => setStatus('mobilization_released')}
                                className="w-full bg-gray-900 text-white font-black text-[10px] uppercase tracking-[0.2em] py-5 rounded-2xl shadow-xl active:scale-95 transition hover:bg-indigo-600"
                            >
                                Verify GPS & Release 20%
                            </button>
                            <button
                                onClick={() => setStatus('completed')}
                                className="w-full border-2 border-gray-100 text-gray-900 font-black text-[10px] uppercase tracking-[0.2em] py-5 rounded-2xl active:scale-95 transition hover:bg-gray-50 hover:border-gray-200"
                            >
                                Final Approval & Release 80%
                            </button>
                        </div>
                    </div>
                </div>

                {/* Safe Badge */}
                <div className="mt-12 flex flex-col items-center gap-4 opacity-30">
                    <div className="flex items-center gap-3">
                        <svg className="w-6 h-6 text-gray-900" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                        <span className="text-[10px] font-black text-gray-900 uppercase tracking-[0.3em]">ABE Secure payment layer v1.2</span>
                    </div>
                    <p className="text-[9px] font-medium text-gray-500">Bank-grade encryption powered by AWS KMS</p>
                </div>

            </div>
        </div>
    );
};

export default TermsForESCROW;