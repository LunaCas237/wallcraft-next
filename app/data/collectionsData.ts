// src/data/collectionsData.ts

// 1. กำหนดโครงสร้างข้อมูล (Type)
export type ProductVariant = {
  name: string; // ชื่อลาย (เช่น Sienna Wood)
  size: string; // ขนาด
  image: string; // รูป Texture
};

export type ProductGroup = {
  title: string; // ชื่อกลุ่มย่อย (เช่น Aggregate Wood)
  subtitle?: string; // คำโปรยย่อย
  code: string; // รหัสสินค้า
  variants: ProductVariant[]; // รายการลายในกลุ่มนี้
};

export type CollectionItem = {
  title: string; // ชื่อหน้า (เช่น Terra Stone)
  subtitle: string; // คำโปรยหลัก
  description: string; // เนื้อหาบรรยาย
  heroImage: string; // รูป Banner ด้านบน
  themeColor: string; // สีธีมของหน้านั้น (เช่น #B08038)
  productGroups: ProductGroup[]; // ข้อมูลสินค้าสำหรับ Slider
};

// 2. ข้อมูลทั้งหมด 20 คอลเลกชัน
export const COLLECTIONS: Record<string, CollectionItem> = {
  
  // ==========================================
  // CRAFT STONE SERIES
  // ==========================================
  "tarra-stone": {
    title: "Terra Stone",
    subtitle: "Signature Texture",
    description: "สัมผัสความเป็นธรรมชาติที่แท้จริง...",
    heroImage: "https://mpsnwijabfingujzirri.supabase.co/storage/v1/object/public/wallcraft_web/Craft%20Stone%20Series/Asset%2092@2x.webp",
    themeColor: "#B08038",
    productGroups: [
      {
        title: "Terra Base",
        code: "TR-001",
        variants: [
           { name: "Sand", size: "600x1200mm", image: "https://mpsnwijabfingujzirri.supabase.co/storage/v1/object/public/wallcraft_web/Craft%20Stone%20Series/Asset%2063@3x.webp" },
           { name: "Clay", size: "600x1200mm", image: "https://mpsnwijabfingujzirri.supabase.co/storage/v1/object/public/wallcraft_web/Essential%20Series/Asset%20158@2x.webp" }
        ]
      }
    ]
  },
  "panorama": {
    title: "Panorama",
    subtitle: "Wide & Deep",
    description: "เปิดมุมมองใหม่ด้วยแผ่นหินขนาดใหญ่...",
    heroImage: "/images/panorama-hero.jpg", // ใส่รูปจริง
    themeColor: "#B08038",
    productGroups: []
  },
  "strength-rock": {
    title: "Strength Rock",
    subtitle: "Solid Performance",
    description: "ความแข็งแกร่งที่มาพร้อมความงาม...",
    heroImage: "/images/strength-hero.jpg",
    themeColor: "#B08038",
    productGroups: []
  },
  "geoform": {
    title: "Geoform",
    subtitle: "Geometric Nature",
    description: "รูปทรงเรขาคณิตผสานธรรมชาติ...",
    heroImage: "/images/geoform-hero.jpg",
    themeColor: "#B08038",
    productGroups: []
  },
  "urban-form": {
    title: "Urban Form",
    subtitle: "City Living",
    description: "สไตล์คนเมืองที่เรียบง่าย...",
    heroImage: "/images/urban-hero.jpg",
    themeColor: "#B08038",
    productGroups: []
  },
  "nature-grain": {
    title: "Nature Grain",
    subtitle: "Wood Touch",
    description: "ลายไม้เสมือนจริง...",
    heroImage: "/images/nature-hero.jpg",
    themeColor: "#B08038",
    productGroups: []
  },
  "rust": {
    title: "Rust",
    subtitle: "Industrial Loft",
    description: "เสน่ห์แห่งสนิมและกาลเวลา...",
    heroImage: "/images/rust-hero.jpg",
    themeColor: "#B08038",
    productGroups: []
  },
  "finesse": {
    title: "Finesse",
    subtitle: "Fine Detail",
    description: "ความละเอียดอ่อนในทุกสัมผัส...",
    heroImage: "/images/finesse-hero.jpg",
    themeColor: "#B08038",
    productGroups: []
  },

  // ==========================================
  // LUXE SERIES
  // ==========================================
  "fabric": {
    title: "Fabric Collection",
    subtitle: "Soft but Sharp",
    description: "ผนังลายผ้าที่สร้างบรรยากาศสบายตา...",
    heroImage: "https://mpsnwijabfingujzirri.supabase.co/storage/v1/object/public/wallcraft_web/Luxe%20Series/Asset%20135@2x.webp",
    themeColor: "#6A6C5F",
    productGroups: []
  },
  "leather": {
    title: "Leather Collection",
    subtitle: "Luxury with Edge",
    description: "ผนังลายหนังที่สะท้อนความหรูหรา...",
    heroImage: "https://mpsnwijabfingujzirri.supabase.co/storage/v1/object/public/wallcraft_web/Luxe%20Series/Asset%20139@2x.webp",
    themeColor: "#7B2715",
    productGroups: []
  },
  "outdoor": {
    title: "Outdoor Collection",
    subtitle: "Strong & Stylish",
    description: "ทนทานต่อทุกสภาพอากาศ...",
    heroImage: "https://mpsnwijabfingujzirri.supabase.co/storage/v1/object/public/wallcraft_web/Luxe%20Series/Asset%20136@2x.webp",
    themeColor: "#7C7D75",
    productGroups: []
  },
  "signature": {
    title: "Signature Collection",
    subtitle: "Your Statement",
    description: "เอกลักษณ์เฉพาะตัว...",
    heroImage: "https://mpsnwijabfingujzirri.supabase.co/storage/v1/object/public/wallcraft_web/Luxe%20Series/Asset%20134@2x.webp",
    themeColor: "#B08038",
    productGroups: []
  },
  "stone": {
    title: "Stone Collection",
    subtitle: "Bold & Distinct",
    description: "ลายหินธรรมชาติที่ทรงพลัง...",
    heroImage: "https://mpsnwijabfingujzirri.supabase.co/storage/v1/object/public/wallcraft_web/Luxe%20Series/Asset%20140@2x.webp",
    themeColor: "#B08038",
    productGroups: []
  },
  "velvet": {
    title: "Velvet Collection",
    subtitle: "Touch of Night",
    description: "สัมผัสกำมะหยี่หรูหรา...",
    heroImage: "https://mpsnwijabfingujzirri.supabase.co/storage/v1/object/public/wallcraft_web/Luxe%20Series/Asset%20138@2x.webp",
    themeColor: "#7B2715",
    productGroups: []
  },
  "wood": {
    title: "Wood Collection",
    subtitle: "Nature Reinvented",
    description: "ไม้แปรรูปดีไซน์ใหม่...",
    heroImage: "https://mpsnwijabfingujzirri.supabase.co/storage/v1/object/public/wallcraft_web/Luxe%20Series/Asset%20133@2x.webp",
    themeColor: "#c2bfb6",
    productGroups: []
  },
  "metallic": {
    title: "Metallic Collection",
    subtitle: "Shine Your Edge",
    description: "ความแวววาวที่ทันสมัย...",
    heroImage: "https://mpsnwijabfingujzirri.supabase.co/storage/v1/object/public/wallcraft_web/Luxe%20Series/Asset%20137@2x.webp",
    themeColor: "#CBBDAD",
    productGroups: []
  },

  // ==========================================
  // ESSENTIAL SERIES
  // ==========================================
  "solid-panel": {
    title: "Solid Panel",
    subtitle: "Standard & Strong",
    description: "ผนัง Solid มาตรฐาน...",
    heroImage: "https://mpsnwijabfingujzirri.supabase.co/storage/v1/object/public/wallcraft_web/Essential%20Series/Asset%20169@2x.webp",
    themeColor: "#c2bfb6",
    productGroups: [
        {
          title: "Aggregate Wood",
          code: "MBQSW",
          variants: [
            { name: "Sienna Wood", size: "600x2400x3.5mm", image: "https://mpsnwijabfingujzirri.supabase.co/storage/v1/object/public/wallcraft_web/Craft%20Stone%20Series/Asset%2063@3x.webp" },
            { name: "Ash Grey", size: "600x2400x3.5mm", image: "https://mpsnwijabfingujzirri.supabase.co/storage/v1/object/public/wallcraft_web/Essential%20Series/Asset%20158@2x.webp" }
          ]
        }
    ]
  },
  "hollow-core": {
    title: "Hollow Core",
    subtitle: "Lightweight System",
    description: "ผนังกลวงน้ำหนักเบา...",
    heroImage: "https://mpsnwijabfingujzirri.supabase.co/storage/v1/object/public/wallcraft_web/Essential%20Series/Asset%20165@2x.webp",
    themeColor: "#c2bfb6",
    productGroups: []
  },
  "decor-panel": {
    title: "Decor Panel",
    subtitle: "Detail Oriented",
    description: "ผนังตกแต่งเฉพาะจุด...",
    heroImage: "https://mpsnwijabfingujzirri.supabase.co/storage/v1/object/public/wallcraft_web/Essential%20Series/Asset%20168@2x.webp",
    themeColor: "#CBBDAD",
    productGroups: []
  },
  "accessories": {
    title: "Accessories",
    subtitle: "Finishing Touch",
    description: "อุปกรณ์จบงาน...",
    heroImage: "https://mpsnwijabfingujzirri.supabase.co/storage/v1/object/public/wallcraft_web/Essential%20Series/Asset%20167@2x.webp",
    themeColor: "#7B2715",
    productGroups: []
  }
};