'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Trash, Download, Upload, Plus, Code, ToggleLeft, ToggleRight } from '@phosphor-icons/react';
import { loadSettings, saveSettings, getCustomProviders, removeCustomProvider } from '@/lib/settings';
import type { CustomProvider } from '@/types/providers';
import CustomProviderForm from './CustomProviderForm';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SettingsPanel({ isOpen, onClose }: SettingsPanelProps) {
  const [devMode, setDevMode] = useState(false);
  const [providers, setProviders] = useState<CustomProvider[]>([]);
  const [showAddProvider, setShowAddProvider] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setProviders(getCustomProviders());
      // 从 localStorage 读取 devMode（可选，如果没有则默认 false）
      const stored = localStorage.getItem('ai-content-factory-devmode');
      setDevMode(stored === 'true');
    }
  }, [isOpen]);

  const toggleDevMode = () => {
    const next = !devMode;
    setDevMode(next);
    localStorage.setItem('ai-content-factory-devmode', String(next));
  };

  const handleDeleteProvider = (id: string) => {
    removeCustomProvider(id);
    setProviders(getCustomProviders());
  };

  const handleClearHistory = () => {
    if (confirm('确定清除所有生成历史？此操作不可撤销。')) {
      localStorage.removeItem('ai-content-factory-history');
      window.dispatchEvent(new Event('storage')); // 通知其他组件刷新
      alert('历史记录已清除');
    }
  };

  const handleExportSettings = () => {
    const settings = loadSettings();
    const blob = new Blob([JSON.stringify(settings, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'aicf-settings.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportSettings = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      try {
        const text = await file.text();
        const settings = JSON.parse(text);
        if (settings.customProviders && Array.isArray(settings.customProviders)) {
          saveSettings(settings);
          setProviders(settings.customProviders);
          alert('设置导入成功');
        } else {
          alert('无效的配置文件格式');
        }
      } catch (err) {
        alert('导入失败: ' + (err as Error).message);
      }
    };
    input.click();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 z-50"
          onClick={onClose}
        >
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="absolute right-0 top-0 h-full w-80 bg-surface border-l border-border shadow-xl overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-surface/95 backdrop-blur border-b border-border p-4 flex items-center justify-between z-10">
              <h2 className="font-semibold text-lg">设置</h2>
              <button onClick={onClose} className="p-1 hover:bg-surface-elevated rounded">
                <X size={20} />
              </button>
            </div>

            <div className="p-4 space-y-6">
              {/* 开发者模式 */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Code size={18} />
                    <span className="font-medium">开发者模式</span>
                  </div>
                  <button
                    onClick={toggleDevMode}
                    className={`p-1 rounded transition-colors ${devMode ? 'text-accent' : 'text-zinc-500'}`}
                  >
                    {devMode ? <ToggleRight size={24} weight="fill" /> : <ToggleLeft size={24} />}
                  </button>
                </div>
                <p className="text-xs text-zinc-500">
                  开启后显示调试信息、技术指标等
                </p>
                {devMode && (
                  <div className="mt-3 p-3 rounded-lg bg-accent/5 border border-accent/20 text-xs font-mono text-accent space-y-1">
                    <div>Model: {import.meta.env.VITE_ACTIVE_PROVIDER || 'default'}</div>
                    <div>Build: {new Date(import.meta.env.VITE_BUILD_TIME || Date.now()).toLocaleString()}</div>
                    <div>Version: 1.0.0-commercial</div>
                  </div>
                )}
              </div>

              {/* 自定义 Provider 管理 */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="font-medium">自定义 API Provider</span>
                  <button
                    onClick={() => setShowAddProvider(true)}
                    className="flex items-center gap-1 px-2 py-1 text-xs bg-accent/10 text-accent rounded hover:bg-accent/20 transition-colors"
                  >
                    <Plus size={14} /> 添加
                  </button>
                </div>
                {providers.length === 0 ? (
                  <p className="text-sm text-zinc-500">暂无自定义 Provider</p>
                ) : (
                  <div className="space-y-2">
                    {providers.map((p) => (
                      <div key={p.id} className="flex items-center justify-between p-3 rounded-lg bg-surface-elevated border border-border">
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm truncate">{p.name}</div>
                          <div className="text-xs text-zinc-500 truncate">{p.baseUrl} / {p.defaultModel}</div>
                        </div>
                        <button
                          onClick={() => handleDeleteProvider(p.id)}
                          className="p-1.5 text-zinc-500 hover:text-red-500 transition-colors"
                          title="删除"
                        >
                          <Trash size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 添加 Provider 模态框 */}
              <AnimatePresence>
                {showAddProvider && (
                  <CustomProviderForm
                    isOpen={showAddProvider}
                    onClose={() => setShowAddProvider(false)}
                    onAdded={(p) => {
                      setProviders(getCustomProviders());
                      setShowAddProvider(false);
                    }}
                  />
                )}
              </AnimatePresence>

              {/* 数据操作 */}
              <div>
                <span className="font-medium block mb-3">数据操作</span>
                <div className="space-y-2">
                  <button
                    onClick={handleClearHistory}
                    className="flex items-center gap-2 w-full p-3 rounded-lg bg-surface-elevated border border-border hover:border-red-500/50 hover:text-red-500 transition-colors text-sm"
                  >
                    <Trash size={16} />
                    清除生成历史
                  </button>
                  <button
                    onClick={handleExportSettings}
                    className="flex items-center gap-2 w-full p-3 rounded-lg bg-surface-elevated border border-border hover:border-accent/50 hover:text-accent transition-colors text-sm"
                  >
                    <Download size={16} />
                    导出设置
                  </button>
                  <button
                    onClick={handleImportSettings}
                    className="flex items-center gap-2 w-full p-3 rounded-lg bg-surface-elevated border border-border hover:border-accent/50 hover:text-accent transition-colors text-sm"
                  >
                    <Upload size={16} />
                    导入设置
                  </button>
                </div>
              </div>

              {/* 应用信息 */}
              <div className="pt-4 border-t border-border text-xs text-zinc-500 space-y-1">
                <div>AI Content Factory</div>
                <div>Commercial Edition v1.0.0</div>
                <div>Built with Next.js 16 + Tailwind v4</div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
