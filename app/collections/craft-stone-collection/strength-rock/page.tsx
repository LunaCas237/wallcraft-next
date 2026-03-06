'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import {
  FaXmark,
  FaChevronLeft,
  FaChevronRight,
  FaCartPlus,
} from 'react-icons/fa6';

const supabase = createClient(
  'https://mpsnwijabfingujzirri.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1wc253aWphYmZpbmd1anppcnJpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc4NDUzNzIsImV4cCI6MjA4MzQyMTM3Mn0.RTNnZHJRnYjoeX9faOi324CbooNxNaW6Fm2xJrV609M'
);

interface Product {
  id: string;
  title: string;
  item_code: string;
  price: number | null;
  dimensions: string | null;
  image_url: string;
  collection_type: string;
}

interface HardcodedProduct {
  title: string;
  itemCode: string;
  size: string;
  image: string;
}

interface ModalState {
  title: string;
  code: string;
  price: string;
  dimensions: string;
  image: string;
  variants: Product[];
  activeProductId: string | null;
}

type DragState = {
  isDown: boolean;
  startX: number;
  scrollLeft: number;
};

const HARDCODED_LIST: HardcodedProduct[] = [
  {
    title: 'Rammed Earth Brick',
    itemCode: 'MBHTZ',
    size: 'W1000 x H2800 x T6(=-0.5)mm',
    image:
      'https://raw.githubusercontent.com/WaiHmueThit23/wallcraft_assets/main/strength_rock_collection/Asset%2033.webp',
  },
  {
    title: 'Granite',
    itemCode: 'MBHGY',
    size:
      'W600x H1200 x T(3-7.5)mm\nW600 x H3000 x T(3-7.5)mm\nW1150 x H3000 x T(3-7.5)mm',
    image:
      'https://raw.githubusercontent.com/WaiHmueThit23/wallcraft_assets/main/strength_rock_collection/Asset%2032.webp',
  },
  {
    title: 'Lunar Board',
    itemCode: 'MBLUN',
    size:
      'W1200 x H600 x T(3-10)mm\nW1000 x H2800 x T(3-10)mm\nW1000x H3000x T(3-10)mm',
    image:
      'https://raw.githubusercontent.com/WaiHmueThit23/wallcraft_assets/main/strength_rock_collection/Asset%2031.webp',
  },
  {
    title: 'Massif Stone',
    itemCode: 'MBCJY',
    size: 'W1100 x H2800 x T(3-13)mm',
    image:
      'https://raw.githubusercontent.com/WaiHmueThit23/wallcraft_assets/main/strength_rock_collection/Asset%2030.webp',
  },
  {
    title: 'Shale Stone',
    itemCode: 'MBDWS',
    size: 'W1160 x H3000 x T(4-19)mm',
    image:
      'https://raw.githubusercontent.com/WaiHmueThit23/wallcraft_assets/main/strength_rock_collection/Asset%2029.webp',
  },
  {
    title: 'Continous Stone',
    itemCode: 'MBDWS',
    size: 'W1160 x H3000 x T(3-13)mm',
    image:
      'https://raw.githubusercontent.com/WaiHmueThit23/wallcraft_assets/main/strength_rock_collection/Asset%2028.webp',
  },
  {
    title: 'Rockcut Stone',
    itemCode: 'MBHSY',
    size: 'W600x H1200 x T(4-13)mm\nW1200 x H3000 x T(4-13)mm',
    image:
      'https://raw.githubusercontent.com/WaiHmueThit23/wallcraft_assets/main/strength_rock_collection/Asset%2027.webp',
  },
  {
    title: 'Cliff Stone',
    itemCode: 'MBQBY',
    size: '600x10600x(3-6)mm',
    image:
      'https://raw.githubusercontent.com/WaiHmueThit23/wallcraft_assets/main/strength_rock_collection/Asset%2025.webp',
  },
  {
    title: 'Deep Rock Stone',
    itemCode: 'MBFKS',
    size: 'W600 x H3000x T(3-12))mm\nW1200 x H3000 x T(3-12)mm',
    image:
      'https://raw.githubusercontent.com/WaiHmueThit23/wallcraft_assets/main/strength_rock_collection/Asset%2026.webp',
  },
];

