import type { Platform, Tone, Client, Post } from './types';

export interface PlatformInfo {
  id: Platform;
  label: string;
  icon: string;
  color: string;
  bgColor: string;
  textColor: string;
  maxCaptionLength: number;
  maxHashtags: number;
  aspectRatio: string;
  tips: string[];
}

export const PLATFORMS: PlatformInfo[] = [
  {
    id: 'instagram_post',
    label: 'Instagram Post',
    icon: '📸',
    color: '#E1306C',
    bgColor: 'rgba(225,48,108,0.15)',
    textColor: '#F06292',
    maxCaptionLength: 2200,
    maxHashtags: 30,
    aspectRatio: '1:1',
    tips: ['Use até 30 hashtags', 'Primeira linha é o gancho principal', 'CTA no final'],
  },
  {
    id: 'instagram_reels',
    label: 'Instagram Reels',
    icon: '🎬',
    color: '#C13584',
    bgColor: 'rgba(193,53,132,0.15)',
    textColor: '#CE93D8',
    maxCaptionLength: 2200,
    maxHashtags: 30,
    aspectRatio: '9:16',
    tips: ['Primeiros 3 segundos são cruciais', 'Use tendências de áudio', 'Legenda curta e direta'],
  },
  {
    id: 'instagram_stories',
    label: 'Instagram Stories',
    icon: '⭕',
    color: '#FCAF45',
    bgColor: 'rgba(252,175,69,0.15)',
    textColor: '#FFD54F',
    maxCaptionLength: 500,
    maxHashtags: 10,
    aspectRatio: '9:16',
    tips: ['Conteúdo efêmero e autêntico', 'Use stickers e enquetes', 'Stories diários aumentam alcance'],
  },
  {
    id: 'tiktok',
    label: 'TikTok',
    icon: '🎵',
    color: '#69C9D0',
    bgColor: 'rgba(105,201,208,0.15)',
    textColor: '#80DEEA',
    maxCaptionLength: 2200,
    maxHashtags: 20,
    aspectRatio: '9:16',
    tips: ['Participe de trends e desafios', 'Dueto e costura aumentam alcance', 'Posting entre 18h-21h'],
  },
  {
    id: 'youtube_shorts',
    label: 'YouTube Shorts',
    icon: '⚡',
    color: '#FF0000',
    bgColor: 'rgba(255,0,0,0.15)',
    textColor: '#EF9A9A',
    maxCaptionLength: 1000,
    maxHashtags: 15,
    aspectRatio: '9:16',
    tips: ['Até 60 segundos', 'Loop automático favorece retentividade', 'Shorts têm canal separado'],
  },
  {
    id: 'youtube_video',
    label: 'YouTube Vídeo',
    icon: '▶️',
    color: '#FF0000',
    bgColor: 'rgba(255,0,0,0.12)',
    textColor: '#EF5350',
    maxCaptionLength: 5000,
    maxHashtags: 15,
    aspectRatio: '16:9',
    tips: ['Título com palavra-chave no início', 'Descrição detalhada com timestamps', 'Thumbnail customizada aumenta CTR'],
  },
];

export interface ToneInfo {
  id: Tone;
  label: string;
  description: string;
  emoji: string;
}

export const TONES: ToneInfo[] = [
  { id: 'profissional', label: 'Profissional', description: 'Tom formal, autoridade e expertise', emoji: '💼' },
  { id: 'casual', label: 'Casual', description: 'Descontraído, próximo e acessível', emoji: '😊' },
  { id: 'divertido', label: 'Divertido', description: 'Animado, bem-humorado e engajante', emoji: '🎉' },
  { id: 'inspiracional', label: 'Inspiracional', description: 'Motivador, emocionante e transformador', emoji: '✨' },
  { id: 'educativo', label: 'Educativo', description: 'Informativo, instrutivo e claro', emoji: '📚' },
  { id: 'provocativo', label: 'Provocativo', description: 'Polêmico, intrigante e que gera debate', emoji: '🔥' },
];

export const CLIENT_COLORS = [
  '#6366F1', '#8B5CF6', '#EC4899', '#EF4444',
  '#F59E0B', '#10B981', '#06B6D4', '#3B82F6',
];

