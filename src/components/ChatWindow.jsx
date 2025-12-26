import React, { useState, useEffect, useRef } from 'react';

const ChatWindow = ({ booking, currentUser, messages, onSendMessage, onAcceptContract, onClose }) => {
    const [inputText, setInputText] = useState('');
    const [showContractForm, setShowContractForm] = useState(false);
    const [contractForm, setContractForm] = useState({
        title: booking?.package || '',
        price: booking?.price || '',
        inclusions: ''
    });

    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = (e) => {
        e.preventDefault();
        if (!inputText.trim()) return;
        onSendMessage(booking.id, currentUser.id, inputText);
        setInputText('');
    };

    const handleSendContract = (e) => {
        e.preventDefault();
        const inclusionsList = contractForm.inclusions.split('\n').filter(i => i.trim());
        const contractData = {
            ...contractForm,
            inclusions: inclusionsList,
            vendorId: currentUser.id,
            vendorName: currentUser.name
        };
        onSendMessage(booking.id, currentUser.id, `CONTRACT_OFFER: ${contractForm.title}`, 'contract', contractData);
        setShowContractForm(false);
    };

    const chatMessages = messages.filter(m => m.bookingId === booking.id);
    const isVendor = currentUser.role === 'VENDOR';

    return (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 sm:p-6">
            <div className="absolute inset-0 bg-gray-950/40 backdrop-blur-sm" onClick={onClose}></div>
            
            <div className="bg-white w-full max-w-2xl h-[80vh] rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden relative border border-gray-100 animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="p-6 border-b border-gray-50 flex justify-between items-center bg-white">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white font-black text-xl">
                            {isVendor ? booking.clientName[0] : booking.vendorName[0]}
                        </div>
                        <div>
                            <h3 className="font-black text-gray-900 leading-tight">
                                {isVendor ? booking.clientName : booking.vendorName}
                            </h3>
                            <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">
                                {booking.id} • {booking.package}
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} className="w-10 h-10 rounded-xl bg-gray-50 text-gray-400 hover:text-gray-900 flex items-center justify-center transition-colors font-black">✕</button>
                </div>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-[#F8FAFC] custom-scrollbar">
                    {chatMessages.length === 0 && (
                        <div className="h-full flex flex-col items-center justify-center text-center opacity-30 grayscale p-10">
                            <span className="text-5xl mb-4">💬</span>
                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Walang messages pa, Abe. Simulan mo na ang usapan!</p>
                        </div>
                    )}
                    
                    {chatMessages.map((msg) => {
                        const isOwn = msg.senderId === currentUser.id;
                        
                        if (msg.type === 'contract') {
                            return (
                                <div key={msg.id} className="flex justify-center my-6">
                                    <div className="bg-white rounded-[2rem] border-2 border-indigo-600 p-8 shadow-xl max-w-md w-full relative overflow-hidden group">
                                        <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-50 rounded-bl-[5rem] -mr-12 -mt-12 group-hover:bg-indigo-100 transition-colors"></div>
                                        <div className="relative">
                                            <span className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em] mb-4 block">Smart Contract Quote</span>
                                            <h4 className="text-2xl font-black text-gray-900 tracking-tighter mb-2 italic">{msg.contractData.title}</h4>
                                            <div className="text-3xl font-black text-indigo-600 mb-6 italic">₱{parseFloat(msg.contractData.price).toLocaleString()}</div>
                                            
                                            <div className="space-y-2 mb-8">
                                                {msg.contractData.inclusions.map((inc, i) => (
                                                    <div key={i} className="flex items-center gap-2 text-sm text-gray-600 font-medium">
                                                        <span className="text-indigo-600">✓</span> {inc}
                                                    </div>
                                                ))}
                                            </div>

                                            {!isVendor && booking.status === 'unpaid' && (
                                                <div className="flex gap-3">
                                                    <button 
                                                        onClick={() => onAcceptContract(booking.id, msg.contractData.price)}
                                                        className="flex-1 bg-gray-900 text-white py-4 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-xl shadow-indigo-100"
                                                    >
                                                        Accept & Pay to Escrow
                                                    </button>
                                                    <button className="px-6 bg-gray-50 text-gray-400 py-4 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-gray-100">
                                                        Decline
                                                    </button>
                                                </div>
                                            )}
                                            
                                            {isVendor && (
                                                <div className="text-center p-3 bg-indigo-50 rounded-xl">
                                                    <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Waiting for Client's Response...</span>
                                                </div>
                                            )}

                                            {booking.status === 'paid' && (
                                                <div className="text-center p-3 bg-green-50 rounded-xl border border-green-100">
                                                    <span className="text-[10px] font-black text-green-600 uppercase tracking-widest">✅ Contract Accepted & Paid</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        }

                        return (
                            <div key={msg.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[80%] rounded-3xl px-6 py-4 shadow-sm relative ${isOwn ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-white text-gray-900 rounded-tl-none border border-gray-100'}`}>
                                    <p className="text-sm font-medium leading-relaxed">{msg.text}</p>
                                    <div className={`mt-2 flex items-center gap-2 ${isOwn ? 'justify-end text-indigo-200' : 'justify-start text-gray-400'}`}>
                                        <span className="text-[8px] font-bold uppercase tracking-widest">{msg.timestamp}</span>
                                        {isOwn && <span className="text-[10px]">{msg.isRead ? '✓✓' : '✓'}</span>}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                    <div ref={messagesEndRef} />
                </div>

                {/* Footer / Input */}
                <div className="p-6 bg-white border-t border-gray-50">
                    {showContractForm && isVendor && (
                        <div className="mb-6 p-6 bg-gray-50 rounded-[2rem] border border-gray-100 animate-in slide-in-from-bottom-4">
                            <div className="flex justify-between items-center mb-6">
                                <h4 className="text-sm font-black text-gray-900 uppercase tracking-widest italic">Create Contract Quote</h4>
                                <button onClick={() => setShowContractForm(false)} className="text-gray-400 hover:text-gray-900 font-black">✕</button>
                            </div>
                            <div className="space-y-4">
                                <input 
                                    type="text" 
                                    placeholder="Service Title (e.g. Wedding Coverage)"
                                    value={contractForm.title}
                                    onChange={(e) => setContractForm({...contractForm, title: e.target.value})}
                                    className="w-full bg-white border border-gray-100 rounded-xl px-5 py-3 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                                <div className="relative">
                                    <span className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 font-black">₱</span>
                                    <input 
                                        type="number" 
                                        placeholder="Final Agreed Price"
                                        value={contractForm.price}
                                        onChange={(e) => setContractForm({...contractForm, price: e.target.value})}
                                        className="w-full bg-white border border-gray-100 rounded-xl pl-10 pr-5 py-3 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                                <textarea 
                                    placeholder="Terms/Inclusions (One per line)"
                                    rows="3"
                                    value={contractForm.inclusions}
                                    onChange={(e) => setContractForm({...contractForm, inclusions: e.target.value})}
                                    className="w-full bg-white border border-gray-100 rounded-xl px-5 py-3 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                                ></textarea>
                                <button 
                                    onClick={handleSendContract}
                                    className="w-full bg-indigo-600 text-white py-4 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-gray-900 shadow-xl shadow-indigo-100 transition-all"
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
                                className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center hover:bg-indigo-100 transition-colors shadow-sm shrink-0"
                                title="Create Contract"
                            >
                                <span className="text-2xl">📝</span>
                            </button>
                        )}
                        <input 
                            type="text" 
                            placeholder="Type your message Abe..."
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            className="flex-1 bg-gray-50 border border-transparent focus:border-indigo-500 focus:bg-white rounded-2xl px-6 py-4 outline-none font-medium text-sm transition-all"
                        />
                        <button 
                            type="submit"
                            className="w-14 h-14 bg-gray-900 text-white rounded-2xl flex items-center justify-center hover:bg-indigo-600 transition-all shadow-xl active:scale-95 shrink-0"
                        >
                            <span className="text-xl">✈️</span>
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ChatWindow;
