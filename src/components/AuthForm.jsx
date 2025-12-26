import React, { useState } from 'react';

const AuthForm = ({ initialMode = 'login', onAuthSuccess }) => {
    const [isLogin, setIsLogin] = useState(initialMode === 'login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');

    // STEP 1: Siguraduhin nating false ang default loading
    const [loading, setLoading] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        setLoading(true); // Start spinner

        console.log("Attempting login...");

        // --- SAFETY TIMEOUT ---
        setTimeout(() => {

            // STEP 2: I-verify ang credentials sa App.jsx
            if (onAuthSuccess) {
                onAuthSuccess({ email, password, name });
            } else {
                alert("Error: onAuthSuccess function is missing!");
            }

            setLoading(false);
        }, 1000);
    };

    return (
        <div className="bg-white p-10 rounded-[2.5rem] shadow-2xl shadow-gray-200 border border-gray-50 max-w-md w-full mx-auto relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 to-purple-600"></div>
            
            <div className="mb-10 text-center">
                <h2 className="text-3xl font-black text-gray-900 tracking-tighter">
                    {isLogin ? 'Welcome Back' : 'Create Account'}
                </h2>
                <p className="text-gray-400 text-xs font-black uppercase tracking-[0.2em] mt-3">
                    {isLogin ? 'Demo Mode Active' : 'Join ABE Events'}
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">

                {!isLogin && (
                    <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Full Name</label>
                        <input
                            type="text"
                            className="w-full px-6 py-4 rounded-2xl border-2 border-gray-50 focus:border-indigo-500 focus:bg-white bg-gray-50 outline-none font-bold transition-all text-sm placeholder-gray-300"
                            placeholder="Juan Dela Cruz"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>
                )}

                <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Email Address</label>
                    <input
                        type="email"
                        required
                        className="w-full px-6 py-4 rounded-2xl border-2 border-gray-50 focus:border-indigo-500 focus:bg-white bg-gray-50 outline-none font-bold transition-all text-sm placeholder-gray-300"
                        placeholder="name@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </div>

                <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Password</label>
                    <input
                        type="password"
                        required
                        className="w-full px-6 py-4 rounded-2xl border-2 border-gray-50 focus:border-indigo-500 focus:bg-white bg-gray-50 outline-none font-bold transition-all text-sm placeholder-gray-300"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <div className="flex justify-end mt-2">
                         <span className="text-[10px] text-green-600 font-black uppercase tracking-widest">
                            * Auto-Login Active
                        </span>
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className={`w-full font-black text-xs uppercase tracking-[0.2em] py-5 rounded-2xl shadow-xl transition-all flex justify-center items-center
            ${loading ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-gray-900 hover:bg-indigo-600 text-white transform active:scale-95'}
          `}
                >
                    {loading ? (
                        <span className="flex items-center gap-3">
               <svg className="animate-spin h-5 w-5 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                 <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                 <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
               </svg>
               Processing...
             </span>
                    ) : (
                        isLogin ? 'Sign In Now' : 'Create Account'
                    )}
                </button>
            </form>

            <div className="text-center mt-10">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    {isLogin ? "Don't have an account?" : "Already have an account?"} <span className="text-indigo-600 cursor-pointer hover:underline">Switch Mode</span>
                </p>
            </div>
        </div>
    );
};

export default AuthForm;