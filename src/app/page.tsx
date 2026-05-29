'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PlatformSelector, ContentTypeSelector } from '@/components/PlatformSelector';
import { GenerateForm } from '@/components/GenerateForm';
import { ResultDisplay } from '@/components/ResultDisplay';
import { HistoryList, saveToHistory, HistoryItem } from '@/components/HistoryList';
import { ProviderSwitch } from '@/components/ProviderSwitch';
import { Platform, ContentType } from '@/types';
import { Sparkle, RocketLaunch, ClockCounterClockwise } from '@phosphor-icons/react';

export default function Home() {
  const [platform, setPlatform] = useState<Platform | null>(null);
  const [contentType, setContentType] = useState<ContentType | null>(null);
  const [loading, setLoading] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  const [result, setResult] = useState<{ content: string; tokens: number; model: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [historyKey, setHistoryKey] = useState(0);
  const [activeTab, setActiveTab] = useState<'generate' | 'history'>('generate');
  const [providerSelection, setProviderSelection] = useState<{
    providerId: string;
    modelId: string | null;
  } | null>(null);

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
          providerId: providerSelection?.providerId,
          modelId: providerSelection?.modelId || undefined,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || '生成失败');
      }

      const responseContentType = response.headers.get('content-type') || '';

      if (responseContentType.includes('application/json')) {
        const data = await response.json();
        const finalContent = data.content || '';
        if (!finalContent) {
          throw new Error('AI 未返回可用内容');
        }

        setResult({
          content: finalContent,
          tokens: data.tokens || 0,
          model: data.model || 'unknown',
        });

        if (platform && contentType) {
          saveToHistory({
            platform,
            contentType,
            topic: params.topic,
            content: finalContent,
          });
          setHistoryKey((k) => k + 1);
        }
        return;
      }

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
            // skip parse failures
          }
        }
      }

      const finalContent = fullContent;
      setResult({
        content: finalContent,
        tokens: 0,
        model: response.headers.get('X-Model') || 'unknown',
      });
      setStreamingContent('');

      if (finalContent && platform && contentType) {
        saveToHistory({
          platform,
          contentType,
          topic: params.topic,
          content: finalContent,
        });
        setHistoryKey((k) => k + 1);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '网络错误，请重试');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectHistory = (item: HistoryItem) => {
    setPlatform(item.platform as Platform);
    setContentType(item.contentType as ContentType);
    setResult({
      content: item.content,
      tokens: 0,
      model: 'deepseek-chat',
    });
    setStreamingContent('');
    setActiveTab('generate');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-dvh bg-background">
      {/* Header */}
      <header className="relative border-b border-border-subtle bg-gradient-to-b from-accent/[0.03] to-transparent">
        <div className="max-w-5xl mx-auto px-6 pt-10 pb-8">
          <div className="flex flex-col items-center text-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center shadow-lg shadow-accent/5">
              <Sparkle size={24} className="text-accent" weight="fill" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                AI 内容工厂
              </h1>
              <p className="mt-1.5 text-sm text-zinc-500 dark:text-zinc-400">
                小红书 · 抖音 · 公众号 — 一键生成爆款内容
              </p>
            </div>
            {/* Provider Switch */}
            <div className="absolute right-6 top-6">
              <ProviderSwitch
                onProviderChange={(providerId, modelId) => {
                  setProviderSelection({ providerId, modelId });
                }}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="max-w-5xl mx-auto px-6 pt-6 pb-4">
        <div className="flex justify-center">
          <div className="flex gap-1 p-1 rounded-xl bg-surface-elevated w-fit">
            <button
              onClick={() => setActiveTab('generate')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'generate'
                  ? 'bg-surface text-foreground shadow-sm'
                  : 'text-zinc-500 dark:text-zinc-400 hover:text-foreground'
              }`}
            >
              <RocketLaunch size={16} weight={activeTab === 'generate' ? 'fill' : 'regular'} />
              生成
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'history'
                  ? 'bg-surface text-foreground shadow-sm'
                  : 'text-zinc-500 dark:text-zinc-400 hover:text-foreground'
              }`}
            >
              <ClockCounterClockwise size={16} weight={activeTab === 'history' ? 'fill' : 'regular'} />
              历史
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'generate' ? (
          <motion.div
            key="generate"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="max-w-5xl mx-auto px-6 pb-20">
              {/* Platform Selection */}
              <PlatformSelector
                selected={platform}
                onSelect={(p) => {
                  setPlatform(p);
                  setContentType(null);
                  setResult(null);
                  setStreamingContent('');
                }}
              />

              {/* Content Type Selection */}
              <AnimatePresence>
                {platform && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <ContentTypeSelector
                      platform={platform}
                      selected={contentType}
                      onSelect={(t) => {
                        setContentType(t);
                        setResult(null);
                        setStreamingContent('');
                      }}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Generate Form */}
              <AnimatePresence>
                {contentType && (
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ duration: 0.3, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <div className="rounded-xl border border-border-subtle bg-surface p-6">
                      <GenerateForm
                        platform={platform}
                        contentType={contentType}
                        onGenerate={handleGenerate}
                        loading={loading}
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Error */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="mt-6 p-4 rounded-xl border border-red-500/20 bg-red-500/5 text-red-500 text-sm"
                  >
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Streaming */}
              <AnimatePresence>
                {streamingContent && (
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-6 p-6 rounded-xl border border-border-subtle bg-surface"
                  >
                    <div className="flex items-center gap-2 mb-4">
                      <span className="relative flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75" />
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-accent" />
                      </span>
                      <span className="text-sm text-zinc-500 dark:text-zinc-400">
                        AI 正在生成
                      </span>
                    </div>
                    <div className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/85">
                      {streamingContent}
                      <span className="inline-block w-[2px] h-[1em] bg-accent ml-0.5 animate-pulse align-middle" />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Result */}
              <AnimatePresence>
                {result && !streamingContent && (
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-6"
                  >
                    <ResultDisplay
                      content={result.content}
                      tokens={result.tokens}
                      model={result.model}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* History Section */}
              <section className="mt-12 pt-8 border-t border-border-subtle">
                <HistoryList
                  key={historyKey}
                  onSelect={handleSelectHistory}
                />
              </section>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="history"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="max-w-5xl mx-auto px-6 pb-20">
              <HistoryList
                key={'full-' + historyKey}
                onSelect={handleSelectHistory}
                fullView
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="border-t border-border-subtle py-6 text-center text-xs text-zinc-500 dark:text-zinc-400">
        AI 内容工厂
      </footer>
    </div>
  );
}
