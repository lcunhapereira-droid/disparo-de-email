import React from 'react';
import type { Client, Post, View } from '../types';
import { PLATFORMS } from '../constants';

interface DashboardViewProps {
  clients: Client[];
  posts: Post[];
  onNavigate: (view: View, data?: { clientId?: string }) => void;
}

function getPlatformInfo(platformId: string) {
  return PLATFORMS.find(p => p.id === platformId);
}

function getStatusStyle(status: string) {
  switch (status) {
    case 'publicado': return 'bg-green-500/20 text-green-400 border border-green-500/30';
    case 'agendado': return 'bg-blue-500/20 text-blue-400 border border-blue-500/30';
    default: return 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30';
  }
}

export const DashboardView: React.FC<DashboardViewProps> = ({ clients, posts, onNavigate }) => {
  const publishedCount = posts.filter(p => p.status === 'publicado').length;
  const scheduledCount = posts.filter(p => p.status === 'agendado').length;
  const draftCount = posts.filter(p => p.status === 'rascunho').length;

  const upcomingPosts = posts
    .filter(p => p.status === 'agendado' && p.scheduledDate)
    .sort((a, b) => new Date(a.scheduledDate!).getTime() - new Date(b.scheduledDate!).getTime())
    .slice(0, 4);

  const recentPosts = [...posts]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  const platformUsage = PLATFORMS.map(p => ({
    ...p,
    count: posts.filter(post => post.platform === p.id).length,
  })).filter(p => p.count > 0).sort((a, b) => b.count - a.count);

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-heading font-bold text-app-text">Dashboard</h2>
          <p className="text-app-text2 text-sm mt-0.5">Visão geral da sua agência</p>
        </div>
        <button
          onClick={() => onNavigate('create')}
          className="flex items-center gap-2 bg-accent hover:bg-accent-hover text-white font-medium px-4 py-2.5 rounded-lg transition-colors text-sm"
        >
          <span>✏️</span> Criar Post
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Clientes Ativos', value: clients.length, icon: '👥', color: 'text-accent', bg: 'bg-accent/10' },
          { label: 'Posts Publicados', value: publishedCount, icon: '✅', color: 'text-success', bg: 'bg-green-500/10' },
          { label: 'Posts Agendados', value: scheduledCount, icon: '📅', color: 'text-blue-400', bg: 'bg-blue-500/10' },
          { label: 'Rascunhos', value: draftCount, icon: '📝', color: 'text-warning', bg: 'bg-yellow-500/10' },
        ].map((stat) => (
          <div key={stat.label} className="bg-app-card border border-app-border rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <span className={`text-xs font-medium ${stat.color} uppercase tracking-wide`}>{stat.label}</span>
              <div className={`${stat.bg} rounded-lg w-8 h-8 flex items-center justify-center text-lg`}>
                {stat.icon}
              </div>
            </div>
            <p className={`text-3xl font-heading font-bold ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Clientes Recentes */}
        <div className="bg-app-card border border-app-border rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-heading font-semibold text-app-text">Clientes</h3>
            <button
              onClick={() => onNavigate('clients')}
              className="text-accent text-xs hover:text-accent-light transition-colors"
            >
              Ver todos →
            </button>
          </div>
          <div className="space-y-3">
            {clients.slice(0, 4).map((client) => (
              <div key={client.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-app-card2 transition-colors cursor-pointer" onClick={() => onNavigate('clients')}>
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0"
                  style={{ backgroundColor: client.color }}
                >
                  {client.initials}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-app-text text-sm font-medium truncate">{client.name}</p>
                  <p className="text-app-text2 text-xs truncate">{client.niche}</p>
                </div>
                <div className="flex gap-1">
                  {client.platforms.slice(0, 3).map(pid => {
                    const info = getPlatformInfo(pid);
                    return info ? (
                      <span key={pid} className="text-sm" title={info.label}>{info.icon}</span>
                    ) : null;
                  })}
                </div>
              </div>
            ))}
            {clients.length === 0 && (
              <p className="text-app-text2 text-sm text-center py-4">Nenhum cliente ainda.</p>
            )}
          </div>
        </div>

        {/* Próximos Posts */}
        <div className="bg-app-card border border-app-border rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-heading font-semibold text-app-text">Próximos Posts</h3>
            <button
              onClick={() => onNavigate('calendar')}
              className="text-accent text-xs hover:text-accent-light transition-colors"
            >
              Ver calendário →
            </button>
          </div>
          <div className="space-y-3">
            {upcomingPosts.map((post) => {
              const platform = getPlatformInfo(post.platform);
              const date = post.scheduledDate ? new Date(post.scheduledDate) : null;
              return (
                <div key={post.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-app-card2 transition-colors">
                  <div
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: post.clientColor }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-app-text text-sm truncate">{post.topic}</p>
                    <p className="text-app-text2 text-xs">{post.clientName}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-app-text2 text-xs">{platform?.icon} {platform?.label.split(' ')[0]}</p>
                    {date && (
                      <p className="text-app-text2 text-xs">
                        {date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
            {upcomingPosts.length === 0 && (
              <p className="text-app-text2 text-sm text-center py-4">Nenhum post agendado.</p>
            )}
          </div>
        </div>
      </div>

      {/* Posts Recentes */}
      <div className="bg-app-card border border-app-border rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-heading font-semibold text-app-text">Posts Recentes</h3>
          <button
            onClick={() => onNavigate('library')}
            className="text-accent text-xs hover:text-accent-light transition-colors"
          >
            Ver biblioteca →
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-app-border">
                <th className="text-left text-xs text-app-text2 font-medium pb-2 pr-4">Cliente</th>
                <th className="text-left text-xs text-app-text2 font-medium pb-2 pr-4">Tema</th>
                <th className="text-left text-xs text-app-text2 font-medium pb-2 pr-4">Plataforma</th>
                <th className="text-left text-xs text-app-text2 font-medium pb-2">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-app-border/50">
              {recentPosts.map((post) => {
                const platform = getPlatformInfo(post.platform);
                return (
                  <tr key={post.id} className="hover:bg-app-card2/50 transition-colors">
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0" style={{ backgroundColor: post.clientColor }}>
                          {post.clientName.charAt(0)}
                        </div>
                        <span className="text-app-text text-sm truncate max-w-[100px]">{post.clientName}</span>
                      </div>
                    </td>
                    <td className="py-3 pr-4">
                      <span className="text-app-text text-sm truncate max-w-[120px] block">{post.topic}</span>
                    </td>
                    <td className="py-3 pr-4">
                      <span className="text-app-text2 text-sm">{platform?.icon} {platform?.label.split(' ')[0]}</span>
                    </td>
                    <td className="py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getStatusStyle(post.status)}`}>
                        {post.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {recentPosts.length === 0 && (
            <p className="text-app-text2 text-sm text-center py-8">Nenhum post criado ainda. <button onClick={() => onNavigate('create')} className="text-accent hover:underline">Criar primeiro post</button></p>
          )}
        </div>
      </div>

      {/* Plataformas usadas */}
      {platformUsage.length > 0 && (
        <div className="bg-app-card border border-app-border rounded-xl p-5">
          <h3 className="font-heading font-semibold text-app-text mb-4">Posts por Plataforma</h3>
          <div className="flex flex-wrap gap-3">
            {platformUsage.map(p => (
              <div key={p.id} className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ backgroundColor: p.bgColor }}>
                <span>{p.icon}</span>
                <span className="text-sm font-medium" style={{ color: p.textColor }}>{p.label}</span>
                <span className="text-xs font-bold px-1.5 py-0.5 rounded-full bg-white/10" style={{ color: p.textColor }}>{p.count}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
