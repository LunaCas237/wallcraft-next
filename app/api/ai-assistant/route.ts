import { NextRequest, NextResponse } from 'next/server';
import { pipeline, env } from '@xenova/transformers';
import { createClient } from '@supabase/supabase-js';

// Prevent transformers from trying to use local files in a serverless env
env.allowLocalModels = false;

let extractor: any = null;

function normalize(vector: number[]) {
    const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
    return vector.map(val => val / magnitude);
}

// ... (keep your imports and normalize function)

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const imageFile = formData.get('image') as File | null;
        const textQuery = formData.get('message') as string | null;

        let products: any[] = [];
        let aiMessage = "";

        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        // CASE 1: USER UPLOADED AN IMAGE
        if (imageFile) {
            if (!extractor) {
                extractor = await pipeline('image-feature-extraction', 'Xenova/clip-vit-base-patch32');
            }
            const buffer = Buffer.from(await imageFile.arrayBuffer());
            const blob = new Blob([buffer]);
            const imageUrl = URL.createObjectURL(blob);
            const output = await extractor(imageUrl);
            const normalizedEmbedding = normalize(Array.from(output.data) as number[]);
            URL.revokeObjectURL(imageUrl);

            const { data: matchedProducts } = await supabase.rpc('match_product_variants', {
                query_embedding: normalizedEmbedding,
                match_threshold: 0.4,
                match_count: 6
            });
            products = matchedProducts || [];

            // AI Image Analysis
            const apiKey = process.env.GEMINI_API_KEY;
            const aiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contents: [{ parts: [
                        { text: "วิเคราะห์รูปนี้ว่าเป็นสไตล์ไหน และแนะนำสั้นๆ ว่าควรใช้ลายไม้แบบไหนถึงจะเหมาะ ตอบสุภาพ 2 ประโยค" },
                        { inline_data: { mime_type: imageFile.type, data: buffer.toString("base64") } }
                    ]}]
                })
            });
            const aiData = await aiResponse.json();
            aiMessage = aiData.candidates?.[0]?.content?.parts?.[0]?.text || "";
        } 
        
        // CASE 2: TEXT SEARCH (Fallback or Primary)
        else if (textQuery) {
            const { data: matchedProducts } = await supabase
                .from('product_variants')
                .select('*')
                .or(`name.ilike.%${textQuery}%,color.ilike.%${textQuery}%`)
                .limit(6);
            
            products = matchedProducts || [];
            aiMessage = `นี่คือผลการค้นหาสำหรับ "${textQuery}" ครับ`;
        }

        return NextResponse.json({
            message: products.length > 0 ? "ค้นหาสำเร็จ" : "ไม่พบสินค้า",
            ai_analysis: aiMessage,
            products: products
        });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}