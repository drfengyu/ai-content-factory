'use client';

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ContentType } from '@/types';
import { Templates } from './Templates';
import { Template } from '@/data/templates';
import { Platform } from '@/types';
import {
  ArrowRight,
  MagicWand,
} from '@phosphor-icons/react';

interface GenerateFormProps {
  platform: Platform | null;
  contentType: ContentType;
  onGenerate: (params: {
    topic: string;
    keywords: string;
    tone: string;
    length: string;
    extraPrompt: string;
  }) => void;
  loading: boolean;
}

const TONES = ['自然', '直接', '专业', '克制', '成交'];
const LENGTHS = ['轻量', '标准', '完整'];

export function GenerateForm({ platform, onGenerate, loading }: GenerateFormProps) {
  const [topic, setTopic] = useState('');
  const [keywords, setKeywords] = useState('');
  const [tone, setTone] = useState('专业');
  const [length, setLength] = useState('标准');
  const [extraPrompt, setExtraPrompt] = useState('');

  const handleTemplateSelect = (template: Template) => {
    setTopic(template.topic);
    setKeywords(template.keywords);
    setTone(template.tone);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;
    onGenerate({ topic, keywords, tone, length, extraPrompt });
  };

  if (loading) {
    return <GenerateFormSkeleton />;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Templates */}
      <Templates platform={platform} onSelect={handleTemplateSelect} />

      {/* Topic */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium">
          项目能力 / 服务方向 <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="例：用 AI 帮商家生成小红书笔记、抖音脚本、公众号文章"
          className="w-full px-4 py-2.5 rounded-xl border border-border-subtle bg-background
                     text-sm text-foreground placeholder:text-zinc-400 dark:placeholder:text-zinc-500
                     focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent
                     transition-all"
          required
        />
      </div>

      {/* Keywords */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium">目标客户 / 已有资源</label>
        <input
          type="text"
          value={keywords}
          onChange={(e) => setKeywords(e.target.value)}
          placeholder="例：本地商家、朋友圈熟人、小红书新手博主"
          className="w-full px-4 py-2.5 rounded-xl border border-border-subtle bg-background
                     text-sm text-foreground placeholder:text-zinc-400 dark:placeholder:text-zinc-500
                     focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent
                     transition-all"
        />
      </div>

      {/* Tone + Length in a 2-col grid (taste-skill: grid over flex-math) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-sm font-medium">成交语气</label>
          <div className="flex flex-wrap gap-1.5">
            {TONES.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTone(t)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all active:scale-[0.97] ${
                  tone === t
                    ? 'bg-accent text-white'
                    : 'bg-surface-elevated text-zinc-500 dark:text-zinc-400 hover:text-foreground'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium">方案复杂度</label>
          <div className="flex gap-1.5">
            {LENGTHS.map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => setLength(l)}
                className={`flex-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all active:scale-[0.97] ${
                  length === l
                    ? 'bg-accent text-white'
                    : 'bg-surface-elevated text-zinc-500 dark:text-zinc-400 hover:text-foreground'
                }`}
              >
                {l}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Extra Prompt */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium">补充要求</label>
        <textarea
          value={extraPrompt}
          onChange={(e) => setExtraPrompt(e.target.value)}
          placeholder="例：第一单先卖 199 元、只通过微信成交、不要做支付系统"
          rows={3}
          className="w-full px-4 py-2.5 rounded-xl border border-border-subtle bg-background
                     text-sm text-foreground placeholder:text-zinc-400 dark:placeholder:text-zinc-500
                     focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent
                     transition-all resize-none"
        />
      </div>

      {/* Submit */}
      <motion.button
        type="submit"
        disabled={!topic.trim()}
        whileTap={{ scale: 0.98 }}
        className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all ${
          !topic.trim()
            ? 'bg-surface-elevated text-zinc-400 dark:text-zinc-500 cursor-not-allowed'
            : 'bg-accent text-white hover:brightness-110 shadow-sm'
        }`}
      >
        <MagicWand size={16} weight="fill" />
        生成首单方案
        <ArrowRight size={16} weight="bold" />
      </motion.button>
    </form>
  );
}

function GenerateFormSkeleton() {
  return (
    <div className="space-y-5">
      <div className="flex gap-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="skeleton h-7 w-20" />
        ))}
      </div>
      <div className="space-y-1.5">
        <div className="skeleton h-4 w-24" />
        <div className="skeleton h-10 w-full" />
      </div>
      <div className="space-y-1.5">
        <div className="skeleton h-4 w-16" />
        <div className="skeleton h-10 w-full" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <div className="skeleton h-4 w-16" />
          <div className="flex gap-1.5">
            {[1, 2, 3].map((i) => (
              <div key={i} className="skeleton h-7 flex-1" />
            ))}
          </div>
        </div>
        <div className="space-y-1.5">
          <div className="skeleton h-4 w-16" />
          <div className="flex gap-1.5">
            {[1, 2, 3].map((i) => (
              <div key={i} className="skeleton h-7 flex-1" />
            ))}
          </div>
        </div>
      </div>
      <div className="skeleton h-20 w-full" />
      <div className="skeleton h-11 w-full" />
    </div>
  );
}
