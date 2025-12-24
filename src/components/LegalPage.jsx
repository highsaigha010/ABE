import React from 'react';

const LegalPage = () => {
    return (
        <div className="min-h-screen bg-white py-20 px-4 sm:px-6 lg:px-8 font-sans selection:bg-indigo-100">
            <div className="max-w-4xl mx-auto">

                {/* Logo / Header */}
                <div className="text-center mb-24">
                    <h1 className="text-6xl font-black text-gray-900 tracking-tighter leading-none mb-6">
                        ABE<span className="text-indigo-600 italic">EVENTS</span>
                    </h1>
                    <p className="text-gray-400 text-xs font-black uppercase tracking-[0.3em] mb-4">
                        "Ing Abe Mu king Seguradung Event"
                    </p>
                    <div className="h-1.5 w-12 bg-indigo-600 mx-auto rounded-full"></div>
                </div>

                <div className="grid grid-cols-1 gap-12">

                    {/* Section: Escrow */}
                    <section className="bg-gray-50 rounded-[3rem] p-12 border border-gray-100 relative overflow-hidden group">
                         <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-100/30 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform duration-700"></div>
                        <div className="flex items-center mb-10 relative z-10">
                            <div className="bg-indigo-600 p-3 rounded-2xl mr-6 shadow-xl shadow-indigo-100">
                                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04" />
                                </svg>
                            </div>
                            <h2 className="text-3xl font-black text-gray-900 tracking-tight">Terms of Escrow</h2>
                        </div>
                        <p className="text-gray-600 leading-relaxed mb-10 text-lg font-medium italic">
                            Ang aming Escrow System ay ang pundasyon ng tiwala sa ABE Events. Layunin nito na siguraduhing bayad ang Vendor at protektado ang Client.
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {[
                                { title: "20% Mobilization", desc: "Awtomatikong ibibigay sa Vendor pagkatapos ng In-App GPS Check-in sa venue." },
                                { title: "80% Final Release", desc: "Ibibigay lamang kapag na-verify na ang pagpasa ng deliverables o output." },
                                { title: "Refund Policy", desc: "100% ibabalik sa Client kung napatunayan na ang Vendor ay 'No-Show'." }
                            ].map((item, i) => (
                                <div key={i} className="bg-white p-6 rounded-2xl border border-gray-100">
                                    <h4 className="font-black text-indigo-900 uppercase tracking-widest text-[10px] mb-3">{item.title}</h4>
                                    <p className="text-xs text-gray-500 font-bold leading-relaxed">{item.desc}</p>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Section: Privacy */}
                    <section className="bg-white rounded-[3rem] p-12 border border-gray-100 relative overflow-hidden group">
                        <div className="flex items-center mb-10">
                            <div className="bg-gray-900 p-3 rounded-2xl mr-6 shadow-xl">
                                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8-0v4h8z" />
                                </svg>
                            </div>
                            <h2 className="text-3xl font-black text-gray-900 tracking-tight">Privacy Policy</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="bg-gray-50 p-8 rounded-[2rem] border border-gray-100">
                                <span className="block font-black text-indigo-600 text-[10px] uppercase tracking-widest mb-4">Data Storage</span>
                                <p className="text-sm text-gray-600 font-bold leading-relaxed italic">Ang iyong IDs at selfies ay encrypted at sumusunod sa Data Privacy Act of 2012.</p>
                            </div>
                            <div className="bg-gray-50 p-8 rounded-[2rem] border border-gray-100">
                                <span className="block font-black text-indigo-600 text-[10px] uppercase tracking-widest mb-4">Third-Party Policy</span>
                                <p className="text-sm text-gray-600 font-bold leading-relaxed italic">Hindi kailanman ibebenta o ibabahagi ang iyong impormasyon sa labas ng platform.</p>
                            </div>
                        </div>
                    </section>

                </div>

                {/* Footer */}
                <footer className="mt-24 text-center">
                    <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.4em] mb-4">
                        © 2025 ABE Events. Angeles City, Pampanga.
                    </p>
                    <div className="text-indigo-600 font-black text-sm tracking-widest">
                        support@abe-events.ph
                    </div>
                </footer>
            </div>
        </div>
    );
};

export default LegalPage;