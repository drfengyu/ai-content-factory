'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowsLeftRight, Check } from '@phosphor-icons/react';

export interface ProviderInfo {
  id: string;
  name: string;
  type: string;
  defaultModel: string;
  models: string[];
  description: string;
}

const STORAGE_KEY = 'ai-content-factory-provider';

export function getStoredProvider(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(STORAGE_KEY);
}

export function setStoredProvider(id: string) {
  localStorage.setItem(STORAGE_KEY, id);
}

interface ProviderSwitchProps {
  onProviderChange?: (id: string) => void;
}

export function ProviderSwitch({ onProviderChange }: ProviderSwitchProps) {
  const [providers, setProviders] = useState<ProviderInfo[]>([]);
  const [activeId, setActiveId] = useState<string>('');
  const [open, setOpen] = useState(false);

  useEffect(() => {
    fetch('/api/providers')
      .then((r) => r.json())
      .then((data) => {
        setProviders(data.providers || []);
        // 优先使用 localStorage 存储的，其次用后端返回的 active
        const stored = getStoredProvider();
        const initial = stored && data.providers?.find((p: ProviderInfo) => p.id === stored)
          ? stored
          : data.active || data.providers?.[0]?.id || 'deepseek';
        setActiveId(initial);
      })
      .catch(() => {});
  }, []);

  const active = providers.find((p) => p.id === activeId);

  const handleSelect = (id: string) => {
    setActiveId(id);
    setStoredProvider(id);
    setOpen(false);
    onProviderChange?.(id);
  };

  if (providers.length === 0) return null;

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
        <ArrowsLeftRight size={11} weight="bold" />
        <span>{active?.name || activeId}</span>
        {active && (
          <span className="text-[10px] text-zinc-400 ml-0.5 hidden sm:inline">
            {active.defaultModel}
          </span>
        )}
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-1.5 w-64 rounded-xl border border-border-subtle
                       bg-surface shadow-lg z-50 overflow-hidden"
          >
            <div className="px-3 py-2 border-b border-border-subtle">
              <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400">切换 API 提供商</span>
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
                    </div>
                    <p className="text-[11px] text-zinc-400 truncate mt-0.5">
                      {p.models.slice(0, 2).join(' / ')}
                      {p.models.length > 2 ? '…' : ''}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
