import { NextResponse } from 'next/server';
import { supabase } from '../../lib/supabase';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const imageFile = formData.get('image') as File;

    if (!imageFile) {
      return NextResponse.json({ error: 'No image uploaded' }, { status: 400 });
    }

    console.log(`Processing real upload: ${imageFile.name}...`);

    const arrayBuffer = await imageFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64String = buffer.toString('base64');
    const fullBase64Image = `data:${imageFile.type};base64,${base64String}`;

    // 1. Save the uploaded image to 'search_image'
    const newId = crypto.randomUUID();
    const { data: insertedRecord, error: insertError } = await supabase
      .from('search_image')
      .insert([{ id: newId, image_url: fullBase64Image, style: 'User Upload' }])
      .select()
      .single();

    if (insertError) {
      console.error("Supabase Error Details:", insertError);
      return NextResponse.json({ error: `Supabase rejected it: ${insertError.message}` }, { status: 500 });
    }

    // 2. FETCH THE MATCHES (using mock data until the AI is connected)
    const { data: mockMatches, error: fetchError } = await supabase
      .from('products')
      .select('id') // Grab IDs to send to the URL
      .limit(4);

    if (fetchError) throw fetchError;

    // 3. Return BOTH the saved image confirmation AND the search results
    return NextResponse.json({ 
      success: true, 
      uploadedImage: insertedRecord,
      results: mockMatches 
    });

  } catch (error: any) {
    console.error("API Catch Error:", error);
    return NextResponse.json({ error: `Code crashed: ${error.message}` }, { status: 500 });
  }
}