import { GoogleGenAI } from "@google/genai";
import type { Client, Platform, GeneratedContent } from '../types';
import { PLATFORMS } from '../constants';

const API_KEY = process.env.API_KEY;
if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

function getPlatformLabel(platform: Platform): string {
  return PLATFORMS.find(p => p.id === platform)?.label ?? platform;
}

export async function generateSocialMediaContent(
  client: Client,
  platform: Platform,
  topic: string,
  extraContext?: string
): Promise<GeneratedContent> {
  const platformInfo = PLATFORMS.find(p => p.id === platform);
  const platformLabel = getPlatformLabel(platform);

  const prompt = `Você é um especialista em marketing de redes sociais para agências digitais brasileiras.

Crie um conteúdo completo para a seguinte situação:

**CLIENTE:**
- Nome: ${client.name}
- Nicho: ${client.niche}
- Segmento: ${client.segment}
- Tom de voz: ${client.tone}
- Público-alvo: ${client.targetAudience}
- Palavras-chave da marca: ${client.keywords.join(', ')}
- Bio/descrição: ${client.bio}

**PLATAFORMA:** ${platformLabel}
- Comprimento máximo da legenda: ${platformInfo?.maxCaptionLength ?? 2200} caracteres
- Máximo de hashtags recomendado: ${platformInfo?.maxHashtags ?? 30}
- Proporção: ${platformInfo?.aspectRatio ?? '1:1'}

**TEMA/ASSUNTO DO POST:** ${topic}
${extraContext ? `**CONTEXTO ADICIONAL:** ${extraContext}` : ''}

**INSTRUÇÕES:**
1. Escreva TOTALMENTE em português brasileiro
2. Use o tom de voz especificado (${client.tone})
3. Adapte para as características específicas da plataforma ${platformLabel}
4. A legenda deve ser envolvente, autêntica e no estilo da marca
5. Hashtags devem ser relevantes e uma mistura de populares + nicho
6. O CTA deve ser claro e direto
7. Sugestões de conteúdo visual devem ser práticas e realizáveis

Responda APENAS com um JSON válido no seguinte formato (sem markdown, sem explicações, apenas JSON puro):
{
  "caption": "legenda completa do post com emojis e quebras de linha",
  "hashtags": ["hashtag1", "hashtag2", "..."],
  "cta": "chamada para ação clara e direta",
  "suggestedTime": "melhor horário/dia para postar",
  "contentIdeas": ["ideia de conteúdo visual 1", "ideia 2", "ideia 3"],
  "engagementTips": ["dica de engajamento 1", "dica 2"]
}`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
  });

  const text = response.candidates?.[0]?.content?.parts?.[0]?.text ?? '';

  // Tentar extrair JSON limpo da resposta
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('Resposta da IA não contém JSON válido. Tente novamente.');
  }

  const parsed = JSON.parse(jsonMatch[0]) as GeneratedContent;
  return parsed;
}
