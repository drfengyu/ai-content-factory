'use client';

import React, { useEffect, useState, useSyncExternalStore } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Gear,
  X,
  Plus,
  TrashSimple,
  CheckCircle,
  WarningCircle,
  Sliders,
  Plug,
  DownloadSimple,
} from '@phosphor-icons/react';
import {
  removeCustomProvider,
  updatePreferences,
  getSettingsSnapshot,
  getSettingsServerSnapshot,
  subscribeSettings,
} from '@/lib/settings';
import type { CustomProvider, GenerationPreferences } from '@/types/providers';
import CustomProviderForm from './CustomProviderForm';

type Section = 'providers' | 'preferences' | 'export';

const TONES = ['自然', '直接', '专业', '克制', '活泼', '种草', '干货'];
const LENGTHS = ['轻量', '标准', '完整'];
const FORMATS: Array<{ value: 'txt' | 'md' | 'html'; label: string }> = [
  { value: 'md', label: 'Markdown (.md)' },
  { value: 'txt', label: '纯文本 (.txt)' },
  { value: 'html', label: 'HTML (.html)' },
];

export function SettingsPanel() {
  const [open, setOpen] = useState(false);
  const [section, setSection] = useState<Section>('providers');
  const [providerFormOpen, setProviderFormOpen] = useState(false);

  // 通过外部 store 订阅 settings，避免 setState-in-effect 反模式
  const settings = useSyncExternalStore(
    subscribeSettings,
    getSettingsSnapshot,
    getSettingsServerSnapshot,
  );
  const customProviders = settings.customProviders;
  const preferences = settings.preferences ?? {};

  // Esc 关闭弹层（CustomProviderForm 打开时优先关掉子弹层）
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (providerFormOpen) setProviderFormOpen(false);
        else setOpen(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, providerFormOpen]);

  const handleRemoveProvider = (id: string, name: string) => {
    if (!confirm(`确定删除自定义 Provider「${name}」？`)) return;
    removeCustomProvider(id);
  };

  const handlePrefChange = (patch: Partial<GenerationPreferences>) => {
    updatePreferences(patch);
  };

  return (
    <>
      <motion.button
        whileTap={{ scale: 0.98 }}
        onClick={() => setOpen(true)}
        aria-label="打开设置"
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-medium bg-surface-elevated text-zinc-400 hover:text-accent hover:bg-accent/10 border border-border-subtle hover:border-accent/30 transition-all"
      >
        <Gear size={11} weight="bold" />
        设置
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 flex items-center justify-center p-4"
            onClick={() => setOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 12 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 12 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="bg-surface border border-border-subtle rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Sidebar */}
              <aside className="w-44 shrink-0 border-r border-border-subtle bg-background/50 p-3 space-y-1 overflow-y-auto">
                <div className="flex items-center gap-2 px-2 py-2 text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                  <Gear size={12} weight="fill" />
                  设置
                </div>
                <SidebarItem
                  active={section === 'providers'}
                  onClick={() => setSection('providers')}
                  icon={<Plug size={14} weight="regular" />}
                  label="Provider 与模型"
                  badge={customProviders.length > 0 ? String(customProviders.length) : undefined}
                />
                <SidebarItem
                  active={section === 'preferences'}
                  onClick={() => setSection('preferences')}
                  icon={<Sliders size={14} weight="regular" />}
                  label="生成偏好"
                />
                <SidebarItem
                  active={section === 'export'}
                  onClick={() => setSection('export')}
                  icon={<DownloadSimple size={14} weight="regular" />}
                  label="导出与外观"
                />
              </aside>

              {/* Body */}
              <div className="flex-1 min-w-0 flex flex-col">
                <header className="flex items-center justify-between px-6 py-4 border-b border-border-subtle">
                  <h2 className="text-sm font-semibold text-foreground">
                    {section === 'providers' && 'Provider 与模型'}
                    {section === 'preferences' && '生成偏好'}
                    {section === 'export' && '导出与外观'}
                  </h2>
                  <button
                    onClick={() => setOpen(false)}
                    aria-label="关闭设置"
                    className="p-1.5 rounded-lg hover:bg-surface-elevated text-zinc-400 transition-colors"
                  >
                    <X size={16} />
                  </button>
                </header>

                <div className="flex-1 overflow-y-auto px-6 py-5">
                  {section === 'providers' && (
                    <ProviderSection
                      providers={customProviders}
                      onAdd={() => setProviderFormOpen(true)}
                      onRemove={handleRemoveProvider}
                    />
                  )}
                  {section === 'preferences' && (
                    <PreferencesSection
                      preferences={preferences}
                      onChange={handlePrefChange}
                    />
                  )}
                  {section === 'export' && (
                    <ExportSection
                      preferences={preferences}
                      onChange={handlePrefChange}
                    />
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <CustomProviderForm
        isOpen={providerFormOpen}
        onClose={() => setProviderFormOpen(false)}
        onAdded={() => {
          // settings 已通过 subscribe 自动刷新 customProviders
          setProviderFormOpen(false);
        }}
      />
    </>
  );
}

// ===== Sidebar 项 =====

function SidebarItem({
  active,
  onClick,
  icon,
  label,
  badge,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  badge?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs font-medium transition-all text-left ${
        active
          ? 'bg-accent/10 text-accent'
          : 'text-zinc-400 hover:text-foreground hover:bg-surface-elevated'
      }`}
    >
      {icon}
      <span className="flex-1">{label}</span>
      {badge && (
        <span className="text-[10px] px-1.5 py-0.5 rounded bg-accent/10 text-accent">
          {badge}
        </span>
      )}
    </button>
  );
}

// ===== Provider 分区 =====

function ProviderSection({
  providers,
  onAdd,
  onRemove,
}: {
  providers: CustomProvider[];
  onAdd: () => void;
  onRemove: (id: string, name: string) => void;
}) {
  return (
    <div className="space-y-5">
      <SectionDescription>
        除了内置 Provider，你可以接入任何 OpenAI / Anthropic / Gemini 兼容的接口。
        API Key 仅保存在本地浏览器，不会上传服务器。
      </SectionDescription>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
            自定义 Provider
          </span>
          <button
            onClick={onAdd}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-accent text-white hover:brightness-110 transition-all"
          >
            <Plus size={12} weight="bold" />
            添加
          </button>
        </div>

        {providers.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border-subtle p-6 text-center">
            <p className="text-sm text-zinc-400">还没有自定义 Provider</p>
            <p className="text-[11px] text-zinc-500 mt-1">
              点击「添加」接入你自己的 API 地址
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {providers.map((p) => (
              <ProviderRow key={p.id} provider={p} onRemove={onRemove} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ProviderRow({
  provider,
  onRemove,
}: {
  provider: CustomProvider;
  onRemove: (id: string, name: string) => void;
}) {
  const configured = Boolean(provider.apiKey && provider.baseUrl && provider.defaultModel);
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl border border-border-subtle bg-background hover:border-accent/30 transition-all">
      <div className="flex-shrink-0">
        {configured ? (
          <CheckCircle size={16} className="text-emerald-500" weight="fill" />
        ) : (
          <WarningCircle size={16} className="text-amber-500" weight="fill" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">{provider.name}</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-surface-elevated text-zinc-400 uppercase">
            {provider.type}
          </span>
        </div>
        <p className="text-[11px] text-zinc-500 mt-0.5 truncate">
          {provider.baseUrl} · {provider.defaultModel}
        </p>
      </div>
      <button
        onClick={() => onRemove(provider.id, provider.name)}
        className="p-1.5 rounded-lg hover:bg-red-500/10 text-zinc-400 hover:text-red-500 transition-all"
        aria-label={`删除 ${provider.name}`}
        title="删除"
      >
        <TrashSimple size={14} />
      </button>
    </div>
  );
}

// ===== 偏好分区 =====

function PreferencesSection({
  preferences,
  onChange,
}: {
  preferences: GenerationPreferences;
  onChange: (patch: Partial<GenerationPreferences>) => void;
}) {
  return (
    <div className="space-y-6">
      <SectionDescription>
        设置生成表单的默认值，每次打开都会自动填入。可以在生成时单独调整。
      </SectionDescription>

      <ChipGroup
        label="默认语气"
        options={TONES}
        value={preferences.defaultTone}
        onChange={(v) => onChange({ defaultTone: v })}
      />

      <ChipGroup
        label="默认复杂度"
        options={LENGTHS}
        value={preferences.defaultLength}
        onChange={(v) => onChange({ defaultLength: v })}
      />
    </div>
  );
}

// ===== 导出与外观 =====

function ExportSection({
  preferences,
  onChange,
}: {
  preferences: GenerationPreferences;
  onChange: (patch: Partial<GenerationPreferences>) => void;
}) {
  return (
    <div className="space-y-6">
      <SectionDescription>
        设置默认导出格式，结果页一键导出时会优先使用这个格式。
      </SectionDescription>

      <div className="space-y-2">
        <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
          默认导出格式
        </label>
        <div className="space-y-1.5">
          {FORMATS.map((f) => (
            <label
              key={f.value}
              className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                preferences.defaultExportFormat === f.value
                  ? 'border-accent bg-accent/5'
                  : 'border-border-subtle hover:border-accent/30'
              }`}
            >
              <input
                type="radio"
                name="export-format"
                value={f.value}
                checked={preferences.defaultExportFormat === f.value}
                onChange={() => onChange({ defaultExportFormat: f.value })}
                className="accent-accent"
              />
              <span className="text-sm">{f.label}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="space-y-2 opacity-60">
        <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
          外观
        </label>
        <div className="rounded-xl border border-border-subtle p-3 text-xs text-zinc-500">
          当前固定为深色主题，亮色模式在后续版本提供。
        </div>
      </div>
    </div>
  );
}

// ===== 通用小组件 =====

function SectionDescription({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs leading-relaxed text-zinc-400">{children}</p>
  );
}

function ChipGroup({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: string[];
  value: string | undefined;
  onChange: (v: string) => void;
}) {
  return (
    <div className="space-y-2">
      <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
        {label}
      </label>
      <div className="flex flex-wrap gap-1.5">
        {options.map((opt) => (
          <button
            key={opt}
            type="button"
            onClick={() => onChange(opt)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all active:scale-[0.97] ${
              value === opt
                ? 'bg-accent text-white'
                : 'bg-surface-elevated text-zinc-400 hover:text-foreground'
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}
