'use client';

import React, { useState, useEffect } from 'react';
import { FaHeart, FaXmark, FaCartPlus } from 'react-icons/fa6';
import { supabase } from '../lib/supabase';

// Define the shape of your product based on your database
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

export default function SearchResults({ initialResults }: { initialResults: Product[] }) {
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null);
  const [variants, setVariants] = useState<Product[]>([]);
  const [downloadState, setDownloadState] = useState<boolean>(false);
  const [isFavoriting, setIsFavoriting] = useState(false);
  const [customNote, setCustomNote] = useState('');
  const [selectedQty, setSelectedQty] = useState(1);

  // Prevent background scrolling when modal is open
  useEffect(() => {
    document.body.style.overflow = currentProduct ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [currentProduct]);

  // Dual Table Save Logic
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

      await saveToDatabase(currentProduct.id, 'user_downloads', customNote);

      setTimeout(() => {
        setDownloadState(false);
        closeModal();
      }, 900);
    } catch (error) {
      setDownloadState(false);
    }
  };

  const openProductModal = async (product: Product) => {
    setCurrentProduct(product);
    setCustomNote('');
    setSelectedQty(1);
    setDownloadState(false);
    
    // Fetch variants dynamically so the modal shows related styles
    const { data } = await supabase
      .from('products')
      .select('*')
      .ilike('title', product.title); // Finds all items with the same title
      
    if (data) {
        // Sort them alphabetically by item_code
        const sortedVariants = data.sort((a, b) => 
            String(a.item_code || '').localeCompare(String(b.item_code || ''))
        );
        setVariants(sortedVariants);
    } else {
        setVariants([product]);
    }
  };

  const closeModal = () => setCurrentProduct(null);

  return (
    <>
      {/* 1. THE GRID */}
      {initialResults.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {initialResults.map((item) => (
            <button 
              key={item.id} 
              onClick={() => openProductModal(item)}
              className="group text-left focus:outline-none cursor-zoom-in"
            >
              <div className="aspect-[4/5] bg-zinc-900 overflow-hidden rounded-sm border border-white/5 flex items-center justify-center p-4">
                <img 
                  src={item.image_url || ''} 
                  alt={item.title} 
                  className="w-full h-full object-contain opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700"
                />
              </div>
              <h3 className="mt-4 text-[10px] uppercase tracking-[0.3em] text-[#c2bfb6] group-hover:text-white transition-colors">
                {item.title}
              </h3>
              <p className="text-[8px] uppercase tracking-[0.2em] text-[#B08038]/70 mt-1">
                {item.subtitle || item.collection_type}
              </p>
            </button>
          ))}
        </div>
      ) : (
        <div className="py-20 text-center border border-white/5 bg-zinc-900/30">
          <p className="text-[#c2bfb6] text-[10px] uppercase tracking-widest">NO MATCHING ITEMS FOUND.</p>
        </div>
      )}

      {/* 2. THE MODAL */}
      {currentProduct && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/95 backdrop-blur-md transition-opacity duration-300" onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}>
          <div className="relative w-full max-w-6xl bg-[#0f0f0f] border border-white/10 rounded-xl overflow-hidden shadow-2xl flex flex-col lg:flex-row max-h-[95vh]">
            <button type="button" onClick={closeModal} className="absolute top-4 right-4 z-20 w-10 h-10 flex items-center justify-center rounded-full bg-black/50 text-white hover:bg-[#B08038] transition-colors"><FaXmark /></button>
            
            <div className="w-full lg:w-3/5 bg-[#050505] flex items-center justify-center p-8 relative">
              <img src={currentProduct.image_url || ''} alt={currentProduct.title} className="max-w-full max-h-[600px] object-contain p-4 transition-all duration-500" />
            </div>

            <div className="w-full lg:w-2/5 p-8 lg:p-12 flex flex-col border-l border-white/5 bg-[#0a0a0a] overflow-y-auto no-scrollbar text-left">
              <div className="mb-8">
                <h2 className="text-4xl text-[#B08038] font-medium uppercase mb-1 leading-tight">{currentProduct.title}</h2>
                <p className="text-[#c2bfb6] text-[10px] tracking-[0.3em] uppercase mb-4 opacity-80">{currentProduct.subtitle || 'Wallcraft Series'}</p>
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
                <span className="block text-white text-[10px] font-bold uppercase tracking-widest mb-4">Select Style/Finish:</span>
                <div className="flex flex-wrap gap-3">
                  {variants.map((variant) => {
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

              <div className="mb-8">
                <span className="block text-white text-[10px] font-bold uppercase tracking-widest mb-4">Customization Note</span>
                <textarea 
                  value={customNote} 
                  onChange={(e) => setCustomNote(e.target.value)} 
                  className="w-full bg-black/40 border border-white/10 rounded-md p-3 text-sm text-white focus:outline-none focus:border-[#B08038] transition-colors resize-none" 
                  rows={3} 
                  placeholder="Enter custom dimensions or specific grain notes..." 
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
    </>
  );
}