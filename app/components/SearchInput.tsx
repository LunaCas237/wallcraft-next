'use client';

import React, { useState, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { FaMagnifyingGlass, FaCamera } from 'react-icons/fa6'; // Added FaCamera

export default function SearchInput() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [term, setTerm] = useState(searchParams.get('q') || '');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [isUploading, setIsUploading] = useState(false);
  
  // Reference to the hidden file input
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (term.trim()) params.set('q', term);
    if (category) params.set('category', category);
    router.push(`/search?${params.toString()}`);
  };

  // Trigger the hidden file input when the camera icon is clicked
  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  // Handle the actual file selection
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);

    try {
      // 1. We will eventually send this file to your Next.js API
      const formData = new FormData();
      formData.append('image', file);

      // Placeholder: await fetch('/api/search-by-image', { method: 'POST', body: formData })
      console.log("Image selected for search:", file.name);
      
      // Temporary alert until we build the backend logic
      alert(`Image "${file.name}" selected! We need to connect the AI backend next.`);

    } catch (error) {
      console.error("Error uploading image:", error);
    } finally {
      setIsUploading(false);
      // Reset the input so they can upload the same file again if needed
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

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
            placeholder="SEARCH WALLPAPERS..."
            className="bg-transparent text-white text-xs md:text-sm outline-none w-full tracking-[0.3em] uppercase placeholder:text-white/20 pr-10"
          />

          {/* Hidden File Input */}
          <input 
            type="file" 
            accept="image/jpeg, image/png, image/webp" 
            className="hidden" 
            ref={fileInputRef}
            onChange={handleFileChange}
          />

          {/* Visual Search Camera Button */}
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

      {/* Category Filter Dropdown */}
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
            <option value="velvet_collection" className="text-white font-normal">Velvet</option>
            {/* Add the other 5 Luxe collections here matching your database EXACTLY */}
          </optgroup>

          <optgroup label="CRAFT STONE" className="bg-zinc-900 text-[#B08038] font-bold">
            <option value="Terra Stone" className="text-white font-normal">Terra Stone</option>
            {/* Add other Craft Stone collections here */}
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