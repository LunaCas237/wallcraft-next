'use client';

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
}