import React, { useState } from 'react';

const VendorVerificationForm = ({ onComplete, businessName }) => {
    const [files, setFiles] = useState({
        dti: null,
        permit: null,
        id: null,
        selfie: null
    });
    const [paymentInfo, setPaymentInfo] = useState({
        bankName: '',
        accountNumber: '',
        accountName: ''
    });
    const [ownerName, setOwnerName] = useState('');
    const [tosAccepted, setTosAccepted] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleFileChange = (type, e) => {
        const file = e.target.files[0];
        if (file) {
            setFiles(prev => ({ ...prev, [type]: file }));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!files.dti || !files.permit || !files.id || !files.selfie) {
            alert("Abe, paki-upload lahat ng required documents kasama ang Selfie!");
            return;
        }
        if (!ownerName) {
            alert("Pakilagay ang Owner Name gaya ng nasa ID, Abe.");
            return;
        }
        if (!tosAccepted) {
            alert("Pakibasa at tanggapin ang Terms of Service, Abe.");
            return;
        }

        setLoading(true);
        // Simulate upload/submission
        setTimeout(() => {
            const verificationData = {
                id: `verify-${Date.now()}`,
                businessName: businessName,
                ownerName: ownerName,
                files: {
                    dti: files.dti.name,
                    permit: files.permit.name,
                    id: files.id.name,
                    selfie: files.selfie.name
                },
                paymentInfo,
                status: 'pending_verification',
                date: new Date().toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })
            };
            onComplete(verificationData);
            setLoading(false);
        }, 2000);
    };

    const FileUploadZone = ({ label, type, file }) => (
        <div className="relative group">
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-1">{label}</label>
            <div className={`relative h-32 rounded-2xl border-2 border-dashed transition-all flex flex-col items-center justify-center gap-2 cursor-pointer overflow-hidden
                ${file ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-indigo-400 bg-gray-50'}`}>
                <input 
                    type="file" 
                    onChange={(e) => handleFileChange(type, e)}
                    className="absolute inset-0 opacity-0 cursor-pointer z-10"
                />
                {file ? (
                    <>
                        <span className="text-2xl">📄</span>
                        <span className="text-[10px] font-bold text-green-600 uppercase truncate px-4 w-full text-center">{file.name}</span>
                    </>
                ) : (
                    <>
                        <span className="text-2xl group-hover:scale-110 transition-transform">📤</span>
                        <span className="text-[10px] font-bold text-gray-400 uppercase">Drag or Click to Upload</span>
                    </>
                )}
            </div>
        </div>
    );

    return (
        <div className="max-w-2xl mx-auto my-6 md:my-12 p-6 md:p-10 bg-white rounded-2xl md:rounded-[2.5rem] shadow-2xl border border-gray-50 mx-4 sm:mx-auto relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 to-purple-600"></div>
            
            <div className="text-center mb-10">
                <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full uppercase tracking-widest mb-4 inline-block">Step 2: Verification</span>
                <h1 className="text-3xl md:text-4xl font-black text-gray-900 mb-2 tracking-tight">Business <span className="text-indigo-600">Verification</span></h1>
                <p className="text-gray-500 font-medium italic">"Clean and Trustworthy" - Helping build trust in Pampanga.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Documents Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <FileUploadZone label="DTI Certificate" type="dti" file={files.dti} />
                    <FileUploadZone label="Business Permit" type="permit" file={files.permit} />
                    <FileUploadZone label="Valid Gov ID" type="id" file={files.id} />
                    <FileUploadZone label="Selfie w/ ID" type="selfie" file={files.selfie} />
                </div>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest text-center">
                    🚨 Selfie is required for Escrow Security and Anti-Fraud verification.
                </p>

                {/* Owner Info Section */}
                <div className="bg-indigo-50/30 p-8 rounded-[2.5rem] border border-indigo-50">
                    <label className="block text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-3 ml-1">Full Name of Owner (As shown on ID)</label>
                    <input
                        type="text"
                        required
                        value={ownerName}
                        onChange={(e) => setOwnerName(e.target.value)}
                        placeholder="Juan Dela Cruz"
                        className="w-full px-6 py-4 rounded-2xl border-2 border-transparent focus:border-indigo-500 focus:bg-white bg-white outline-none font-bold transition-all text-sm shadow-sm"
                    />
                </div>

                {/* Payment Info Section */}
                <div className="bg-gray-50 p-8 rounded-[2.5rem] border border-gray-100">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm">
                            <span className="text-xl">💰</span>
                        </div>
                        <div>
                            <h3 className="text-sm font-black text-gray-900 uppercase tracking-tight">Payment Information</h3>
                            <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest flex items-center gap-1">
                                <span className="text-indigo-600">🔒</span> Private & Secure
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Bank Name / GCash</label>
                            <input
                                type="text"
                                required
                                value={paymentInfo.bankName}
                                onChange={(e) => setPaymentInfo({...paymentInfo, bankName: e.target.value})}
                                placeholder="e.g. GCash or BDO"
                                className="w-full px-6 py-4 rounded-2xl border-2 border-transparent focus:border-indigo-500 focus:bg-white bg-white outline-none font-bold transition-all text-sm shadow-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Account Number</label>
                            <input
                                type="text"
                                required
                                value={paymentInfo.accountNumber}
                                onChange={(e) => setPaymentInfo({...paymentInfo, accountNumber: e.target.value})}
                                placeholder="09XX XXX XXXX"
                                className="w-full px-6 py-4 rounded-2xl border-2 border-transparent focus:border-indigo-500 focus:bg-white bg-white outline-none font-bold transition-all text-sm shadow-sm"
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Account Name (Dapat kapareho ng nasa ID)</label>
                            <input
                                type="text"
                                required
                                value={paymentInfo.accountName}
                                onChange={(e) => setPaymentInfo({...paymentInfo, accountName: e.target.value})}
                                placeholder="Juan Dela Cruz"
                                className="w-full px-6 py-4 rounded-2xl border-2 border-transparent focus:border-indigo-500 focus:bg-white bg-white outline-none font-bold transition-all text-sm shadow-sm"
                            />
                        </div>
                    </div>
                </div>

                {/* TOS Checkbox */}
                <div className="flex items-start gap-4 p-6 bg-indigo-50/50 rounded-2xl border border-indigo-50">
                    <input 
                        type="checkbox" 
                        id="tos"
                        checked={tosAccepted}
                        onChange={(e) => setTosAccepted(e.target.checked)}
                        className="mt-1 w-5 h-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                    />
                    <label htmlFor="tos" className="text-xs font-bold text-gray-600 leading-relaxed cursor-pointer">
                        I understand that <span className="text-indigo-600">ABE Events</span> will hold 80% of the funds in Smart Escrow until service completion. I agree to the platform's verification standards.
                    </label>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-gray-900 transition-all shadow-2xl shadow-indigo-100 flex items-center justify-center gap-3 group"
                >
                    {loading ? (
                        <>
                            <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Verifying documents...
                        </>
                    ) : (
                        <>Submit for Verification <span className="group-hover:translate-x-1 transition-transform">&rarr;</span></>
                    )}
                </button>
            </form>
        </div>
    );
};

export default VendorVerificationForm;