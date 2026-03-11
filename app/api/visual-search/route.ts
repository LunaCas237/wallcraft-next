import { NextResponse } from 'next/server';
import { supabase } from '../../lib/supabase';

// The mathematical formula to compare two AI vectors and return a percentage match
function cosineSimilarity(vecA: number[], vecB: number[]) {
  let dotProduct = 0; let normA = 0; let normB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const imageFile = formData.get('image') as File;

    if (!imageFile) return NextResponse.json({ error: 'No image' }, { status: 400 });

    const arrayBuffer = await imageFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // 1. SAVE THE UPLOADED IMAGE TO SUPABASE
    const fullBase64Image = `data:${imageFile.type};base64,${buffer.toString('base64')}`;
    const newId = crypto.randomUUID();
    await supabase.from('search_image').insert([{ id: newId, image_url: fullBase64Image, style: 'User Upload' }]);

    // 2. THE AI MAGIC (Turn the uploaded image into 512 numbers)
    const hfToken = process.env.HUGGINGFACE_API_KEY; 
    if (!hfToken) throw new Error("Missing HUGGINGFACE_API_KEY. We need AI to compare the images!");

    const aiResponse = await fetch(
      "https://api-inference.huggingface.co/pipeline/feature-extraction/openai/clip-vit-base-patch32",
      {
        headers: { Authorization: `Bearer ${hfToken}` },
        method: "POST",
        body: buffer,
      }
    );
    
    // This is the array of numbers representing your uploaded image
    const uploadedImageVector = await aiResponse.json(); 

    // 3. FETCH THE EXISTING DATABASE NUMBERS
    const { data: dbImages, error } = await supabase
      .from('search_image')
      .select('id, feat_local_b64')
      .not('feat_local_b64', 'is', null);

    if (error) throw error;

    // 4. FIND THE 90% MATCHES
    const matchedIds: { id: string }[] = [];

    dbImages.forEach((row) => {
      try {
        // Decode the Base64 text back into numbers
        const decodedText = Buffer.from(row.feat_local_b64, 'base64').toString('utf-8');
        const dbVector = JSON.parse(decodedText);

        // Calculate if it is a 90% match
        const similarityPercentage = cosineSimilarity(uploadedImageVector, dbVector);

        // ONLY keep it if it is over 90%
        if (similarityPercentage >= 0.90) {
          matchedIds.push({ id: row.id });
        }
      } catch (e) {
        // Skip any rows with corrupted data
      }
    });

    return NextResponse.json({ 
      success: true, 
      results: matchedIds // Only returns the real 90%+ matches!
    });

  } catch (error: any) {
    console.error("API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}