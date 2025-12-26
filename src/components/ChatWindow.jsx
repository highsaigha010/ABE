import React, { useState, useEffect, useRef } from 'react';

const ChatWindow = ({ booking, currentUser, messages, onSendMessage, onAcceptContract, onClose, className }) => {
    const [inputText, setInputText] = useState('');
    const [showContractForm, setShowContractForm] = useState(false);
    const [showSecurityWarning, setShowSecurityWarning] = useState(false);
    const [contractForm, setContractForm] = useState({
        title: booking?.package || '',
        price: booking?.price || '',
        inclusions: ''
    });

    const RESTRICTED_KEYWORDS = ['labas', 'personal account', 'direct payment', 'gcash', 'paymaya', 'number', 'contact', 'whatsapp', 'viber', 'telegram', 'messenger', 'fb', 'facebook'];
    const PHONE_REGEX = /(\+?\d{1,4}[-.\s]?)?(\(?\d{3}\)?[-.\s]?)?\d{3}[-.\s]?\d{4}/g;

    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Keyword Monitor Logic
    useEffect(() => {
        const lowerInput = inputText.toLowerCase();
        const hasKeyword = RESTRICTED_KEYWORDS.some(word => lowerInput.includes(word));
        const hasPhone = PHONE_REGEX.test(lowerInput);
        
        if (hasKeyword || hasPhone) {
            setShowSecurityWarning(true);
        } else {
            setShowSecurityWarning(false);
        }
    }, [inputText]);

    const chatMessages = messages.filter(m => m.bookingId === booking.id);
    const isVendor = currentUser.role === 'VENDOR';

    // System Message Logic
    useEffect(() => {
        if (chatMessages.length === 0 && booking) {
            // First time chat system message
            onSendMessage(booking.id, 'SYSTEM', 'Welcome to ABE Chat! For your safety, always keep transactions within the platform to stay protected by our Justice System.');
        }
    }, [booking?.id]);

    const handleSend = (e) => {
        e.preventDefault();
        if (!inputText.trim()) return;
        onSendMessage(booking.id, currentUser.id, inputText);
        setInputText('');
    };

    return (
        <div className={`fixed inset-0 z-50 pointer-events-none overflow-hidden ${className || ''}`}>
            {/* Overlay */}
            <div 
                className={`absolute inset-0 bg-gray-950/20 backdrop-blur-[2px] transition-opacity duration-500 pointer-events-auto ${booking ? 'opacity-100' : 'opacity-0'}`} 
                onClick={onClose}
            ></div>
            
            {/* Sliding Sidebar */}
            <div className="absolute top-0 right-0 h-full w-full max-w-lg bg-white shadow-[-20px_0_50px_-10px_rgba(0,0,0,0.1)] flex flex-col pointer-events-auto transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] transform translate-x-0 sm:rounded-l-[3rem] border-l border-gray-50">
                
                {/* Header */}
                <div className="p-8 sm:p-10 border-b border-gray-50 flex justify-between items-center bg-white/80 backdrop-blur-md sticky top-0 z-10">
                    <div className="flex items-center gap-5">
                        <div className="w-14 h-14 bg-indigo-600 rounded-[1.25rem] flex items-center justify-center text-white font-black text-2xl shadow-lg shadow-indigo-100 relative overflow-hidden group">
                            <span className="relative z-10">{isVendor ? booking.clientName[0] : booking.vendorName[0]}</span>
                            <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"></div>
                        </div>
                        <div>
                            <h3 className="font-black text-gray-900 text-lg leading-tight tracking-tighter uppercase italic">
                                {isVendor ? booking.clientName : booking.vendorName}
                            </h3>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                                    {booking.id} • Online
                                </p>
                            </div>
                        </div>
                    </div>
                    <button 
                        onClick={onClose} 
                        className="w-12 h-12 rounded-2xl bg-gray-50 text-gray-400 hover:text-gray-900 hover:bg-gray-100 flex items-center justify-center transition-all font-black text-xl"
                    >
                        ✕
                    </button>
                </div>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-8 sm:p-10 space-y-6 bg-white custom-scrollbar">
                    {chatMessages.length === 0 && (
                        <div className="h-full flex flex-col items-center justify-center text-center opacity-30 grayscale p-10">
                            <span className="text-6xl mb-6">💬</span>
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 max-w-[200px] leading-relaxed">
                                Walang messages pa, Abe. Simulan mo na ang usapan!
                            </p>
                        </div>
                    )}
                    
                    {chatMessages.map((msg) => {
                        const isOwn = msg.senderId === currentUser.id;
                        const isSystem = msg.senderId === 'SYSTEM';

                        if (isSystem) {
                            return (
                                <div key={msg.id} className="flex justify-center my-4">
                                    <div className="bg-amber-50 border border-amber-100 rounded-2xl px-6 py-3 max-w-[90%] text-center shadow-sm">
                                        <p className="text-[10px] font-black text-amber-700 uppercase tracking-widest leading-relaxed">
                                            {msg.text}
                                        </p>
                                    </div>
                                </div>
                            );
                        }
                        
                        if (msg.type === 'contract') {
                            return (
                                <div key={msg.id} className="flex justify-center my-10">
                                    <div className="bg-white rounded-[2.5rem] border border-gray-100 p-0 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)] max-w-md w-full relative overflow-hidden group animate-in zoom-in-95 duration-500">
                                        <div className="h-2 w-full bg-gradient-to-r from-indigo-600 to-indigo-400"></div>
                                        
                                        <div className="p-10">
                                            <div className="flex justify-between items-start mb-8">
                                                <div>
                                                    <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full uppercase tracking-[0.2em] mb-3 inline-block">Official Event Quote</span>
                                                    <h4 className="text-3xl font-black text-gray-900 tracking-tighter leading-[0.9] italic uppercase">{msg.contractData.title}</h4>
                                                </div>
                                                <div className="text-4xl">📄</div>
                                            </div>

                                            <div className="bg-gray-50 rounded-[2rem] p-6 mb-8 border border-gray-50">
                                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Final Agreed Price</p>
                                                <div className="text-4xl font-black text-indigo-600 tracking-tighter italic">₱{parseFloat(msg.contractData.price).toLocaleString()}</div>
                                            </div>
                                            
                                            <div className="space-y-4 mb-10">
                                                <p className="text-[10px] font-black text-gray-900 uppercase tracking-widest ml-1">Service Inclusions</p>
                                                {msg.contractData.inclusions.map((inc, i) => (
                                                    <div key={i} className="flex items-start gap-3 text-sm text-gray-600 font-medium">
                                                        <div className="w-5 h-5 rounded-full bg-indigo-50 flex items-center justify-center shrink-0 mt-0.5">
                                                            <span className="text-indigo-600 text-[10px]">✓</span>
                                                        </div>
                                                        <span className="leading-tight">{inc}</span>
                                                    </div>
                                                ))}
                                            </div>

                                            {!isVendor && booking.status === 'unpaid' && (
                                                <div className="flex flex-col gap-3">
                                                    <button 
                                                        onClick={() => onAcceptContract(booking.id, msg.contractData.price)}
                                                        className="w-full bg-gray-900 text-white py-6 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-indigo-600 transition-all shadow-[0_20px_40px_-10px_rgba(79,70,229,0.3)] active:scale-95"
                                                    >
                                                        Accept & Pay to Escrow
                                                    </button>
                                                    <button className="w-full bg-gray-50 text-gray-400 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-red-50 hover:text-red-500 transition-all">
                                                        Decline Quote
                                                    </button>
                                                </div>
                                            )}
                                            
                                            {isVendor && (
                                                <div className="text-center p-4 bg-indigo-50/50 rounded-2xl border border-indigo-50">
                                                    <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest animate-pulse">Waiting for Client Approval...</span>
                                                </div>
                                            )}

                                            {booking.status === 'paid' && (
                                                <div className="text-center p-5 bg-green-50 rounded-2xl border border-green-100 flex items-center justify-center gap-3">
                                                    <span className="text-xl">✅</span>
                                                    <span className="text-[10px] font-black text-green-600 uppercase tracking-widest">Contract Accepted & Paid</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        }

                        return (
                            <div key={msg.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                                <div className="flex flex-col gap-2 max-w-[85%]">
                                    <div className={`rounded-[1.75rem] px-6 py-4 shadow-sm relative ${isOwn ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-gray-50 text-gray-900 rounded-tl-none border border-gray-100'}`}>
                                        <p className="text-sm font-medium leading-relaxed">{msg.text}</p>
                                    </div>
                                    <div className={`flex items-center gap-2 px-1 ${isOwn ? 'justify-end' : 'justify-start'}`}>
                                        <span className="text-[8px] font-black text-gray-300 uppercase tracking-widest">{msg.timestamp}</span>
                                        {isOwn && (
                                            <div className="flex items-center">
                                                <span className={`text-[10px] font-black ${msg.isRead ? 'text-indigo-400' : 'text-gray-200'}`}>✓</span>
                                                <span className={`text-[10px] font-black -ml-1 ${msg.isRead ? 'text-indigo-400' : 'text-gray-200'}`}>✓</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                    <div ref={messagesEndRef} />
                </div>

                {/* Footer / Input */}
                <div className="p-8 sm:p-10 bg-white border-t border-gray-50 relative">
                    {/* Security Warning Tooltip */}
                    {showSecurityWarning && (
                        <div className="absolute bottom-full left-8 right-8 mb-4 bg-amber-400 text-gray-900 p-4 rounded-2xl shadow-2xl animate-in slide-in-from-bottom-2 duration-300 z-20">
                            <div className="flex items-start gap-3">
                                <span className="text-xl">🛡️</span>
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest">Smart Escrow Protection</p>
                                    <p className="text-xs font-bold mt-1 leading-tight">
                                        Abe, iwas sa off-platform deals! Manatili sa app para protektado ang bayad mo ng ating Justice System.
                                    </p>
                                </div>
                            </div>
                            <div className="absolute bottom-0 left-10 w-4 h-4 bg-amber-400 rotate-45 translate-y-2"></div>
                        </div>
                    )}

                    {showContractForm && isVendor && (
                        <div className="mb-8 p-8 bg-gray-50 rounded-[2.5rem] border border-gray-100 animate-in slide-in-from-bottom-8 duration-500 shadow-inner">
                            <div className="flex justify-between items-center mb-8">
                                <h4 className="text-[10px] font-black text-gray-900 uppercase tracking-[0.3em] italic">Create Contract Quote</h4>
                                <button onClick={() => setShowContractForm(false)} className="w-8 h-8 rounded-full bg-white text-gray-400 hover:text-gray-900 flex items-center justify-center text-xs shadow-sm">✕</button>
                            </div>
                            <div className="space-y-4">
                                <input 
                                    type="text" 
                                    placeholder="Service Title (e.g. Wedding Coverage)"
                                    value={contractForm.title}
                                    onChange={(e) => setContractForm({...contractForm, title: e.target.value})}
                                    className="w-full bg-white border-2 border-transparent focus:border-indigo-500 rounded-2xl px-6 py-4 text-sm font-bold shadow-sm transition-all outline-none"
                                />
                                <div className="relative">
                                    <span className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 font-black">₱</span>
                                    <input 
                                        type="number" 
                                        placeholder="Final Agreed Price"
                                        value={contractForm.price}
                                        onChange={(e) => setContractForm({...contractForm, price: e.target.value})}
                                        className="w-full bg-white border-2 border-transparent focus:border-indigo-50 rounded-2xl pl-12 pr-6 py-4 text-sm font-bold shadow-sm transition-all outline-none"
                                    />
                                </div>
                                <textarea 
                                    placeholder="Terms/Inclusions (One per line)"
                                    rows="3"
                                    value={contractForm.inclusions}
                                    onChange={(e) => setContractForm({...contractForm, inclusions: e.target.value})}
                                    className="w-full bg-white border-2 border-transparent focus:border-indigo-500 rounded-2xl px-6 py-4 text-sm font-bold shadow-sm transition-all outline-none resize-none"
                                ></textarea>
                                <button 
                                    onClick={handleSendContract}
                                    className="w-full bg-indigo-600 text-white py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-gray-900 shadow-xl shadow-indigo-100 transition-all active:scale-95"
                                >
                                    Send Contract to Client
                                </button>
                            </div>
                        </div>
                    )}

                    <form onSubmit={handleSend} className="flex gap-4">
                        {isVendor && !showContractForm && (
                            <button 
                                type="button"
                                onClick={() => setShowContractForm(true)}
                                className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-[1.5rem] flex items-center justify-center hover:bg-indigo-600 hover:text-white transition-all shadow-sm shrink-0 active:scale-90"
                                title="Create Contract"
                            >
                                <span className="text-2xl">📝</span>
                            </button>
                        )}
                        <div className="flex-1 relative group">
                            <input 
                                type="text" 
                                placeholder="Type your message Abe..."
                                value={inputText}
                                onChange={(e) => setInputText(e.target.value)}
                                className="w-full bg-gray-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-[1.5rem] px-8 py-5 outline-none font-bold text-sm transition-all shadow-inner"
                            />
                            <button 
                                type="submit"
                                className="absolute right-3 top-1/2 -translate-y-1/2 w-12 h-12 bg-gray-900 text-white rounded-2xl flex items-center justify-center hover:bg-indigo-600 transition-all shadow-xl active:scale-90 group-focus-within:bg-indigo-600"
                            >
                                <span className="text-xl">✈️</span>
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ChatWindow;
