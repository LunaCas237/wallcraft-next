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
        { role: 'ai', content: 'สวัสดีครับ! ผมคือผู้เชี่ยวชาญจาก Wallcraft พิมพ์สอบถามหรือส่งรูปไอเดียแต่งบ้านที่ชอบมาได้เลยครับ' }
    ]);
    
    // 🛠️ FIX: Added missing 'input' state
    const [input, setInput] = useState(""); 
    const [loading, setLoading] = useState(false);
    
    const fileInputRef = useRef<HTMLInputElement>(null);
    const scrollRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, loading, isOpen]);

    // 🛠️ FIX: Updated handleSend to handle both Text and Files
    const handleSend = async (file?: File) => {
        // Prevent sending if both input and file are empty
        if (!input.trim() && !file) return;

        const userMsg: Message = { 
            role: 'user', 
            content: input || "ค้นหาด้วยรูปภาพ...", 
            image: file ? URL.createObjectURL(file) : undefined 
        };
        
        setMessages(prev => [...prev, userMsg]);
        setLoading(true);
        
        const currentText = input; // Save text before clearing
        setInput(""); // Clear text bar

        const formData = new FormData();
        if (file) formData.append('image', file);
        if (currentText) formData.append('message', currentText);

        try {
            const res = await fetch('/api/ai-assistant', { method: 'POST', body: formData });
            const data = await res.json();

            const aiMsg: Message = {
                role: 'ai',
                content: data.ai_analysis || "นี่คือข้อมูลที่ผมพบครับ:",
                products: data.products || []
            };
            setMessages(prev => [...prev, aiMsg]);
        } catch (err) {
            setMessages(prev => [...prev, { role: 'ai', content: 'ขออภัยครับ ระบบประมวลผลขัดข้อง ลองใหม่อีกครั้งนะครับ' }]);
        } finally {
            setLoading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end font-sans">
            
            {/* Chat Window */}
            {isOpen && (
                <div className="mb-4 w-[350px] sm:w-[400px] h-[550px] bg-[#1a1c1e] rounded-2xl shadow-2xl border border-gray-700 flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
                    
                    {/* Header */}
                    <div className="bg-gray-900 p-4 flex items-center justify-between border-b border-gray-800">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-amber-400 rounded-full flex items-center justify-center shadow-inner">🤖</div>
                            <span className="font-bold text-white text-sm">Wallcraft AI</span>
                        </div>
                        <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white transition-colors">✕</button>
                    </div>

                    {/* Chat Messages */}
                    <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#121416]">
                        {messages.map((msg, idx) => (
                            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[85%] space-y-2`}>
                                    <div className={`p-3 rounded-2xl text-sm leading-relaxed ${
                                        msg.role === 'user' 
                                        ? 'bg-blue-600 text-white rounded-tr-none' 
                                        : 'bg-gray-800 text-gray-200 rounded-tl-none border border-gray-700'
                                    }`}>
                                        {msg.image && <img src={msg.image} className="rounded-lg mb-2 w-full object-cover" alt="upload" />}
                                        <p>{msg.content}</p>
                                    </div>

                                    {/* Products Grid */}
                                    {msg.products && msg.products.length > 0 && (
                                        <div className="grid grid-cols-2 gap-2 mt-2">
                                            {msg.products.map((p, i) => (
                                                <div key={i} className="bg-gray-900 rounded-xl border border-gray-700 overflow-hidden shadow-sm">
                                                    <img src={p.variant_image} className="h-20 w-full object-cover" alt={p.name} />
                                                    <div className="p-2 text-[10px]">
                                                        <p className="font-bold truncate text-white">{p.name}</p>
                                                        <p className="text-blue-400 font-bold mt-1">฿{p.price.toLocaleString()}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                        {loading && <div className="text-[11px] text-gray-500 animate-pulse italic">AI กำลังวิเคราะห์...</div>}
                    </div>

                    {/* 🛠️ FIX: New Input Bar Area */}
                    <div className="p-4 bg-gray-900 border-t border-gray-800">
                        <div className="flex items-center gap-2">
                            <button 
                                onClick={() => fileInputRef.current?.click()}
                                className="w-10 h-10 bg-gray-800 hover:bg-gray-700 rounded-full flex items-center justify-center border border-gray-700 transition-all shadow-md"
                            >
                                📷
                            </button>
                            <input type="file" ref={fileInputRef} onChange={(e) => e.target.files?.[0] && handleSend(e.target.files[0])} className="hidden" accept="image/*" />
                            
                            <input 
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                placeholder="ถามเรื่องลายไม้..."
                                className="flex-1 bg-gray-800 text-white rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 border border-gray-700"
                            />
                            
                            <button 
                                onClick={() => handleSend()}
                                className="text-blue-400 font-bold px-2 hover:text-blue-300 disabled:text-gray-600"
                                disabled={loading}
                            >
                                ส่ง
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Toggle Button */}
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className={`w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all transform hover:scale-105 active:scale-95 ${isOpen ? 'bg-gray-800' : 'bg-amber-400'}`}
            >
                {isOpen ? <span className="text-white text-xl">✕</span> : <span className="text-2xl">🤖</span>}
            </button>
        </div>
    );
}