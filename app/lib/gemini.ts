export interface MessagePart {
  text?: string;
  inlineData?: { mimeType: string; data: string };
}

export interface Message {
  role: "user" | "model";
  parts: MessagePart[];
  timestamp?: string;
}

export async function* sendMessageStream(
  history: Message[],
  message: string,
  image?: { mimeType: string; data: string },
  systemInstruction?: string,
  customApiKey?: string
) {
  const userParts: any[] = [];
  if (message.trim()) userParts.push({ text: message });
  if (image) userParts.push({ inlineData: image });

  const messages = [
    ...history.map(({ role, parts }) => ({ role, parts })),
    { role: 'user', parts: userParts }
  ];

  try {
    const res = await fetch('/api/ai-assistant', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages, systemInstruction, customApiKey }),
    });
    
    const data = await res.json();

    if (!res.ok || data.error) {
      throw new Error(data.error || 'Failed to get response');
    }

    // Yield the full reply as one chunk
    yield data.reply;

  } catch (error: any) {
    throw new Error(error.message || 'Unknown error');
  }
}