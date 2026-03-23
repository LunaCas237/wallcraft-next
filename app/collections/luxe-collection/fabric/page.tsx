'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { FaChevronLeft, FaChevronRight, FaHeart, FaXmark, FaCartPlus } from 'react-icons/fa6';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabase = createClient(
  'https://mpsnwijabfingujzirri.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1wc253aWphYmZpbmd1anppcnJpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc4NDUzNzIsImV4cCI6MjA4MzQyMTM3Mn0.RTNnZHJRnYjoeX9faOi324CbooNxNaW6Fm2xJrV609M'
);

type Product = {
  id: string | number;
  title: string;
  item_code?: string | null;
  image_url?: string | null;
  dimensions?: string | null;
  subtitle?: string | null;
  description?: string | null;
  price?: number | string | null;
  collection_type?: string | null;
};

type GroupedProduct = {
  title: string;
  mainItem: Product;
  variants: Product[];
};

type DragState = {
  id: string | null;
  isDown: boolean;
  startX: number;
  scrollLeft: number;
};

const collectionOrder = [
  'L.MYSTIC', 'L.ACTUATE', 'L.WOOLLAM', 'L.MEADOW', 'L.ECOTINE', 
  'L.PEARL', 'L.LEEDS', 'L.STARRY', 'L.DUPIONI', 'L.VICTORIA', 
  'L.CANVAS', 'L.AGATE', 'L.JUNGLE', 'L.RUGGED'
];

const normalizeTitle = (text: string = ''): string => text.trim();

