'use client';

import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '../lib/supabase'; // <-- Adjust relative path if needed
import { Camera, Search, Loader2 } from 'lucide-react';
import { FaHeart, FaCartPlus, FaXmark } from 'react-icons/fa6';

// Helper: Converts the uploaded image file to a Base64 string
const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
    });
};

// Helper: Generates a visual fingerprint (hash) of an image using HTML5 Canvas
const getFingerprint = (imgSource: string): Promise<string> => {
    return new Promise((resolve) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return resolve("0000");

        canvas.width = 16;
        canvas.height = 16;

        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => {
            ctx.drawImage(img, 0, 0, 16, 16);
            const data = ctx.getImageData(0, 0, 16, 16).data;
            let hash = "";
            for (let i = 0; i < data.length; i += 4) {
                const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
                hash += avg > 128 ? "1" : "0";
            }
            resolve(hash);
        };
        img.onerror = () => resolve("0000");
        img.src = imgSource;
    });
};

export default function SearchPage() {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [uploadedImage, setUploadedImage] = useState<string | null>(null);

    // Modal States
    const [currentProduct, setCurrentProduct] = useState<any | null>(null);
    const [customNote, setCustomNote] = useState('');
    const [selectedQty, setSelectedQty] = useState(1);
    const [downloadState, setDownloadState] = useState(false);
    const [isFavoriting, setIsFavoriting] = useState(false);

    // Lock body scroll when modal is open
    useEffect(() => {
        document.body.style.overflow = currentProduct ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
    }, [currentProduct]);

    // ==========================================
    // 1. TEXT SEARCH LOGIC
    // ==========================================
    const handleTextSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!query.trim()) return;
        
        setLoading(true);
        setResults([]);
        setUploadedImage(null); 
        
        try {
            const { error: insertError } = await supabase.from('search_text').insert([{
                id: uuidv4(),
                search_term: query,
                style: 'User Query',     
                feat_ver: 'v1'
            }]);
            
            if (insertError) console.error("DB Log Error:", insertError.message);

            const { data, error: searchError } = await supabase
                .from('products')
                .select('*')
                .or(`title.ilike.%${query}%,collection_type.ilike.%${query}%,texture_name.ilike.%${query}%`);

            if (searchError) throw searchError;
            setResults(data || []);
            
        } catch (err) {
            console.error("Text Search Error:", err);
        } finally {
            setLoading(false);
        }
    };

    // ==========================================
    // 2. VISUAL SIMILARITY SEARCH LOGIC (Canvas)
    // ==========================================
    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        
        setLoading(true);
        setResults([]);
        
        try {
            const base64Image = await fileToBase64(file);
            setUploadedImage(base64Image); 

            await supabase.from('search_image').insert([{
                id: uuidv4(),
                image_url: base64Image, 
                style: 'User Upload',   
                feat_ver: 'v1'
            }]);

            const { data: allProducts, error: fetchError } = await supabase.from('products').select('*');
            if (fetchError) throw fetchError;

            const uploadFingerprint = await getFingerprint(base64Image);

            const scoredMatches = await Promise.all((allProducts || []).map(async (product) => {
                const productFingerprint = await getFingerprint(product.image_url);
                let diff = 0;
                for (let i = 0; i < uploadFingerprint.length; i++) {
                    if (uploadFingerprint[i] !== productFingerprint[i]) diff++;
                }
                const score = Math.max(0, 100 - (diff / 2.56));
                return { ...product, matchScore: score };
            }));

            const strictMatches = scoredMatches
                .filter(p => p.matchScore >= 90)
                .sort((a, b) => b.matchScore - a.matchScore);

            setResults(strictMatches);

        } catch (err) {
            console.error("Image Search Error:", err);
        } finally {
            setLoading(false);
            e.target.value = ''; 
        }
    };

    // ==========================================
    // 3. MODAL & DATABASE LOGIC
    // ==========================================
    const openProductModal = (product: any) => {
        setCurrentProduct(product);
        setCustomNote('');
        setSelectedQty(1);
        setDownloadState(false);
    };

    const closeModal = () => setCurrentProduct(null);

    const saveToDatabase = async (productId: string | number, tableName: 'user_favorites' | 'user_downloads', note: string) => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                alert(`Please login to ${tableName === 'user_favorites' ? 'save favorites' : 'download items'}.`);
                return false;
            }
            const { error } = await supabase.from(tableName).insert([{ 
                user_id: session.user.id, 
                product_id: productId,
                custom_note: note 
            }]);

            if (error) {
                if (error.code === '23505' && tableName === 'user_favorites') {
                    alert("This item is already in your favorites.");
                } else if (error.code !== '23505') throw error;
            }
            return true;
        } catch (err) {
            console.error(`Database Error (${tableName}):`, err);
            return false;
        }
    };

    const handleFavorite = async () => {
        if (!currentProduct) return;
        setIsFavoriting(true);
        const success = await saveToDatabase(currentProduct.id, 'user_favorites', customNote);
        if (success) alert("Added to your saved textures in Profile!");
        setIsFavoriting(false);
    };

    const handleDownloadSimple = async () => {
        if (!currentProduct?.image_url) return;
        try {
            setDownloadState(true);
            const response = await fetch(currentProduct.image_url);
            const blob = await response.blob();
            const blobUrl = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = blobUrl;
            link.download = `${currentProduct.item_code || currentProduct.title}.jpg`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(blobUrl);

            await saveToDatabase(currentProduct.id, 'user_downloads', customNote);

            setTimeout(() => {
                setDownloadState(false);
            }, 900);
        } catch (error) {
            setDownloadState(false);
        }
    };

    // ==========================================
    // UI RENDER
    // ==========================================
    return (
        <div className="series-textured min-h-screen font-light selection:bg-[#B08038]/30 w-full overflow-x-hidden text-white">
            
            {/* Header & Search Bar Section */}
            <section className="relative pt-24 pb-12 px-6">
                <div className="max-w-[1800px] mx-auto text-center">
                    <h1 className="text-4xl md:text-6xl font-bold tracking-tighter uppercase text-[#B08038] mb-6 font-['Prompt']">
                        Search Archive
                    </h1>
                    <p className="text-[#c2bfb6] font-['Prompt'] max-w-2xl mx-auto mb-12 text-sm md:text-base opacity-80">
                        ค้นหาแรงบันดาลใจสำหรับผนังของคุณด้วยระบบค้นหาอัจฉริยะ 
                        ไม่ว่าจะเป็นชื่อรุ่น หรือค้นหาผ่านรูปภาพที่คุณประทับใจ
                    </p>

                    <div className="max-w-3xl mx-auto">
                        <form onSubmit={handleTextSearch} className="group relative flex items-center bg-zinc-900/50 backdrop-blur-md rounded-none border border-white/10 p-1 transition-all focus-within:border-[#B08038]/50 shadow-2xl">
                            <Search className="ml-4 text-[#B08038]" size={20} />
                            
                            <input 
                                type="text"
                                placeholder="Search by name, collection, or texture..."
                                className="w-full bg-transparent p-4 outline-none text-white placeholder:text-zinc-600 font-['Prompt']"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                            />
                            
                            <label className="p-3 hover:bg-white/5 rounded-none cursor-pointer transition flex items-center gap-2 border-l border-white/5">
                                <Camera className="text-[#c2bfb6] hover:text-[#B08038] transition-colors" size={24} />
                                <input 
                                    type="file" 
                                    className="hidden" 
                                    onChange={handleImageUpload} 
                                    accept="image/jpeg, image/png, image/webp" 
                                />
                            </label>
                            
                            <button type="submit" disabled={loading} className="bg-[#B08038] px-8 py-4 text-black font-bold uppercase text-[10px] tracking-[0.2em] hover:bg-[#d4a04d] transition-all ml-1 disabled:opacity-50 disabled:cursor-not-allowed">
                                Search
                            </button>
                        </form>
                    </div>
                </div>
            </section>

            {/* Results Section */}
            <section className="max-w-[1800px] mx-auto px-6 md:px-16 pb-32">
                
                {uploadedImage && !loading && (
                    <div className="mb-16 flex flex-col items-center animate-fade-in border-b border-white/10 pb-12">
                        <div className="flex items-center gap-3 mb-6">
                            <Camera className="text-[#B08038]" size={18} />
                            <h2 className="text-[#B08038] font-bold tracking-widest uppercase text-sm">Target Search Image</h2>
                        </div>
                        <div className="h-56 p-2 rounded-xl border border-[#B08038]/30 bg-black/40 shadow-2xl backdrop-blur-sm">
                            <img 
                                src={uploadedImage} 
                                alt="Search Query" 
                                className="h-full w-auto object-contain mx-auto rounded-lg" 
                            />
                        </div>
                        <button 
                            onClick={() => { setUploadedImage(null); setResults([]); }} 
                            className="mt-6 text-[10px] text-white/40 hover:text-white uppercase tracking-widest transition-colors"
                        >
                            [ Clear Visual Search ]
                        </button>
                    </div>
                )}

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <Loader2 className="animate-spin text-[#B08038] mb-4" size={48} />
                        <p className="text-[#c2bfb6] font-['Prompt'] animate-pulse text-sm tracking-widest uppercase">Scanning Database...</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                        {results.length > 0 ? (
                            results.map((product) => (
                                <div key={product.id} className="group relative bg-zinc-900/30 border border-white/5 overflow-hidden transition-all duration-500 hover:border-[#B08038]/40 shadow-2xl">
                                    
                                    {product.matchScore && (
                                        <div className="absolute top-4 right-4 z-10 bg-black/80 backdrop-blur-md px-3 py-1 border border-[#B08038] text-[#B08038] text-[10px] font-bold tracking-widest uppercase">
                                            {Math.round(product.matchScore)}% Match
                                        </div>
                                    )}

                                    <div className="aspect-[4/5] relative overflow-hidden bg-black">
                                        <img 
                                            src={product.image_url} 
                                            alt={product.title} 
                                            className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-700 opacity-90 group-hover:opacity-100" 
                                            loading="lazy"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-6 z-10">
                                            <button 
                                                onClick={() => openProductModal(product)} 
                                                className="w-full bg-[#B08038] text-black text-center py-3 text-[10px] font-bold tracking-[0.2em] uppercase transition-transform hover:scale-[1.02]"
                                            >
                                                View Details
                                            </button>
                                        </div>
                                    </div>
                                    <div className="p-6 space-y-2 relative z-10">
                                        <h3 className="font-['Prompt'] text-lg text-[#c2bfb6] group-hover:text-[#B08038] transition-colors truncate">
                                            {product.title}
                                        </h3>
                                        <div className="flex justify-between items-center border-t border-white/5 pt-4">
                                            <span className="text-white/40 text-xs uppercase tracking-widest">{product.collection_type?.replace(/_/g, ' ') || 'Premium Series'}</span>
                                            <span className="text-[#B08038] font-bold">{product.price ? `฿${product.price}` : 'Contact for price'}</span>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="col-span-full text-center py-20 opacity-40">
                                <p className="font-['Prompt'] text-xl mb-2 text-[#c2bfb6]">No matching products found.</p>
                                <p className="text-sm tracking-wide">Try adjusting your search term or uploading a clearer image.</p>
                            </div>
                        )}
                    </div>
                )}
            </section>

            {/* POPUP MODAL (Directly on Search Page) */}
            {currentProduct && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/95 backdrop-blur-md transition-opacity duration-300" onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}>
                    <div className="relative w-full max-w-6xl bg-[#0f0f0f] border border-white/10 rounded-xl overflow-hidden shadow-2xl flex flex-col lg:flex-row max-h-[95vh] animate-fade-in">
                        <button type="button" onClick={closeModal} className="absolute top-4 right-4 z-20 w-10 h-10 flex items-center justify-center rounded-full bg-black/50 text-white hover:bg-[#B08038] transition-colors"><FaXmark /></button>
                        
                        {/* Left side: Image */}
                        <div className="w-full lg:w-3/5 bg-[#050505] flex items-center justify-center p-8 relative">
                            <img src={currentProduct.image_url || ''} alt={currentProduct.title} className="max-w-full max-h-[600px] object-contain p-4 transition-all duration-500" />
                        </div>

                        {/* Right side: Details */}
                        <div className="w-full lg:w-2/5 p-8 lg:p-12 flex flex-col border-l border-white/5 bg-[#0a0a0a] overflow-y-auto no-scrollbar text-left">
                            <div className="mb-8">
                                <h2 className="text-4xl text-[#B08038] font-medium uppercase mb-1 leading-tight">{currentProduct.title}</h2>
                                <p className="text-[#c2bfb6] text-[10px] tracking-[0.3em] uppercase mb-4 opacity-80">{currentProduct.collection_type?.replace(/_/g, ' ') || currentProduct.subtitle || 'Premium Series'}</p>
                                <p className="text-[#c2bfb6] text-sm tracking-widest">{currentProduct.item_code || '-'}</p>
                            </div>

                            <div className="mb-8 p-4 bg-white/5 rounded-sm border border-white/5">
                                <div className="flex justify-between items-center mb-4">
                                    <span className="text-zinc-400 text-[10px] uppercase tracking-wider">Estimated Price</span>
                                    <span className="text-sm text-[#c2bfb6] font-light uppercase tracking-widest">
                                        {currentProduct.price ? `฿${Number(currentProduct.price).toLocaleString()}` : 'Inquiry Required'}
                                    </span>
                                </div>
                                <div className="flex flex-col space-y-1">
                                    <span className="text-zinc-400 text-[10px] uppercase tracking-wider font-bold">Standard Dimensions</span>
                                    <span className="text-[#c2bfb6] text-sm font-light whitespace-pre-line leading-relaxed">{currentProduct.dimensions || 'Standard Form'}</span>
                                </div>
                            </div>

                            <div className="mb-8">
                                <span className="block text-white text-[10px] font-bold uppercase tracking-widest mb-4">Customization Note</span>
                                <textarea 
                                    value={customNote} 
                                    onChange={(e) => setCustomNote(e.target.value)} 
                                    className="w-full bg-black/40 border border-white/10 rounded-md p-3 text-sm text-white focus:outline-none focus:border-[#B08038] transition-colors resize-none" 
                                    rows={3} 
                                    placeholder="Enter custom dimensions or notes..." 
                                />
                            </div>

                            <div className="mt-auto pt-8 border-t border-white/10">
                                <div className="flex flex-col gap-4">
                                    <div className="flex gap-4">
                                        <div className="flex items-center border border-white/20 rounded-sm">
                                            <button type="button" className="px-4 py-3 text-white" onClick={() => setSelectedQty(q => Math.max(1, q - 1))}>-</button>
                                            <span className="px-2 text-white font-mono w-8 text-center">{selectedQty}</span>
                                            <button type="button" className="px-4 py-3 text-white" onClick={() => setSelectedQty(q => q + 1)}>+</button>
                                        </div>
                                        <button type="button" onClick={handleDownloadSimple} className="flex-1 bg-white text-black uppercase text-[11px] font-bold tracking-[0.2em] hover:bg-[#B08038] hover:text-white transition-all rounded-sm flex items-center justify-center gap-3">
                                            {downloadState ? 'DOWNLOADED' : 'Download Simple'} <FaCartPlus />
                                        </button>
                                    </div>
                                    <button 
                                        type="button" 
                                        disabled={isFavoriting} 
                                        onClick={handleFavorite}
                                        className="w-full border border-[#B08038] text-[#B08038] hover:bg-[#B08038] hover:text-white uppercase text-[11px] font-bold tracking-[0.2em] py-4 rounded-sm transition-all flex items-center justify-center gap-3"
                                    >
                                        {isFavoriting ? 'SAVING...' : 'Add to Favorite'} <FaHeart />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            
            <style jsx global>{`
                .series-textured {
                    background-image: linear-gradient(rgba(8, 8, 8, 0.9), rgba(8, 8, 8, 0.9)), 
                                      url('https://raw.githubusercontent.com/WaiHmueThit23/wallcraft_assets/main/Band_Introduction/Asset%2091@3x.webp');
                    background-size: cover;
                    background-position: center;
                    background-attachment: fixed;
                }
                
                @keyframes fade-in {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in {
                    animation: fade-in 0.5s ease-out forwards;
                }
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
        </div>
    );
}