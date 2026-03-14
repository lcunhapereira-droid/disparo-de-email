import React, { useState } from 'react';
import type { Client, Tone, Platform } from '../types';
import { PLATFORMS, TONES, CLIENT_COLORS } from '../constants';
import { generateId } from '../utils/storage';

interface ClientsViewProps {
  clients: Client[];
  onClientsChange: (clients: Client[]) => void;
  onCreatePost: (clientId: string) => void;
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map(w => w.charAt(0).toUpperCase())
    .join('');
}

const EMPTY_FORM = {
  name: '',
  niche: '',
  segment: '',
  tone: 'casual' as Tone,
  targetAudience: '',
  platforms: [] as Platform[],
  keywords: '',
  bio: '',
  color: CLIENT_COLORS[0],
};

export const ClientsView: React.FC<ClientsViewProps> = ({ clients, onClientsChange, onCreatePost }) => {
  const [showForm, setShowForm] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const openCreate = () => {
    setForm(EMPTY_FORM);
    setEditingClient(null);
    setShowForm(true);
  };

  const openEdit = (client: Client) => {
    setForm({
      name: client.name,
      niche: client.niche,
      segment: client.segment,
      tone: client.tone,
      targetAudience: client.targetAudience,
      platforms: [...client.platforms],
      keywords: client.keywords.join(', '),
      bio: client.bio,
      color: client.color,
    });
    setEditingClient(client);
    setShowForm(true);
  };

  const handleSave = () => {
    if (!form.name.trim() || !form.niche.trim()) return;
    const keywords = form.keywords.split(',').map(k => k.trim()).filter(Boolean);

    if (editingClient) {
      const updated = clients.map(c =>
        c.id === editingClient.id
          ? { ...c, ...form, keywords, initials: getInitials(form.name) }
          : c
      );
      onClientsChange(updated);
    } else {
      const newClient: Client = {
        id: generateId(),
        name: form.name.trim(),
        initials: getInitials(form.name),
        color: form.color,
        niche: form.niche.trim(),
        segment: form.segment.trim(),
        tone: form.tone,
        targetAudience: form.targetAudience.trim(),
        platforms: form.platforms,
        keywords,
        bio: form.bio.trim(),
        createdAt: new Date().toISOString(),
      };
      onClientsChange([...clients, newClient]);
    }
    setShowForm(false);
  };

  const handleDelete = (id: string) => {
    onClientsChange(clients.filter(c => c.id !== id));
    setDeleteConfirm(null);
    if (selectedClient?.id === id) setSelectedClient(null);
  };

  const togglePlatform = (p: Platform) => {
    setForm(prev => ({
      ...prev,
      platforms: prev.platforms.includes(p)
        ? prev.platforms.filter(x => x !== p)
        : [...prev.platforms, p],
    }));
  };

  const inputClass = "w-full bg-app-card2 border border-app-border rounded-lg px-3 py-2.5 text-app-text text-sm placeholder:text-app-text2/50 focus:outline-none focus:border-accent transition-colors";
  const labelClass = "block text-app-text2 text-xs font-medium mb-1.5";

  return (
    <div className="p-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-heading font-bold text-app-text">Clientes</h2>
          <p className="text-app-text2 text-sm mt-0.5">{clients.length} cliente{clients.length !== 1 ? 's' : ''} cadastrado{clients.length !== 1 ? 's' : ''}</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-accent hover:bg-accent-hover text-white font-medium px-4 py-2.5 rounded-lg transition-colors text-sm"
        >
          <span>+</span> Novo Cliente
        </button>
      </div>

      {/* Clients Grid */}
      {!showForm && !selectedClient && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {clients.map((client) => (
            <div
              key={client.id}
              className="bg-app-card border border-app-border rounded-xl p-5 hover:border-app-border2 transition-all cursor-pointer"
              onClick={() => setSelectedClient(client)}
            >
              <div className="flex items-start gap-4 mb-4">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg shrink-0"
                  style={{ backgroundColor: client.color }}
                >
                  {client.initials}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-heading font-semibold text-app-text truncate">{client.name}</h3>
                  <p className="text-app-text2 text-xs truncate">{client.niche}</p>
                  <p className="text-app-text2 text-xs truncate">{client.segment}</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-1 mb-4">
                {client.platforms.map(pid => {
                  const p = PLATFORMS.find(x => x.id === pid);
                  return p ? (
                    <span
                      key={pid}
                      className="text-xs px-2 py-0.5 rounded-full font-medium"
                      style={{ backgroundColor: p.bgColor, color: p.textColor }}
                    >
                      {p.icon} {p.label.split(' ')[0]}
                    </span>
                  ) : null;
                })}
              </div>

              <div className="flex items-center gap-2 pt-3 border-t border-app-border">
                <button
                  onClick={(e) => { e.stopPropagation(); onCreatePost(client.id); }}
                  className="flex-1 text-xs text-accent hover:text-white hover:bg-accent bg-accent/10 py-1.5 rounded-lg transition-colors font-medium"
                >
                  ✏️ Criar Post
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); openEdit(client); }}
                  className="text-xs text-app-text2 hover:text-app-text hover:bg-app-card2 px-3 py-1.5 rounded-lg transition-colors"
                >
                  Editar
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); setDeleteConfirm(client.id); }}
                  className="text-xs text-danger/70 hover:text-danger hover:bg-red-500/10 px-3 py-1.5 rounded-lg transition-colors"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}

          {clients.length === 0 && (
            <div className="col-span-full text-center py-16">
              <p className="text-4xl mb-3">👥</p>
              <p className="text-app-text font-medium mb-1">Nenhum cliente ainda</p>
              <p className="text-app-text2 text-sm mb-4">Adicione seu primeiro cliente para começar</p>
              <button onClick={openCreate} className="bg-accent hover:bg-accent-hover text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                Adicionar Cliente
              </button>
            </div>
          )}
        </div>
      )}

      {/* Client Detail */}
      {selectedClient && !showForm && (
        <div className="animate-slide-up">
          <button onClick={() => setSelectedClient(null)} className="flex items-center gap-2 text-app-text2 hover:text-app-text text-sm mb-4 transition-colors">
            ← Voltar
          </button>
          <div className="bg-app-card border border-app-border rounded-xl p-6">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-16 h-16 rounded-xl flex items-center justify-center text-white font-bold text-2xl shrink-0" style={{ backgroundColor: selectedClient.color }}>
                {selectedClient.initials}
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-heading font-bold text-app-text">{selectedClient.name}</h3>
                <p className="text-app-text2 text-sm">{selectedClient.niche} · {selectedClient.segment}</p>
                <div className="flex gap-2 mt-2">
                  <button onClick={() => openEdit(selectedClient)} className="text-xs bg-accent/20 text-accent px-3 py-1 rounded-lg hover:bg-accent/30 transition-colors">Editar</button>
                  <button onClick={() => onCreatePost(selectedClient.id)} className="text-xs bg-accent text-white px-3 py-1 rounded-lg hover:bg-accent-hover transition-colors">✏️ Criar Post</button>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { label: 'Tom de Voz', value: TONES.find(t => t.id === selectedClient.tone)?.label ?? selectedClient.tone },
                { label: 'Público-alvo', value: selectedClient.targetAudience },
                { label: 'Bio', value: selectedClient.bio },
                { label: 'Palavras-chave', value: selectedClient.keywords.join(', ') },
              ].map(item => (
                <div key={item.label} className="bg-app-card2 rounded-lg p-3">
                  <p className="text-app-text2 text-xs mb-1">{item.label}</p>
                  <p className="text-app-text text-sm">{item.value || '—'}</p>
                </div>
              ))}
            </div>
            <div className="mt-4">
              <p className="text-app-text2 text-xs mb-2">Plataformas</p>
              <div className="flex flex-wrap gap-2">
                {selectedClient.platforms.map(pid => {
                  const p = PLATFORMS.find(x => x.id === pid);
                  return p ? (
                    <span key={pid} className="text-sm px-3 py-1 rounded-full font-medium" style={{ backgroundColor: p.bgColor, color: p.textColor }}>
                      {p.icon} {p.label}
                    </span>
                  ) : null;
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-app-card border border-app-border rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-slide-up">
            <div className="sticky top-0 bg-app-card border-b border-app-border px-6 py-4 flex items-center justify-between">
              <h3 className="font-heading font-bold text-app-text text-lg">
                {editingClient ? 'Editar Cliente' : 'Novo Cliente'}
              </h3>
              <button onClick={() => setShowForm(false)} className="text-app-text2 hover:text-app-text text-xl transition-colors">×</button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className={labelClass}>Nome do cliente *</label>
                  <input className={inputClass} value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Ex: Studio Beleza & Co." />
                </div>
                <div>
                  <label className={labelClass}>Nicho *</label>
                  <input className={inputClass} value={form.niche} onChange={e => setForm(p => ({ ...p, niche: e.target.value }))} placeholder="Ex: Beleza e Estética" />
                </div>
                <div>
                  <label className={labelClass}>Segmento</label>
                  <input className={inputClass} value={form.segment} onChange={e => setForm(p => ({ ...p, segment: e.target.value }))} placeholder="Ex: Salão de beleza premium" />
                </div>
                <div className="col-span-2">
                  <label className={labelClass}>Público-alvo</label>
                  <input className={inputClass} value={form.targetAudience} onChange={e => setForm(p => ({ ...p, targetAudience: e.target.value }))} placeholder="Ex: Mulheres de 25-45 anos, classe B/A" />
                </div>
                <div className="col-span-2">
                  <label className={labelClass}>Bio / Descrição</label>
                  <textarea className={`${inputClass} resize-none`} rows={2} value={form.bio} onChange={e => setForm(p => ({ ...p, bio: e.target.value }))} placeholder="Breve descrição do negócio..." />
                </div>
                <div className="col-span-2">
                  <label className={labelClass}>Palavras-chave (separadas por vírgula)</label>
                  <input className={inputClass} value={form.keywords} onChange={e => setForm(p => ({ ...p, keywords: e.target.value }))} placeholder="Ex: beleza, transformação, autocuidado" />
                </div>
                <div>
                  <label className={labelClass}>Tom de Voz</label>
                  <select className={inputClass} value={form.tone} onChange={e => setForm(p => ({ ...p, tone: e.target.value as Tone }))}>
                    {TONES.map(t => (
                      <option key={t.id} value={t.id}>{t.emoji} {t.label} — {t.description}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Cor do Avatar</label>
                  <div className="flex gap-2 flex-wrap">
                    {CLIENT_COLORS.map(c => (
                      <button
                        key={c}
                        onClick={() => setForm(p => ({ ...p, color: c }))}
                        className={`w-8 h-8 rounded-full transition-transform hover:scale-110 ${form.color === c ? 'ring-2 ring-white ring-offset-2 ring-offset-app-card scale-110' : ''}`}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                </div>
                <div className="col-span-2">
                  <label className={labelClass}>Plataformas ativas</label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {PLATFORMS.map(p => (
                      <button
                        key={p.id}
                        onClick={() => togglePlatform(p.id)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium border transition-all ${
                          form.platforms.includes(p.id)
                            ? 'border-transparent'
                            : 'border-app-border text-app-text2 hover:border-app-border2'
                        }`}
                        style={form.platforms.includes(p.id) ? { backgroundColor: p.bgColor, color: p.textColor, borderColor: p.color + '50' } : {}}
                      >
                        <span>{p.icon}</span>
                        <span className="text-xs">{p.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowForm(false)} className="flex-1 border border-app-border text-app-text2 hover:text-app-text py-2.5 rounded-lg text-sm transition-colors">
                  Cancelar
                </button>
                <button
                  onClick={handleSave}
                  disabled={!form.name.trim() || !form.niche.trim()}
                  className="flex-1 bg-accent hover:bg-accent-hover disabled:bg-app-border disabled:text-app-text2 text-white py-2.5 rounded-lg text-sm font-medium transition-colors"
                >
                  {editingClient ? 'Salvar Alterações' : 'Criar Cliente'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-app-card border border-app-border rounded-xl p-6 max-w-sm w-full animate-slide-up">
            <h3 className="font-heading font-bold text-app-text mb-2">Excluir cliente?</h3>
            <p className="text-app-text2 text-sm mb-4">Essa ação não pode ser desfeita. Os posts associados permanecerão na biblioteca.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 border border-app-border text-app-text2 py-2 rounded-lg text-sm hover:text-app-text transition-colors">Cancelar</button>
              <button onClick={() => handleDelete(deleteConfirm)} className="flex-1 bg-danger hover:bg-red-600 text-white py-2 rounded-lg text-sm font-medium transition-colors">Excluir</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
