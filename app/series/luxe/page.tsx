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
    title: 'DECORATIVE SHEET',
    description: 'ชั้นปิดผิวระดับพรีเมียมพร้อมเทคโนโลยีป้องกันการซีดจาง และทนทานต่อการขีดข่วนเป็นพิเศษ',
    image: 'https://raw.githubusercontent.com/WaiHmueThit23/wallcraft_assets/main/luxe_series/Asset%20123@2x.webp'
  },
  {
    title: 'HPVC/AVIATION FIBER',
    description: 'โครงสร้างแกนกลาง HPVC ผสมเส้นใยเกรดการบิน แข็งแรง กันน้ำ 100% และคงรูปได้ดีเยี่ยม',
    image: 'https://raw.githubusercontent.com/WaiHmueThit23/wallcraft_assets/main/luxe_series/Asset%20124@2x.webp'
  }
];

const TECH_ICONS_DATA = [
  'https://raw.githubusercontent.com/WaiHmueThit23/wallcraft_assets/main/luxe_series/Asset%20132@2x.webp',
  'https://raw.githubusercontent.com/WaiHmueThit23/wallcraft_assets/main/luxe_series/Asset%20131@2x.webp',
  'https://raw.githubusercontent.com/WaiHmueThit23/wallcraft_assets/main/luxe_series/Asset%20130@2x.webp',
  'https://raw.githubusercontent.com/WaiHmueThit23/wallcraft_assets/main/luxe_series/Asset%20129@2x.webp',
  'https://raw.githubusercontent.com/WaiHmueThit23/wallcraft_assets/main/luxe_series/Asset%20128@2x.webp',
  'https://raw.githubusercontent.com/WaiHmueThit23/wallcraft_assets/main/luxe_series/Asset%20127@2x.webp'
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
  desc, 
  img, 
  link, 
  reverse = false 
}: { 
  title: string, 
  desc: string, 
  img: string, 
  link: string, 
  reverse?: boolean 
}) => {
  // Split title to separate Main Title and "Collection"
  const titleParts = title.split(' ');
  const mainTitle = titleParts.slice(0, -1).join(' ');
  const subTitle = titleParts[titleParts.length - 1];

  return (
    <section className={`relative z-10 flex flex-col ${reverse ? 'lg:flex-row-reverse' : 'lg:flex-row'} min-h-[70vh] items-center py-20 border-t border-white/5 overflow-hidden`}>
      <div className={`w-full lg:w-[50%] flex flex-col justify-center px-8 md:px-16 lg:px-24`}>
        <div className="max-w-lg mx-auto lg:mx-0">
          <Separator />
          <h2 className="text-4xl md:text-6xl font-light leading-tight mt-6 mb-8" style={{ color: '#B08038' }}>
            {mainTitle} <span className="text-[#c2bfb6]"><br />{subTitle}</span>
          </h2>
          <p className="text-[10px] md:text-sm font-light leading-relaxed max-w-md mb-10 text-[#c2bfb6]">
            {desc}
          </p>
          <a href={link} className="inline-block border px-8 py-4 text-xs font-bold uppercase tracking-widest transition-all duration-300 hover:bg-[#c2bfb6] hover:text-black" style={{ color: '#c2bfb6', borderColor: 'rgba(194, 191, 182, 0.4)' }}>
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

export default function App() {
  const [isStacked, setIsStacked] = useState(true);
  const [activeLayerIndex, setActiveLayerIndex] = useState<number | null>(null);
  const stackContainerRef = useRef<HTMLDivElement>(null);
  const [windowWidth, setWindowWidth] = useState(0);

  useEffect(() => {
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
        setIsStacked(distance > window.innerHeight * 0.35);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [activeLayerIndex]);

  const getLayerStyle = (index: number) => {
    const isMobile = windowWidth < 768;
    // Spacing mapping identical to HTML
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

        @keyframes fadeInUp { 0% { opacity: 0; transform: translateY(30px); } 100% { opacity: 1; transform: translateY(0); } }
        .animate-fade-in-up { animation: fadeInUp 1s ease-out forwards; }
        @keyframes fadeInRight { 0% { opacity: 0; transform: translateX(60px); } 100% { opacity: 1; transform: translateX(0); } }
        .animate-fade-in-right { animation: fadeInRight 1.5s cubic-bezier(0.23, 1, 0.32, 1) forwards; }
        @keyframes fadeInLeft { 0% { opacity: 0; transform: translateX(-60px); } 100% { opacity: 1; transform: translateX(0); } }
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
            backgroundImage: "url('https://raw.githubusercontent.com/WaiHmueThit23/wallcraft_assets/main/luxe_series/Asset%20126@2x.webp')" 
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/85 via-black/40 to-black/20" />
      </div>

      {/* --- HERO SECTION --- */}
      <header className="relative z-10 min-h-[90vh] lg:min-h-screen flex items-start lg:items-center justify-start overflow-hidden px-6 md:px-16 lg:px-24 pt-32 md:pt-40 lg:pt-0 pb-16 lg:pb-0">
        
        {/* Faded Mask Wrapper */}
        <div 
            className="absolute inset-0 z-0 w-full h-full" 
            style={{ WebkitMaskImage: 'linear-gradient(to bottom, black 50%, transparent 100%)', maskImage: 'linear-gradient(to bottom, black 90%, transparent 100%)' }}
        >
            <img 
                src="https://raw.githubusercontent.com/WaiHmueThit23/wallcraft_assets/main/luxe_series/Asset%20125@2x.webp" 
                className="w-full h-full object-cover object-bottom lg:object-contain lg:object-right animate-fade-in-right drop-shadow-[0_0_50px_rgba(0,0,0,0.8)]"
                alt="Luxe Series Material Display" 
            />
            {/* Gradients */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#000000] via-black/35 to-transparent lg:hidden"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-black via-black/60 to-transparent hidden lg:block"></div>
        </div>

        <div className="container mx-auto max-w-[1400px] z-30 relative pointer-events-none mt-4 lg:mt-0">
          <div className="flex flex-col animate-fade-in-up text-left pointer-events-auto">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight uppercase headline-gold mb-4 lg:mb-6 leading-[1.1] drop-shadow-md">
              Luxe<br/>Series
            </h1>
            <p className="text-[12px] sm:text-sm md:text-base font-light leading-relaxed max-w-[280px] sm:max-w-md text-gray-200 drop-shadow-md">
              ผนังตกแต่งระดับพรีเมียมที่ออกแบบมาเพื่อยกระดับทุกพื้นที่ให้มีทั้งความงามและความทนทาน ด้วยโครงสร้างหลัก HPVC หนา 5 มิลลิเมตร แข็งแรง กันน้ำ และคงรูปได้ดีเยี่ยม
            </p>
          </div>
        </div>
      </header>

      {/* --- TECHNOLOGY LAYER SECTION --- */}
      <section id="technology" className="relative z-10 py-24 flex flex-col items-center border-t border-white/5">
        <div className="text-center mb-16 px-6">
          <Separator />
          <h2 className="text-4xl md:text-6xl font-bold tracking-tight uppercase text-[#B08038]">Luxe Technology</h2>
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
                      <p className="text-gray-200 text-[11px] leading-relaxed">{layer.description}</p>
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
        <div className="w-full max-w-[1600px] mx-auto mt-24 px-6 relative z-20">
          <div className="grid grid-cols-3 md:grid-cols-6 gap-8 items-center justify-items-center opacity-80">
            {TECH_ICONS_DATA.map((src, i) => (
              <div key={i} className="w-full max-w-[120px] aspect-square flex items-center justify-center p-2">
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
        title="Fabric Collection" 
        desc="ผนังลายผ้าที่สร้างบรรยากาศสบายตาและมีชีวิตชีวา ถ่ายทอดความละเมียดละไม พร้อมดีไซน์ที่คมชัดในทุกมุม เรียบง่ายแต่เต็มไปด้วยพลังของดีไซน์ที่แตกต่าง"
        img="https://raw.githubusercontent.com/WaiHmueThit23/wallcraft_assets/main/luxe_series/Asset%20135@2x.webp"
        link="/collections/luxe-collection/fabric"
      />

      <CollectionSection 
        title="Leather Collection" 
        desc="ผนังลายหนังที่สะท้อนความหรูหราอย่างมั่นใจ เติมเสน่ห์ที่มีเอกลักษณ์เฉพาะตัว คือการออกแบบที่ผสมผสานความหรูหรากับความร่วมสมัยอย่างลงตัว"
        img="https://raw.githubusercontent.com/WaiHmueThit23/wallcraft_assets/main/luxe_series/Asset%20139@2x.webp"
        link="/collections/luxe-collection/leather"
        reverse
      />

      <CollectionSection 
        title="Metallic Collection" 
        desc="ผนังเมทัลลิกที่เปล่งประกายด้วยการเล่นแสงเงา เติมความมีพลังและความโมเดิร์นให้กับทุกพื้นที่ เป็นการแสดงออกที่เฉียบคมและเต็มไปด้วยความทันสมัย"
        img="https://raw.githubusercontent.com/WaiHmueThit23/wallcraft_assets/main/luxe_series/Asset%20137@2x.webp"
        link="/collections/luxe-collection/metallic"
      />

      <CollectionSection 
        title="Semi Outdoor Collection" 
        desc="ผนัง Outdoor ที่ออกแบบมาเพื่อรองรับทุกสภาพอากาศ ทั้งแสงแดดและฝน พร้อมดีไซน์ที่โดดเด่น เป็นการผสมผสานฟังก์ชันการใช้งานเข้ากับดีไซน์ที่สะกดสายตา"
        img="https://raw.githubusercontent.com/WaiHmueThit23/wallcraft_assets/main/luxe_series/Asset%20136@2x.webp"
        link="/collections/luxe-collection/outdoor"
        reverse
      />

      <CollectionSection 
        title="Signature Collection" 
        desc="ผนัง Signature ถ่ายทอดความคิดสร้างสรรค์ผ่านการผสมวัสดุและเทคนิคเฉพาะ เป็นเสมือนงานแฟชั่นที่ไม่ซ้ำใครและสะท้อนสไตล์ที่ชัดเจนของคุณ"
        img="https://raw.githubusercontent.com/WaiHmueThit23/wallcraft_assets/main/luxe_series/Asset%20134@2x.webp"
        link="/collections/luxe-collection/signature"
      />

      <CollectionSection 
        title="Stone Collection" 
        desc="ผนังลายหินที่สะท้อนพลังและความสง่างามของธรรมชาติ ถ่ายทอดความแข็งแรงและความโดดเด่นในทุกมิติ ดีไซน์ที่มั่นคงและมีเอกลักษณ์ในตัวเอง"
        img="https://raw.githubusercontent.com/WaiHmueThit23/wallcraft_assets/main/luxe_series/Asset%20140@2x.webp"
        link="/collections/luxe-collection/stone"
        reverse
      />

      <CollectionSection 
        title="Velvet Collection" 
        desc="ผนังเวลเวทที่มอบสัมผัสเรียบหรูและเต็มไปด้วยชั้นเชิง เพิ่มบรรยากาศที่ลุ่มลึกและน่าค้นหา เป็นการตีความใหม่ของความหรูหราให้ทันสมัยและโดดเด่น"
        img="https://raw.githubusercontent.com/WaiHmueThit23/wallcraft_assets/main/luxe_series/Asset%20138@2x.webp"
        link="/collections/luxe-collection/velvet"
      />

      <CollectionSection 
        title="Wood Collection" 
        desc="ผนังลายไม้ที่สะท้อนความเป็นธรรมชาติในรูปแบบที่ร่วมสมัย ถ่ายทอดความสมดุลของดีไซน์และฟังก์ชัน สร้างบรรยากาศที่สดใหม่และเข้ากับทุกแนวทางการตกแต่ง"
        img="https://raw.githubusercontent.com/WaiHmueThit23/wallcraft_assets/main/luxe_series/Asset%20133@2x.webp"
        link="/collections/luxe-collection/wood"
        reverse
      />

      {/* --- SECTION 12: Comparison Matrix --- */}
      <section className="relative z-10 py-32 border-t border-white/5">
        <div className="container mx-auto max-w-[1400px] px-8">
            <div className="mb-24 text-center md:text-left">
                <h2 className="text-3xl md:text-5xl font-bold leading-tight uppercase mb-4 text-white">
                    แนวทางการเลือกพื้นผิววัสดุ<br /><span className="text-[#c2bfb6]">ตามฟังก์ชันการใช้งาน</span>
                </h2>
                <div className="flex gap-1 h-1.5 w-28 mb-8 mx-auto md:mx-0">
                    <div className="bg-[#6A6C5F] w-1/3"></div>
                    <div className="bg-[#7B2715] w-1/3"></div>
                    <div className="bg-[#B08038] w-1/3"></div>
                </div>
            </div>

            <div className="overflow-x-auto no-scrollbar">
                <table className="w-full min-w-[1100px] text-center border-collapse">
                    <thead>
                        <tr className="border-b border-white/5">
                            <th className="py-10 text-left w-[20%]"></th>
                            {['154', '152', '153', '151', '150', '149', '148', '147'].map((id) => (
                                <th key={id} className="py-10 px-4">
                                    <div className="w-20 h-20 flex items-center justify-center mx-auto">
                                        <img src={`https://raw.githubusercontent.com/WaiHmueThit23/wallcraft_assets/main/luxe_series/Asset%20${id}@2x.webp`} className="w-full h-full object-contain opacity-80" alt="Icon" />
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {[
                            { name: 'Vinyl Collection', color: '#B08038', scores: [9, 8, 6, 7, 5, 9, 5, 8] },
                            { name: 'Fabric Collection', color: '#6A6C5F', scores: [6, 5, 5, 6, 8, 6, 9, 5] },
                            { name: 'Unique Collection', color: '#CBBDAD', scores: [7, 6, 5, 7, 8, 7, 8, 6] },
                            { name: 'Velvet Collection', color: '#7B2715', scores: [6, 5, 5, 6, 9, 6, 9, 5] },
                            { name: 'Outdoor Collection', color: '#7C7D75', scores: [8, 8, 9, 7, 6, 9, 6, 8] },
                        ].map((row, idx) => (
                            <tr key={idx} className="hover:bg-white/5 transition-colors group border-b border-white/5 last:border-0">
                                <td className="py-8 text-left text-lg font-bold uppercase" style={{ color: row.color }}>{row.name}</td>
                                {row.scores.map((score, sIdx) => (
                                    <td key={sIdx} className="py-8 font-semibold text-xl" style={{ color: row.color }}>{score}</td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
      </section>

      {/* --- INSTALLATION PROCESS SECTION --- */}
      <section className="relative z-10 py-24 border-t border-white/5">
        <div className="container mx-auto max-w-[1600px] px-6">
            <div className="text-center mb-24">
                <Separator />
                <span className="text-[30px] font-bold mb-4 block text-[#c2bfb6]">Process Guide</span>
                <h2 className="text-3xl md:text-4xl font-light text-white leading-tight uppercase mb-8">Installation Process</h2>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-6">
                {[
                    { img: '146', title: 'ป้องกันคราบสกปรก', desc: 'ผิววัสดุช่วยลดการยึดเกาะ ของคราบ ทำให้ผนังดูสะอาด อยู่เสมอ' },
                    { img: '144', title: 'วัสดุไม่เป็นเชื้อเพลิง (Class B)', desc: 'ผ่านมาตรฐานความปลอดภัย จากการติดไฟ ลดความเสี่ยงจาก อัคคีภัย' },
                    { img: '141', title: 'ติดตั้งและซ่อมบำรุงง่าย', desc: 'ออกแบบให้ใช้งานสะดวก ลดขั้นตอนการติดตั้ง และซ่อมบำรุงได้อย่างรวดเร็ว' },
                    { img: '143', title: 'ไม่หลุดร่อนหรือแตกร้าวง่าย', desc: 'ผิวเคลือบและโครงสร้าง มีความทนทาน ใช้งานได้ยาวนาน' },
                    { img: '142', title: 'ผิวสัมผัสนุ่ม', desc: 'มอบความรู้สึกสบาย ปลอดภัย ต่อผู้ใช้งาน โดยเฉพาะในพื้นที่ ที่มีเด็กหรือผู้สูงอายุ' },
                    { img: '145', title: 'ทำความสะอาดง่าย', desc: 'สามารถเช็ดล้างได้สะดวก ประหยัดเวลาและค่าใช้จ่าย ในการดูแลรักษา' }
                ].map((item, idx) => (
                    <div key={idx} className="group flex flex-col items-center">
                        <div className="aspect-[3/4] overflow-hidden border border-white/10 mb-6 relative w-full rounded-sm">
                            <img src={`https://raw.githubusercontent.com/WaiHmueThit23/wallcraft_assets/main/luxe_series/Asset%20${item.img}@2x.webp`} className="w-full h-full object-cover group-hover:scale-110 transition-all duration-700" alt={item.title} />
                        </div>
                        <div className="text-center">
                            <h3 className="text-sm font-bold uppercase mb-1 text-[#B08038]">{item.title}</h3>
                            <p className="text-[10px] text-[#c2bfb6] uppercase tracking-wider">{item.desc}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
      </section>
    </div>
  );
}