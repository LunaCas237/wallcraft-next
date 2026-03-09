'use client';

import React, { useState, useEffect, useRef } from 'react';

// --- Types ---
interface Layer {
  title: string;
  description: string;
  image: string;
}

interface AnimatedSectionProps {
  children: React.ReactNode;
  className?: string;
  animation?: "fade-in-up" | "fade-in-right" | "fade-in-left";
  delay?: number;
}

// --- Data ---
const LAYERS_DATA: Layer[] = [
  {
    title: 'DECORATIVE FILM',
    description: 'ชั้นฟิล์มลายไม้คุณภาพสูงพร้อมเคลือบผิวป้องกันรอยขีดข่วนและรังสี UV ให้สีสันสวยงามเป็นธรรมชาติ',
    image: 'https://raw.githubusercontent.com/WaiHmueThit23/wallcraft_assets/main/Essential%20Series/Essential%20Series/Asset%20156@2x.webp'
  },
  {
    title: 'ECO BAMBOO COMPOSITE',
    description: 'โครงสร้างหลักผลิตจากเยื่อไผ่ธรรมชาติ มีความยืดหยุ่นสูง แข็งแรงทนทาน และเป็นมิตรต่อสิ่งแวดล้อม',
    image: 'https://raw.githubusercontent.com/WaiHmueThit23/wallcraft_assets/main/Essential%20Series/Essential%20Series/Asset%20157@2x.webp'
  }
];

const TECH_ICONS_DATA = [
  'https://raw.githubusercontent.com/WaiHmueThit23/wallcraft_assets/main/Essential%20Series/Essential%20Series/Asset%20163@2x.webp',
  'https://raw.githubusercontent.com/WaiHmueThit23/wallcraft_assets/main/Essential%20Series/Essential%20Series/Asset%20162@2x.webp',
  'https://raw.githubusercontent.com/WaiHmueThit23/wallcraft_assets/main/Essential%20Series/Essential%20Series/Asset%20161@2x.webp',
  'https://raw.githubusercontent.com/WaiHmueThit23/wallcraft_assets/main/Essential%20Series/Essential%20Series/Asset%20160@2x.webp',
  'https://raw.githubusercontent.com/WaiHmueThit23/wallcraft_assets/main/Essential%20Series/Essential%20Series/Asset%20159@2x.webp',
  'https://raw.githubusercontent.com/WaiHmueThit23/wallcraft_assets/main/Essential%20Series/Essential%20Series/Asset%20164@2x.webp'
];

// --- Helper Components ---

const Separator = () => (
  <div className="flex justify-center lg:justify-start gap-1 h-1.5 w-28 my-8 mx-auto lg:mx-0">
    <div className="bg-[#6A6C5F] w-1/3"></div>
    <div className="bg-[#7B2715] w-1/3"></div>
    <div className="bg-[#B08038] w-1/3"></div>
  </div>
);

const AnimatedSection = ({ 
    children, 
    className = "", 
    animation = "fade-in-up", 
    delay = 0 
}: AnimatedSectionProps) => {
    const [isVisible, setIsVisible] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) setIsVisible(true);
        }, { threshold: 0.1 });
        if (ref.current) observer.observe(ref.current);
        return () => observer.disconnect();
    }, []);

    const animClasses = isVisible ? {
        'fade-in-right': 'animate-fade-in-right opacity-100',
        'fade-in-left': 'animate-fade-in-left opacity-100',
        'fade-in-up': 'animate-fade-in-up opacity-100'
    }[animation] : 'opacity-0 translate-y-8';

    return (
        <div ref={ref} className={`${className} transition-all duration-1000 ${animClasses}`} style={{ transitionDelay: `${delay}ms` }}>
            {children}
        </div>
    );
};

