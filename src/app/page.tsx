'use client';

import React, { useState } from 'react';
import { PlatformSelector, ContentTypeSelector } from '@/components/PlatformSelector';
import { GenerateForm } from '@/components/GenerateForm';
import { ResultDisplay } from '@/components/ResultDisplay';
import { Platform, ContentType } from '@/types';

export default function Home() {
  const [platform, setPlatform] = useState<Platform | null>(null);
  const [contentType, setContentType] = useState<ContentType | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ content: string; tokens: number; model: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async (params: {
    topic: string;
    keywords: string;
    tone: string;
    length: string;
    extraPrompt: string;
  }) => {
    if (!contentType) return;
    
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platform,
          contentType,
          ...params,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '生成失败');
      }

      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '网络错误，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950">
      {/* Header */}
      <header className="py-8 text-center">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          AI 内容工厂
        </h1>
        <p className="mt-3 text-gray-500 dark:text-gray-400">
          小红书 · 抖音 · 公众号 — 一键生成爆款内容
        </p>
      </header>

      <div className="max-w-3xl mx-auto px-6 pb-20">
        {/* Step 1: 选择平台 */}
        <section className="mb-8">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <span className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm">1</span>
            选择平台
          </h2>
          <PlatformSelector
            selected={platform}
            onSelect={(p) => {
              setPlatform(p);
              setContentType(null);
              setResult(null);
            }}
          />
        </section>

        {/* Step 2: 选择内容类型 */}
        {platform && (
          <section className="mb-8">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm">2</span>
              选择内容类型
            </h2>
            <ContentTypeSelector
              platform={platform}
              selected={contentType}
              onSelect={(t) => {
                setContentType(t);
                setResult(null);
              }}
            />
          </section>
        )}

        {/* Step 3: 填写信息 */}
        {contentType && (
          <section className="mb-8">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm">3</span>
              填写生成信息
            </h2>
            <div className="p-6 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm">
              <GenerateForm
                contentType={contentType}
                onGenerate={handleGenerate}
                loading={loading}
              />
            </div>
          </section>
        )}

        {/* 错误提示 */}
        {error && (
          <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 mb-8">
            ❌ {error}
          </div>
        )}

        {/* 生成结果 */}
        {result && (
          <ResultDisplay
            content={result.content}
            tokens={result.tokens}
            model={result.model}
          />
        )}
      </div>

      {/* Footer */}
      <footer className="py-8 text-center text-sm text-gray-400 border-t border-gray-200 dark:border-gray-800">
        AI 内容工厂 — 让创作更简单
      </footer>
    </main>
  );
}
