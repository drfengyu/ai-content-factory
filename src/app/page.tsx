'use client';

import React, { useState } from 'react';
import { PlatformSelector, ContentTypeSelector } from '@/components/PlatformSelector';
import { GenerateForm } from '@/components/GenerateForm';
import { ResultDisplay } from '@/components/ResultDisplay';
import { HistoryList, saveToHistory, HistoryItem } from '@/components/HistoryList';
import { Platform, ContentType } from '@/types';

export default function Home() {
  const [platform, setPlatform] = useState<Platform | null>(null);
  const [contentType, setContentType] = useState<ContentType | null>(null);
  const [loading, setLoading] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  const [result, setResult] = useState<{ content: string; tokens: number; model: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [historyKey, setHistoryKey] = useState(0); // 用于刷新历史列表

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
    setStreamingContent('');

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

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || '生成失败');
      }

      // 流式读取
      const reader = response.body?.getReader();
      if (!reader) throw new Error('无法读取响应流');

      const decoder = new TextDecoder();
      let fullContent = '';
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || !trimmed.startsWith('data: ')) continue;
          
          const data = trimmed.slice(6);
          if (data === '[DONE]') continue;

          try {
            const parsed = JSON.parse(data);
            if (parsed.content) {
              fullContent += parsed.content;
              setStreamingContent(fullContent);
            }
          } catch {
            // 忽略解析失败
          }
        }
      }

      // 流结束，设置最终结果
      const finalContent = fullContent;
      setResult({
        content: finalContent,
        tokens: 0, // 流式模式不返回 token 数
        model: 'deepseek-chat',
      });
      setStreamingContent('');

      // 保存到历史记录
      if (finalContent && platform && contentType) {
        saveToHistory({
          platform,
          contentType,
          topic: params.topic,
          content: finalContent,
        });
        setHistoryKey(k => k + 1);
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : '网络错误，请重试');
    } finally {
      setLoading(false);
    }
  };

  // 从历史记录中选择
  const handleSelectHistory = (item: HistoryItem) => {
    setPlatform(item.platform as Platform);
    setContentType(item.contentType as ContentType);
    setResult({
      content: item.content,
      tokens: 0,
      model: 'deepseek-chat',
    });
    setStreamingContent('');
    // 滚动到结果区域
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
              setStreamingContent('');
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
                setStreamingContent('');
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
                platform={platform}
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

        {/* 流式输出中 */}
        {streamingContent && (
          <div className="mt-8 p-6 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-sm text-gray-500">正在生成...</span>
            </div>
            <div className="whitespace-pre-wrap text-gray-700 dark:text-gray-300 leading-relaxed">
              {streamingContent}
              <span className="inline-block w-2 h-5 bg-blue-500 ml-1 animate-pulse" />
            </div>
          </div>
        )}

        {/* 生成结果 */}
        {result && !streamingContent && (
          <ResultDisplay
            content={result.content}
            tokens={result.tokens}
            model={result.model}
          />
        )}

        {/* 历史记录 */}
        <section className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-800">
          <HistoryList 
            key={historyKey}
            onSelect={handleSelectHistory} 
          />
        </section>
      </div>

      {/* Footer */}
      <footer className="py-8 text-center text-sm text-gray-400 border-t border-gray-200 dark:border-gray-800">
        AI 内容工厂 — 让创作更简单
      </footer>
    </main>
  );
}
