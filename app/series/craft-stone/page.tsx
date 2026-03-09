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

// --- Data Constants ---
const LAYERS_DATA: Layer[] = [
    {
        title: 'UV Coating Layer',
        description: 'เคลือบป้องกันรังสี UV ลดการซีดจางของสี ป้องกันรอยขีดข่วน และทำให้พื้นผิวทำความสะอาดง่ายเป็นพิเศษ',
        image: 'https://raw.githubusercontent.com/WaiHmueThit23/wallcraft_assets/main/craft_layer/layer1.webp'
    },
    {
        title: 'Mineral Color Layer',
        description: 'ชั้นสีที่สกัดจากแร่ธรรมชาติ 100% ทนทานต่อแสงแดดจัดและทนไฟได้ดีเยี่ยม ให้สีสันที่สวยงามดูเป็นธรรมชาติและไม่ซีดจางตามกาลเวลา',
        image: 'https://raw.githubusercontent.com/WaiHmueThit23/wallcraft_assets/main/craft_layer/layer2.webp'
    },
    {
        title: 'Eco Clay Composite',
        description: 'ชั้นแกนกลางนวัตกรรมใหม่จากดินและผงหินดัดแปลง (Modified Clay) ให้คุณสมบัติเด่นเรื่องความเบา ความยืดหยุ่นสูง แต่ยังคงความแข็งแรงทนทาน',
        image: 'https://raw.githubusercontent.com/WaiHmueThit23/wallcraft_assets/main/craft_layer/layer3.webp'
    },
    {
        title: 'Fiberglass Mesh',
        description: 'ตาข่ายไฟเบอร์กลาสเสริมแรงชั้นล่างสุด ช่วยป้องกันการแตกร้าวและการบิดงอของแผ่นวัสดุ เพิ่มความเสถียรในการติดตั้งกับทุกสภาพพื้นผิว',
        image: 'https://raw.githubusercontent.com/WaiHmueThit23/wallcraft_assets/main/craft_layer/layer4.webp'
    }
];

const TECH_ICONS_DATA = [
    'https://raw.githubusercontent.com/WaiHmueThit23/wallcraft_assets/main/craft%20stone%20icon/craft%20stone%20icon/Untitled-1-03.webp',
    'https://raw.githubusercontent.com/WaiHmueThit23/wallcraft_assets/main/craft%20stone%20icon/craft%20stone%20icon/Untitled-1-04.webp',
    'https://raw.githubusercontent.com/WaiHmueThit23/wallcraft_assets/main/craft%20stone%20icon/craft%20stone%20icon/Untitled-1-05.webp',
    'https://raw.githubusercontent.com/WaiHmueThit23/wallcraft_assets/main/craft%20stone%20icon/craft%20stone%20icon/Untitled-1-06.webp',
    'https://raw.githubusercontent.com/WaiHmueThit23/wallcraft_assets/main/craft%20stone%20icon/craft%20stone%20icon/Untitled-1-07.webp',
    'https://raw.githubusercontent.com/WaiHmueThit23/wallcraft_assets/main/craft%20stone%20icon/craft%20stone%20icon/Untitled-1-08.webp',
    'https://raw.githubusercontent.com/WaiHmueThit23/wallcraft_assets/main/craft%20stone%20icon/craft%20stone%20icon/Untitled-1-09.webp'
];

