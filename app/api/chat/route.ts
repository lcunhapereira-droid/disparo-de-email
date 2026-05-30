import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

const SYSTEM_PROMPT = `Voce e um assistente especializado em configurar agentes de curadoria de conteudo automatica.

Voce ajuda o usuario a criar e configurar agentes que:
- Coletam noticias/artigos de sites via RSS
- Filtram o conteudo com IA (Gemini)
- Enviam resumos por e-mail automaticamente em horario programado

Quando o usuario pedir para criar um agente, colete as seguintes informacoes fazendo perguntas uma de cada vez de forma conversacional:
1. Nome e profissao de quem vai receber
2. Area de interesse (medicina, tecnologia, direito, financas, etc)
3. E-mail de destino
4. Horario preferido de envio (horario de Brasilia)

Quando tiver todas as informacoes, gere o CONFIG completo no seguinte formato JSON dentro de um bloco de codigo:

\`\`\`config
{CONFIG JSON AQUI}
\`\`\`

O JSON deve ter exatamente esta estrutura:
{
  "identidade": {
    "nomeDestinatario": "...",
    "descricaoProfissional": "...",
    "identificacao": "",
    "localidade": "...",
    "tituloEmail": "..."
  },
  "email": {
    "destinatario": "...",
    "assunto": "Curadoria Diaria",
    "remetente": "Curadoria IA <onboarding@resend.dev>"
  },
  "cronSchedule": "0 XX * * *",
  "visual": {
    "corPrimaria": "#9B8559",
    "corSecundaria": "#b8a07a",
    "corFundo": "#F9F8F7",
    "corBannerTexto": "#F0F0F0",
    "corDataFundo": "#E8EEF0",
    "corDataTexto": "#336655",
    "corRodape": "#1a1a1a"
  },
  "feeds": [...],
  "secoes": [...],
  "filtro": {
    "incluir": [...],
    "excluir": [...]
  },
  "idiomaSaida": "portugues brasileiro"
}

Escolha feeds RSS reais e relevantes para a area informada.
Para cronSchedule: some 3 ao horario de Brasilia para obter UTC. Ex: 20h Brasilia = "0 23 * * *"

Comandos que o usuario pode usar:
- "criar agente" ou "novo agente" -> inicie o processo de coleta de informacoes
- "testar" ou "disparar email" -> instrua a acessar /api/cron/resumo?secret=CRON_SECRET
- "ver config atual" -> explique como ver o config.ts no GitHub
- "ajuda" -> liste os comandos disponiveis

Seja conciso, amigavel e em portugues brasileiro. Nao use markdown excessivo.`;

export async function POST(request: NextRequest) {
  const geminiKey = process.env.GEMINI_API_KEY;
  if (!geminiKey) {
    return NextResponse.json({ error: "GEMINI_API_KEY nao configurada" }, { status: 500 });
  }

  const { messages } = await request.json();
  const ai = new GoogleGenAI({ apiKey: geminiKey });

  const contents = [
    { role: "user", parts: [{ text: SYSTEM_PROMPT + "\n\nInicie a conversa cumprimentando o usuario e listando o que voce pode fazer." }] },
    { role: "model", parts: [{ text: "Olá! Sou o assistente de curadoria automática. Posso te ajudar com:\n\n• **Criar um novo agente** — configuro tudo para qualquer área (medicina, tecnologia, direito, etc.)\n• **Disparar um e-mail de teste** — para verificar se está funcionando\n• **Explicar como alterar** o agente existente\n\nO que deseja fazer?" }] },
    ...messages.map((m: { role: string; content: string }) => ({
      role: m.role === "user" ? "user" : "model",
      parts: [{ text: m.content }],
    })),
  ];

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents,
  });

  return NextResponse.json({ reply: response.text });
}
