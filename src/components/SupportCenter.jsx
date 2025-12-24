import React from 'react';

const SupportCenter = () => {
    return (
        <div className="min-h-screen bg-white py-20 px-4 md:px-8 font-sans selection:bg-indigo-100">
            <div className="max-w-3xl mx-auto">

                {/* Header Section */}
                <div className="mb-20 text-center">
                    <span className="inline-block px-4 py-1.5 bg-indigo-50 rounded-full text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-4 border border-indigo-100">
                        Help & Resources
                    </span>
                    <h1 className="text-5xl font-black text-gray-900 tracking-tighter leading-none mb-4">Abe Support</h1>
                    <p className="text-gray-500 font-medium max-w-md mx-auto italic">"Nandito ang iyong Abe para tumulong. Ano ang maipaglilingkod namin, Cabalen?"</p>
                </div>

                {/* Support Options Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">

                    {/* Live Chat Option */}
                    <button className="flex flex-col items-center p-10 bg-white border border-gray-100 rounded-[2.5rem] shadow-sm hover:shadow-xl hover:shadow-indigo-100 transition-all active:scale-95 group">
                        <div className="w-20 h-20 bg-indigo-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-indigo-600 transition-colors duration-500">
                            <svg className="w-10 h-10 text-indigo-600 group-hover:text-white transition-colors duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                        </div>
                        <h3 className="font-black text-gray-900 uppercase tracking-widest text-sm mb-2">Chat sa Abe</h3>
                        <p className="text-xs text-gray-400 font-medium text-center leading-relaxed">Mabilis na sagot para sa iyong mga tanong mula sa aming team.</p>
                    </button>

                    {/* File a Dispute Option */}
                    <button className="flex flex-col items-center p-10 bg-white border border-gray-100 rounded-[2.5rem] shadow-sm hover:shadow-xl hover:shadow-orange-100 transition-all active:scale-95 group border-t-4 border-t-orange-500">
                        <div className="w-20 h-20 bg-orange-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-orange-600 transition-colors duration-500">
                            <svg className="w-10 h-10 text-orange-600 group-hover:text-white transition-colors duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                        <h3 className="font-black text-orange-700 uppercase tracking-widest text-sm mb-2">Mag-file ng Dispute</h3>
                        <p className="text-xs text-gray-400 font-medium text-center leading-relaxed">I-report kung may problema sa serbisyo o bayad.</p>
                    </button>

                </div>

                {/* FAQs Section */}
                <div className="bg-gray-50 rounded-[3rem] p-12 border border-gray-100 mb-16 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-100/50 rounded-full -mr-16 -mt-16"></div>
                    <h2 className="text-2xl font-black text-gray-900 mb-10 tracking-tight">Frequently Asked Questions</h2>

                    <div className="space-y-10">
                        <div className="group">
                            <h4 className="font-black text-indigo-900 uppercase tracking-widest text-[11px] mb-2 flex items-center gap-2">
                                <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full"></span>
                                Paano kung hindi sumipot ang Vendor?
                            </h4>
                            <p className="text-sm text-gray-600 font-medium leading-relaxed ml-3.5">Automatic 100% refund ang makukuha mo sa iyong Escrow wallet sa loob ng 24 oras matapos ma-verify ng aming Admin team.</p>
                        </div>

                        <div className="group">
                            <h4 className="font-black text-indigo-900 uppercase tracking-widest text-[11px] mb-2 flex items-center gap-2">
                                <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full"></span>
                                Gaano katagal bago makuha ang refund?
                            </h4>
                            <p className="text-sm text-gray-600 font-medium leading-relaxed ml-3.5">Karaniwan ay 1-3 business days depende sa iyong bank o e-wallet (GCash/Maya) providers.</p>
                        </div>

                        <div className="group">
                            <h4 className="font-black text-indigo-900 uppercase tracking-widest text-[11px] mb-2 flex items-center gap-2">
                                <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full"></span>
                                Safe ba ang aking ID sa App?
                            </h4>
                            <p className="text-sm text-gray-600 font-medium leading-relaxed ml-3.5">Opo. Ang ABE Events ay gumagamit ng end-to-end encryption. Ang iyong data ay para sa verification purposes lamang ayon sa Data Privacy Act.</p>
                        </div>
                    </div>
                </div>

                {/* Direct Contact */}
                <div className="p-12 bg-gray-900 rounded-[3rem] text-center text-white shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-500/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
                    <p className="text-indigo-400 text-[10px] uppercase tracking-[0.3em] font-black mb-4 relative z-10">Emergency Contact</p>
                    <p className="text-lg font-medium opacity-80 mb-2 relative z-10">Tawagan kami sa:</p>
                    <p className="text-4xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white to-indigo-200 relative z-10">0917-ABE-HELP</p>
                    <p className="text-[10px] mt-6 opacity-40 font-black uppercase tracking-widest relative z-10">Mon-Sun | 8:00 AM - 10:00 PM</p>
                </div>

            </div>
        </div>
    );
};

export default SupportCenter;