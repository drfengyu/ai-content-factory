'use client';

import React, { useState } from 'react';

interface ResultDisplayProps {
  content: string;
  tokens: number;
  model: string;
}

export function ResultDisplay({ content, tokens, model }: ResultDisplayProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!content) return null;

  return (
    <div className="mt-8 p-6 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold">生成结果</h3>
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-500">
            {tokens} tokens · {model}
          </span>
          <button
            onClick={handleCopy}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all
              ${copied 
                ? 'bg-green-500 text-white' 
                : 'bg-blue-500 text-white hover:bg-blue-600'
              }`}
          >
            {copied ? '✓ 已复制' : '📋 复制'}
          </button>
        </div>
      </div>
      
      <div className="prose prose-gray dark:prose-invert max-w-none">
        <div className="whitespace-pre-wrap text-gray-700 dark:text-gray-300 leading-relaxed">
          {content}
        </div>
      </div>

      {/* 快捷操作 */}
      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 flex gap-2">
        <button
          onClick={handleCopy}
          className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-sm hover:bg-gray-300 dark:hover:bg-gray-600 transition-all"
        >
          📋 再次复制
        </button>
        <button
          onClick={() => {
            const blob = new Blob([content], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `content-${Date.now()}.txt`;
            a.click();
          }}
          className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-sm hover:bg-gray-300 dark:hover:bg-gray-600 transition-all"
        >
          💾 下载文本
        </button>
      </div>
    </div>
  );
}
