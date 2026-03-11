'use client';

import React, { useState, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { FaMagnifyingGlass, FaCamera } from 'react-icons/fa6';

export default function SearchInput() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [term, setTerm] = useState(searchParams.get('q') || '');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [isUploading, setIsUploading] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (term.trim()) params.set('q', term);
    if (category) params.set('category', category);
    router.push(`/search?${params.toString()}`);
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch('/api/visual-search', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok && data.success) {
        alert(`Massive success! Image saved to Supabase with ID: ${data.uploadedImage?.id}`);
        
        // Redirect the page to show the 4 matching items
        if (data.results) {
          const matchedIds = data.results.map((item: any) => item.id).join(',');
          router.push(`/search?matches=${matchedIds}`);
        }
      } else {
        alert("Failed to process image: " + (data.error || "Unknown error"));
      }

    } catch (error) {
      console.error("Error uploading image:", error);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }; // <-- This was the missing bracket that broke your UI!

  return (
    <div className="w-full max-w-3xl mb-12">
      <form 
        onSubmit={handleSearch} 
        className="flex flex-col md:flex-row items-start md:items-center gap-4 w-full"
      >
        <div className="flex items-center flex-1 border-b border-white/20 pb-2 group focus-within:border-[#B08038] transition-colors duration-500 w-full relative">
          <FaMagnifyingGlass className="text-[#c2bfb6] group-focus-within:text-[#B08038] text-lg mr-4 transition-colors duration-500" />
          
          <input
            type="text"
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            placeholder="SEARCH PRODUCTS..."
            className="bg-transparent text-white text-xs md:text-sm outline-none w-full tracking-[0.3em] uppercase placeholder:text-white/20 pr-10"
          />

          <input 
            type="file" 
            accept="image/jpeg, image/png, image/webp" 
            className="hidden" 
            ref={fileInputRef}
            onChange={handleFileChange}
          />

          <button 
            type="button" 
            onClick={handleImageClick}
            disabled={isUploading}
            className="absolute right-0 top-0 bottom-2 px-2 text-white/40 hover:text-[#B08038] transition-colors"
            title="Search by image"
          >
            {isUploading ? (
              <div className="w-4 h-4 border-2 border-t-transparent border-[#B08038] rounded-full animate-spin"></div>
            ) : (
              <FaCamera className="text-lg" />
            )}
          </button>
        </div>

        <div className="flex items-center gap-4 w-full md:w-auto">
          <select 
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="bg-transparent text-[#c2bfb6] text-[10px] tracking-widest uppercase outline-none border-b border-white/20 pb-2 cursor-pointer hover:border-[#B08038] transition-colors w-full md:w-auto"
          >
            <option value="" className="bg-zinc-900 text-white">ALL COLLECTIONS</option>
            
            <optgroup label="LUXE SERIES" className="bg-zinc-900 text-[#B08038] font-bold">
              <option value="fabric_collection" className="text-white font-normal">Fabric</option>
              <option value="leather_collection" className="text-white font-normal">Leather</option>
              <option value="metallic" className="text-white font-normal">metallic</option>
              <option value="semi-outdoor" className="text-white font-normal">semi-outdoor</option>
              <option value="stone" className="text-white font-normal">signature</option>
              <option value="signature" className="text-white font-normal">stone</option>
              <option value="velvet_collection" className="text-white font-normal">velvet</option>
              <option value="wood" className="text-white font-normal">wood</option>
            </optgroup>

            <optgroup label="CRAFT STONE" className="bg-zinc-900 text-[#B08038] font-bold">
              <option value="Terra Stone" className="text-white font-normal">Terra Stone</option>
              <option value="Panorama" className="text-white font-normal">Panorama</option>
              <option value="Strength Rock" className="text-white font-normal">Strength Rock</option>
              <option value="Geoform" className="text-white font-normal">GeoForm</option>
              <option value="Urban Form" className="text-white font-normal">Urban Form</option>
              <option value="Nature Grain" className="text-white font-normal">Nature Grain</option>
              <option value="Rust Grain" className="text-white font-normal">Rust</option>
              <option value="Finesse Grain" className="text-white font-normal">Finesse</option>
            </optgroup>
          </select>

          <button 
            type="submit"
            className="bg-white text-black px-6 py-2 text-[10px] uppercase tracking-widest font-bold hover:bg-[#B08038] hover:text-white transition-colors rounded-sm"
          >
            Find
          </button>
        </div>
      </form>
    </div>
  );
}