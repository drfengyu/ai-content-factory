import type {
  AppearancePreferences,
  CustomProvider,
  GenerationPreferences,
  UserSettings,
} from '@/types/providers';

const STORAGE_KEY = 'ai-content-factory-settings';

/** 默认设置 */
const DEFAULT_SETTINGS: UserSettings = {
  customProviders: [],
  preferences: {
    defaultTone: '专业',
    defaultLength: '标准',
    defaultExportFormat: 'md',
  },
  appearance: {
    theme: 'dark',
  },
};

/** 合并默认值，避免老用户读到部分缺失字段 */
function withDefaults(raw: Partial<UserSettings>): UserSettings {
  return {
    customProviders: raw.customProviders ?? [],
    preferences: { ...DEFAULT_SETTINGS.preferences, ...(raw.preferences ?? {}) },
    appearance: { ...DEFAULT_SETTINGS.appearance, ...(raw.appearance ?? {}) },
  };
}

// ===== 缓存与 useSyncExternalStore 兼容的 snapshot =====
// 避免 setState-in-effect lint 错误，让组件可以直接通过 useSyncExternalStore 订阅。
let cachedRaw: string | null = null;
let cachedSnapshot: UserSettings = DEFAULT_SETTINGS;

function readSettingsSnapshot(): UserSettings {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS;
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw === cachedRaw) return cachedSnapshot;
  if (!raw) {
    cachedRaw = null;
    cachedSnapshot = DEFAULT_SETTINGS;
    return cachedSnapshot;
  }
  try {
    cachedSnapshot = withDefaults(JSON.parse(raw) as Partial<UserSettings>);
    cachedRaw = raw;
  } catch {
    cachedRaw = null;
    cachedSnapshot = DEFAULT_SETTINGS;
  }
  return cachedSnapshot;
}

/** 从 localStorage 加载用户设置（每次都重新解析） */
export function loadSettings(): UserSettings {
  return readSettingsSnapshot();
}

/** 同步读取当前 settings 快照，配合 useSyncExternalStore 使用 */
export function getSettingsSnapshot(): UserSettings {
  return readSettingsSnapshot();
}

/** SSR snapshot：服务端永远返回默认值，避免 hydration mismatch */
export function getSettingsServerSnapshot(): UserSettings {
  return DEFAULT_SETTINGS;
}

/** 保存用户设置到 localStorage 并通知订阅者 */
export function saveSettings(settings: UserSettings): void {
  if (typeof window === 'undefined') return;
  const next = JSON.stringify(settings);
  localStorage.setItem(STORAGE_KEY, next);
  cachedRaw = next;
  cachedSnapshot = settings;
  notifySubscribers();
}

// ===== 订阅机制 =====
type Listener = () => void;
const listeners = new Set<Listener>();

function notifySubscribers(): void {
  listeners.forEach((fn) => {
    try {
      fn();
    } catch (err) {
      console.error('settings subscriber error', err);
    }
  });
}

/** 订阅 settings 变化，兼容 useSyncExternalStore 与回调用法 */
export function subscribeSettings(listener: Listener): () => void {
  if (typeof window === 'undefined') return () => {};
  listeners.add(listener);

  // 跨标签同步：其他标签写 localStorage 时也通知本标签
  const onStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY) {
      // 失效缓存，让下次读取走 localStorage
      cachedRaw = null;
      listener();
    }
  };
  window.addEventListener('storage', onStorage);

  return () => {
    listeners.delete(listener);
    window.removeEventListener('storage', onStorage);
  };
}

// ===== 自定义 Provider =====

/** 获取所有自定义 Provider */
export function getCustomProviders(): CustomProvider[] {
  return readSettingsSnapshot().customProviders;
}

/** 添加自定义 Provider */
export function addCustomProvider(
  provider: Omit<CustomProvider, 'id' | 'createdAt'>
): CustomProvider {
  const settings = readSettingsSnapshot();
  const newProvider: CustomProvider = {
    ...provider,
    id: `custom-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    createdAt: new Date().toISOString(),
  };
  saveSettings({
    ...settings,
    customProviders: [...settings.customProviders, newProvider],
  });
  return newProvider;
}

/** 更新自定义 Provider */
export function updateCustomProvider(
  id: string,
  updates: Partial<CustomProvider>
): CustomProvider | null {
  const settings = readSettingsSnapshot();
  const idx = settings.customProviders.findIndex((p) => p.id === id);
  if (idx === -1) return null;
  const updated: CustomProvider = { ...settings.customProviders[idx], ...updates };
  const nextProviders = [...settings.customProviders];
  nextProviders[idx] = updated;
  saveSettings({ ...settings, customProviders: nextProviders });
  return updated;
}

/** 删除自定义 Provider */
export function removeCustomProvider(id: string): boolean {
  const settings = readSettingsSnapshot();
  const idx = settings.customProviders.findIndex((p) => p.id === id);
  if (idx === -1) return false;
  const nextProviders = settings.customProviders.filter((p) => p.id !== id);
  saveSettings({ ...settings, customProviders: nextProviders });
  return true;
}

// ===== 偏好 =====

export function getPreferences(): GenerationPreferences {
  return readSettingsSnapshot().preferences ?? DEFAULT_SETTINGS.preferences!;
}

export function updatePreferences(updates: Partial<GenerationPreferences>): GenerationPreferences {
  const settings = readSettingsSnapshot();
  const nextPrefs = { ...settings.preferences, ...updates };
  saveSettings({ ...settings, preferences: nextPrefs });
  return nextPrefs;
}

export function getAppearance(): AppearancePreferences {
  return readSettingsSnapshot().appearance ?? DEFAULT_SETTINGS.appearance!;
}

export function updateAppearance(updates: Partial<AppearancePreferences>): AppearancePreferences {
  const settings = readSettingsSnapshot();
  const nextAppearance = { ...settings.appearance, ...updates };
  saveSettings({ ...settings, appearance: nextAppearance });
  return nextAppearance;
}

