'use client';

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X } from '@phosphor-icons/react';
import { addCustomProvider } from '@/lib/settings';
import type { CustomProvider } from '@/types/providers';

interface CustomProviderFormProps {
  isOpen: boolean;
  onClose: () => void;
  onAdded: (provider: CustomProvider) => void;
}

export default function CustomProviderForm({ isOpen, onClose, onAdded }: CustomProviderFormProps) {
  const [name, setName] = useState('');
  const [baseUrl, setBaseUrl] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [type, setType] = useState<'openai' | 'anthropic' | 'gemini'>('openai');
  const [models, setModels] = useState('');
  const [defaultModel, setDefaultModel] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !baseUrl || !apiKey || !defaultModel) return;

    const provider = addCustomProvider({
      name,
      baseUrl,
      apiKey,
      type,
      models: models ? models.split(',').map(m => m.trim()) : [defaultModel],
      defaultModel,
    });
    onAdded(provider);
    reset();
    onClose();
  };

  const reset = () => {
    setName('');
    setBaseUrl('');
    setApiKey('');
    setModels('');
    setDefaultModel('');
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-surface border border-border rounded-xl shadow-xl w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="font-semibold">添加自定义 Provider</h2>
          <button onClick={onClose} className="p-1 hover:bg-surface-elevated rounded">
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">名称</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2 rounded-lg bg-background border border-border focus:border-accent outline-none"
              placeholder="如 DeepSeek"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Base URL</label>
            <input
              type="url"
              value={baseUrl}
              onChange={(e) => setBaseUrl(e.target.value)}
              className="w-full p-2 rounded-lg bg-background border border-border focus:border-accent outline-none"
              placeholder="https://api.deepseek.com"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">API Key</label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="w-full p-2 rounded-lg bg-background border border-border focus:border-accent outline-none"
              placeholder="sk-..."
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">接口类型</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as 'openai' | 'anthropic' | 'gemini')}
              className="w-full p-2 rounded-lg bg-background border border-border focus:border-accent outline-none"
            >
              <option value="openai">OpenAI 兼容</option>
              <option value="anthropic">Anthropic</option>
              <option value="gemini">Gemini</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">可用模型（逗号分隔）</label>
            <input
              type="text"
              value={models}
              onChange={(e) => setModels(e.target.value)}
              className="w-full p-2 rounded-lg bg-background border border-border focus:border-accent outline-none"
              placeholder="deepseek-chat, deepseek-coder"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">默认模型</label>
            <input
              type="text"
              value={defaultModel}
              onChange={(e) => setDefaultModel(e.target.value)}
              className="w-full p-2 rounded-lg bg-background border border-border focus:border-accent outline-none"
              placeholder="deepseek-chat"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full py-2.5 rounded-lg bg-accent text-white font-medium hover:bg-accent/90 transition-colors"
          >
            添加 Provider
          </button>
        </form>
      </motion.div>
    </motion.div>
  );
}
