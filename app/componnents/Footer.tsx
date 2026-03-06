'use client';
import React from 'react';
import Link from 'next/link';
import { FaFacebookF, FaInstagram, FaLine, FaPhone } from 'react-icons/fa6';

export default function Footer() {
  return (
    <footer className="bg-[#050505] border-t border-white/5 pt-20 pb-10 text-white relative z-10">
      {/* Reduced padding (lg:px-10) to move content closer to the left edge */}
      <div className="container mx-auto px-8 lg:px-10">
        
        {/* Grid Layout: 5 Columns on Desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-16 mb-32">
          
          {/* --- Column 1: Contact (Moved Left) --- */}
          <div className="lg:col-span-1">
            <Link href="/" className="text-2xl font-bold tracking-widest text-[#B08038] uppercase mb-6 block">
              TPS GARDEN FURNITURE CO., LTD
            </Link>
            <ul className="space-y-4 text-xs text-[#c2bfb6] font-light tracking-wide">
              <li className="flex items-start gap-3">
                <span className="opacity-50 mt-1 text-[10px] ">📍</span>
                <span>351/7-8 Soi Bangkok-Nonthaburi 13, Bangkok-Nonthaburi Road, Bang Sue Subdistrict, Bang Sue District, Bangkok 10800</span>
              </li>
            </ul>
          </div>

          {/* --- Column 2: Collections (Takes 2 columns) --- */}
          <div className="lg:col-span-2">
             <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-[#B08038] mb-8">Collections</h4>
             
             <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
               
               {/* Sub-Col 1: Craft Stone */}
               <div className="space-y-4">
                 <h3 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#B08038] border-b border-white/10 pb-2 mb-3">
                   Craft Stone
                 </h3>
                 <div className="space-y-3 flex flex-col">
                   <Link href="/collection/tarra-stone" className="text-[9px] uppercase tracking-[0.2em] text-[#c2bfb6] hover:text-white transition-colors">Terra Stone</Link>
                   <Link href="/collection/panorama" className="text-[9px] uppercase tracking-[0.2em] text-[#c2bfb6] hover:text-white transition-colors">Panorama</Link>
                   <Link href="/collection/strength-rock" className="text-[9px] uppercase tracking-[0.2em] text-[#c2bfb6] hover:text-white transition-colors">Strength Rock</Link>
                   <Link href="/collection/geoform" className="text-[9px] uppercase tracking-[0.2em] text-[#c2bfb6] hover:text-white transition-colors">Geoform</Link>
                   <Link href="/collection/urban-form" className="text-[9px] uppercase tracking-[0.2em] text-[#c2bfb6] hover:text-white transition-colors">Urban Form</Link>
                   <Link href="/collection/nature-grain" className="text-[9px] uppercase tracking-[0.2em] text-[#c2bfb6] hover:text-white transition-colors">Nature Grain</Link>
                   <Link href="/collection/rust" className="text-[9px] uppercase tracking-[0.2em] text-[#c2bfb6] hover:text-white transition-colors">Rust</Link>
                   <Link href="/collection/finesse" className="text-[9px] uppercase tracking-[0.2em] text-[#c2bfb6] hover:text-white transition-colors">Finesse</Link>
                 </div>
               </div>

               {/* Sub-Col 2: Luxe Series */}
               <div className="space-y-4">
                 <h3 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#B08038] border-b border-white/10 pb-2 mb-3">
                   Luxe Series
                 </h3>
                 <div className="space-y-3 flex flex-col">
                   <Link href="/collection/fabric" className="text-[9px] uppercase tracking-[0.2em] text-[#c2bfb6] hover:text-white transition-colors">Fabric</Link>
                   <Link href="/collection/leather" className="text-[9px] uppercase tracking-[0.2em] text-[#c2bfb6] hover:text-white transition-colors">Leather</Link>
                   <Link href="/collection/outdoor" className="text-[9px] uppercase tracking-[0.2em] text-[#c2bfb6] hover:text-white transition-colors">Outdoor</Link>
                   <Link href="/collection/signature" className="text-[9px] uppercase tracking-[0.2em] text-[#c2bfb6] hover:text-white transition-colors">Signature</Link>
                   <Link href="/collection/stone" className="text-[9px] uppercase tracking-[0.2em] text-[#c2bfb6] hover:text-white transition-colors">Stone</Link>
                   <Link href="/collection/velvet" className="text-[9px] uppercase tracking-[0.2em] text-[#c2bfb6] hover:text-white transition-colors">Velvet</Link>
                   <Link href="/collection/wood" className="text-[9px] uppercase tracking-[0.2em] text-[#c2bfb6] hover:text-white transition-colors">Wood</Link>
                 </div>
               </div>

               {/* Sub-Col 3: Essential Series */}
               <div className="space-y-4">
                 <h3 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#B08038] border-b border-white/10 pb-2 mb-3">
                   Essential Series
                 </h3>
                 <div className="space-y-3 flex flex-col">
                   <Link href="/collection/solid-panel" className="text-[9px] uppercase tracking-[0.2em] text-[#c2bfb6] hover:text-white transition-colors">Solid Panel</Link>
                   <Link href="/collection/hollow-core" className="text-[9px] uppercase tracking-[0.2em] text-[#c2bfb6] hover:text-white transition-colors">Hollow Core Panel</Link>
                   <Link href="/collection/decor-panel" className="text-[9px] uppercase tracking-[0.2em] text-[#c2bfb6] hover:text-white transition-colors">Decor Panel</Link>
                   <Link href="/collection/accessories" className="text-[9px] uppercase tracking-[0.2em] text-[#c2bfb6] hover:text-white transition-colors leading-relaxed">
                     Accessories<br/>Aluminium & LED
                   </Link>
                 </div>
               </div>

             </div>
          </div>

          {/* --- Column 3: Technical Support --- */}
          <div className="lg:col-span-1">
            <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-[#B08038] mb-8">Technical Support</h4>
            <ul className="space-y-4 text-xs text-[#c2bfb6] font-light tracking-wide">
              <li><Link href="/support/installation" className= "text-[#c2bfb6] hover:text-[#B08038] transition-colors">Installation Guide</Link></li>
              <li><Link href="/support/maintenance" className="text-[#c2bfb6] hover:text-[#B08038] transition-colors">Care & Maintenance</Link></li>
              <li><Link href="/support/warranty" className="text-[#c2bfb6] hover:text-[#B08038] transition-colors">Warranty & Policy</Link></li>
              <li><Link href="/studio-qa" className="text-[#c2bfb6] hover:text-[#B08038] transition-colors">Studio Q&A</Link></li>
            </ul>
          </div>

          {/* --- Column 4: Brand/Socials --- */}
          <div className="lg:col-span-1">
            <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-[#B08038] mb-8">Contact Us</h4>
            <ul className="space-y-4 text-xs text-[#c2bfb6] font-light tracking-wide mb-6">
              <li><Link href="#" className= "text-[#c2bfb6] hover:text-[#B08038] transition-colors">Showrooms</Link></li>
              <li><Link href="#" className="text-[#c2bfb6] hover:text-[#B08038] transition-colors">Location</Link></li>
              {/* ---<li className="flex items-center gap-3">
                <FaPhone size={10} className="opacity-50" />
                <span>+66 2 123 4567</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="text-[#c2bfb6] opacity-50 text-[10px]">@</span>
                <span>contact@wallcraft.th</span>
              </li>--- */}
            </ul>
            
            <div className="flex space-x-4">
              <a href="#" className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-#c2bfb6 hover:bg-[#B08038] hover:text-white transition-all"><FaFacebookF size={12} /></a>
              <a href="#" className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-#c2bfb6 hover:bg-[#B08038] hover:text-white transition-all"><FaInstagram size={12} /></a>
              <a href="#" className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-#c2bfb6 hover:bg-[#B08038] hover:text-white transition-all"><FaLine size={12} /></a>
            </div>
          </div>

        </div>

      </div>
    </footer>
  );
}