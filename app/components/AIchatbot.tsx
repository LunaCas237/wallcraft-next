"use client";
import { useState, useRef, useEffect } from 'react';
import { ImageIcon, Mic, Send, Settings, Sparkles, X, MessageCircle, Languages } from 'lucide-react';

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
    const [showSettings, setShowSettings] = useState(false);
    const [language, setLanguage] = useState<'th' | 'en'>('th'); // Language State
    
    const [messages, setMessages] = useState<Message[]>([
        { 
            role: 'ai', 
            content: language === 'th' 
                ? 'สวัสดีครับ! ผมคือผู้เชี่ยวชาญจาก Wallcraft พิมพ์สอบถามได้เลยครับ' 
                : 'Hello! I am your Wallcraft expert. How can I help you today?' 
        }
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
            content: input || (language === 'th' ? "ค้นหาด้วยรูปภาพ..." : "Searching with image..."),
            image: file ? URL.createObjectURL(file) : undefined
        };

        setMessages(prev => [...prev, userMsg]);
        setLoading(true);
        const currentText = input;
        setInput("");

        const formData = new FormData();
        if (file) formData.append('image', file);
        if (currentText) formData.append('message', currentText);
        
        // --- IMPORTANT: Pass language to your API ---
        formData.append('lang', language); 

        try {
            const res = await fetch('/api/ai-assistant', { method: 'POST', body: formData });
            const data = await res.json();

            const aiMsg: Message = {
                role: 'ai',
                content: data.ai_analysis || (language === 'th' ? "นี่คือข้อมูลที่พบครับ" : "Here is what I found:"),
                products: data.products || []
            };
            setMessages(prev => [...prev, aiMsg]);
        } catch (err) {
            setMessages(prev => [...prev, { 
                role: 'ai', 
                content: language === 'th' ? 'เกิดข้อผิดพลาด ลองใหม่อีกครั้ง' : 'Error occurred, please try again.' 
            }]);
        } finally {
            setLoading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end font-sans">
            {isOpen && (
                <div className="mb-4 w-[350px] sm:w-[420px] h-[600px] bg-[#0f0f0f] rounded-3xl shadow-2xl border border-gray-800 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
                    
                    {/* Header */}
                    <header className="relative flex justify-between items-center px-5 py-4 bg-[#161616] border-b border-gray-800">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-500/10 rounded-xl">
                                <Sparkles className="text-blue-400 w-5 h-5" />
                            </div>
                            <h1 className="text-sm font-bold text-white tracking-tight">Wallcraft AI</h1>
                        </div>

                        <div className="flex items-center gap-3">
                            {/* Language Quick Toggle */}
                            <button 
                                onClick={() => setLanguage(language === 'th' ? 'en' : 'th')}
                                className="flex items-center gap-1 bg-[#262626] px-2 py-1 rounded-lg border border-gray-700 hover:border-blue-500 transition-all"
                            >
                                <Languages className="w-3.5 h-3.5 text-blue-400" />
                                <span className="text-[10px] font-bold text-white uppercase">{language}</span>
                            </button>
                            
                            <Settings 
                                className={`w-4 h-4 cursor-pointer transition-colors ${showSettings ? 'text-blue-400' : 'text-gray-600 hover:text-white'}`}
                                onClick={() => setShowSettings(!showSettings)}
                            />
                            <button onClick={() => setIsOpen(false)} className="text-gray-500 hover:text-white"><X className="w-5 h-5" /></button>
                        </div>

                        {/* Dropdown Settings Menu */}
                        {showSettings && (
                            <div className="absolute top-16 right-5 w-40 bg-[#1a1a1a] border border-gray-800 rounded-xl shadow-2xl p-2 z-10 animate-in fade-in zoom-in duration-200">
                                <p className="text-[10px] text-gray-500 px-2 mb-1 uppercase font-bold">Select Language</p>
                                <button 
                                    onClick={() => { setLanguage('th'); setShowSettings(false); }}
                                    className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-colors ${language === 'th' ? 'bg-blue-500/20 text-blue-400' : 'text-gray-400 hover:bg-white/5'}`}
                                >
                                    ภาษาไทย (Thai)
                                </button>
                                <button 
                                    onClick={() => { setLanguage('en'); setShowSettings(false); }}
                                    className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-colors ${language === 'en' ? 'bg-blue-500/20 text-blue-400' : 'text-gray-400 hover:bg-white/5'}`}
                                >
                                    English (US)
                                </button>
                            </div>
                        )}
                    </header>

                    {/* Chat Area */}
                    <main ref={scrollRef} className="flex-1 overflow-y-auto p-5 space-y-6 bg-[#0f0f0f] scrollbar-hide">
                        {messages.map((msg, idx) => (
                            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`p-4 rounded-2xl text-sm ${
                                    msg.role === 'user' ? 'bg-[#262626] text-white rounded-tr-none' : 'bg-[#1a1a1a] text-gray-300 rounded-tl-none border border-gray-800'
                                }`}>
                                    {msg.image && <img src={msg.image} className="rounded-xl mb-3 w-full object-cover max-h-48" alt="upload" />}
                                    <p>{msg.content}</p>
                                </div>
                            </div>
                        ))}
                        {loading && <div className="text-[11px] text-gray-500 animate-pulse italic">AI is thinking...</div>}
                    </main>

                    {/* Input Area */}
                    <footer className="p-5 bg-[#161616] border-t border-gray-800">
                        <div className="flex items-center gap-3">
                            <button onClick={() => fileInputRef.current?.click()} className="p-3 bg-[#262626] rounded-2xl border border-gray-700">
                                <ImageIcon className="w-5 h-5 text-gray-400" />
                            </button>
                            <div className="relative flex-1">
                                <input 
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                    placeholder={language === 'th' ? "ถามเรื่องลายไม้..." : "Ask about wood patterns..."}
                                    className="w-full bg-[#0a0a0a] text-gray-200 rounded-2xl py-3 px-5 text-sm focus:outline-none border border-gray-800"
                                />
                                <button onClick={() => handleSend()} className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-blue-500/10 rounded-xl">
                                    <Send className="w-4 h-4 text-blue-500" />
                                </button>
                            </div>
                        </div>
                        <input type="file" ref={fileInputRef} onChange={(e) => e.target.files?.[0] && handleSend(e.target.files[0])} className="hidden" accept="image/*" />
                    </footer>
                </div>
            )}

            {/* Main Toggle */}
            <button onClick={() => setIsOpen(!isOpen)} className="w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all bg-blue-500">
                {isOpen ? <X className="text-white w-6 h-6" /> : <MessageCircle className="text-white w-7 h-7" />}
            </button>
        </div>
    );
}