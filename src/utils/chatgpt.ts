export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export async function getChatGPTReply(
  userText: string,
  siteData: any,
  history: ChatMessage[] = [],
  conversationContext?: Record<string, string>
) {
  const key = import.meta.env.VITE_OPENAI_KEY;
  if (!key) {
    throw new Error('MISSING_OPENAI_KEY');
  }

  // Build context string from anything we know about the visitor
  const ctxLines = conversationContext
    ? Object.entries(conversationContext)
        .filter(([, v]) => v)
        .map(([k, v]) => `- ${k}: ${v}`)
        .join('\n')
    : '';

  const contextBlock = ctxLines
    ? `\n\nKnown details about this visitor so far:\n${ctxLines}`
    : '';

  const system = `You are Aurora, the friendly and knowledgeable AI assistant for Optimum Prime Solutions — Kenya's certified TallyPrime partner, cloud hosting provider, and EOS® consulting firm.

Your job is to help visitors understand how TallyPrime, cloud hosting, HubSpot CRM integration, and EOS® can benefit their business. You qualify leads by asking about their business type, challenges, team size, and current software.

Key facts:
- TallyPrime Silver: KES 57,600 +VAT (single user)
- TallyPrime Gold: KES 172,800 +VAT (multi-user)
- Cloud Hosting: from KES 8,000/month
- EOS® Implementation: custom quote
- Phone: +254 116 246 074 | +254 727 209 720
- Email: optimumprimesolutionsltd@gmail.com
- Location: Ruiru, Kenya

Rules:
1. ALWAYS remember what the user has told you earlier in the conversation.
2. NEVER ask for information the user has already provided.
3. Address the user by name if they have given it.
4. Keep replies concise (under 150 words unless detail is needed).
5. Always end with a relevant follow-up question or a clear call to action.
6. Be warm, professional, and conversational.${contextBlock}

Site data reference: ${JSON.stringify(siteData).slice(0, 2500)}`;

  // Full message chain: system + entire conversation history + current user message
  const messages: ChatMessage[] = [
    { role: 'system', content: system },
    ...history,
    { role: 'user', content: userText },
  ];

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      model: 'gpt-3.5-turbo',
      messages,
      temperature: 0.5,
      max_tokens: 500,
    }),
    signal: controller.signal,
  }).finally(() => clearTimeout(timeout));

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`OpenAI error: ${res.status} ${text}`);
  }

  const json = await res.json();
  const msg = json?.choices?.[0]?.message?.content;
  if (!msg) throw new Error('No response from OpenAI');
  return msg as string;
}
