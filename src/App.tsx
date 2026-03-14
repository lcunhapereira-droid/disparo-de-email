import React, { useState, useCallback } from 'react';
import type { Client, Post, View } from './types';
import { loadClients, saveClients, loadPosts, savePosts } from './utils/storage';
import { Sidebar } from './components/Sidebar';
import { DashboardView } from './components/DashboardView';
import { ClientsView } from './components/ClientsView';
import { ContentCreatorView } from './components/ContentCreatorView';
import { CalendarView } from './components/CalendarView';
import { LibraryView } from './components/LibraryView';

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<View>('dashboard');
  const [clients, setClients] = useState<Client[]>(() => loadClients());
  const [posts, setPosts] = useState<Post[]>(() => loadPosts());
  const [preselectedClientId, setPreselectedClientId] = useState<string | undefined>(undefined);

  const handleClientsChange = useCallback((updated: Client[]) => {
    setClients(updated);
    saveClients(updated);
  }, []);

  const handlePostSaved = useCallback((post: Post) => {
    setPosts(prev => {
      const updated = [post, ...prev];
      savePosts(updated);
      return updated;
    });
  }, []);

  const handlePostStatusChange = useCallback((postId: string, status: Post['status']) => {
    setPosts(prev => {
      const updated = prev.map(p => p.id === postId ? { ...p, status } : p);
      savePosts(updated);
      return updated;
    });
  }, []);

  const handlePostDelete = useCallback((postId: string) => {
    setPosts(prev => {
      const updated = prev.filter(p => p.id !== postId);
      savePosts(updated);
      return updated;
    });
  }, []);

  const handleNavigate = useCallback((view: View, data?: { clientId?: string }) => {
    if (data?.clientId) setPreselectedClientId(data.clientId);
    else setPreselectedClientId(undefined);
    setActiveView(view);
  }, []);

  const handleCreatePostForClient = useCallback((clientId: string) => {
    setPreselectedClientId(clientId);
    setActiveView('create');
  }, []);

  const renderView = () => {
    switch (activeView) {
      case 'dashboard':
        return (
          <DashboardView
            clients={clients}
            posts={posts}
            onNavigate={handleNavigate}
          />
        );
      case 'clients':
        return (
          <ClientsView
            clients={clients}
            onClientsChange={handleClientsChange}
            onCreatePost={handleCreatePostForClient}
          />
        );
      case 'create':
        return (
          <ContentCreatorView
            clients={clients}
            onPostSaved={handlePostSaved}
            preselectedClientId={preselectedClientId}
          />
        );
      case 'calendar':
        return (
          <CalendarView
            posts={posts}
            onPostStatusChange={handlePostStatusChange}
          />
        );
      case 'library':
        return (
          <LibraryView
            posts={posts}
            clients={clients}
            onPostStatusChange={handlePostStatusChange}
            onPostDelete={handlePostDelete}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex min-h-screen bg-app-bg">
      <Sidebar
        activeView={activeView}
        onViewChange={(view) => { setPreselectedClientId(undefined); setActiveView(view); }}
        clientCount={clients.length}
        postCount={posts.length}
      />
      <main className="flex-1 overflow-auto min-h-screen">
        {renderView()}
      </main>
    </div>
  );
};

export default App;
