import type { Client, Post } from '../types';
import { SAMPLE_CLIENTS, SAMPLE_POSTS } from '../constants';

const CLIENTS_KEY = 'lumina_clients';
const POSTS_KEY = 'lumina_posts';

export function loadClients(): Client[] {
  try {
    const stored = localStorage.getItem(CLIENTS_KEY);
    if (stored) return JSON.parse(stored) as Client[];
  } catch {
    // ignore
  }
  // Dados de demonstração no primeiro acesso
  saveClients(SAMPLE_CLIENTS);
  return SAMPLE_CLIENTS;
}

export function saveClients(clients: Client[]): void {
  localStorage.setItem(CLIENTS_KEY, JSON.stringify(clients));
}

export function loadPosts(): Post[] {
  try {
    const stored = localStorage.getItem(POSTS_KEY);
    if (stored) return JSON.parse(stored) as Post[];
  } catch {
    // ignore
  }
  savePosts(SAMPLE_POSTS);
  return SAMPLE_POSTS;
}

export function savePosts(posts: Post[]): void {
  localStorage.setItem(POSTS_KEY, JSON.stringify(posts));
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}