export const SAMPLE_CLIENTS: Client[] = [
  {
    id: 'client-1',
    name: 'Studio Beleza & Co.',
    initials: 'SB',
    color: '#EC4899',
    niche: 'Beleza e Estética',
    segment: 'Salão de beleza premium',
    tone: 'inspiracional',
    targetAudience: 'Mulheres de 25-45 anos, classe B/A, interessadas em beleza e autocuidado',
    platforms: ['instagram_post', 'instagram_reels', 'instagram_stories'],
    keywords: ['beleza', 'transformação', 'autocuidado', 'cabelo', 'estética'],
    bio: 'Salão de beleza premium especializado em coloração e tratamentos capilares.',
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'client-2',
    name: 'FitLife Academia',
    initials: 'FL',
    color: '#10B981',
    niche: 'Fitness e Saúde',
    segment: 'Academia e personal trainer',
    tone: 'divertido',
    targetAudience: 'Jovens adultos de 20-40 anos que querem emagrecer e ganhar saúde',
    platforms: ['instagram_post', 'instagram_reels', 'tiktok', 'youtube_shorts'],
    keywords: ['fitness', 'treino', 'saúde', 'emagrecimento', 'musculação'],
    bio: 'Academia e personal trainer focados em resultados reais e sustentáveis.',
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'client-3',
    name: 'Tech Startup Zap',
    initials: 'TZ',
    color: '#6366F1',
    niche: 'Tecnologia',
    segment: 'Startup SaaS B2B',
    tone: 'educativo',
    targetAudience: 'Empreendedores e gestores de PMEs que querem digitalizar processos',
    platforms: ['instagram_post', 'youtube_video', 'tiktok'],
    keywords: ['tecnologia', 'automação', 'produtividade', 'digital', 'inovação'],
    bio: 'Startup de tecnologia que automatiza processos empresariais com IA.',
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

export const SAMPLE_POSTS: Post[] = [
  {
    id: 'post-1',
    clientId: 'client-1',
    clientName: 'Studio Beleza & Co.',
    clientColor: '#EC4899',
    platform: 'instagram_reels',
    topic: 'Antes e depois de coloração',
    caption: '✨ Transformação completa! Essa cliente chegou tímida com o cabelo opaco e saiu com um loiro luminoso que reflete toda a sua personalidade.\n\nNossa técnica exclusiva preserva 97% da estrutura do fio, entregando cor intensa e brilho sem igual.\n\nQuer viver essa transformação? Clique no link da bio! 🌟',
    hashtags: ['#coloracao', '#loiro', '#transformacao', '#cabelo', '#beleza', '#StudioBeleza', '#antesedepois', '#hair', '#haircolor', '#cabeleireiro'],
    cta: 'Agende sua avaliação gratuita no link da bio!',
    suggestedTime: 'Terça ou Quinta entre 18h-20h',
    contentIdeas: ['Processo da coloração em time-lapse', 'Depoimento da cliente', 'Comparativo de produtos usados'],
    engagementTips: ['Pergunte nos comentários qual transformação eles querem ver', 'Faça enquete no stories sobre o resultado'],
    status: 'publicado',
    scheduledDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'post-2',
    clientId: 'client-2',
    clientName: 'FitLife Academia',
    clientColor: '#10B981',
    platform: 'tiktok',
    topic: '5 erros no treino de perna',
    caption: 'Esses 5 erros estão SABOTANDO seu treino de perna 🦵❌\n\nA maioria das pessoas comete pelo menos 3 desses erros e ficam meses sem ver resultado!\n\nSalva esse vídeo antes de ir pra academia hoje 💪',
    hashtags: ['#fitness', '#treino', '#academia', '#errosnotreino', '#perna', '#musculacao', '#resultados'],
    cta: 'Salva esse vídeo e compartilha com um amigo que precisa ver isso!',
    suggestedTime: 'Segunda ou Quarta entre 6h-8h ou 19h-21h',
    contentIdeas: ['Demonstração dos erros e correções', 'Reação de pessoas fazendo o movimento errado', 'Tutorial passo a passo'],
    engagementTips: ['Provoque o debate com "Qual desses você comete??"', 'Use trending sounds do TikTok'],
    status: 'agendado',
    scheduledDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'post-3',
    clientId: 'client-3',
    clientName: 'Tech Startup Zap',
    clientColor: '#6366F1',
    platform: 'youtube_video',
    topic: 'Como IA economiza 10h/semana na empresa',
    caption: 'Descubra como PMEs estão economizando 10 horas por semana com automação de IA — sem precisar contratar um time de TI.\n\n✅ Os 3 processos que mais consomem tempo\n✅ Como automatizá-los em menos de 1 hora\n✅ Caso real com redução de custos em 40%\n\n🔔 Inscreva-se para mais conteúdo!',
    hashtags: ['#IA', '#automacao', '#tecnologia', '#produtividade', '#startup', '#PME', '#inteligenciaartificial'],
    cta: 'Inscreva-se no canal e ative as notificações!',
    suggestedTime: 'Quarta ou Quinta entre 12h-14h',
    contentIdeas: ['Demonstração ao vivo da ferramenta', 'Entrevista com cliente', 'Comparativo antes/depois'],
    engagementTips: ['Peça comentários sobre qual processo automatizar primeiro', 'Crie uma playlist de automação'],
    status: 'rascunho',
    createdAt: new Date().toISOString(),
  },
];
