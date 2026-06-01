import type { User } from '@/types';

const STORAGE_KEY = 'ai-content-factory-user';
const listeners = new Set<() => void>();
let cachedUserStorageValue: string | null = null;
let cachedUserSnapshot: User | null = null;

export type CreateUserInput = {
  name: string;
  email: string;
  role?: string;
};

export const DEFAULT_DAILY_LIMIT = 20;

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function normalizeUser(user: User): User {
  const today = todayKey();
  if (user.usageDate !== today) {
    return {
      ...user,
      usage: 0,
      usageDate: today,
    };
  }
  return user;
}

function notifyUserChange() {
  listeners.forEach((listener) => listener());
}

function readCurrentUserSnapshot(): User | null {
  if (typeof window === 'undefined') return null;

  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw === cachedUserStorageValue) return cachedUserSnapshot;
  if (!raw) {
    cachedUserStorageValue = null;
    cachedUserSnapshot = null;
    return null;
  }

  try {
    const normalized = normalizeUser(JSON.parse(raw) as User);
    cachedUserStorageValue = raw;
    cachedUserSnapshot = normalized;
    return normalized;
  } catch {
    cachedUserStorageValue = null;
    cachedUserSnapshot = null;
    return null;
  }
}

export function subscribeCurrentUser(listener: () => void) {
  if (typeof window === 'undefined') return () => {};

  listeners.add(listener);

  const handleStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY) listener();
  };
  window.addEventListener('storage', handleStorage);

  return () => {
    listeners.delete(listener);
    window.removeEventListener('storage', handleStorage);
  };
}

export function getCurrentUserSnapshot(): User | null {
  return readCurrentUserSnapshot();
}

export function getCurrentUserServerSnapshot(): User | null {
  return null;
}

export function loadCurrentUser(): User | null {
  return readCurrentUserSnapshot();
}

export function saveCurrentUser(user: User): User {
  const normalized = normalizeUser(user);
  if (typeof window !== 'undefined') {
    const serialized = JSON.stringify(normalized);
    localStorage.setItem(STORAGE_KEY, serialized);
    cachedUserStorageValue = serialized;
    cachedUserSnapshot = normalized;
    notifyUserChange();
  }
  return normalized;
}

export function createLocalUser(input: CreateUserInput): User {
  const user: User = {
    id: `user-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    name: input.name.trim() || '内容服务主理人',
    email: input.email.trim(),
    role: input.role?.trim() || 'AI 内容服务主理人',
    plan: 'starter',
    usage: 0,
    maxUsage: DEFAULT_DAILY_LIMIT,
    usageDate: todayKey(),
    createdAt: new Date().toISOString(),
  };
  return saveCurrentUser(user);
}

export function clearCurrentUser() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_KEY);
    cachedUserStorageValue = null;
    cachedUserSnapshot = null;
    notifyUserChange();
  }
}

export function incrementUserUsage(): User | null {
  const user = loadCurrentUser();
  if (!user) return null;
  return saveCurrentUser({
    ...user,
    usage: Math.min(user.usage + 1, user.maxUsage),
  });
}