const INSTALLATION_STEPS = [
    { img: "https://raw.githubusercontent.com/WaiHmueThit23/wallcraft_assets/main/craft_stone/Asset%20105@2x.webp", text: "หลังจากที่เคลียร์ผนังเรียบร้อยแล้ว ให้ทำการวัดตำแหน่ง จุดที่ต้องการติดตั้ง MCM จากนั้นใช้บักเต้าตีเส้นหรือขึงเอ็น ให้ตรงตามระนาบทั้งแนวตั้งและแนวนอน" },
    { img: "https://raw.githubusercontent.com/WaiHmueThit23/wallcraft_assets/main/craft_stone/Asset%20104@2x.webp", text: "ตัดแต่งแผ่น MCM ตามขนาดที่ต้องการ โดยใช้ลูกหมู หรือเครื่องตัดไฟฟ้า ก่อนการทากาวและติดตั้ง" },
    { img: "https://raw.githubusercontent.com/WaiHmueThit23/wallcraft_assets/main/craft_stone/Asset%20103@2x.webp", text: "นำแผ่น MCM ที่ตัดเตรียมไว้ ทาปูนกาว ที่ด้านหลังของแผ่นให้ทั่ว จากนั้นใช้เกรียงหวีปาด เป็นครั้งสุดท้ายก่อนนำขึ้นติดกับผนัง" },
    { img: "https://raw.githubusercontent.com/WaiHmueThit23/wallcraft_assets/main/craft_stone/Asset%20101@2x.webp", text: "ใช้เกรียงฉาบไล่ฟองอากาศ และกดกระจายน้ำหนัก ให้ทั่วบริเวณแผ่น MCM ให้กาวเกิดการกระจายตัว และติดแน่น" },
    { img: "https://raw.githubusercontent.com/WaiHmueThit23/wallcraft_assets/main/craft_stone/Asset%20102@2x.webp", text: "หากมีการเว้นร่อง ให้ใช้กาวซิลิโคนยาแนวบีบไปที่แนวร่อง จากนั้นใช้ฟองน้ำเช็ดทำความสะอาดบริเวณร่องแผ่นเพื่อเก็บรายละเอียดความเรียบร้อยของงาน" }
];

const PERFORMANCE_TESTS = [
    { img: 'https://raw.githubusercontent.com/WaiHmueThit23/wallcraft_assets/main/craft_stone/Asset%20106@2x.webp', text: 'วัสดุผ่านการทดสอบการปล่อยสารอินทรีย์ระเหยง่าย (VOCs) ทำให้มั่นใจได้ว่าไม่มีสารพิษที่เป็นอันตรายต่อสุขภาพ' },
    { img: 'https://raw.githubusercontent.com/WaiHmueThit23/wallcraft_assets/main/craft_stone/Asset%20107@2x.webp', text: 'การทดสอบการขัดถู วัสดุสูญเสียน้ำหนักเพียง 0.0833 กรัม หลังขัด 500 รอบ ทนทานต่อการใช้งานสูง' },
    { img: 'https://raw.githubusercontent.com/WaiHmueThit23/wallcraft_assets/main/craft_stone/Asset%20108@2x.webp', text: 'ตรวจสอบตามมาตรฐาน Prop 65 ของสหรัฐอเมริกา โดยไม่พบสารตะกั่วหลงเหลือเลย ปลอดภัยต่อผู้ใช้งาน' },
    { img: 'https://raw.githubusercontent.com/WaiHmueThit23/wallcraft_assets/main/craft_stone/Asset%20109%402x.webp', text: 'ทดสอบแช่แข็งและละลายซ้ำ 20 รอบ ไม่พบการแตกร้าว ทนต่อสภาพอากาศที่เปลี่ยนแปลงได้ดี' },
    { img: 'https://raw.githubusercontent.com/WaiHmueThit23/wallcraft_assets/main/craft_stone/Asset 110@2x.webp', text: 'การดูดซึมน้ำเฉลี่ย 5.41% วัสดุมีน้ำหนักเบากว่าหินธรรมชาติทั่วไป ติดตั้งและเคลื่อนย้ายสะดวก' },
    { img: 'https://raw.githubusercontent.com/WaiHmueThit23/wallcraft_assets/main/craft_stone/Asset%20110%402x.webp', text: 'ทนต่ออุณหภูมิสุดขั้ว -40°C ถึง 80°C ไม่เปลี่ยนรูปหรือแตกร้าว เหมาะกับอากาศร้อนในประเทศไทย' }
];

const APP_ICONS = [
    'https://raw.githubusercontent.com/WaiHmueThit23/wallcraft_assets/main/craft_stone/Asset%20121@2x.webp',
    'https://raw.githubusercontent.com/WaiHmueThit23/wallcraft_assets/main/craft_stone/Asset%20113@2x.webp',
    'https://raw.githubusercontent.com/WaiHmueThit23/wallcraft_assets/main/craft_stone/Asset%20114@2x.webp',
    'https://raw.githubusercontent.com/WaiHmueThit23/wallcraft_assets/main/craft_stone/Asset%20115@2x.webp',
    'https://raw.githubusercontent.com/WaiHmueThit23/wallcraft_assets/main/craft_stone/Asset%20116@2x.webp',
    'https://raw.githubusercontent.com/WaiHmueThit23/wallcraft_assets/main/craft_stone/Asset%20117@2x.webp',
    'https://raw.githubusercontent.com/WaiHmueThit23/wallcraft_assets/main/craft_stone/Asset%20118@2x.webp',
    'https://raw.githubusercontent.com/WaiHmueThit23/wallcraft_assets/main/craft_stone/Asset%20119@2x.webp'
];