export default function StrengthRockPage() {
  const [loading, setLoading] = useState(true);
  const [globalData, setGlobalData] = useState<Product[]>([]);
  const [modalState, setModalState] = useState<ModalState | null>(null);
  const [selectedQty, setSelectedQty] = useState(1);
  const [customNote, setCustomNote] = useState('');
  const [requestAdded, setRequestAdded] = useState(false);

  const sliderRefs = useRef<Record<number, HTMLDivElement | null>>({});
  const dragStates = useRef<Record<number, DragState>>({});
  const addTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchCollection = async () => {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('collection_type', 'Strength Rock')
          .order('title', { ascending: true });

        if (error) throw error;

        if (isMounted) {
          setGlobalData((data as Product[]) || []);
        }
      } catch (err) {
        console.error('Supabase Error:', err);
        if (isMounted) {
          setGlobalData([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchCollection();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    document.body.style.overflow = modalState ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [modalState]);

  useEffect(() => {
    return () => {
      if (addTimerRef.current) clearTimeout(addTimerRef.current);
    };
  }, []);

  const groupedProducts = useMemo(() => {
    return globalData.reduce<Record<string, Product[]>>((acc, item) => {
      if (!acc[item.title]) acc[item.title] = [];
      acc[item.title].push(item);
      return acc;
    }, {});
  }, [globalData]);

  const resetModalControls = () => {
    setSelectedQty(1);
    setCustomNote('');
    setRequestAdded(false);

    if (addTimerRef.current) {
      clearTimeout(addTimerRef.current);
      addTimerRef.current = null;
    }
  };

  const openModalFromDetail = (detail: HardcodedProduct) => {
    resetModalControls();

    const variants = groupedProducts[detail.title] || [];

    setModalState({
      title: detail.title,
      code: detail.itemCode || '-',
      price: 'Inquiry Required',
      dimensions: detail.size || 'Standard Form',
      image: detail.image,
      variants,
      activeProductId: null,
    });
  };

  const openProductModalById = (productId: string) => {
    const product = globalData.find((item) => item.id === productId);
    if (!product) return;

    resetModalControls();

    const variants = groupedProducts[product.title] || [];

    setModalState({
      title: product.title,
      code: product.item_code || '-',
      price: product.price
        ? `$${product.price.toLocaleString()}`
        : 'Inquiry Required',
      dimensions: product.dimensions || 'Standard Form',
      image: product.image_url,
      variants,
      activeProductId: product.id,
    });
  };

  const closeModal = () => {
    resetModalControls();
    setModalState(null);
  };

  const scrollSlider = (index: number, amount: number) => {
    const el = sliderRefs.current[index];
    if (!el) return;
    el.scrollBy({ left: amount, behavior: 'smooth' });
  };

  const handleSliderMouseDown = (
    index: number,
    e: React.MouseEvent<HTMLDivElement>
  ) => {
    const el = sliderRefs.current[index];
    if (!el) return;

    dragStates.current[index] = {
      isDown: true,
      startX: e.pageX - el.offsetLeft,
      scrollLeft: el.scrollLeft,
    };

    el.style.cursor = 'grabbing';
  };

  const handleSliderMouseMove = (
    index: number,
    e: React.MouseEvent<HTMLDivElement>
  ) => {
    const el = sliderRefs.current[index];
    const state = dragStates.current[index];

    if (!el || !state?.isDown) return;

    e.preventDefault();
    const x = e.pageX - el.offsetLeft;
    const walk = (x - state.startX) * 2;
    el.scrollLeft = state.scrollLeft - walk;
  };

  const handleSliderMouseUp = (index: number) => {
    const el = sliderRefs.current[index];
    const state = dragStates.current[index];

    if (state) {
      dragStates.current[index] = {
        ...state,
        isDown: false,
      };
    }

    if (el) {
      el.style.cursor = 'grab';
    }
  };

  const handleAddToRequest = () => {
    setRequestAdded(true);

    addTimerRef.current = setTimeout(() => {
      setRequestAdded(false);
      closeModal();
    }, 1000);
  };

  return (
    <div className="font-sans bg-[#0a0a0a] text-white min-h-screen">
      <header
        className="relative min-h-[75vh] flex items-center overflow-hidden pt-20 text-left"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(10, 10, 10, 0.5) 0%, rgba(10, 10, 10, 0.2) 50%, rgba(10, 10, 10, 0) 100%), url('https://mpsnwijabfingujzirri.supabase.co/storage/v1/object/public/wallcraft_web/collections_cover/StrengthRock.webp')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      >
        <div className="container mx-auto px-8 lg:px-24 z-20">
          <div className="max-w-2xl">
            <div className="flex gap-1 h-1.5 w-28 mb-10">
              <div className="bg-[#6A6C5F] w-1/3" />
              <div className="bg-[#7B2715] w-1/3" />
              <div className="bg-[#B08038] w-1/3" />
            </div>

            <h1 className="text-5xl lg:text-8xl font-bold tracking-tight mb-6">
              <span className="text-[#B08038]">Strength Rock</span>
              <br />
              <span className="text-[#c2bfb6]">Collection</span>
            </h1>
          </div>
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto px-8 lg:px-16 py-20 min-h-[50vh]">
        {loading ? (
          <div className="flex flex-col items-center justify-center space-y-4 py-20 opacity-60">
            <div className="w-12 h-12 border-2 border-white/10 border-t-[#B08038] rounded-full animate-spin" />
            <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 font-medium">
              Synchronizing Strength Rock Textures...
            </p>
          </div>
        ) : (
          <div id="collection-grid">
            {HARDCODED_LIST.map((detail, i) => {
              const variants = groupedProducts[detail.title] || [];

              return (
                <section
                  key={detail.title}
                  className="mb-24 lg:mb-[12rem] text-left"
                >
                  <div className="flex flex-col lg:flex-row gap-8 lg:gap-16 items-center justify-center max-w-5xl lg:max-w-6xl mx-auto">
                    <div className="w-full lg:w-1/2 relative group flex justify-center">
                      <button
                        type="button"
                        onClick={() => openModalFromDetail(detail)}
                        className="relative block w-full cursor-zoom-in bg-transparent border-0 p-0"
                      >
                        <div className="absolute inset-0 bg-[#B08038]/10 blur-[80px] rounded-full pointer-events-none w-3/4 mx-auto h-3/4 mt-8" />
                        <div className="relative z-10 w-[85%] lg:w-full max-w-[450px] lg:max-w-[550px] mx-auto aspect-square flex items-center justify-center overflow-hidden rounded-[2px] shadow-[0_30px_60px_-12px_rgba(0,0,0,0.5)] border border-white/5">
                          <img
                            src={detail.image}
                            alt={detail.title}
                            className="w-full h-full object-cover transition-all duration-700 group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <div className="p-4 border border-white/30 bg-black/40 backdrop-blur-md text-white text-[10px] uppercase tracking-widest font-bold">
                              Quick View
                            </div>
                          </div>
                        </div>
                      </button>
                    </div>

                    <div className="w-full lg:w-1/2 flex flex-col items-center lg:items-start text-center lg:text-left">
                      <h2 className="text-3xl lg:text-5xl font-bold uppercase mb-8 tracking-wide text-[#B08038]">
                        {detail.title}
                      </h2>

                      <div className="w-[85%] lg:w-full max-w-[300px] lg:max-w-[400px] text-left mb-8 px-2 lg:px-0">
                        <h4 className="text-white text-xs lg:text-sm font-bold mb-2">
                          Size
                        </h4>
                        <p className="text-[#c2bfb6] text-[11px] lg:text-sm leading-relaxed whitespace-pre-line">
                          {detail.size || '-'}
                        </p>
                      </div>

                      {variants.length > 0 && (
                        <div className="flex items-center gap-4 lg:gap-6 mb-10 w-full justify-center lg:justify-start">
                          <button
                            type="button"
                            aria-label={`Scroll ${detail.title} variants left`}
                            className="w-8 h-8 lg:w-10 lg:h-10 rounded-full border border-white/40 flex items-center justify-center text-white/70 hover:border-[#B08038] hover:text-[#B08038] transition-colors"
                            onClick={() => scrollSlider(i, -150)}
                          >
                            <FaChevronLeft className="text-[10px] lg:text-[12px]" />
                          </button>

                          <div
                            ref={(el) => {
                              sliderRefs.current[i] = el;
                            }}
                            className="flex gap-4 lg:gap-5 overflow-x-auto w-[240px] lg:w-[400px] snap-x py-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
                            style={{ cursor: 'grab' }}
                            onMouseDown={(e) => handleSliderMouseDown(i, e)}
                            onMouseMove={(e) => handleSliderMouseMove(i, e)}
                            onMouseUp={() => handleSliderMouseUp(i)}
                            onMouseLeave={() => handleSliderMouseUp(i)}
                          >
                            {variants.map((variant) => (
                              <button
                                key={variant.id}
                                type="button"
                                onClick={() => openProductModalById(variant.id)}
                                className="flex-none w-[70px] lg:w-[100px] aspect-square opacity-90 hover:opacity-100 cursor-pointer transition-all snap-center hover:scale-105 border border-white/10 hover:border-[#B08038] bg-transparent p-0"
                              >
                                <img
                                  src={variant.image_url}
                                  alt={variant.title}
                                  className="w-full h-full object-cover"
                                />
                              </button>
                            ))}
                          </div>

                          <button
                            type="button"
                            aria-label={`Scroll ${detail.title} variants right`}
                            className="w-8 h-8 lg:w-10 lg:h-10 rounded-full border border-white/40 flex items-center justify-center text-white/70 hover:border-[#B08038] hover:text-[#B08038] transition-colors"
                            onClick={() => scrollSlider(i, 150)}
                          >
                            <FaChevronRight className="text-[10px] lg:text-[12px]" />
                          </button>
                        </div>
                      )}

                      <button
                        type="button"
                        className="border border-white/60 text-white px-8 py-2 lg:px-10 lg:py-3 lg:text-sm rounded-lg text-xs font-medium tracking-wide hover:bg-white hover:text-black transition-colors"
                        onClick={() => openModalFromDetail(detail)}
                      >
                        Learn more
                      </button>
                    </div>
                  </div>
                </section>
              );
            })}
          </div>
        )}
      </main>

      {modalState && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm text-left"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeModal();
          }}
        >
          <div className="relative w-full max-w-6xl bg-[#0f0f0f] border border-white/10 rounded-xl overflow-hidden shadow-2xl flex flex-col lg:flex-row max-h-[95vh]">
            <button
              type="button"
              onClick={closeModal}
              className="absolute top-4 right-4 z-20 w-10 h-10 flex items-center justify-center rounded-full bg-black/50 text-white hover:bg-[#B08038] transition-colors"
            >
              <FaXmark />
            </button>

            <div className="w-full lg:w-3/5 bg-[#050505] flex items-center justify-center p-8 relative">
              <img
                src={modalState.image}
                alt={modalState.title}
                className="max-w-full max-h-[600px] object-contain transition-all duration-500"
              />
            </div>

            <div className="w-full lg:w-2/5 p-8 lg:p-12 flex flex-col border-l border-white/5 bg-[#0a0a0a] overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
              <div className="mb-8">
                <h3 className="text-[#B08038] text-[10px] font-bold tracking-[0.4em] uppercase mb-2 text-left">
                  Strength Rock Series
                </h3>
                <h2 className="text-4xl text-white font-medium uppercase mb-2 leading-tight text-left">
                  {modalState.title}
                </h2>
                <p className="text-zinc-500 text-sm tracking-widest text-left">
                  {modalState.code}
                </p>
              </div>

              <div className="mb-8 p-4 bg-white/5 rounded-lg border border-white/5">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-zinc-400 text-[10px] uppercase tracking-wider">
                    Estimated Price
                  </span>
                  <span className="text-xl text-white font-light">
                    {modalState.price}
                  </span>
                </div>

                <div className="flex flex-col space-y-1">
                  <span className="text-zinc-400 text-[10px] uppercase tracking-wider font-bold">
                    Standard Dimensions
                  </span>
                  <span className="text-zinc-300 text-sm font-light whitespace-pre-line text-left">
                    {modalState.dimensions}
                  </span>
                </div>
              </div>

              {modalState.variants.length > 1 && (
                <div className="mb-8 text-left">
                  <span className="block text-white text-[10px] font-bold uppercase tracking-widest mb-4">
                    Select Finish:
                  </span>

                  <div className="flex flex-wrap gap-3">
                    {modalState.variants.map((variant) => {
                      const isActive = modalState.activeProductId === variant.id;

                      return (
                        <button
                          key={variant.id}
                          type="button"
                          onClick={() => openProductModalById(variant.id)}
                          className={`w-12 h-12 border cursor-pointer hover:border-[#B08038] transition-colors ${
                            isActive
                              ? 'border-[#B08038] scale-105'
                              : 'border-white/10'
                          }`}
                        >
                          <img
                            src={variant.image_url}
                            alt={variant.title}
                            className="w-full h-full object-cover"
                          />
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="mb-8 text-left">
                <span className="block text-white text-[10px] font-bold uppercase tracking-widest mb-4">
                  Customization Note
                </span>

                <textarea
                  value={customNote}
                  onChange={(e) => setCustomNote(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-md p-3 text-sm text-white focus:outline-none focus:border-[#B08038] transition-colors resize-none"
                  rows={3}
                  placeholder="Enter custom dimensions..."
                />
              </div>

              <div className="mt-auto pt-8 border-t border-white/10 text-left">
                <div className="flex gap-4 mb-4">
                  <div className="flex items-center border border-white/20 rounded-md">
                    <button
                      type="button"
                      className="px-4 py-3 text-white hover:bg-white/10"
                      onClick={() =>
                        setSelectedQty((prev) => Math.max(1, prev - 1))
                      }
                    >
                      -
                    </button>

                    <span className="px-2 text-white font-mono w-8 text-center">
                      {selectedQty}
                    </span>

                    <button
                      type="button"
                      className="px-4 py-3 text-white hover:bg-white/10"
                      onClick={() => setSelectedQty((prev) => prev + 1)}
                    >
                      +
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={handleAddToRequest}
                    className="flex-1 bg-[#B08038] text-white uppercase text-[10px] font-bold tracking-[0.2em] hover:bg-[#8f662a] transition-all duration-300 rounded-md flex items-center justify-center gap-3"
                  >
                    {requestAdded ? (
                      'Added to Request'
                    ) : (
                      <>
                        Download Simple <FaCartPlus />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}