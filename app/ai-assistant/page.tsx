"use client";
import { useState, useRef, useEffect } from 'react';

interface Product {
    sku: string;
    name: string;
    color: string;
    variant_image: string;
    price: number;
    similarity: number;
}

interface Message {
    role: 'user' | 'ai';
    content: string;
    image?: string;
    products?: Product[];
}

export default function AIchatbot() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        { role: 'ai', content: 'สวัสดีครับ! ผมคือผู้ช่วย AI จาก Wallcraft มีอะไรให้ผมช่วยเลือกชมลายไม้หรือตรวจสอบรูปภาพไหมครับ?' }
    ]);
    const [input, setInput] = useState(""); 
    const [loading, setLoading] = useState(false);
    
    const fileInputRef = useRef<HTMLInputElement>(null);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, loading, isOpen]);

    const handleSend = async (file?: File) => {
        if (!input.trim() && !file) return;

        const userMsg: Message = { 
            role: 'user', 
            content: input || "ตรวจสอบรูปภาพนี้...", 
            image: file ? URL.createObjectURL(file) : undefined 
        };
        
        setMessages(prev => [...prev, userMsg]);
        setLoading(true);
        const currentText = input;
        setInput(""); 

        const formData = new FormData();
        if (file) formData.append('image', file);
        if (currentText) formData.append('message', currentText);

        try {
            const res = await fetch('/api/ai-assistant', { method: 'POST', body: formData });
            const data = await res.json();

            const aiMsg: Message = {
                role: 'ai',
                content: data.ai_analysis || "นี่คือข้อมูลสินค้าที่เราพบครับ:",
                products: data.products || []
            };
            setMessages(prev => [...prev, aiMsg]);
        } catch (err) {
            setMessages(prev => [...prev, { role: 'ai', content: 'ขออภัยครับ ระบบประมวลผลขัดข้อง โปรดลองใหม่อีกครั้งนะครับ' }]);
        } finally {
            setLoading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end font-sans">
            
            {/* Chat Window */}
            {isOpen && (
                <div className="mb-4 w-[350px] sm:w-[400px] h-[550px] bg-white rounded-3xl shadow-2xl border border-blue-100 flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
                    
                    {/* Header: Professional Blue Gradient */}
                    <div className="bg-gradient-to-r from-blue-700 to-blue-900 p-5 flex items-center justify-between shadow-lg">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-white/20 rounded-xl backdrop-blur-md flex items-center justify-center border border-white/30">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M12 2C6.477 2 2 6.477 2 12C2 17.523 6.477 22 12 22C17.523 22 22 17.523 22 12C22 6.477 17.523 2 12 2ZM12 20C7.589 20 4 16.411 4 12C4 7.589 7.589 4 12 4C16.411 4 20 7.589 20 12C20 16.411 16.411 20 12 20Z" fill="white"/>
                                    <path d="M12 6C9.791 6 8 7.791 8 10C8 12.209 9.791 14 12 14C14.209 14 16 12.209 16 10C16 7.791 14.209 6 12 6Z" fill="white"/>
                                    <circle cx="12" cy="10" r="2" fill="#3b82f6"/>
                                </svg>
                            </div>
                            <div>
                                <h2 className="font-bold text-white text-md">Wallcraft Assistant</h2>
                                <p className="text-[10px] text-blue-200 flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span> ประมวลผลด้วย AI
                                </p>
                            </div>
                        </div>
                        <button onClick={() => setIsOpen(false)} className="text-white/70 hover:text-white transition-colors">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                        </button>
                    </div>

                    {/* Chat Messages */}
                    <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
                        {messages.map((msg, idx) => (
                            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className="max-w-[85%] space-y-2">
                                    <div className={`p-4 rounded-2xl text-sm leading-relaxed shadow-sm ${
                                        msg.role === 'user' 
                                        ? 'bg-blue-600 text-white rounded-tr-none' 
                                        : 'bg-white text-slate-700 rounded-tl-none border border-blue-50'
                                    }`}>
                                        {msg.image && <img src={msg.image} className="rounded-xl mb-3 w-full object-cover border border-slate-100" alt="upload" />}
                                        <p>{msg.content}</p>
                                    </div>

                                    {/* Products Grid */}
                                    {msg.products && msg.products.length > 0 && (
                                        <div className="grid grid-cols-2 gap-2 mt-2">
                                            {msg.products.map((p, i) => (
                                                <div key={i} className="bg-white rounded-2xl border border-blue-100 overflow-hidden shadow-sm hover:border-blue-300 transition-all">
                                                    <img src={p.variant_image} className="h-24 w-full object-cover" alt={p.name} />
                                                    <div className="p-2.5 text-[10px]">
                                                        <p className="font-bold truncate text-slate-800">{p.name}</p>
                                                        <p className="text-blue-600 font-extrabold mt-1">฿{p.price.toLocaleString()}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                        {loading && (
                            <div className="flex justify-start">
                                <div className="bg-white px-4 py-2 rounded-full border border-blue-50 text-[11px] text-blue-500 font-medium animate-pulse">
                                    AI กำลังคิด...
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Input Bar: Modern & Rounded */}
                    <div className="p-4 bg-white border-t border-slate-100">
                        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-full border border-slate-200 focus-within:border-blue-400 focus-within:ring-1 focus-within:ring-blue-400 transition-all">
                            <button 
                                onClick={() => fileInputRef.current?.click()}
                                className="w-9 h-9 bg-white text-blue-600 hover:bg-blue-50 rounded-full flex items-center justify-center transition-all shadow-sm"
                            >
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
                            </button>
                            <input type="file" ref={fileInputRef} onChange={(e) => e.target.files?.[0] && handleSend(e.target.files[0])} className="hidden" accept="image/*" />
                            
                            <input 
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                placeholder="ถามเราได้เลย..."
                                className="flex-1 bg-transparent text-slate-700 px-2 py-2 text-sm focus:outline-none"
                            />
                            
                            <button 
                                onClick={() => handleSend()}
                                disabled={loading}
                                className="w-9 h-9 bg-blue-600 hover:bg-blue-700 text-white rounded-full flex items-center justify-center transition-all shadow-md disabled:bg-slate-300"
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Floating Trigger Button: The Iconic Blue Bubble */}
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-[0_10px_40px_rgba(37,99,235,0.4)] transition-all duration-300 transform hover:scale-110 active:scale-90 ${isOpen ? 'bg-slate-900' : 'bg-blue-600'}`}
            >
                {isOpen ? (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                ) : (
                    <svg width="30" height="30" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M21 11.5C21 16.1944 16.9706 20 12 20C11.0253 20 10.0894 19.854 9.22709 19.5815L5 21L6.15286 17.5414C4.81691 15.9686 4 13.8447 4 11.5C4 6.80558 8.02944 3 12 3C16.9706 3 21 6.80558 21 11.5Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <circle cx="12" cy="11.5" r="2.5" fill="white"/>
                    </svg>
                )}
            </button>
        </div>
    );
}