const CollectionSection = ({ 
  title, 
  highlight, 
  desc, 
  img, 
  link, 
  reverse = false, 
  color = '#c2bfb6' 
}: { 
  title: string, 
  highlight: string, 
  desc: string, 
  img: string, 
  link: string, 
  reverse?: boolean, 
  color?: string 
}) => {
  return (
    <section className={`relative z-10 flex flex-col ${reverse ? 'lg:flex-row-reverse' : 'lg:flex-row'} min-h-[70vh] items-center py-20 border-t border-white/5 overflow-hidden`}>
      <div className={`w-full lg:w-[50%] flex flex-col justify-center px-8 md:px-16 lg:px-24`}>
        <div className="max-w-lg mx-auto lg:mx-0">
          <Separator />
          <h2 className="text-4xl md:text-6xl font-light leading-tight mt-6 mb-8" style={{color: '#B08038' }}>
            {title}<br /><span className="text-[#c2bfb6]">{highlight}</span>
          </h2>
          <p className="text-[10px] md:text-sm font-light leading-relaxed max-w-md mb-10 text-[#c2bfb6]">
            {desc}
          </p>
          <a href={link} className="inline-block border border-[#c2bfb6] px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-[#c2bfb6] hover:bg-white hover:text-black transition-all">
            Learn More
          </a>
        </div>
      </div>
      <div className="w-full lg:w-[50%] px-8">
        <AnimatedSection animation={reverse ? "fade-in-left" : "fade-in-right"}>
          <img src={img} className="w-full max-h-[500px] object-contain drop-shadow-2xl" alt={title} />
        </AnimatedSection>
      </div>
    </section>
  );
};

// --- Main Page Component ---

