'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { FaBarsStaggered, FaXmark, FaChevronDown, FaMagnifyingGlass } from 'react-icons/fa6';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openSubMenu, setOpenSubMenu] = useState(""); // Default to empty string

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Helper to toggle submenus without errors
  const toggleSubMenu = (name: React.SetStateAction<string>) => {
    setOpenSubMenu(openSubMenu === name ? "" : name);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
    setOpenSubMenu("");
  };

  return (
    <>
      {/* Mobile Top Bar */}
      <nav className={`fixed top-0 w-full z-[60] px-6 py-5 flex justify-between items-center md:hidden transition-all duration-500 ${scrolled ? 'bg-black/95 backdrop-blur-md border-b border-white/5' : 'bg-transparent'}`}>
        <Link href="/">
          <img src="https://raw.githubusercontent.com/WaiHmueThit23/wallcraft_assets/main/Logo_Images/wallcraft%20logo%20grey%20color.webp" alt="Logo" className="h-6 w-auto" />
        </Link>
        <div className="flex items-center space-x-5">
          <FaMagnifyingGlass className="text-white/60 text-sm" />
          <button className="text-white/80 text-xl" onClick={() => setIsMobileMenuOpen(true)}>
            <FaBarsStaggered />
          </button>
        </div>
      </nav>

      {/* Mobile Overlay */}
      <div className={`fixed inset-0 z-[70] bg-black transition-all duration-500 ${isMobileMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}>
        <button className="absolute top-6 right-8 text-white/70 text-3xl" onClick={closeMobileMenu}>
          <FaXmark />
        </button>

        <div className="flex flex-col items-center justify-center h-full space-y-8 w-full">
          <Link href="/introduction" onClick={closeMobileMenu} className="text-[11px] uppercase tracking-[0.4em] text-white">Introduction</Link>
          
          {/* Series Section */}
          <div className="w-full flex flex-col items-center">
            <button 
              onClick={() => toggleSubMenu('series')}
              className="text-[11px] uppercase tracking-[0.4em] text-white flex items-center"
            >
              Series 
              <FaChevronDown className={`ml-3 text-[8px] transition-transform ${openSubMenu === 'series' ? 'rotate-180' : ''}`} />
            </button>
            
            {/* Conditional Rendering to avoid height errors */}
            <div className={`flex flex-col items-center space-y-5 overflow-hidden transition-all duration-500 ${openSubMenu === 'series' ? 'max-h-[300px] mt-8 opacity-100' : 'max-h-0 opacity-0'}`}>
              <Link href="/series/craft-stone" onClick={closeMobileMenu} className="text-[10px] uppercase tracking-[0.3em] text-[#c2bfb6]">Craft Stone</Link>
              <Link href="/series/luxe" onClick={closeMobileMenu} className="text-[10px] uppercase tracking-[0.3em] text-[#c2bfb6]">Luxe Series</Link>
              <Link href="/series/essential" onClick={closeMobileMenu} className="text-[10px] uppercase tracking-[0.3em] text-[#c2bfb6]">Essential Series</Link>
            </div>
          </div>

          {/* Art & Gallery Section */}
          <div className="w-full flex flex-col items-center">
            <button 
              onClick={() => toggleSubMenu('art')}
              className="text-[11px] uppercase tracking-[0.4em] text-white flex items-center"
            >
              Art & Gallery 
              <FaChevronDown className={`ml-3 text-[8px] transition-transform ${openSubMenu === 'art' ? 'rotate-180' : ''}`} />
            </button>
            <div className={`flex flex-col items-center space-y-5 overflow-hidden transition-all duration-500 ${openSubMenu === 'art' ? 'max-h-[200px] mt-8 opacity-100' : 'max-h-0 opacity-0'}`}>
              <Link href="/art&gallery/visual-showcase" onClick={closeMobileMenu} className="text-[10px] uppercase tracking-[0.3em] text-[#c2bfb6]">Visual Showcase</Link>
              <Link href="#" onClick={closeMobileMenu} className="text-[10px] uppercase tracking-[0.3em] text-[#c2bfb6]">Project Showcase</Link>
            </div>
          </div>

          <Link href="#" onClick={closeMobileMenu} className="text-[11px] uppercase tracking-[0.4em] text-white">Match Inspiration</Link>
        </div>
      </div>

      {/* Desktop Navigation */}
      <nav className={`fixed top-0 w-full z-50 px-8 py-6 hidden md:block transition-all duration-400 ${scrolled ? 'bg-black/95 py-2 backdrop-blur-md border-b border-white/5' : 'bg-black/40 backdrop-blur-md border-b border-white/5'}`}>
        <div className="max-w-[1800px] mx-auto flex justify-center items-center relative">
          <div className="absolute left-0 lg:left-8 flex items-center">
            <Link href="/">
              <img src="https://raw.githubusercontent.com/WaiHmueThit23/wallcraft_assets/main/Logo_Images/wallcraft%20logo%20grey%20color.webp" alt="Wallcraft Logo" className="h-5 lg:h-6 opacity-90" />
            </Link>
          </div>

          <div className="flex items-center space-x-12">
            <Link href="/introduction" className="text-[10px] uppercase tracking-[0.4em] text-[#c2bfb6] hover:text-[#B08038] transition-colors">Band Introduction</Link>
            
            {/* Series Dropdown (เดิม) - อาจจะลบออกถ้า Collection ครอบคลุมแล้ว หรือเก็บไว้ตามดีไซน์ */}
            {/* ถ้าต้องการเก็บไว้ก็ปล่อยไว้ครับ แต่ถ้าจะรวม ให้ลบ section นี้ทิ้งได้เลย */}
             <div className="relative py-2 flex items-center group cursor-pointer">
              <span className="text-[10px] uppercase tracking-[0.4em] text-[#c2bfb6] hover:text-[#B08038] transition-colors">Series</span>
              <div className="ml-2 p-1 group-hover:rotate-180 transition-transform duration-300">
                <FaChevronDown className="text-[8px] opacity-40 group-hover:text-[#B08038] group-hover:opacity-100" />
              </div>
              <div className="absolute left-1/2 -translate-x-1/2 top-full pt-4 w-60 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300">
                <div className="bg-zinc-900/95 backdrop-blur-2xl border border-white/5 p-6 space-y-4 shadow-2xl rounded-sm">
                  <Link href="/series/craft-stone" className="block text-[9px] uppercase tracking-[0.3em] text-[#c2bfb6] hover:text-[#B08038]">Craft Stone Series</Link>
                  <Link href="/series/luxe" className="block text-[9px] uppercase tracking-[0.3em] text-[#c2bfb6] hover:text-[#B08038]">Luxe Series</Link>
                  <Link href="/series/essential" className="block text-[9px] uppercase tracking-[0.3em] text-[#c2bfb6] hover:text-[#B08038]">Essential Series</Link>
                </div>
              </div>
            </div>
            
            {/* Art Dropdown */}
            <div className="relative py-2 flex items-center group cursor-pointer">
              <span className="text-[10px] uppercase tracking-[0.4em] text-[#c2bfb6] hover:text-[#B08038] transition-colors">Art & Gallery</span>
              <div className="ml-2 p-1 group-hover:rotate-180 transition-transform duration-300">
                <FaChevronDown className="text-[8px] opacity-40 group-hover:text-[#B08038] group-hover:opacity-100" />
              </div>
               <div className="absolute left-1/2 -translate-x-1/2 top-full pt-4 w-60 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300">
                <div className="bg-zinc-900/95 backdrop-blur-2xl border border-white/5 p-6 space-y-4 shadow-2xl rounded-sm">
                  <Link href="/art&gallery/visual-showcase" className="block text-[9px] uppercase tracking-[0.3em] text-[#c2bfb6] hover:text-[#B08038]">Visual Showcase</Link>
                  <Link href="#" className="block text-[9px] uppercase tracking-[0.3em] text-[#c2bfb6] hover:text-[#B08038]">Project Showcase</Link>
                </div>
              </div>
            </div>

            <Link href="#" className="text-[10px] uppercase tracking-[0.4em] text-[#c2bfb6] hover:text-[#B08038] transition-colors">Match Inspiration</Link>
            <Link href="#" className="text-[10px] uppercase tracking-[0.4em] text-[#c2bfb6] hover:text-[#B08038] transition-colors">Studio Q&A</Link>
          
          </div>

          <div className="absolute right-0 lg:right-8 flex items-center space-x-6">
            <button className="text-[#c2bfb6] hover:text-white transition text-[9px] tracking-widest uppercase flex items-center">
              Search <FaMagnifyingGlass className="ml-3 opacity-60" />
            </button>
          </div>
        </div>
      </nav>
    </>
  );
}