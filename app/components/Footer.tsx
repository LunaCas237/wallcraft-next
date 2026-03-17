'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { FaFacebookF, FaInstagram, FaLine, FaChevronDown } from 'react-icons/fa6';

export default function Footer() {
  // State to handle mobile dropdowns for the Collections
  const [openSeries, setOpenSeries] = useState({
    craft: false,
    luxe: false,
    essential: false,
  });

  // Toggle function (Fixed strict typing)
  const toggleSeries = (series: 'craft' | 'luxe' | 'essential') => {
    setOpenSeries((prev) => ({ ...prev, [series]: !prev[series] }));
  };

  return (
    <footer className="bg-[#050505] border-t border-white/5 pt-20 pb-10 text-white relative z-10">
      <div className="container mx-auto px-8 lg:px-10">
        
        {/* Grid Layout: 5 Columns on Desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-16 mb-32">
          
          {/* --- Column 1: Contact --- */}
          <div className="lg:col-span-1">
            <Link href="/" className="text-2xl font-bold tracking-widest text-[#B08038] uppercase mb-6 block">
              TPS GARDEN FURNITURE CO., LTD
            </Link>
            <ul className="space-y-4 text-s text-[#c2bfb6] font-light tracking-wide">
              <li className="flex items-start gap-3">
                <span className="opacity-50 mt-1 text-[12px]">📍</span>
                <span>351/7-8 Soi Bangkok-Nonthaburi 13, Bangkok-Nonthaburi Road, Bang Sue Subdistrict, Bang Sue District, Bangkok 10800</span>
              </li>
            </ul>
          </div>

          {/* --- Column 2: Collections (Takes 2 columns) --- */}
          <div className="lg:col-span-2">
             <h4 className="text-s font-bold uppercase tracking-[0.2em] text-[#B08038] mb-8 hidden lg:block">Collections</h4>
             
             <div className="grid grid-cols-1 sm:grid-cols-3 lg:gap-8">
               
               {/* Sub-Col 1: Craft Stone */}
               <div className="space-y-0 lg:space-y-4">
                 <button 
                   onClick={() => toggleSeries('craft')}
                   className="w-full flex justify-between items-center text-[12px] font-semibold uppercase tracking-[0.2em] text-[#B08038] border-b border-white/10 pb-2 mb-3 pt-4 lg:pt-0 lg:cursor-default"
                 >
                   <span>Craft Stone</span>
                   <FaChevronDown className={`lg:hidden transition-transform duration-300 ${openSeries.craft ? 'rotate-180' : ''}`} />
                 </button>
                 <div className={`${openSeries.craft ? 'flex' : 'hidden'} lg:flex flex-col space-y-3 pb-2 lg:pb-0`}>
                    <Link href="/collections/craft-stone-collection/tarra-stone" className="text-[10px] uppercase tracking-[0.2em] text-[#c2bfb6] hover:text-white transition-colors">Tarra Stone</Link>
                    <Link href="/collections/craft-stone-collection/panorama" className="text-[10px] uppercase tracking-[0.2em] text-[#c2bfb6] hover:text-white transition-colors">Panorama</Link>
                    <Link href="/collections/craft-stone-collection/strength-rock" className="text-[10px] uppercase tracking-[0.2em] text-[#c2bfb6] hover:text-white transition-colors">Strength Rock</Link>
                    <Link href="/collections/craft-stone-collection/geo-form" className="text-[10px] uppercase tracking-[0.2em] text-[#c2bfb6] hover:text-white transition-colors">Geoform</Link>
                    <Link href="/collections/craft-stone-collection/urban-form" className="text-[10px] uppercase tracking-[0.2em] text-[#c2bfb6] hover:text-white transition-colors">Urban Form</Link>
                    <Link href="/collections/craft-stone-collection/nature-grain" className="text-[10px] uppercase tracking-[0.2em] text-[#c2bfb6] hover:text-white transition-colors">Nature Grain</Link>
                    <Link href="/collections/craft-stone-collection/rust" className="text-[10px] uppercase tracking-[0.2em] text-[#c2bfb6] hover:text-white transition-colors">Rust</Link>
                    <Link href="/collections/craft-stone-collection/finesse" className="text-[10px] uppercase tracking-[0.2em] text-[#c2bfb6] hover:text-white transition-colors">Finesse</Link>
                  </div>
                </div>

               {/* Sub-Col 2: Luxe Series */}
               <div className="space-y-0 lg:space-y-4">
                 <button 
                   onClick={() => toggleSeries('luxe')}
                   className="w-full flex justify-between items-center text-[12px] font-semibold uppercase tracking-[0.2em] text-[#B08038] border-b border-white/10 pb-2 mb-3 pt-4 lg:pt-0 lg:cursor-default"
                 >
                   <span>Luxe Series</span>
                   <FaChevronDown className={`lg:hidden transition-transform duration-300 ${openSeries.luxe ? 'rotate-180' : ''}`} />
                 </button>
                 <div className={`${openSeries.luxe ? 'flex' : 'hidden'} lg:flex flex-col space-y-3 pb-2 lg:pb-0`}>
                   <Link href="/collections/luxe-collection/fabric" className="text-[10px] uppercase tracking-[0.2em] text-[#c2bfb6] hover:text-white transition-colors">Fabric</Link>
                   <Link href="/collections/luxe-collection/leather" className="text-[10px] uppercase tracking-[0.2em] text-[#c2bfb6] hover:text-white transition-colors">Leather</Link>
                   <Link href="/collections/luxe-collection/metallic" className="text-[10px] uppercase tracking-[0.2em] text-[#c2bfb6] hover:text-white transition-colors">Metallic</Link>
                   <Link href="/collections/luxe-collection/semi-outdoor" className="text-[10px] uppercase tracking-[0.2em] text-[#c2bfb6] hover:text-white transition-colors">Semi Outdoor</Link>
                   <Link href="/collections/luxe-collection/signature" className="text-[10px] uppercase tracking-[0.2em] text-[#c2bfb6] hover:text-white transition-colors">Signature</Link>
                   <Link href="/collections/luxe-collection/stone" className="text-[10px] uppercase tracking-[0.2em] text-[#c2bfb6] hover:text-white transition-colors">Stone</Link>
                   <Link href="/collections/luxe-collection/velvet" className="text-[10px] uppercase tracking-[0.2em] text-[#c2bfb6] hover:text-white transition-colors">Velvet</Link>
                   <Link href="/collections/luxe-collection/wood" className="text-[10px] uppercase tracking-[0.2em] text-[#c2bfb6] hover:text-white transition-colors">Wood</Link>
                 </div>
               </div>

               {/* Sub-Col 3: Essential Series */}
               <div className="space-y-0 lg:space-y-4">
                 <button 
                   onClick={() => toggleSeries('essential')}
                   className="w-full flex justify-between items-center text-[12px] font-semibold uppercase tracking-[0.2em] text-[#B08038] border-b border-white/10 pb-2 mb-3 pt-4 lg:pt-0 lg:cursor-default"
                 >
                   <span>Essential Series</span>
                   <FaChevronDown className={`lg:hidden transition-transform duration-300 ${openSeries.essential ? 'rotate-180' : ''}`} />
                 </button>
                 <div className={`${openSeries.essential ? 'flex' : 'hidden'} lg:flex flex-col space-y-3 pb-2 lg:pb-0`}>
                   <Link href="/collection/solid-panel" className="text-[10px] uppercase tracking-[0.2em] text-[#c2bfb6] hover:text-white transition-colors">Solid Panel</Link>
                   <Link href="/collection/hollow-core" className="text-[10px] uppercase tracking-[0.2em] text-[#c2bfb6] hover:text-white transition-colors">Hollow Core Panel</Link>
                   <Link href="/collection/decor-panel" className="text-[10px] uppercase tracking-[0.2em] text-[#c2bfb6] hover:text-white transition-colors">Decor Panel</Link>
                   <Link href="/collection/accessories" className="text-[10px] uppercase tracking-[0.2em] text-[#c2bfb6] hover:text-white transition-colors leading-relaxed">
                     Accessories<br/>Aluminium & LED
                   </Link>
                 </div>
               </div>

             </div>
          </div>

          {/* --- Column 3: Technical Support --- */}
          <div className="lg:col-span-1 mt-8 lg:mt-0">
            <h4 className="text-s font-bold uppercase tracking-[0.2em] text-[#B08038] mb-8">Technical Support</h4>
            <ul className="space-y-4 text-s text-[#c2bfb6] font-light tracking-wide">
              <li><Link href="/support/installation" className= "text-[#c2bfb6] hover:text-[#B08038] transition-colors">Installation Guide</Link></li>
              <li><Link href="/support/maintenance" className="text-[#c2bfb6] hover:text-[#B08038] transition-colors">Care & Maintenance</Link></li>
              <li><Link href="/support/warranty" className="text-[#c2bfb6] hover:text-[#B08038] transition-colors">Warranty & Policy</Link></li>
              <li><Link href="/studio-qa" className="text-[#c2bfb6] hover:text-[#B08038] transition-colors">Studio Q&A</Link></li>
            </ul>
          </div>

          {/* --- Column 4: Brand/Socials --- */}
          <div className="lg:col-span-1 mt-8 lg:mt-0">
            <h4 className="text-s font-bold uppercase tracking-[0.2em] text-[#B08038] mb-8">Contact Us</h4>
            <ul className="space-y-4 text-s text-[#c2bfb6] font-light tracking-wide mb-6">
              <li><Link href="#" className= "text-[#c2bfb6] hover:text-[#B08038] transition-colors">Showrooms</Link></li>
              <li><Link href="#" className="text-[#c2bfb6] hover:text-[#B08038] transition-colors">Location</Link></li>
            </ul>
            
            <div className="flex space-x-4">
              <a href="#" className="w-10 h-10 lg:w-8 lg:h-8 rounded-full bg-white/5 flex items-center justify-center text-[#c2bfb6] hover:bg-[#B08038] hover:text-white transition-all">
                <FaFacebookF className="text-[28px] lg:text-[16px]" />
              </a>
              <a href="#" className="w-10 h-10 lg:w-8 lg:h-8 rounded-full bg-white/5 flex items-center justify-center text-[#c2bfb6] hover:bg-[#B08038] hover:text-white transition-all">
                <FaInstagram className="text-[28px] lg:text-[16px]" />
              </a>
              <a href="#" className="w-10 h-10 lg:w-8 lg:h-8 rounded-full bg-white/5 flex items-center justify-center text-[#c2bfb6] hover:bg-[#B08038] hover:text-white transition-all">
                <FaLine className="text-[28px] lg:text-[16px]" />
              </a>
            </div>
          </div>

        </div>

      </div>
    </footer>
  );
}