import React, { useState, useCallback } from 'react';
import type { Client, Post, Platform, GeneratedContent } from '../types';
import { PLATFORMS } from '../constants';
import { generateSocialMediaContent } from '../services/socialMediaService';
import { generateId } from '../utils/storage';

interface ContentCreatorViewProps {
  clients: Client[];
  onPostSaved: (post: Post) => void;
  preselectedClientId?: string;
}

type Step = 'form' | 'result';

export const ContentCreatorView: React.FC<ContentCreatorViewProps> = ({
  clients,
  onPostSaved,
  preselectedClientId,
}) => {
  const [selectedClientId, setSelectedClientId] = useState(preselectedClientId ?? (clients[0]?.id ?? ''));
  const [selectedPlatform, setSelectedPlatform] = useState<Platform>('instagram_post');
  const [topic, setTopic] = useState('');
  const [extraContext, setExtraContext] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generated, setGenerated] = useState<GeneratedContent | null>(null);
  const [step, setStep] = useState<Step>('form');
  const [scheduledDate, setScheduledDate] = useState('');
  const [savedFeedback, setSavedFeedback] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const selectedClient = clients.find(c => c.id === selectedClientId);
  const platformInfo = PLATFORMS.find(p => p.id === selectedPlatform);

  // Filter platforms to those the client uses (or all if no client)
  const availablePlatforms = selectedClient
    ? PLATFORMS.filter(p => selectedClient.platforms.includes(p.id))
    : PLATFORMS;

  const handleGenerate = useCallback(async () => {
    if (!selectedClient || !topic.trim()) return;
    setIsGenerating(true);
    setError(null);

    try {
      const content = await generateSocialMediaContent(selectedClient, selectedPlatform, topic, extraContext);
      setGenerated(content);
      setStep('result');
    } catch (err: any) {
      setError(`Erro ao gerar conteúdo: ${err.message ?? 'Tente novamente'}`);
    } finally {
      setIsGenerating(false);
    }
  }, [selectedClient, selectedPlatform, topic, extraContext]);

  const handleSave = (status: 'rascunho' | 'agendado' | 'publicado') => {
    if (!generated || !selectedClient) return;
    const post: Post = {
      id: generateId(),
      clientId: selectedClient.id,
      clientName: selectedClient.name,
      clientColor: selectedClient.color,
      platform: selectedPlatform,
      topic: topic.trim(),
      caption: generated.caption,
      hashtags: generated.hashtags,
      cta: generated.cta,
      suggestedTime: generated.suggestedTime,
      contentIdeas: generated.contentIdeas,
      engagementTips: generated.engagementTips,
      status,
      scheduledDate: status === 'agendado' && scheduledDate ? new Date(scheduledDate).toISOString() : undefined,
      createdAt: new Date().toISOString(),
    };
    onPostSaved(post);
    setSavedFeedback(`Post salvo como "${status}"!`);
    setTimeout(() => setSavedFeedback(null), 3000);
  };

  const copyToClipboard = async (text: string, field: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const inputClass = "w-full bg-app-card2 border border-app-border rounded-lg px-3 py-2.5 text-app-text text-sm placeholder:text-app-text2/50 focus:outline-none focus:border-accent transition-colors";

  if (clients.length === 0) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-[400px] animate-fade-in">
        <p className="text-4xl mb-3">👥</p>
        <p className="text-app-text font-heading font-semibold text-lg mb-1">Nenhum cliente cadastrado</p>
        <p className="text-app-text2 text-sm">Adicione um cliente antes de criar posts.</p>
      </div>
    );
  }

  return (
    <div className="p-6 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-heading font-bold text-app-text">Criar Post com IA</h2>
          <p className="text-app-text2 text-sm mt-0.5">Gere conteúdo personalizado para cada plataforma</p>
        </div>
        {step === 'result' && (
          <button onClick={() => { setStep('form'); setGenerated(null); setError(null); }} className="text-sm text-app-text2 hover:text-app-text flex items-center gap-1 transition-colors">
            ← Novo post
          </button>
        )}
      </div>

      {step === 'form' && (
        <div className="max-w-2xl mx-auto space-y-6 animate-slide-up">
          {/* Client Selection */}
          <div className="bg-app-card border border-app-border rounded-xl p-5">
            <h3 className="font-heading font-semibold text-app-text mb-4 text-sm uppercase tracking-wide text-app-text2">1. Selecione o cliente</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {clients.map(client => (
                <button
                  key={client.id}
                  onClick={() => { setSelectedClientId(client.id); setSelectedPlatform(client.platforms[0] ?? 'instagram_post'); }}
                  className={`flex items-center gap-3 p-3 rounded-lg border transition-all text-left ${
                    selectedClientId === client.id
                      ? 'border-accent bg-accent/10'
                      : 'border-app-border hover:border-app-border2 hover:bg-app-card2'
                  }`}
                >
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center text-white font-bold text-sm shrink-0" style={{ backgroundColor: client.color }}>
                    {client.initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-app-text text-sm font-medium truncate">{client.name}</p>
                    <p className="text-app-text2 text-xs truncate">{client.niche}</p>
                  </div>
                  {selectedClientId === client.id && <span className="text-accent text-sm">✓</span>}
                </button>
              ))}
            </div>
          </div>

          {/* Platform Selection */}
          <div className="bg-app-card border border-app-border rounded-xl p-5">
            <h3 className="font-heading font-semibold text-sm uppercase tracking-wide text-app-text2 mb-4">2. Plataforma</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {(availablePlatforms.length > 0 ? availablePlatforms : PLATFORMS).map(p => (
                <button
                  key={p.id}
                  onClick={() => setSelectedPlatform(p.id)}
                  className={`flex items-center gap-2 p-3 rounded-lg border text-sm font-medium transition-all ${
                    selectedPlatform === p.id ? 'border-transparent' : 'border-app-border hover:border-app-border2'
                  }`}
                  style={selectedPlatform === p.id ? { backgroundColor: p.bgColor, color: p.textColor, borderColor: p.color + '60' } : {}}
                >
                  <span className="text-base">{p.icon}</span>
                  <span className="text-xs">{p.label}</span>
                </button>
              ))}
            </div>
            {platformInfo && (
              <div className="mt-3 flex flex-wrap gap-2">
                {platformInfo.tips.map((tip, i) => (
                  <span key={i} className="text-xs text-app-text2 bg-app-card2 px-2 py-1 rounded-full">💡 {tip}</span>
                ))}
              </div>
            )}
          </div>

          {/* Topic */}
          <div className="bg-app-card border border-app-border rounded-xl p-5 space-y-4">
            <h3 className="font-heading font-semibold text-sm uppercase tracking-wide text-app-text2">3. Tema do post</h3>
            <div>
              <label className="block text-app-text2 text-xs mb-1.5">Sobre o que é esse post? *</label>
              <textarea
                className={`${inputClass} resize-none`}
                rows={3}
                value={topic}
                onChange={e => setTopic(e.target.value)}
                placeholder="Ex: Antes e depois de coloração loira com técnica balayage..."
              />
            </div>
            <div>
              <label className="block text-app-text2 text-xs mb-1.5">Contexto adicional (opcional)</label>
              <input
                className={inputClass}
                value={extraContext}
                onChange={e => setExtraContext(e.target.value)}
                placeholder="Ex: Promoção de aniversário 30% off, produto específico, data comemorativa..."
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg p-3 text-sm">
              {error}
            </div>
          )}

          <button
            onClick={handleGenerate}
            disabled={isGenerating || !selectedClientId || !topic.trim()}
            className="w-full bg-accent hover:bg-accent-hover disabled:bg-app-border disabled:text-app-text2 text-white font-semibold py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            {isGenerating ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                Gerando com IA...
              </>
            ) : (
              <>✨ Gerar Conteúdo com IA</>
            )}
          </button>
        </div>
      )}

      {step === 'result' && generated && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-slide-up">
          {/* Generated Content */}
          <div className="space-y-4">
            {/* Caption */}
            <div className="bg-app-card border border-app-border rounded-xl p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-heading font-semibold text-app-text">Legenda</h3>
                <button
                  onClick={() => copyToClipboard(generated.caption, 'caption')}
                  className="text-xs text-accent hover:text-accent-light flex items-center gap-1 transition-colors"
                >
                  {copiedField === 'caption' ? '✅ Copiado!' : '📋 Copiar'}
                </button>
              </div>
              <div className="bg-app-card2 rounded-lg p-3">
                <p className="text-app-text text-sm whitespace-pre-wrap leading-relaxed">{generated.caption}</p>
              </div>
              <p className="text-app-text2 text-xs mt-2">{generated.caption.length} / {platformInfo?.maxCaptionLength ?? 2200} caracteres</p>
            </div>

            {/* Hashtags */}
            <div className="bg-app-card border border-app-border rounded-xl p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-heading font-semibold text-app-text">Hashtags</h3>
                <button
                  onClick={() => copyToClipboard(generated.hashtags.join(' '), 'hashtags')}
                  className="text-xs text-accent hover:text-accent-light flex items-center gap-1 transition-colors"
                >
                  {copiedField === 'hashtags' ? '✅ Copiado!' : '📋 Copiar'}
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {generated.hashtags.map((tag, i) => (
                  <span key={i} className="text-xs px-2 py-1 rounded-full bg-accent/15 text-accent-light font-medium">{tag}</span>
                ))}
              </div>
              <p className="text-app-text2 text-xs mt-2">{generated.hashtags.length} hashtags</p>
            </div>

            {/* CTA */}
            <div className="bg-app-card border border-app-border rounded-xl p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-heading font-semibold text-app-text">Chamada para Ação (CTA)</h3>
                <button
                  onClick={() => copyToClipboard(generated.cta, 'cta')}
                  className="text-xs text-accent hover:text-accent-light transition-colors"
                >
                  {copiedField === 'cta' ? '✅ Copiado!' : '📋'}
                </button>
              </div>
              <p className="text-app-text text-sm bg-app-card2 p-3 rounded-lg">{generated.cta}</p>
            </div>

            {/* Best time */}
            <div className="bg-app-card border border-app-border rounded-xl p-4 flex items-center gap-3">
              <span className="text-2xl">⏰</span>
              <div>
                <p className="text-app-text2 text-xs">Melhor horário para postar</p>
                <p className="text-app-text text-sm font-medium">{generated.suggestedTime}</p>
              </div>
            </div>
          </div>

          {/* Right column: Ideas, Tips, Save */}
          <div className="space-y-4">
            {/* Platform Preview Simulation */}
            {platformInfo && (
              <div className="bg-app-card border border-app-border rounded-xl p-5">
                <h3 className="font-heading font-semibold text-app-text mb-3 flex items-center gap-2">
                  <span>{platformInfo.icon}</span> Preview — {platformInfo.label}
                </h3>
                <div className="rounded-xl overflow-hidden border border-app-border2" style={{ backgroundColor: platformInfo.bgColor }}>
                  <div className="p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0" style={{ backgroundColor: selectedClient?.color ?? '#6366F1' }}>
                        {selectedClient?.initials ?? 'CL'}
                      </div>
                      <div>
                        <p className="text-white text-xs font-semibold">{selectedClient?.name ?? 'Cliente'}</p>
                        <p className="text-white/60 text-xs">{platformInfo.label}</p>
                      </div>
                    </div>
                    <div className="bg-white/10 rounded-lg aspect-video flex items-center justify-center mb-3">
                      <span className="text-white/40 text-sm">📷 Imagem / Vídeo</span>
                    </div>
                    <p className="text-white/90 text-xs leading-relaxed line-clamp-4">{generated.caption}</p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {generated.hashtags.slice(0, 5).map((tag, i) => (
                        <span key={i} className="text-xs" style={{ color: platformInfo.textColor }}>{tag}</span>
                      ))}
                      {generated.hashtags.length > 5 && <span className="text-xs text-white/40">+{generated.hashtags.length - 5}</span>}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Content Ideas */}
            <div className="bg-app-card border border-app-border rounded-xl p-5">
              <h3 className="font-heading font-semibold text-app-text mb-3">💡 Ideias de Conteúdo Visual</h3>
              <ul className="space-y-2">
                {generated.contentIdeas.map((idea, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-app-text2">
                    <span className="text-accent mt-0.5 shrink-0">→</span>
                    <span>{idea}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Engagement Tips */}
            <div className="bg-app-card border border-app-border rounded-xl p-5">
              <h3 className="font-heading font-semibold text-app-text mb-3">🚀 Dicas de Engajamento</h3>
              <ul className="space-y-2">
                {generated.engagementTips.map((tip, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-app-text2">
                    <span className="text-success mt-0.5 shrink-0">✓</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Save Actions */}
            <div className="bg-app-card border border-app-border rounded-xl p-5 space-y-3">
              <h3 className="font-heading font-semibold text-app-text mb-1">Salvar Post</h3>
              <div>
                <label className="block text-app-text2 text-xs mb-1.5">Data de agendamento (opcional)</label>
                <input
                  type="datetime-local"
                  className={inputClass}
                  value={scheduledDate}
                  onChange={e => setScheduledDate(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => handleSave('rascunho')}
                  className="bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 py-2 rounded-lg text-xs font-medium transition-colors"
                >
                  📝 Rascunho
                </button>
                <button
                  onClick={() => handleSave('agendado')}
                  className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 py-2 rounded-lg text-xs font-medium transition-colors"
                >
                  📅 Agendar
                </button>
                <button
                  onClick={() => handleSave('publicado')}
                  className="bg-green-500/20 hover:bg-green-500/30 text-green-400 py-2 rounded-lg text-xs font-medium transition-colors"
                >
                  ✅ Publicado
                </button>
              </div>
              {savedFeedback && (
                <p className="text-success text-sm text-center bg-green-500/10 rounded-lg py-2">{savedFeedback}</p>
              )}
            </div>

            {/* Regenerate */}
            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full border border-accent/50 text-accent hover:bg-accent/10 py-2.5 rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2"
            >
              {isGenerating ? (
                <><span className="w-4 h-4 border-2 border-accent/30 border-t-accent rounded-full animate-spin"></span> Gerando...</>
              ) : (
                <>🔄 Gerar Novamente</>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
