'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { supabase } from '../lib/supabase';
import SearchInput from '../components/SearchInput';

function SearchResults() {
  const searchParams = useSearchParams();
  const matchesParam = searchParams.get('matches');
  const textQuery = searchParams.get('q');
  const searchId = searchParams.get('searchId'); 

  const [products, setProducts] = useState<any[]>([]);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // State for the Popup Modal
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);

  useEffect(() => {
    async function fetchResults() {
      setIsLoading(true);
      try {
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
          // Fetching EVERYTHING (*) from the database here
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
              onClick={() => setSelectedProduct(product)}
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

      {/* DYNAMIC POPUP MODAL */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md transition-opacity">
          <div className="absolute inset-0" onClick={() => setSelectedProduct(null)}></div>
          
          <div className="relative bg-[#0a0a0a] w-full max-w-5xl h-[85vh] md:h-[600px] rounded-lg shadow-2xl overflow-hidden flex flex-col md:flex-row border border-white/10 animate-fade-in-up">
            
            <button 
              onClick={() => setSelectedProduct(null)}
              className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-black/50 text-white hover:bg-[#B08038] transition-colors"
            >
              &#10005;
            </button>

            {/* Left side: Image */}
            <div className="w-full md:w-1/2 h-1/2 md:h-full bg-black relative">
              <img src={selectedProduct.image_url} alt={selectedProduct.title} className="w-full h-full object-cover" />
            </div>

            {/* Right side: Scrollable Dynamic Data */}
            <div className="w-full md:w-1/2 p-8 md:p-10 flex flex-col h-1/2 md:h-full">
              
              <div className="flex-1 overflow-y-auto pr-4 custom-scrollbar">
                <p className="text-[#B08038] text-[10px] tracking-[0.3em] uppercase mb-2 font-bold">Wallcraft Archive</p>
                <h2 className="text-white text-2xl md:text-3xl font-bold uppercase tracking-wide mb-2">
                  {selectedProduct.title || 'Unknown Asset'}
                </h2>
                
                <div className="h-[1px] w-full bg-white/10 my-6"></div>
                
                {/* Dynamically Loop Through Everything in the Database */}
                <div className="flex flex-col gap-4 mb-8">
                  {Object.entries(selectedProduct).map(([key, value]) => {
                    // Hide images and massive math vectors from the text details
                    if (['image_url', 'title', 'feat_ai_b64', 'feat_local_b64'].includes(key)) return null;
                    if (value === null || value === undefined || value === '') return null;

                    return (
                      <div key={key} className="flex flex-col border-b border-white/5 pb-2">
                        <span className="text-white/40 text-[9px] uppercase tracking-[0.2em] mb-1">
                          {key.replace(/_/g, ' ')}
                        </span>
                        <span className="text-[#c2bfb6] text-sm break-words">
                          {String(value)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
              
              {/* Bottom Sticky Action Bar */}
              <div className="pt-6 mt-2 border-t border-white/10 flex items-center justify-between shrink-0">
                <span className="text-white text-lg font-medium tracking-widest">
                  {selectedProduct.price || '฿ POA'}
                </span>
                <button className="bg-white text-black px-6 py-3 text-[10px] uppercase tracking-widest font-bold hover:bg-[#B08038] hover:text-white transition-colors rounded-sm">
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