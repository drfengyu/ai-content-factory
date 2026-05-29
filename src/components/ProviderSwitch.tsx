'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowsLeftRight, CaretDown, Check, WarningCircle } from '@phosphor-icons/react';

export interface ProviderInfo {
  id: string;
  name: string;
  type: string;
  defaultModel: string;
  models: string[];
  configured: boolean;
  apiKeyEnv: string;
  description: string;
}

const PROVIDER_STORAGE_KEY = 'ai-content-factory-provider';
const MODEL_STORAGE_PREFIX = 'ai-content-factory-model';

export function getStoredProvider(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(PROVIDER_STORAGE_KEY);
}

export function setStoredProvider(id: string) {
  localStorage.setItem(PROVIDER_STORAGE_KEY, id);
}

function getStoredModel(providerId: string): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(`${MODEL_STORAGE_PREFIX}-${providerId}`);
}

function setStoredModel(providerId: string, modelId: string) {
  localStorage.setItem(`${MODEL_STORAGE_PREFIX}-${providerId}`, modelId);
}

function resolveInitialModel(provider: ProviderInfo, preferredModel?: string): string {
  const stored = getStoredModel(provider.id);
  if (stored && provider.models.includes(stored)) return stored;
  if (preferredModel && provider.models.includes(preferredModel)) return preferredModel;
  return provider.defaultModel || provider.models[0] || '';
}

interface ProviderSwitchProps {
  onProviderChange?: (providerId: string, modelId: string | null) => void;
}

export function ProviderSwitch({ onProviderChange }: ProviderSwitchProps) {
  const [providers, setProviders] = useState<ProviderInfo[]>([]);
  const [activeId, setActiveId] = useState<string>('');
  const [activeModel, setActiveModel] = useState<string>('');
  const [open, setOpen] = useState(false);
  const onProviderChangeRef = useRef(onProviderChange);

  useEffect(() => {
    onProviderChangeRef.current = onProviderChange;
  }, [onProviderChange]);

  useEffect(() => {
    fetch('/api/providers')
      .then((r) => r.json())
      .then((data) => {
        const providerList: ProviderInfo[] = data.providers || [];
        setProviders(providerList);

        // 优先使用 localStorage 存储的，其次用后端返回的 active
        const stored = getStoredProvider();
        const initial = stored && providerList.find((p) => p.id === stored)
          ? stored
          : data.active || providerList[0]?.id || 'deepseek';
        const initialProvider = providerList.find((p) => p.id === initial) || providerList[0];
        const initialModel = initialProvider ? resolveInitialModel(initialProvider, data.activeModel) : '';

        setActiveId(initial);
        setActiveModel(initialModel);
        if (initialProvider) {
          onProviderChangeRef.current?.(initialProvider.id, initialModel || null);
        }
      })
      .catch(() => {});
  }, []);

  const active = providers.find((p) => p.id === activeId);

  const handleSelect = (id: string) => {
    const provider = providers.find((p) => p.id === id);
    if (!provider) return;
    const nextModel = resolveInitialModel(provider);

    setActiveId(id);
    setActiveModel(nextModel);
    setStoredProvider(id);
    if (nextModel) setStoredModel(id, nextModel);
    onProviderChange?.(id, nextModel || null);
  };

  const handleModelChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const nextModel = event.currentTarget.value;
    setActiveModel(nextModel);
    if (activeId) {
      setStoredModel(activeId, nextModel);
      onProviderChange?.(activeId, nextModel);
    }
  };

  if (providers.length === 0) return null;

  const isConfigured = active?.configured ?? false;

  return (
    <div className="relative">
      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-medium
                   bg-surface-elevated text-zinc-500 dark:text-zinc-400
                   hover:text-accent hover:bg-accent/10 border border-border-subtle
                   hover:border-accent/30 transition-all"
      >
        <span
          className={`h-1.5 w-1.5 rounded-full ${
            isConfigured ? 'bg-emerald-500' : 'bg-amber-500'
          }`}
        />
        <ArrowsLeftRight size={11} weight="bold" />
        <span>{active?.name || activeId}</span>
        {active && (
          <span className="text-[10px] text-zinc-400 ml-0.5 hidden sm:inline">
            {activeModel || active.defaultModel}
          </span>
        )}
        <CaretDown size={10} weight="bold" className={open ? 'rotate-180 transition-transform' : 'transition-transform'} />
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-1.5 w-80 rounded-xl border border-border-subtle
                       bg-surface shadow-lg z-50 overflow-hidden"
          >
            <div className="flex items-center justify-between gap-3 px-3 py-2 border-b border-border-subtle">
              <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400">API 提供商</span>
              {active && (
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${
                    active.configured
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                      : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                  }`}
                >
                  {!active.configured && <WarningCircle size={10} weight="fill" />}
                  {active.configured ? '已配置' : `缺 ${active.apiKeyEnv}`}
                </span>
              )}
            </div>
            <div className="py-1 max-h-56 overflow-y-auto">
              {providers.map((p) => (
                <button
                  key={p.id}
                  onClick={() => handleSelect(p.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 text-left transition-all hover:bg-surface-elevated ${
                    activeId === p.id ? 'bg-accent/[0.03]' : ''
                  }`}
                >
                  <div className={`flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                    activeId === p.id ? 'border-accent bg-accent' : 'border-zinc-300 dark:border-zinc-600'
                  }`}>
                    {activeId === p.id && <Check size={10} weight="bold" className="text-white" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-medium">{p.name}</span>
                      <span className="text-[10px] px-1 py-0.5 rounded bg-surface-elevated text-zinc-400 uppercase">
                        {p.type}
                      </span>
                      <span
                        className={`ml-auto h-1.5 w-1.5 rounded-full ${
                          p.configured ? 'bg-emerald-500' : 'bg-amber-500'
                        }`}
                        title={p.configured ? '已配置' : `缺少 ${p.apiKeyEnv}`}
                      />
                    </div>
                    <p className="text-[11px] text-zinc-400 truncate mt-0.5">
                      {p.models.slice(0, 2).join(' / ')}
                      {p.models.length > 2 ? '…' : ''}
                    </p>
                  </div>
                </button>
              ))}
            </div>
            {active && (
              <div className="space-y-2 border-t border-border-subtle px-3 py-3">
                <label className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400">
                  模型
                </label>
                <select
                  value={activeModel || active.defaultModel}
                  onChange={handleModelChange}
                  className="w-full rounded-lg border border-border-subtle bg-background px-3 py-2 text-xs text-foreground
                             focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent"
                >
                  {active.models.map((model) => (
                    <option key={model} value={model}>
                      {model}
                    </option>
                  ))}
                </select>
                {active.description && (
                  <p className="text-[11px] leading-relaxed text-zinc-400">
                    {active.description}
                  </p>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
