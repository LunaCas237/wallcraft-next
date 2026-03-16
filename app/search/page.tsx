'use client';
<<<<<<< HEAD

import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '../lib/supabase'; // <-- Bulletproof relative path
import { Camera, Search, Loader2 } from 'lucide-react';
import Link from 'next/link';

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
        img.crossOrigin = "anonymous"; // Prevents CORS issues with Supabase images
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
        img.onerror = () => resolve("0000"); // Return safe fallback on load error
        img.src = imgSource;
    });
};

export default function SearchPage() {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [uploadedImage, setUploadedImage] = useState<string | null>(null);

    // ==========================================
    // 1. TEXT SEARCH LOGIC
    // ==========================================
    const handleTextSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!query.trim()) return;
        
        setLoading(true);
        setResults([]);
        setUploadedImage(null); // Clear image preview if switching to text search
        
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
            // Step A: Convert to Base64 and show in UI immediately
            const base64Image = await fileToBase64(file);
            setUploadedImage(base64Image); 

            // Log to Supabase
            await supabase.from('search_image').insert([{
                id: uuidv4(),
                image_url: base64Image, 
                style: 'User Upload',   
                feat_ver: 'v1'
            }]);

            // Step B: Fetch all products so we can compare their pixels locally
            const { data: allProducts, error: fetchError } = await supabase
                .from('products')
                .select('*');

            if (fetchError) throw fetchError;

            // Step C: Generate fingerprint for the uploaded image
            const uploadFingerprint = await getFingerprint(base64Image);

            // Step D: Calculate similarity scores for every product
            const scoredMatches = await Promise.all((allProducts || []).map(async (product) => {
                const productFingerprint = await getFingerprint(product.image_url);
                let diff = 0;
                for (let i = 0; i < uploadFingerprint.length; i++) {
                    if (uploadFingerprint[i] !== productFingerprint[i]) diff++;
                }
                const score = Math.max(0, 100 - (diff / 2.56));
                return { ...product, matchScore: score };
            }));

            // Step E: Filter out anything below 90% and sort highest to lowest
            const strictMatches = scoredMatches
                .filter(p => p.matchScore >= 90)
                .sort((a, b) => b.matchScore - a.matchScore);

            setResults(strictMatches);

        } catch (err) {
            console.error("Image Search Error:", err);
        } finally {
            setLoading(false);
            e.target.value = ''; // Reset file input
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
                        Product Gallery
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
                
                {/* Visual Target Preview (Shows un-cropped uploaded image) */}
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
                        <p className="text-[#c2bfb6] font-['Prompt'] animate-pulse text-sm tracking-widest uppercase">Analyzing Visual Data...</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                        {results.length > 0 ? (
                            results.map((product) => (
                                <div key={product.id} className="group relative bg-zinc-900/30 border border-white/5 overflow-hidden transition-all duration-500 hover:border-[#B08038]/40 shadow-2xl">
                                    
                                    {/* Similarity Badge Overlay */}
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
                                            <Link href={`/product/${product.id}`} className="w-full bg-[#B08038] text-black text-center py-3 text-[10px] font-bold tracking-[0.2em] uppercase transition-transform hover:scale-[1.02]">
                                                View Details
                                            </Link>
                                        </div>
                                    </div>
                                    <div className="p-6 space-y-2 relative z-10">
                                        <h3 className="font-['Prompt'] text-lg text-[#c2bfb6] group-hover:text-[#B08038] transition-colors truncate">
                                            {product.title}
                                        </h3>
                                        <div className="flex justify-between items-center border-t border-white/5 pt-4">
                                            <span className="text-white/40 text-xs uppercase tracking-widest">{product.collection_type || 'Premium Series'}</span>
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
            
            {/* Global Styles for Texture */}
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
            `}</style>
        </div>
    );
=======

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { supabase } from '../lib/supabase';
import SearchInput from '../components/SearchInput';

function SearchResults() {
  const searchParams = useSearchParams();
  const matchesParam = searchParams.get('matches');
  const textQuery = searchParams.get('q');
  const searchId = searchParams.get('searchId'); // Get the ID of the uploaded image

  const [products, setProducts] = useState<any[]>([]);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // State for the Popup Modal
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);

  useEffect(() => {
    async function fetchResults() {
      setIsLoading(true);
      try {
        // Fetch the uploaded image to display as a preview
        if (searchId) {
          const { data: searchData } = await supabase
            .from('search_image')
            .select('image_url')
            .eq('id', searchId)
            .single();
          if (searchData) setUploadedImage(searchData.image_url);
        }

        if (matchesParam === 'pending') {
          setProducts([]); 
        } else if (matchesParam) {
          const ids = matchesParam.split(',');
          const { data, error } = await supabase.from('products').select('*').in('id', ids);
          if (error) throw error;
          const sortedData = ids.map(id => data?.find(p => p.id === id)).filter(Boolean);
          setProducts(sortedData);
        } else if (textQuery) {
          const { data, error } = await supabase.from('products').select('*').ilike('title', `%${textQuery}%`);
          if (error) throw error;
          setProducts(data || []);
        } else {
          const { data, error } = await supabase.from('products').select('*').limit(8);
          if (error) throw error;
          setProducts(data || []);
        }
      } catch (error) {
        console.error("Error loading products:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchResults();
  }, [matchesParam, textQuery, searchId]);

  return (
    <div className="w-full">
      {/* Upload Preview Section */}
      {uploadedImage && (
        <div className="mb-10 flex flex-col items-center animate-fade-in">
          <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-[#B08038]/30 shadow-2xl mb-4">
            <img src={uploadedImage} alt="Uploaded query" className="w-full h-full object-cover" />
          </div>
          <p className="text-[#B08038] text-[10px] tracking-[0.2em] uppercase font-bold">
            Analysis Target
          </p>
        </div>
      )}

      <div className="mb-8 border-b border-white/10 pb-4">
        <h2 className="text-white/60 text-[10px] tracking-[0.3em] uppercase">
          {matchesParam ? "90%+ MATCH CONFIDENCE RESULTS" : (textQuery ? `RESULTS FOR "${textQuery}"` : "EXPLORE ARCHIVE")}
        </h2>
      </div>

      {isLoading ? (
        <div className="text-[#c2bfb6] text-xs tracking-widest uppercase">Analyzing Archive...</div>
      ) : products.length === 0 ? (
        <div className="text-[#c2bfb6] text-xs tracking-widest uppercase py-12 text-center border border-white/10 rounded-lg">
          No matches found above 90% confidence threshold.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <div 
              key={product.id} 
              className="group cursor-pointer"
              onClick={() => setSelectedProduct(product)} // Open Modal on click
            >
              <div className="w-full aspect-square bg-[#1a1a1a] rounded-sm overflow-hidden mb-4 relative">
                {matchesParam && (
                  <div className="absolute top-2 right-2 bg-black/80 backdrop-blur-sm text-[#B08038] text-[9px] font-bold px-2 py-1 rounded-sm z-10 tracking-widest uppercase border border-[#B08038]/30">
                    High Match
                  </div>
                )}
                <img src={product.image_url} alt={product.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-in-out" />
              </div>
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-white text-xs font-bold tracking-wider uppercase mb-1">{product.title}</h3>
                  <p className="text-[#c2bfb6] text-[10px] tracking-widest uppercase">{product.style}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* POPUP MODAL */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md transition-opacity">
          {/* Click outside to close */}
          <div className="absolute inset-0" onClick={() => setSelectedProduct(null)}></div>
          
          <div className="relative bg-[#111] w-full max-w-4xl rounded-lg shadow-2xl overflow-hidden flex flex-col md:flex-row border border-white/10 animate-fade-in-up">
            
            {/* Close Button */}
            <button 
              onClick={() => setSelectedProduct(null)}
              className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-black/50 text-white hover:bg-[#B08038] transition-colors"
            >
              &#10005;
            </button>

            {/* Modal Image */}
            <div className="w-full md:w-1/2 aspect-square md:aspect-auto md:h-[500px] bg-black">
              <img src={selectedProduct.image_url} alt={selectedProduct.title} className="w-full h-full object-cover" />
            </div>

            {/* Modal Details */}
            <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
              <p className="text-[#B08038] text-[10px] tracking-[0.3em] uppercase mb-2 font-bold">Wallcraft Collection</p>
              <h2 className="text-white text-2xl md:text-3xl font-bold uppercase tracking-wide mb-2">{selectedProduct.title}</h2>
              <p className="text-white/60 text-sm tracking-wider uppercase mb-6">{selectedProduct.style}</p>
              
              <div className="h-[1px] w-full bg-white/10 mb-6"></div>
              
              <p className="text-[#c2bfb6] text-sm leading-relaxed mb-8">
                {selectedProduct.description || "A pristine example of organic aesthetic and masterful craftsmanship. Designed to elevate any space with natural elegance."}
              </p>
              
              <div className="flex items-center justify-between mt-auto">
                <span className="text-white text-xl font-medium tracking-widest">{selectedProduct.price || '฿ Price on Request'}</span>
                <button className="bg-white text-black px-8 py-3 text-[10px] uppercase tracking-widest font-bold hover:bg-[#B08038] hover:text-white transition-colors rounded-sm">
                  Add to Archive
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default function SearchPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] px-6 py-12 md:px-12 md:py-20">
      <div className="max-w-7xl mx-auto">
        <SearchInput />
        <Suspense fallback={<div className="text-[#B08038] text-xs tracking-widest">LOADING ARCHIVE...</div>}>
          <SearchResults />
        </Suspense>
      </div>
    </div>
  );
>>>>>>> 72e3d6c645d5dd0bfb5206fe10bea832baaf06f7
}