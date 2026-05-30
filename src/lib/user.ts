import type { User } from '@/types';

const STORAGE_KEY = 'ai-content-factory-user';

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

export function loadCurrentUser(): User | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return normalizeUser(JSON.parse(raw) as User);
  } catch {
    return null;
  }
}

export function saveCurrentUser(user: User): User {
  const normalized = normalizeUser(user);
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
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