export default function App() {
  const [isStacked, setIsStacked] = useState(true);
  const [activeLayerIndex, setActiveLayerIndex] = useState<number | null>(null);
  const stackContainerRef = useRef<HTMLDivElement>(null);
  const [windowWidth, setWindowWidth] = useState(0);

  useEffect(() => {
    // Initial width
    if (typeof window !== 'undefined') {
        setWindowWidth(window.innerWidth);
        const handleResize = () => setWindowWidth(window.innerWidth);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (stackContainerRef.current && activeLayerIndex === null) {
        const rect = stackContainerRef.current.getBoundingClientRect();
        const viewMid = window.innerHeight / 2;
        const distance = Math.abs((rect.top + rect.height / 2) - viewMid);
        
        // Auto stack/unstack based on scroll distance from screen center
        setIsStacked(distance > window.innerHeight * 0.35);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [activeLayerIndex]);

  const getLayerStyle = (index: number) => {
    const isMobile = windowWidth < 768;
    // Spacing matching Luxe Series
    const spacing = isStacked ? (isMobile ? 12 : 25) : (isMobile ? 65 : 180);

    if (activeLayerIndex !== null) {
      if (index === activeLayerIndex) {
        return {
          opacity: 1,
          zIndex: 100,
          transform: `translateY(${isMobile ? -40 : 0}px) scale(1.05)`,
          className: 'active-layer',
          pointerEvents: 'auto' as const
        };
      } else {
        // OTHER LAYER DISAPPEARS COMPLETELY
        return {
          opacity: 0,
          zIndex: 0,
          transform: 'translateY(50px) scale(0.8)',
          className: '',
          pointerEvents: 'none' as const
        };
      }
    }

    const finalY = isStacked ? index * spacing : (index * spacing) - ((LAYERS_DATA.length - 1) * spacing / 2);

    return {
      opacity: 1,
      zIndex: LAYERS_DATA.length - index,
      transform: `translateY(${finalY}px)`,
      className: '',
      pointerEvents: 'auto' as const
    };
  };

  const toggleLayer = (index: number) => {
    setActiveLayerIndex(prev => prev === index ? null : index);
    setIsStacked(false);
  };

  return (
    <div className="bg-black text-[#c2bfb6] font-sans overflow-x-hidden selection:bg-orange-500 selection:text-white">
      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=Prompt:wght@300;400;500;600;700&display=swap');
        
        body { font-family: 'Prompt', sans-serif; background-color: #000; }
        
        .layer-wrapper {
            transition: all 0.7s cubic-bezier(0.34, 1.56, 0.64, 1);
            will-change: transform, opacity;
            position: absolute;
            width: 100%;
        }

        .layer-inner-card {
            transform: rotateX(50deg) rotateZ(-15deg);
            transition: all 0.5s ease;
        }
        
        .active-layer .layer-inner-card {
            transform: rotateX(0deg) rotateZ(0deg);
            filter: drop-shadow(0 0 30px rgba(176, 128, 56, 0.5));
        }

        @keyframes fadeInUp {
          0% { opacity: 0; transform: translateY(30px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up { animation: fadeInUp 1s ease-out forwards; }

        @keyframes fadeInRight {
          0% { opacity: 0; transform: translateX(60px); }
          100% { opacity: 1; transform: translateX(0); }
        }
        .animate-fade-in-right { animation: fadeInRight 1.5s cubic-bezier(0.23, 1, 0.32, 1) forwards; }

        @keyframes fadeInLeft {
          0% { opacity: 0; transform: translateX(-60px); }
          100% { opacity: 1; transform: translateX(0); }
        }
        .animate-fade-in-left { animation: fadeInLeft 1.5s cubic-bezier(0.23, 1, 0.32, 1) forwards; }

        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }

        .headline-gold { color: #B08038; }
        
        .btn-explore {
            border: 1px solid rgba(176, 128, 56, 0.5);
            padding: 12px 32px;
            font-size: 11px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.25em;
            color: #fff;
            background: rgba(0, 0, 0, 0.2);
            backdrop-filter: blur(10px);
            transition: all 0.4s ease;
        }
        .btn-explore:hover {
            background: #B08038;
            box-shadow: 0 0 25px rgba(176, 128, 56, 0.4);
        }
      `}} />

      {/* --- GLOBAL BACKGROUND --- */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat bg-fixed"
          style={{ 
            backgroundImage: "url('https://raw.githubusercontent.com/WaiHmueThit23/wallcraft_assets/main/Essential%20Series/Essential%20Series/a97dadae3afc99615841325016e26563-gigapixel-standard%20v2-2x.webp')" 
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/85 to-black/30" />
      </div>

      {/* --- HERO SECTION --- */}
      <header className="relative z-10 min-h-[90vh] lg:min-h-screen flex items-start lg:items-center justify-start overflow-hidden px-6 md:px-16 lg:px-24 pt-32 md:pt-40 lg:pt-0 pb-16 lg:pb-0">
        
        {/* Faded Mask Wrapper */}
        <div 
            className="absolute inset-0 z-0 w-full h-full" 
            style={{ WebkitMaskImage: 'linear-gradient(to bottom, black 50%, transparent 100%)', maskImage: 'linear-gradient(to bottom, black 90%, transparent 100%)' }}
        >
            <img 
                src="https://raw.githubusercontent.com/WaiHmueThit23/wallcraft_assets/main/Essential%20Series/Essential%20Series/Asset%20158@2x.webp" 
                className="w-full h-full object-cover object-bottom lg:object-contain lg:object-right animate-fade-in-right drop-shadow-[0_0_50px_rgba(0,0,0,0.8)]"
                alt="Essential Series Material Display" 
            />
            {/* Gradients matching Luxe layout */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#000000] via-black/35 to-transparent lg:hidden"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-black via-black/60 to-transparent hidden lg:block"></div>
        </div>

        <div className="container mx-auto max-w-[1400px] z-30 relative pointer-events-none mt-4 lg:mt-0">
          <div className="flex flex-col animate-fade-in-up text-left pointer-events-auto">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight uppercase headline-gold mb-4 lg:mb-6 leading-[1.1] drop-shadow-md">
              Essential<br/>Series
            </h1>
            <p className="text-[12px] sm:text-sm md:text-base font-light leading-relaxed max-w-[280px] sm:max-w-md text-[#c2bfb6] drop-shadow-md">
              ผนังดีไซน์ใหม่ที่มอบทางเลือกการติดตั้งและการจบงานที่สมบูรณ์แบบ ครอบคลุมทั้ง Flat, 3D Wall และ LED ช่วยลดโอกาสการเกิดปัญหาหน้างาน
            </p>
          </div>
        </div>
      </header>

      {/* --- TECHNOLOGY LAYER SECTION --- */}
      <section id="technology" className="relative z-10 py-24 flex flex-col items-center border-t border-white/5">
        <div className="text-center mb-16 px-6">
          <Separator />
          <h2 className="text-4xl md:text-6xl font-bold tracking-tight mt-6 uppercase text-[#B08038]">Structure Detail</h2>
          <p className="text-[#c2bfb6] mt-4 max-w-xl mx-auto text-sm">การผสมผสานวัสดุและเทคโนโลยี เพื่อความสวยงามที่ยั่งยืน</p>
        </div>

        <div ref={stackContainerRef} className="relative w-full max-w-6xl h-[500px] md:h-[600px] flex justify-center items-center" style={{ perspective: '2500px' }}>
          {LAYERS_DATA.map((layer, index) => {
            const style = getLayerStyle(index);
            const isActive = index === activeLayerIndex;
            
            return (
              <div 
                key={index}
                className={`layer-wrapper flex flex-col md:flex-row justify-center items-center ${style.className}`}
                style={{ 
                  zIndex: style.zIndex, 
                  transform: style.transform,
                  opacity: style.opacity,
                  pointerEvents: style.pointerEvents
                }}
              >
                <div 
                  className="relative w-[300px] h-[180px] md:w-[650px] md:h-[380px] cursor-pointer group layer-click-target"
                  onClick={() => toggleLayer(index)}
                >
                  <div className="layer-inner-card w-full h-full">
                    <img src={layer.image} className="w-full h-full object-contain drop-shadow-2xl" alt={layer.title} />
                  </div>

                  {/* Desktop Label */}
                  <div className={`hidden md:flex items-center absolute left-[95%] top-1/2 -translate-y-1/2 z-50 transition-all duration-500 ${!isStacked || isActive ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'}`}>
                    <div className="h-[1px] w-[60px] bg-gradient-to-r from-transparent to-[#B08038]"></div>
                    <div className="ml-8 text-left min-w-[300px]">
                      <h3 className="headline-gold font-bold text-xl uppercase">{layer.title}</h3>
                      <div className={`mt-3 text-white text-sm leading-relaxed transition-all duration-500 overflow-hidden ${isActive ? 'max-h-[150px] opacity-100' : 'max-h-0 opacity-0'}`}>
                        <p className="p-4 bg-black/60 border-l-2 border-[#B08038] backdrop-blur-md">
                          {layer.description}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Mobile Description */}
                {isActive && (
                  <div className="md:hidden mt-8 px-8 w-full animate-fade-in-up">
                    <div className="bg-zinc-900/90 p-6 border-t-2 border-[#B08038] rounded-b-xl text-center">
                      <h3 className="headline-gold font-bold text-lg uppercase mb-2">{layer.title}</h3>
                      <p className="text-[#c2bfb6] text-[11px] leading-relaxed">{layer.description}</p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-12 flex flex-col items-center gap-6 relative z-40">
          <button onClick={() => toggleLayer(activeLayerIndex !== null ? activeLayerIndex : 0)} className="btn-explore">
            {isStacked ? 'Explore Layers' : 'Stack Layers'}
          </button>
        </div>

        {/* Tech Icons */}
        <div className="w-full max-w-[1600px] mx-auto mt-24 md:mt-32 px-6 relative z-20">
          <div className="grid grid-cols-3 md:grid-cols-6 gap-6 sm:gap-10 items-center justify-items-center opacity-80">
            {TECH_ICONS_DATA.map((src, i) => (
              <div key={i} className="w-full max-w-[120px] md:max-w-[180px] aspect-square flex items-center justify-center p-2">
                <img 
                  src={src} 
                  className="w-full h-full object-contain opacity-80 hover:opacity-100 transition-all duration-300 hover:scale-110" 
                  alt="Icon" 
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- COLLECTION SECTIONS --- */}
      <CollectionSection 
        title="Solid" 
        highlight="Panel"
        desc="ผนังสำเร็จรูปที่เน้นความแข็งแรง ติดตั้งง่าย จบงานได้ทันทีโดยไม่ต้องผ่านกระบวนการซับซ้อน"
        img="https://raw.githubusercontent.com/WaiHmueThit23/wallcraft_assets/main/Essential%20Series/Essential%20Series/Asset%20169@2x.webp"
        link="/collection/essential-solid"
        color="#B08036"
      />

      <CollectionSection 
        title="Hollow Core" 
        highlight="Panel"
        desc="ผนังน้ำหนักเบาพร้อมระบบร่องลิ้นและตัวจบมุมในตัว ช่วยให้การติดตั้งรวดเร็วและประณีตในทุกรายละเอียด"
        img="https://raw.githubusercontent.com/WaiHmueThit23/wallcraft_assets/main/Essential%20Series/Essential%20Series/Asset%20165@2x.webp"
        link="/collection/essential-hollow"
        reverse
      />

      <CollectionSection 
        title="Decor" 
        highlight="Panel"
        desc="ดีไซน์ผนังระแนงที่มาพร้อมตัวจบที่ออกแบบมาให้เข้าคู่กันโดยเฉพาะ สร้างมิติให้พื้นที่ได้อย่างลงตัว"
        img="https://raw.githubusercontent.com/WaiHmueThit23/wallcraft_assets/main/Essential%20Series/Essential%20Series/Asset%20168@2x.webp"
        link="/collection/essential-decor"
        color="#CBBDAD"
      />

      <CollectionSection 
        title="Accessories" 
        highlight="Aluminium & LED"
        desc="อุปกรณ์ตกแต่งเพื่อความสมบูรณ์แบบ ทั้งคิ้วอลูมิเนียมเก็บงานสีเดียวกับแผ่น และระบบไฟ LED ขนาดจิ๋ว"
        img="https://raw.githubusercontent.com/WaiHmueThit23/wallcraft_assets/main/Essential%20Series/Essential%20Series/Asset%20167@2x.webp"
        link="/collection/essential-accessories"
        reverse
      />
    </div>
  );
}