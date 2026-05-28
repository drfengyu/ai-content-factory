'use client';

import React, { useState } from 'react';
import { ContentType } from '@/types';
import { Templates } from './Templates';
import { Template } from '@/data/templates';
import { Platform } from '@/types';

interface GenerateFormProps {
  platform: Platform;
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

const TONES = ['种草', '活泼', '专业', '干货', '故事'];
const LENGTHS = ['短', '中', '长'];

export function GenerateForm({ platform, contentType, onGenerate, loading }: GenerateFormProps) {
  const [topic, setTopic] = useState('');
  const [keywords, setKeywords] = useState('');
  const [tone, setTone] = useState('种草');
  const [length, setLength] = useState('中');
  const [extraPrompt, setExtraPrompt] = useState('');

  // 从模板填充
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

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* 快捷模板 */}
      <Templates platform={platform} onSelect={handleTemplateSelect} />

      {/* 主题输入 */}
      <div>
        <label className="block text-sm font-medium mb-2">
          主题 / 产品名称 <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="例如：夏日防晒霜推荐、Python学习心得..."
          className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 
                     bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent
                     outline-none transition-all"
          required
        />
      </div>

      {/* 关键词 */}
      <div>
        <label className="block text-sm font-medium mb-2">关键词（可选）</label>
        <input
          type="text"
          value={keywords}
          onChange={(e) => setKeywords(e.target.value)}
          placeholder="例如：防晒、清爽、不假白"
          className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 
                     bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent
                     outline-none transition-all"
        />
      </div>

      {/* 语气选择 */}
      <div>
        <label className="block text-sm font-medium mb-2">语气风格</label>
        <div className="flex flex-wrap gap-2">
          {TONES.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTone(t)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all
                ${tone === t 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* 长度选择 */}
      <div>
        <label className="block text-sm font-medium mb-2">内容长度</label>
        <div className="flex gap-2">
          {LENGTHS.map((l) => (
            <button
              key={l}
              type="button"
              onClick={() => setLength(l)}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all
                ${length === l 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
            >
              {l}
            </button>
          ))}
        </div>
      </div>

      {/* 补充要求 */}
      <div>
        <label className="block text-sm font-medium mb-2">补充要求（可选）</label>
        <textarea
          value={extraPrompt}
          onChange={(e) => setExtraPrompt(e.target.value)}
          placeholder="例如：加入emoji、使用第一人称、不要用感叹号..."
          rows={3}
          className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 
                     bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent
                     outline-none transition-all resize-none"
        />
      </div>

      {/* 生成按钮 */}
      <button
        type="submit"
        disabled={loading || !topic.trim()}
        className={`w-full py-4 rounded-xl font-bold text-lg transition-all
          ${loading || !topic.trim()
            ? 'bg-gray-300 dark:bg-gray-700 cursor-not-allowed'
            : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl'
          }`}
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            AI 正在生成...
          </span>
        ) : (
          '✨ 开始生成'
        )}
      </button>
    </form>
  );
}