const COLLECTIONS_DATA = [
  {
    title: "Tarra Stone",
    link: "/collections/craft-stone-collection/tarra-stone",
    image: "https://raw.githubusercontent.com/WaiHmueThit23/wallcraft_assets/main/craft_stone/Asset%2092@2x.webp",
    reverse: false,
  },
  {
    title: "Panorama",
    link: "/collections/craft-stone-collection/panorama",
    image: "https://raw.githubusercontent.com/WaiHmueThit23/wallcraft_assets/main/craft_stone/Asset%2093@2x.webp",
    reverse: true,
  },
  {
    title: "Strength Rock",
    link: "/collections/craft-stone-collection/strength-rock",
    image: "https://raw.githubusercontent.com/WaiHmueThit23/wallcraft_assets/main/craft_stone/Asset%2094@2x.webp",
    reverse: false,
  },
  {
    title: "Geoform",
    link: "/collections/craft-stone-collection/geoform",
    image: "https://raw.githubusercontent.com/WaiHmueThit23/wallcraft_assets/main/craft_stone/Asset%2095@2x.webp",
    reverse: true,
  },
  {
    title: "Urban Form",
    link: "/collections/craft-stone-collection/urban-form",
    image: "https://raw.githubusercontent.com/WaiHmueThit23/wallcraft_assets/main/craft_stone/Asset%2096@2x.webp",
    reverse: false,
  },
  {
    title: "Nature Grain",
    link: "/collections/craft-stone-collection/nature-grain",
    image: "https://raw.githubusercontent.com/WaiHmueThit23/wallcraft_assets/main/craft_stone/Asset%2097@2x.webp",
    reverse: true,
  },
  {
    title: "Rust",
    link: "/collections/craft-stone-collection/rust",
    image: "https://raw.githubusercontent.com/WaiHmueThit23/wallcraft_assets/main/craft_stone/Asset%2098@2x.webp",
    reverse: false,
  },
  {
    title: "Finesse",
    link: "/collections/craft-stone-collection/finesse",
    image: "https://raw.githubusercontent.com/WaiHmueThit23/wallcraft_assets/main/craft_stone/Asset%2099@2x.webp",
    reverse: true,
  },
];

