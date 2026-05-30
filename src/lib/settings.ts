import type { CustomProvider, UserSettings } from '@/types/providers';

const STORAGE_KEY = 'ai-content-factory-settings';

/** 默认设置 */
const DEFAULT_SETTINGS: UserSettings = {
  customProviders: [],
};

/** 从 localStorage 加载用户设置 */
export function loadSettings(): UserSettings {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    return JSON.parse(raw) as UserSettings;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

/** 保存用户设置到 localStorage */
export function saveSettings(settings: UserSettings): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}

/** 获取所有自定义 Provider */
export function getCustomProviders(): CustomProvider[] {
  return loadSettings().customProviders;
}

/** 添加自定义 Provider */
export function addCustomProvider(
  provider: Omit<CustomProvider, 'id' | 'createdAt'>
): CustomProvider {
  const settings = loadSettings();
  const newProvider: CustomProvider = {
    ...provider,
    id: `custom-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    createdAt: new Date().toISOString(),
  };
  settings.customProviders.push(newProvider);
  saveSettings(settings);
  return newProvider;
}

/** 更新自定义 Provider */
export function updateCustomProvider(
  id: string,
  updates: Partial<CustomProvider>
): CustomProvider | null {
  const settings = loadSettings();
  const idx = settings.customProviders.findIndex((p) => p.id === id);
  if (idx === -1) return null;
  settings.customProviders[idx] = { ...settings.customProviders[idx], ...updates };
  saveSettings(settings);
  return settings.customProviders[idx];
}

/** 删除自定义 Provider */
export function removeCustomProvider(id: string): boolean {
  const settings = loadSettings();
  const idx = settings.customProviders.findIndex((p) => p.id === id);
  if (idx === -1) return false;
  settings.customProviders.splice(idx, 1);
  saveSettings(settings);
  return true;
}
