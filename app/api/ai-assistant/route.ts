import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

export async function POST(req: NextRequest) {
  try {
    const { messages, systemInstruction, customApiKey } = await req.json();

    // UI key takes priority → then env var
    const apiKey = customApiKey || process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
    }

    const aiClient = new GoogleGenAI({ apiKey });

    const response = await aiClient.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: messages,
      config: {
        systemInstruction: systemInstruction || 'You are the official AI assistant for Wallcraft Thailand.',
        temperature: 0.7,
      },
    });

    return NextResponse.json({ reply: response.text });
  } catch (error: any) {
    console.error('Gemini API error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}