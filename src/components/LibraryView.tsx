import React, { useState } from 'react';
import type { Post, Client } from '../types';
import { PLATFORMS } from '../constants';

interface LibraryViewProps {
  posts: Post[];
  clients: Client[];
  onPostStatusChange: (postId: string, status: Post['status']) => void;
  onPostDelete: (postId: string) => void;
}

function getStatusStyle(status: string) {
  switch (status) {
    case 'publicado': return 'bg-green-500/20 text-green-400 border border-green-500/30';
    case 'agendado': return 'bg-blue-500/20 text-blue-400 border border-blue-500/30';
    default: return 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30';
  }
}

type FilterStatus = 'todos' | Post['status'];
type SortBy = 'newest' | 'oldest' | 'client';

export const LibraryView: React.FC<LibraryViewProps> = ({ posts, clients, onPostStatusChange, onPostDelete }) => {
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('todos');
  const [filterClientId, setFilterClientId] = useState<string>('todos');
  const [filterPlatform, setFilterPlatform] = useState<string>('todos');
  const [sortBy, setSortBy] = useState<SortBy>('newest');
  const [expandedPost, setExpandedPost] = useState<Post | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [copiedPostId, setCopiedPostId] = useState<string | null>(null);

  const filtered = posts
    .filter(p => filterStatus === 'todos' || p.status === filterStatus)
    .filter(p => filterClientId === 'todos' || p.clientId === filterClientId)
    .filter(p => filterPlatform === 'todos' || p.platform === filterPlatform)
    .sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (sortBy === 'oldest') return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      return a.clientName.localeCompare(b.clientName);
    });

  const usedPlatforms = [...new Set(posts.map(p => p.platform))];

  const copyFullContent = async (post: Post) => {
    const text = `${post.caption}\n\n${post.hashtags.join(' ')}\n\n${post.cta}`;
    await navigator.clipboard.writeText(text);
    setCopiedPostId(post.id);
    setTimeout(() => setCopiedPostId(null), 2000);
  };

  const selectClass = "bg-app-card2 border border-app-border rounded-lg px-3 py-2 text-app-text text-sm focus:outline-none focus:border-accent transition-colors";

  return (
    <div className="p-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-heading font-bold text-app-text">Biblioteca de Posts</h2>
          <p className="text-app-text2 text-sm mt-0.5">{filtered.length} de {posts.length} post{posts.length !== 1 ? 's' : ''}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6 p-4 bg-app-card border border-app-border rounded-xl">
        <div className="flex items-center gap-2">
          <span className="text-app-text2 text-xs">Status:</span>
          <select className={selectClass} value={filterStatus} onChange={e => setFilterStatus(e.target.value as FilterStatus)}>
            <option value="todos">Todos</option>
            <option value="rascunho">Rascunho</option>
            <option value="agendado">Agendado</option>
            <option value="publicado">Publicado</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-app-text2 text-xs">Cliente:</span>
          <select className={selectClass} value={filterClientId} onChange={e => setFilterClientId(e.target.value)}>
            <option value="todos">Todos</option>
            {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-app-text2 text-xs">Plataforma:</span>
          <select className={selectClass} value={filterPlatform} onChange={e => setFilterPlatform(e.target.value)}>
            <option value="todos">Todas</option>
            {usedPlatforms.map(pid => {
              const p = PLATFORMS.find(x => x.id === pid);
              return p ? <option key={pid} value={pid}>{p.icon} {p.label}</option> : null;
            })}
          </select>
        </div>
        <div className="flex items-center gap-2 ml-auto">
          <span className="text-app-text2 text-xs">Ordenar:</span>
          <select className={selectClass} value={sortBy} onChange={e => setSortBy(e.target.value as SortBy)}>
            <option value="newest">Mais recentes</option>
            <option value="oldest">Mais antigos</option>
            <option value="client">Cliente</option>
          </select>
        </div>
      </div>

      {/* Posts Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-4xl mb-3">📚</p>
          <p className="text-app-text font-medium mb-1">Nenhum post encontrado</p>
          <p className="text-app-text2 text-sm">Tente ajustar os filtros ou crie novos posts.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(post => {
            const platform = PLATFORMS.find(p => p.id === post.platform);
            const date = new Date(post.scheduledDate ?? post.createdAt);
            return (
              <div key={post.id} className="bg-app-card border border-app-border rounded-xl overflow-hidden hover:border-app-border2 transition-all group">
                {/* Card header */}
                <div className="p-4 pb-3">
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0" style={{ backgroundColor: post.clientColor }}>
                        {post.clientName.charAt(0)}
                      </div>
                      <span className="text-app-text2 text-xs truncate">{post.clientName}</span>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full shrink-0 font-medium ${getStatusStyle(post.status)}`}>{post.status}</span>
                  </div>

                  {/* Platform badge */}
                  {platform && (
                    <div className="flex items-center gap-1.5 mb-2">
                      <span className="text-sm">{platform.icon}</span>
                      <span className="text-xs font-medium" style={{ color: platform.textColor }}>{platform.label}</span>
                    </div>
                  )}

                  <h3 className="text-app-text font-semibold text-sm mb-2 line-clamp-1">{post.topic}</h3>
                  <p className="text-app-text2 text-xs line-clamp-3 leading-relaxed">{post.caption}</p>
                </div>

                {/* Hashtags preview */}
                <div className="px-4 pb-3 flex flex-wrap gap-1">
                  {post.hashtags.slice(0, 4).map((tag, i) => (
                    <span key={i} className="text-xs px-1.5 py-0.5 rounded bg-accent/10 text-accent-light">{tag}</span>
                  ))}
                  {post.hashtags.length > 4 && <span className="text-xs text-app-text2">+{post.hashtags.length - 4}</span>}
                </div>

                {/* Card footer */}
                <div className="px-4 py-3 border-t border-app-border flex items-center justify-between">
                  <span className="text-app-text2 text-xs">
                    {date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: '2-digit' })}
                  </span>
                  <div className="flex gap-1">
                    <button
                      onClick={() => copyFullContent(post)}
                      className="text-xs px-2 py-1 rounded-lg bg-accent/15 text-accent hover:bg-accent/25 transition-colors"
                      title="Copiar conteúdo completo"
                    >
                      {copiedPostId === post.id ? '✅' : '📋'}
                    </button>
                    <button
                      onClick={() => setExpandedPost(post)}
                      className="text-xs px-2 py-1 rounded-lg bg-app-card2 text-app-text2 hover:text-app-text hover:bg-app-border transition-colors"
                    >
                      Ver
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(post.id)}
                      className="text-xs px-2 py-1 rounded-lg text-danger/60 hover:text-danger hover:bg-red-500/10 transition-colors"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Post Detail Modal */}
      {expandedPost && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-app-card border border-app-border rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto animate-slide-up">
            <div className="sticky top-0 bg-app-card border-b border-app-border px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0" style={{ backgroundColor: expandedPost.clientColor }}>
                  {expandedPost.clientName.charAt(0)}
                </div>
                <div>
                  <p className="text-app-text text-sm font-semibold">{expandedPost.clientName}</p>
                  <p className="text-app-text2 text-xs">{PLATFORMS.find(p => p.id === expandedPost.platform)?.label}</p>
                </div>
              </div>
              <button onClick={() => setExpandedPost(null)} className="text-app-text2 hover:text-app-text text-xl transition-colors">×</button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <p className="text-app-text2 text-xs mb-1">Tema</p>
                <p className="text-app-text font-semibold">{expandedPost.topic}</p>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <p className="text-app-text2 text-xs">Legenda</p>
                  <button onClick={() => copyFullContent(expandedPost)} className="text-xs text-accent hover:text-accent-light transition-colors">
                    {copiedPostId === expandedPost.id ? '✅ Copiado!' : '📋 Copiar tudo'}
                  </button>
                </div>
                <p className="text-app-text text-sm bg-app-card2 p-3 rounded-lg whitespace-pre-wrap leading-relaxed">{expandedPost.caption}</p>
              </div>
              <div>
                <p className="text-app-text2 text-xs mb-2">Hashtags ({expandedPost.hashtags.length})</p>
                <div className="flex flex-wrap gap-1">
                  {expandedPost.hashtags.map((tag, i) => (
                    <span key={i} className="text-xs px-2 py-0.5 rounded-full bg-accent/15 text-accent-light">{tag}</span>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-app-text2 text-xs mb-1">CTA</p>
                <p className="text-app-text text-sm bg-app-card2 p-3 rounded-lg">{expandedPost.cta}</p>
              </div>
              <div>
                <p className="text-app-text2 text-xs mb-1">Melhor horário</p>
                <p className="text-app-text text-sm">{expandedPost.suggestedTime}</p>
              </div>
              {expandedPost.contentIdeas.length > 0 && (
                <div>
                  <p className="text-app-text2 text-xs mb-2">Ideias de conteúdo visual</p>
                  <ul className="space-y-1">
                    {expandedPost.contentIdeas.map((idea, i) => (
                      <li key={i} className="text-app-text text-sm flex gap-2"><span className="text-accent shrink-0">→</span>{idea}</li>
                    ))}
                  </ul>
                </div>
              )}
              {expandedPost.engagementTips.length > 0 && (
                <div>
                  <p className="text-app-text2 text-xs mb-2">Dicas de engajamento</p>
                  <ul className="space-y-1">
                    {expandedPost.engagementTips.map((tip, i) => (
                      <li key={i} className="text-app-text text-sm flex gap-2"><span className="text-success shrink-0">✓</span>{tip}</li>
                    ))}
                  </ul>
                </div>
              )}
              <div>
                <p className="text-app-text2 text-xs mb-2">Alterar status</p>
                <div className="flex gap-2">
                  {(['rascunho', 'agendado', 'publicado'] as Post['status'][]).map(s => (
                    <button
                      key={s}
                      onClick={() => { onPostStatusChange(expandedPost.id, s); setExpandedPost({ ...expandedPost, status: s }); }}
                      className={`flex-1 text-xs py-2 rounded-lg font-medium transition-colors ${
                        expandedPost.status === s ? getStatusStyle(s) : 'bg-app-card2 text-app-text2 hover:bg-app-border'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-app-card border border-app-border rounded-xl p-6 max-w-sm w-full animate-slide-up">
            <h3 className="font-heading font-bold text-app-text mb-2">Excluir post?</h3>
            <p className="text-app-text2 text-sm mb-4">Essa ação não pode ser desfeita.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 border border-app-border text-app-text2 py-2 rounded-lg text-sm hover:text-app-text transition-colors">Cancelar</button>
              <button onClick={() => { onPostDelete(deleteConfirm); setDeleteConfirm(null); setExpandedPost(null); }} className="flex-1 bg-danger hover:bg-red-600 text-white py-2 rounded-lg text-sm font-medium transition-colors">Excluir</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
