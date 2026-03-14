import React, { useState } from 'react';
import type { Post } from '../types';
import { PLATFORMS } from '../constants';

interface CalendarViewProps {
  posts: Post[];
  onPostStatusChange: (postId: string, status: Post['status']) => void;
}

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 1).getDay();
}

const MONTH_NAMES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

const DAY_NAMES = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

function getStatusStyle(status: string) {
  switch (status) {
    case 'publicado': return 'bg-green-500/20 text-green-400 border border-green-500/30';
    case 'agendado': return 'bg-blue-500/20 text-blue-400 border border-blue-500/30';
    default: return 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30';
  }
}

export const CalendarView: React.FC<CalendarViewProps> = ({ posts, onPostStatusChange }) => {
  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [expandedPost, setExpandedPost] = useState<Post | null>(null);

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth);

  const prevMonth = () => {
    if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(y => y - 1); }
    else setCurrentMonth(m => m - 1);
    setSelectedDay(null);
  };

  const nextMonth = () => {
    if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(y => y + 1); }
    else setCurrentMonth(m => m + 1);
    setSelectedDay(null);
  };

  const getPostsForDay = (day: number) => {
    return posts.filter(post => {
      const dateStr = post.scheduledDate ?? post.createdAt;
      const d = new Date(dateStr);
      return d.getFullYear() === currentYear && d.getMonth() === currentMonth && d.getDate() === day;
    });
  };

  const selectedDayPosts = selectedDay ? getPostsForDay(selectedDay) : [];

  const allMonthPosts = posts.filter(post => {
    const dateStr = post.scheduledDate ?? post.createdAt;
    const d = new Date(dateStr);
    return d.getFullYear() === currentYear && d.getMonth() === currentMonth;
  });

  return (
    <div className="p-6 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-heading font-bold text-app-text">Calendário</h2>
          <p className="text-app-text2 text-sm mt-0.5">{allMonthPosts.length} post{allMonthPosts.length !== 1 ? 's' : ''} em {MONTH_NAMES[currentMonth]}</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={prevMonth} className="w-8 h-8 rounded-lg bg-app-card border border-app-border hover:bg-app-card2 text-app-text transition-colors flex items-center justify-center">‹</button>
          <span className="text-app-text font-heading font-semibold min-w-[130px] text-center">
            {MONTH_NAMES[currentMonth]} {currentYear}
          </span>
          <button onClick={nextMonth} className="w-8 h-8 rounded-lg bg-app-card border border-app-border hover:bg-app-card2 text-app-text transition-colors flex items-center justify-center">›</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar Grid */}
        <div className="lg:col-span-2 bg-app-card border border-app-border rounded-xl overflow-hidden">
          <div className="grid grid-cols-7 border-b border-app-border">
            {DAY_NAMES.map(day => (
              <div key={day} className="py-2 text-center text-xs font-medium text-app-text2">{day}</div>
            ))}
          </div>
          <div className="grid grid-cols-7">
            {/* Empty cells before first day */}
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`empty-${i}`} className="h-24 border-b border-r border-app-border/50 bg-app-bg/30" />
            ))}
            {/* Days */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dayPosts = getPostsForDay(day);
              const isToday = today.getFullYear() === currentYear && today.getMonth() === currentMonth && today.getDate() === day;
              const isSelected = selectedDay === day;

              return (
                <div
                  key={day}
                  onClick={() => setSelectedDay(isSelected ? null : day)}
                  className={`h-24 border-b border-r border-app-border/50 p-1 cursor-pointer transition-colors ${
                    isSelected ? 'bg-accent/10' : 'hover:bg-app-card2/50'
                  }`}
                >
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium mb-1 ${
                    isToday ? 'bg-accent text-white' : isSelected ? 'text-accent' : 'text-app-text2'
                  }`}>
                    {day}
                  </div>
                  <div className="space-y-0.5 overflow-hidden">
                    {dayPosts.slice(0, 2).map(post => {
                      const p = PLATFORMS.find(pl => pl.id === post.platform);
                      return (
                        <div
                          key={post.id}
                          className="flex items-center gap-1 rounded px-1 py-0.5 text-xs truncate"
                          style={{ backgroundColor: post.clientColor + '25', color: post.clientColor }}
                          title={`${post.clientName}: ${post.topic}`}
                        >
                          <span className="text-xs">{p?.icon}</span>
                          <span className="truncate text-xs">{post.topic}</span>
                        </div>
                      );
                    })}
                    {dayPosts.length > 2 && (
                      <div className="text-xs text-app-text2 pl-1">+{dayPosts.length - 2}</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Panel */}
        <div className="space-y-4">
          {/* Selected day posts */}
          {selectedDay && (
            <div className="bg-app-card border border-app-border rounded-xl p-4 animate-slide-up">
              <h3 className="font-heading font-semibold text-app-text mb-3">
                {selectedDay} de {MONTH_NAMES[currentMonth]}
              </h3>
              {selectedDayPosts.length === 0 ? (
                <p className="text-app-text2 text-sm">Nenhum post neste dia.</p>
              ) : (
                <div className="space-y-2">
                  {selectedDayPosts.map(post => {
                    const p = PLATFORMS.find(pl => pl.id === post.platform);
                    return (
                      <button
                        key={post.id}
                        onClick={() => setExpandedPost(post)}
                        className="w-full text-left p-3 rounded-lg bg-app-card2 hover:bg-app-border/50 transition-colors"
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <div className="w-5 h-5 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0" style={{ backgroundColor: post.clientColor }}>
                            {post.clientName.charAt(0)}
                          </div>
                          <span className="text-app-text2 text-xs">{post.clientName}</span>
                          <span className="ml-auto text-xs">{p?.icon}</span>
                        </div>
                        <p className="text-app-text text-sm font-medium truncate">{post.topic}</p>
                        <span className={`text-xs px-1.5 py-0.5 rounded-full mt-1 inline-block ${getStatusStyle(post.status)}`}>{post.status}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Month summary */}
          <div className="bg-app-card border border-app-border rounded-xl p-4">
            <h3 className="font-heading font-semibold text-app-text mb-3 text-sm">Resumo do Mês</h3>
            <div className="space-y-2">
              {[
                { label: 'Publicados', count: allMonthPosts.filter(p => p.status === 'publicado').length, color: 'text-success', bg: 'bg-green-500/10' },
                { label: 'Agendados', count: allMonthPosts.filter(p => p.status === 'agendado').length, color: 'text-blue-400', bg: 'bg-blue-500/10' },
                { label: 'Rascunhos', count: allMonthPosts.filter(p => p.status === 'rascunho').length, color: 'text-warning', bg: 'bg-yellow-500/10' },
              ].map(item => (
                <div key={item.label} className={`flex items-center justify-between ${item.bg} rounded-lg px-3 py-2`}>
                  <span className={`text-sm ${item.color}`}>{item.label}</span>
                  <span className={`font-bold font-heading ${item.color}`}>{item.count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent posts list */}
          <div className="bg-app-card border border-app-border rounded-xl p-4">
            <h3 className="font-heading font-semibold text-app-text mb-3 text-sm">Posts do Mês</h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {allMonthPosts.length === 0 ? (
                <p className="text-app-text2 text-sm">Nenhum post neste mês.</p>
              ) : (
                allMonthPosts
                  .sort((a, b) => {
                    const da = new Date(a.scheduledDate ?? a.createdAt).getTime();
                    const db = new Date(b.scheduledDate ?? b.createdAt).getTime();
                    return da - db;
                  })
                  .map(post => {
                    const p = PLATFORMS.find(pl => pl.id === post.platform);
                    const d = new Date(post.scheduledDate ?? post.createdAt);
                    return (
                      <button
                        key={post.id}
                        onClick={() => setExpandedPost(post)}
                        className="w-full text-left flex items-center gap-2 p-2 rounded-lg hover:bg-app-card2 transition-colors"
                      >
                        <span className="text-sm shrink-0">{p?.icon}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-app-text text-xs truncate">{post.topic}</p>
                          <p className="text-app-text2 text-xs">{post.clientName} · dia {d.getDate()}</p>
                        </div>
                        <span className={`text-xs px-1.5 py-0.5 rounded-full shrink-0 ${getStatusStyle(post.status)}`}>{post.status.charAt(0).toUpperCase()}</span>
                      </button>
                    );
                  })
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Post Detail Modal */}
      {expandedPost && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-app-card border border-app-border rounded-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto animate-slide-up">
            <div className="sticky top-0 bg-app-card border-b border-app-border px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ backgroundColor: expandedPost.clientColor }}>
                  {expandedPost.clientName.charAt(0)}
                </div>
                <div>
                  <p className="text-app-text text-sm font-semibold">{expandedPost.clientName}</p>
                  <p className="text-app-text2 text-xs">{PLATFORMS.find(p => p.id === expandedPost.platform)?.label}</p>
                </div>
              </div>
              <button onClick={() => setExpandedPost(null)} className="text-app-text2 hover:text-app-text text-xl">×</button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <p className="text-app-text2 text-xs mb-1">Tema</p>
                <p className="text-app-text font-medium">{expandedPost.topic}</p>
              </div>
              <div>
                <p className="text-app-text2 text-xs mb-1">Legenda</p>
                <p className="text-app-text text-sm bg-app-card2 p-3 rounded-lg whitespace-pre-wrap">{expandedPost.caption}</p>
              </div>
              <div>
                <p className="text-app-text2 text-xs mb-2">Hashtags</p>
                <div className="flex flex-wrap gap-1">
                  {expandedPost.hashtags.map((tag, i) => (
                    <span key={i} className="text-xs px-2 py-0.5 rounded-full bg-accent/15 text-accent-light">{tag}</span>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-app-text2 text-xs mb-1">Status</p>
                <div className="flex gap-2">
                  {(['rascunho', 'agendado', 'publicado'] as Post['status'][]).map(s => (
                    <button
                      key={s}
                      onClick={() => { onPostStatusChange(expandedPost.id, s); setExpandedPost({ ...expandedPost, status: s }); }}
                      className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${
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
    </div>
  );
};