export default function FabricCollection() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null);
  const [downloadState, setDownloadState] = useState<boolean>(false);
  const [isFavoriting, setIsFavoriting] = useState(false);
  const [customNote, setCustomNote] = useState('');
  const [selectedQty, setSelectedQty] = useState(1);
  const [draggingSliderId, setDraggingSliderId] = useState<string | null>(null);

  const sliderRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const dragRef = useRef<DragState>({
    id: null,
    isDown: false,
    startX: 0,
    scrollLeft: 0,
  });

  useEffect(() => {
    let ignore = false;
    async function fetchCollection() {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('collection_type', 'fabric_collection');

        if (error) throw error;
        if (!ignore) setProducts((data as Product[]) || []);
      } catch (err: any) {
        if (!ignore) setErrorMsg(err.message);
      } finally {
        if (!ignore) setLoading(false);
      }
    }
    fetchCollection();
    return () => { ignore = true; };
  }, []);

  useEffect(() => {
    document.body.style.overflow = currentProduct ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [currentProduct]);

  // Dual Table Save Logic (Like Tarra Stone)
  const saveToDatabase = async (productId: string | number, tableName: 'user_favorites' | 'user_downloads', note: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        alert(`Please login to ${tableName === 'user_favorites' ? 'save favorites' : 'download items'}.`);
        return false;
      }
      const { error } = await supabase
        .from(tableName)
        .insert([{ 
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

      // Save to Download History
      await saveToDatabase(currentProduct.id, 'user_downloads', customNote);

      setTimeout(() => {
        setDownloadState(false);
        closeModal();
      }, 900);
    } catch (error) {
      setDownloadState(false);
    }
  };

  const groupedProducts = useMemo<GroupedProduct[]>(() => {
    const grouped: Record<string, Product[]> = {};
    products.forEach((item: Product) => {
      const cleanTitle = normalizeTitle(item.title || '');
      if (!grouped[cleanTitle]) grouped[cleanTitle] = [];
      grouped[cleanTitle].push(item);
    });

    return Object.keys(grouped)
      .sort((a, b) => {
        const indexA = collectionOrder.indexOf(a);
        const indexB = collectionOrder.indexOf(b);
        return (indexA === -1 ? 999 : indexA) - (indexB === -1 ? 999 : indexB);
      })
      .map((title) => {
        const variants = [...grouped[title]].sort((a, b) =>
          String(a.item_code || '').localeCompare(String(b.item_code || ''))
        );
        return { title, mainItem: variants[0], variants };
      });
  }, [products]);

  const currentVariants = useMemo<Product[]>(() => {
    if (!currentProduct) return [];
    return products
      .filter(item => normalizeTitle(item.title || '') === normalizeTitle(currentProduct.title || ''))
      .sort((a, b) => String(a.item_code || '').localeCompare(String(b.item_code || '')));
  }, [currentProduct, products]);

  const openProductModal = (product: Product) => {
    setCurrentProduct(product);
    setCustomNote('');
    setSelectedQty(1);
    setDownloadState(false);
  };

  const closeModal = () => {
    setCurrentProduct(null);
  };

  const scrollSlider = (sliderId: string, amount: number) => {
    sliderRefs.current[sliderId]?.scrollBy({ left: amount, behavior: 'smooth' });
  };

  const handleMouseDown = (sliderId: string, e: React.MouseEvent<HTMLDivElement>) => {
    const el = sliderRefs.current[sliderId];
    if (!el) return;
    dragRef.current = { id: sliderId, isDown: true, startX: e.pageX - el.offsetLeft, scrollLeft: el.scrollLeft };
    setDraggingSliderId(sliderId);
  };

  useEffect(() => {
    const handleGlobalMouseUp = () => {
      dragRef.current.isDown = false;
      setDraggingSliderId(null);
    };
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (!dragRef.current.isDown || !dragRef.current.id) return;
      const el = sliderRefs.current[dragRef.current.id];
      if (!el) return;
      e.preventDefault();
      const x = e.pageX - el.offsetLeft;
      const walk = (x - dragRef.current.startX) * 2;
      el.scrollLeft = dragRef.current.scrollLeft - walk;
    };
    window.addEventListener('mouseup', handleGlobalMouseUp);
    window.addEventListener('mousemove', handleGlobalMouseMove);
    return () => {
      window.removeEventListener('mouseup', handleGlobalMouseUp);
      window.removeEventListener('mousemove', handleGlobalMouseMove);
    };
  }, []);

  return (
    <div className="bg-[#0a0a0a] text-white overflow-x-hidden antialiased font-sans">
      <header
        className="relative min-h-[70vh] flex items-center overflow-hidden pt-20 text-left bg-black"
        style={{
          backgroundImage: "linear-gradient(to right, rgba(10, 10, 10, 0.7) 0%, rgba(10, 10, 10, 0.4) 50%, rgba(10, 10, 10, 0.1) 100%), url('https://raw.githubusercontent.com/WaiHmueThit23/wallcraft_assets/main/luxe_series/Asset%20135@2x.webp')",
          backgroundSize: 'cover', backgroundPosition: 'center',
        }}
      >
        <div className="container mx-auto px-8 lg:px-24 z-20">
          <div className="max-w-2xl animate-reveal">
            <div className="flex gap-1 h-1.5 w-28 mb-10">
              <div className="bg-gray-600 w-1/3"></div>
              <div className="bg-red-900 w-1/3"></div>
              <div className="bg-[#B08038] w-1/3"></div>
            </div>
            <h1 className="text-5xl lg:text-8xl font-bold tracking-tight mb-6 leading-none">
              <span className="text-[#B08038]">Fabric</span>
              <br />
              <span className="text-[#c2bfb6]">Collection</span>
            </h1>
          </div>
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto px-8 lg:px-16 py-20 min-h-[50vh]">
        {loading ? (
           <div className="flex flex-col items-center justify-center space-y-4 py-20 opacity-60">
             <div className="w-12 h-12 border-2 border-white/10 border-t-[#B08038] rounded-full animate-spin"></div>
             <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 font-medium text-center">Loading Fabric Textures.</p>
           </div>
        ) : errorMsg ? (
          <div className="py-20 text-center"><p className="text-red-500">{errorMsg}</p></div>
        ) : (
          <div>
            {groupedProducts.map((group, i) => {
              const sliderId = `slider-${i}`;
              return (
                <section key={group.title} className="product-card mb-24 lg:mb-[12rem] animate-reveal" style={{ animationDelay: `${i * 0.1}s` }}>
                  <div className="flex flex-col lg:flex-row gap-8 lg:gap-16 items-center justify-center max-w-5xl lg:max-w-6xl mx-auto">
                    <div className="w-full lg:w-1/2 relative group flex justify-center cursor-zoom-in">
                      <button type="button" onClick={() => openProductModal(group.mainItem)} className="w-full flex justify-center bg-transparent border-0 p-0">
                        <div className="absolute inset-0 bg-[#B08038]/10 blur-[80px] rounded-full pointer-events-none w-3/4 mx-auto h-3/4 mt-8"></div>
                        <div className="texture-preview-container relative z-10 w-[85%] lg:w-full max-w-[450px] lg:max-w-[550px] shadow-2xl overflow-hidden border border-white/5 bg-[#050505]">
                          <img src={group.mainItem.image_url || ''} alt={group.title} className="transition-all duration-700 group-hover:scale-105 object-contain w-full h-full" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <div className="p-4 border border-white/30 bg-black/40 backdrop-blur-md text-white text-[10px] uppercase tracking-widest font-bold">Quick View</div>
                          </div>
                        </div>
                      </button>
                    </div>

                    <div className="w-full lg:w-1/2 flex flex-col items-center lg:items-start text-center lg:text-left">
                      <h2 className="text-3xl lg:text-5xl font-bold uppercase mb-8 tracking-wide text-[#B08038]">{group.title}</h2>
                      <div className="w-[85%] lg:w-full max-w-[300px] lg:max-w-[400px] text-left mb-8 px-2 lg:px-0">
                        <h4 className="text-white text-xs lg:text-sm font-bold mb-2">Size</h4>
                        <p className="text-[#c2bfb6] text-[11px] lg:text-sm leading-relaxed whitespace-pre-line">{group.mainItem.dimensions || 'W1220 x H2440 x T5+- mm.\nW1220 x H2800 x T5+- mm.'}</p>
                      </div>
                      <div className="flex items-center gap-4 lg:gap-6 mb-10 w-full justify-center lg:justify-start">
                        <button type="button" className="w-8 h-8 lg:w-10 lg:h-10 rounded-full border border-white/40 flex items-center justify-center text-white/70 hover:border-[#B08038] hover:text-[#B08038] transition-colors" onClick={() => scrollSlider(sliderId, -200)}>
                          <FaChevronLeft className="text-[10px] lg:text-[12px]" />
                        </button>
                        
                        <div ref={(el) => { sliderRefs.current[sliderId] = el; }} onMouseDown={(e) => handleMouseDown(sliderId, e)} className={`flex gap-4 lg:gap-5 overflow-x-auto no-scrollbar w-[240px] lg:w-[400px] snap-x cursor-grab py-2 select-none ${draggingSliderId === sliderId ? 'grabbing' : ''}`}>
                          {group.variants.map((variant) => (
                            <button key={variant.id} type="button" onClick={() => openProductModal(variant)} className="flex-none w-[70px] lg:w-[100px] aspect-square opacity-90 hover:opacity-100 transition-all snap-center border border-white/10 hover:border-[#B08038] overflow-hidden">
                              <img src={variant.image_url || ''} alt={variant.title} className="w-full h-full object-cover" />
                            </button>
                          ))}
                        </div>
                        <button type="button" className="w-8 h-8 lg:w-10 lg:h-10 rounded-full border border-white/40 flex items-center justify-center text-white/70 hover:border-[#B08038] hover:text-[#B08038] transition-colors" onClick={() => scrollSlider(sliderId, 200)}>
                          <FaChevronRight className="text-[10px] lg:text-[12px]" />
                        </button>
                      </div>
                      <button type="button" className="border border-white/60 text-white px-8 py-2 lg:px-10 lg:py-3 lg:text-sm rounded-lg text-xs font-medium tracking-wide hover:bg-white hover:text-black transition-colors" onClick={() => openProductModal(group.mainItem)}>Learn more</button>
                    </div>
                  </div>
                </section>
              );
            })}
          </div>
        )}
      </main>

      {/* POPUP MODAL - Tarra Stone Layout + Fabric Color Selection preserved */}
      {currentProduct && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/95 backdrop-blur-md transition-opacity duration-300" onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}>
          <div className="relative w-full max-w-6xl bg-[#0f0f0f] border border-white/10 rounded-xl overflow-hidden shadow-2xl flex flex-col lg:flex-row max-h-[95vh]">
            <button type="button" onClick={closeModal} className="absolute top-4 right-4 z-20 w-10 h-10 flex items-center justify-center rounded-full bg-black/50 text-white hover:bg-[#B08038] transition-colors"><FaXmark /></button>
            
            {/* Left side: Image */}
            <div className="w-full lg:w-3/5 bg-[#050505] flex items-center justify-center p-8 relative">
              <img src={currentProduct.image_url || ''} alt={currentProduct.title} className="max-w-full max-h-[600px] object-contain p-4 transition-all duration-500" />
            </div>

            {/* Right side: Details (Tarra Layout) */}
            <div className="w-full lg:w-2/5 p-8 lg:p-12 flex flex-col border-l border-white/5 bg-[#0a0a0a] overflow-y-auto no-scrollbar text-left">
              <div className="mb-8">
                <h2 className="text-4xl text-[#B08038] font-medium uppercase mb-1 leading-tight">{currentProduct.title}</h2>
                <p className="text-[#c2bfb6] text-[10px] tracking-[0.3em] uppercase mb-4 opacity-80">{currentProduct.subtitle || 'Velvet Series'}</p>
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

              {/* YOUR ORIGINAL Color Selection Section (Preserved) */}
              <div className="mb-8">
                <span className="block text-white text-[10px] font-bold uppercase tracking-widest mb-4">Select Style/Color:</span>
                <div className="flex flex-wrap gap-3">
                  {currentVariants.map((variant) => {
                    const isActive = variant.id === currentProduct.id;
                    const suffix = variant.item_code?.split('-').pop() || variant.item_code || '-';
                    return (
                      <button key={variant.id} type="button" onClick={() => setCurrentProduct(variant)} className="group flex flex-col items-center gap-1 cursor-pointer">
                        <div className={`w-14 h-14 border transition-all overflow-hidden ${isActive ? 'border-[#B08038] scale-105' : 'border-white/10 group-hover:border-[#B08038]'}`}>
                          <img src={variant.image_url || ''} alt={suffix} className="w-full h-full object-cover" />
                        </div>
                        <span className={`text-[9px] uppercase tracking-widest ${isActive ? 'text-[#B08038] font-bold' : 'text-zinc-500'}`}>{suffix}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Custom Note (Like Tarra) */}
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

              {/* Action Buttons (Tarra style) */}
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

      <style jsx>{`
        .animate-reveal { animation: reveal 1.2s cubic-bezier(0.77, 0, 0.175, 1) forwards; }
        @keyframes reveal { 0% { transform: translateY(80px); opacity: 0; } 100% { transform: translateY(0); opacity: 1; } }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .texture-preview-container { width: 100%; aspect-ratio: 1 / 1; display: flex; align-items: center; justify-content: center; border-radius: 2px; }
        .grabbing { cursor: grabbing !important; }
      `}</style>
    </div>
  );
}