const Separator = () => (
    <div className="flex gap-1 h-1.5 w-28 mx-auto lg:mx-0">
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

export default function App() {
    const [isStacked, setIsStacked] = useState(true);
    const [activeLayerIndex, setActiveLayerIndex] = useState<number | null>(null);
    const stackContainerRef = useRef<HTMLDivElement>(null);
    const [windowWidth, setWindowWidth] = useState(1200);

    // Track window resize for responsive layer spacing
    useEffect(() => {
        setWindowWidth(window.innerWidth);
        const handleResize = () => setWindowWidth(window.innerWidth);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Track scroll to auto-expand/collapse layers
    useEffect(() => {
        const handleScroll = () => {
            if (!stackContainerRef.current) return;
            const rect = stackContainerRef.current.getBoundingClientRect();
            const viewMid = window.innerHeight / 2;
            const distance = Math.abs((rect.top + rect.height / 2) - viewMid);
            
            if (activeLayerIndex === null) {
                setIsStacked(distance > window.innerHeight * 0.35);
            }
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, [activeLayerIndex]);

    const toggleLayer = (index: number) => {
        if (activeLayerIndex === index) {
            setActiveLayerIndex(null);
        } else {
            setActiveLayerIndex(index);
            setIsStacked(false);
        }
    };

    const getLayerStyle = (index: number) => {
        const isMobile = windowWidth < 768;
        const spacing = isStacked ? (isMobile ? 12 : 18) : (isMobile ? 50 : 130);

        if (activeLayerIndex !== null) {
            if (index === activeLayerIndex) {
                return {
                    opacity: 1,
                    zIndex: 100,
                    transform: isMobile ? 'translateY(-40px) scale(1.05)' : 'translateY(0px) scale(1.05)',
                    className: 'expanded active-layer',
                    pointerEvents: 'auto' as const
                };
            } else {
                return {
                    opacity: 0,
                    zIndex: 0,
                    transform: 'translateY(50px) scale(0.8)',
                    className: 'inactive-layer',
                    pointerEvents: 'none' as const
                };
            }
        }

        const finalY = isStacked ? index * spacing : (index * spacing) - ((LAYERS_DATA.length - 1) * spacing / 2);

        return {
            opacity: 1,
            zIndex: LAYERS_DATA.length - index,
            transform: `translateY(${finalY}px)`,
            className: !isStacked ? 'expanded' : '',
            pointerEvents: 'auto' as const
        };
    };

    return (
        <div className="bg-black text-[#c2bfb6] font-sans overflow-x-hidden selection:bg-orange-500 selection:text-white">
            <style dangerouslySetInnerHTML={{__html: `
                @import url('https://fonts.googleapis.com/css2?family=Prompt:wght@300;400;500;600;700&display=swap');
                
                :root {
                    --brand-gold: #B08038;
                    --text-grey: #c2bfb6;
                }
                body {
                    font-family: 'Prompt', sans-serif;
                    background-color: #000;
                }
                .headline-gold { color: var(--brand-gold) !important; }
                .craft-stone-unified-bg {
                    background-image: linear-gradient(to bottom, rgba(0, 0, 0, 0.9), rgba(0, 0, 0, 0.4)), url('https://raw.githubusercontent.com/WaiHmueThit23/wallcraft_assets/main/craft_stone/A7_04129%20copy.webp');
                    background-size: cover;
                    background-position: center;
                    background-attachment: fixed;
                }
                .perspective-container { perspective: 2500px; }
                .layer-wrapper {
                    transition: all 0.7s cubic-bezier(0.34, 1.56, 0.64, 1);
                    will-change: transform, opacity;
                }
                .layer-card {
                    transform: rotateZ(-5deg);
                    transition: all 0.5s ease;
                }
                .active-layer .layer-card {
                    transform: rotateZ(0deg) scale(1.02);
                    filter: drop-shadow(0 0 20px rgba(176, 128, 56, 0.4));
                }
                .layer-label {
                    opacity: 0;
                    transform: translateX(40px);
                    transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
                    pointer-events: none;
                }
                .expanded .layer-label {
                    opacity: 1;
                    transform: translateX(0);
                    pointer-events: auto;
                }
                .active-layer .layer-label {
                    transform: translateX(0) scale(1.05);
                    opacity: 1;
                }
                .pointer-line {
                    height: 1px;
                    width: 60px;
                    background: linear-gradient(to right, transparent, var(--brand-gold));
                    position: relative;
                }
                .btn-explore {
                    border: 1px solid rgba(176, 128, 56, 0.5);
                    padding: 14px 40px;
                    font-size: 12px;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 0.25em;
                    color: #fff;
                    background: rgba(176, 128, 56, 0.1);
                    backdrop-filter: blur(10px);
                    transition: all 0.4s ease;
                    cursor: pointer;
                }
                .btn-explore:hover {
                    background: var(--brand-gold);
                    box-shadow: 0 0 25px rgba(176, 128, 56, 0.4);
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
            `}} />

            <div className="craft-stone-unified-bg">
                
                {/* --- Hero Section --- */}
                <header className="relative z-10 min-h-[90vh] lg:min-h-screen flex items-start lg:items-center justify-start overflow-hidden px-6 md:px-16 lg:px-24 pt-32 md:pt-40 lg:pt-0 pb-16 lg:pb-0">
                    <div className="absolute inset-0 z-0 w-full h-full">
                        <img 
                            src="https://raw.githubusercontent.com/WaiHmueThit23/wallcraft_assets/main/craft_stone/Asset%20100@2x.webp" 
                            className="w-full h-full object-cover object-bottom lg:object-contain lg:object-right animate-fade-in-right" 
                            alt="Craft Stone Material" 
                        />
                        <div className="absolute inset-0 bg-gradient-to-b from-[#000000] via-black/35 to-transparent lg:hidden"></div>
                        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/40 to-transparent hidden lg:block"></div>
                    </div>

                    <div className="container mx-auto max-w-[1400px] z-30 relative pointer-events-none mt-4 lg:mt-0">
                        <div className="flex flex-col animate-fade-in-up text-left pointer-events-auto">
                            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight uppercase headline-gold mb-4 lg:mb-6 leading-[1.1] drop-shadow-md">
                                Craft Stone<br/>Series
                            </h1>
                            <p className="text-[12px] sm:text-sm md:text-base font-light leading-relaxed max-w-[280px] sm:max-w-md text-[#c2bfb6] drop-shadow-md">
                                วัสดุตกแต่งผนังนวัตกรรมใหม่ ผลิตจากแร่ธรรมชาติ (Eco Clay Composite) มอบคุณสมบัติเด่น น้ำหนักเบา ยืดหยุ่น แข็งแรง และเป็นมิตรต่อสิ่งแวดล้อม
                            </p>
                        </div>
                    </div>
                </header>

                {/* --- Technology Layer Section --- */}
                <section id="technology" className="relative z-10 py-24 flex flex-col items-center">
                    <div className="text-center mb-16 px-6">
                        <Separator />
                        <h2 className="text-4xl md:text-6xl font-bold tracking-tight mt-6 uppercase text-white">Structure Detail</h2>
                        <p className="text-[#c2bfb6] mt-4 max-w-xl mx-auto text-sm">เจาะลึกโครงสร้าง 4 ชั้นที่ทำให้ Craft Stone โดดเด่นกว่าวัสดุทั่วไป</p>
                    </div>

                    <div ref={stackContainerRef} className="relative w-full max-w-6xl h-[550px] md:h-[650px] flex justify-center items-center perspective-container">
                        {LAYERS_DATA.map((layer, index) => {
                            const style = getLayerStyle(index);
                            const isActive = activeLayerIndex === index;
                            
                            return (
                                <div 
                                    key={index}
                                    className={`layer-wrapper absolute w-full flex flex-col md:flex-row justify-center items-center ${style.className}`}
                                    style={{ 
                                        zIndex: style.zIndex, 
                                        transform: style.transform,
                                        opacity: style.opacity,
                                        pointerEvents: style.pointerEvents
                                    }}
                                >
                                    <div 
                                        className="relative w-[280px] h-[160px] md:w-[500px] md:h-[300px] cursor-pointer group"
                                        onClick={() => toggleLayer(index)}
                                    >
                                        <div className="layer-card w-full h-full">
                                            <img src={layer.image} className="w-full h-full object-contain" alt={layer.title} />
                                        </div>

                                        <div className="layer-label hidden md:flex items-center absolute left-[95%] top-1/2 -translate-y-1/2 z-50">
                                            <div className="pointer-line"></div>
                                            <div className="ml-8 text-left min-w-[300px]">
                                                <h3 className={`headline-gold font-bold text-xl uppercase transition-all ${isActive ? 'scale-110' : ''}`}>{layer.title}</h3>
                                                <div className={`mt-3 text-white text-sm leading-relaxed transition-all duration-500 overflow-hidden ${isActive ? 'max-h-[150px] opacity-100' : 'max-h-0 opacity-0'}`}>
                                                    <p className="p-4 bg-black/60 border-l-2 border-[#B08038] backdrop-blur-md">
                                                        {layer.description}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {isActive && (
                                        <div className="text-[#c2bfb6] md:hidden mt-10 px-8 w-full animate-fade-in-up">
                                            <div className="bg-zinc-900/90 p-6 border-t-2 border-[#B08038] rounded-b-xl">
                                                <h3 className="headline-gold font-bold text-lg uppercase mb-2">{layer.title}</h3>
                                                <p className="text-[#c2bfb6] text-sm leading-relaxed">{layer.description}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    <div className="text-[#c2bfb6] mt-12 flex flex-col items-center gap-6 relative z-40">
                        <button onClick={() => { setIsStacked(!isStacked); setActiveLayerIndex(null); }} className="btn-explore text-[#c2bfb6]">
                            {isStacked ? 'Explore Layers' : 'Stack Layers'}
                        </button>
                    </div>

                    <div className="w-full max-w-[1600px] mx-auto mt-20 md:mt-32 px-6 relative z-20">
                        <div className="grid grid-cols-4 md:grid-cols-7 gap-4 sm:gap-8 items-center justify-items-center">
                            {TECH_ICONS_DATA.map((src, i) => (
                                <div key={i} className="w-full max-w-[120px] md:max-w-[180px] aspect-square flex items-center justify-center p-2">
                                    <img 
                                        src={src} 
                                        className="w-full h-full object-contain opacity-80 hover:opacity-100 transition-all duration-300 hover:scale-110 drop-shadow-[0_0_15px_rgba(176,128,56,0.2)]" 
                                        alt="Tech Icon" 
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* --- Collections Section (Reverted to Original) --- */}
                <div className="space-y-0">
                    {COLLECTIONS_DATA.map((col, idx) => (
                        <section key={idx} className={`flex flex-col ${col.reverse ? 'lg:flex-row-reverse' : 'lg:flex-row'} min-h-[70vh] items-center border-t border-white/5 py-16`}>
                            <div className="w-full lg:w-1/2 px-8 md:px-16 lg:px-24 mb-10 lg:mb-0">
                                <Separator />
                                <h2 className="text-4xl md:text-6xl font-light leading-tight mt-6 mb-8 text-[#B08038]">
                                    {col.title} <span className="text-[#c2bfb6] block">Collection</span>
                                </h2>
                                <a href={col.link} className="inline-block border border-'rgba(194, 191, 182, 0.4)' px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-[#c2bfb6] hover:bg-white hover:text-black transition-all">
                                    View Collection
                                </a>
                            </div>
                            <div className="w-full lg:w-1/2 px-8">
                                <AnimatedSection animation={col.reverse ? "fade-in-left" : "fade-in-right"}>
                                    <img src={col.image} className="w-full max-h-[500px] object-contain" alt={col.title} />
                                </AnimatedSection>
                            </div>
                        </section>
                    ))}
                </div>

                {/* --- Installation Process (Reverted to Original) --- */}
                <section className="py-24 border-t border-white/5 bg-black/40">
                    <div className="container mx-auto px-6 max-w-[1400px]">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl md:text-4xl font-bold headline-gold uppercase mb-4">Installation Process</h2>
                            <Separator />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8">
                            {INSTALLATION_STEPS.map((step, i) => (
                                <AnimatedSection key={i} delay={i * 100} className="text-center group">
                                    <div className="aspect-[4/5] overflow-hidden mb-6 border border-zinc-800 rounded-sm">
                                        <img src={step.img} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt="Step" />
                                    </div>
                                    <p className="text-sm text-[#c2bfb6] leading-relaxed px-2">{step.text}</p>
                                </AnimatedSection>
                            ))}
                        </div>
                    </div>
                </section>

                {/* --- Performance Tests (Reverted to Original) --- */}
                <section className="py-24 border-t border-white/5">
                    <div className="container mx-auto px-6 max-w-[1200px]">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl font-bold text-white uppercase mb-4">Performance Test</h2>
                            <Separator />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                            {PERFORMANCE_TESTS.map((test, i) => (
                                <div key={i} className="flex flex-col items-center text-center p-6 bg-zinc-900/30 rounded-lg border border-zinc-800/50">
                                    <img src={test.img} className="w-16 h-16 mb-6 object-contain" alt="Icon" />
                                    <p className="text-[11px] leading-relaxed text-[#c2bfb6] uppercase tracking-wide">{test.text}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* --- Showcase (Reverted to Original) --- */}
                <section className="min-h-[60vh] flex flex-col lg:flex-row border-t border-white/5">
                    <div className="w-full lg:w-1/2">
                        <img src="https://raw.githubusercontent.com/WaiHmueThit23/wallcraft_assets/main/craft_stone/Asset%20120@2x.webp" className="w-full h-full object-cover min-h-[400px]" alt="Showcase" />
                    </div>
                    <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-12 lg:p-24 text-center">
                        <h2 className="text-4xl font-bold headline-gold uppercase mb-8">การใช้งาน</h2>
                        <Separator />
                        <div className="grid grid-cols-4 md:grid-cols-4 gap-4 sm:gap-8 mt-16 w-full max-w-2xl">
                            {APP_ICONS.map((icon, i) => (
                                <div key={i} className="flex justify-center aspect-square p-2">
                                    <img src={icon} className="w-full h-full object-contain hover:scale-110 transition-transform" alt="Icon" />
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

            </div>
        </div>
    );
}