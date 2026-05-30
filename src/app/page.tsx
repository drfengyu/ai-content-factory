'use client';

import React, { useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PlatformSelector, ContentTypeSelector } from '@/components/PlatformSelector';
import { GenerateForm } from '@/components/GenerateForm';
import { ResultDisplay } from '@/components/ResultDisplay';
import { HistoryList, saveToHistory, HistoryItem } from '@/components/HistoryList';
import { ProviderSwitch } from '@/components/ProviderSwitch';
import { UserPanel } from '@/components/UserPanel';
import SettingsPanel from '@/components/SettingsPanel';
import { incrementUserUsage } from '@/lib/user';
import { Platform, ContentType, User } from '@/types';
import { Sparkle, RocketLaunch, ClockCounterClockwise, CheckCircle, CurrencyCny, UsersThree, Gear } from '@phosphor-icons/react';

export default function Home() {
  const [platform, setPlatform] = useState<Platform | null>(null);
  const [contentType, setContentType] = useState<ContentType | null>(null);
  const [loading, setLoading] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  const [result, setResult] = useState<{ content: string; tokens: number; model: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [historyKey, setHistoryKey] = useState(0);
  const [activeTab, setActiveTab] = useState<'generate' | 'history'>('generate');
  const [user, setUser] = useState<User | null>(null);
  const [providerSelection, setProviderSelection] = useState<{
    providerId: string;
    modelId: string | null;
  } | null>(null);
  const [showSettings, setShowSettings] = useState(false);

  const handleUserChange = useCallback((nextUser: User | null) => {
    setUser(nextUser);
  }, []);

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
        setUser(incrementUserUsage());
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
      if (finalContent) {
        setUser(incrementUserUsage());
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
      <header className="relative border-b border-border-subtle bg-gradient-to-b from-accent/[0.06] to-transparent overflow-hidden">
        <div className="max-w-6xl mx-auto px-6 pt-12 pb-10">
          <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-8 items-end">
            <div className="text-left">
            <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center shadow-lg shadow-accent/5">
              <Sparkle size={24} className="text-accent" weight="fill" />
            </div>
            <div className="mt-5">
              <p className="text-xs font-semibold tracking-[0.24em] text-accent uppercase">AI Content Factory</p>
              <h1 className="mt-3 text-3xl sm:text-5xl font-bold tracking-tight leading-tight">
                把 AI 内容能力包装成<br className="hidden sm:block" />你的第一单服务收入
              </h1>
              <p className="mt-4 text-sm sm:text-base text-zinc-500 dark:text-zinc-400 max-w-xl leading-relaxed">
                先不做复杂 SaaS。用这个项目展示能力、生成交付内容、设计 99/199/299 服务包，通过微信完成第一笔成交。
              </p>
            </div>
            <div className="mt-6 flex flex-wrap gap-2 text-xs text-zinc-500 dark:text-zinc-400">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-border-subtle bg-surface px-3 py-1.5"><CurrencyCny size={14} className="text-accent" /> 首单 99-299 元</span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-border-subtle bg-surface px-3 py-1.5"><UsersThree size={14} className="text-accent" /> 熟人/本地商家获客</span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-border-subtle bg-surface px-3 py-1.5"><CheckCircle size={14} className="text-accent" /> 当天可交付</span>
            </div>
            </div>
            <div className="rounded-xl border border-accent/20 bg-surface/80 p-5 shadow-2xl shadow-accent/5">
              <div className="text-sm font-semibold">首单路径</div>
              <div className="mt-4 space-y-3 text-sm text-zinc-500 dark:text-zinc-400">
                <div className="flex gap-3"><span className="text-accent font-semibold">01</span><span>生成可卖服务包和报价</span></div>
                <div className="flex gap-3"><span className="text-accent font-semibold">02</span><span>复制微信/朋友圈获客话术</span></div>
                <div className="flex gap-3"><span className="text-accent font-semibold">03</span><span>用内容工厂完成客户交付</span></div>
              </div>
            </div>
            {/* Provider Switch */}
            <div className="absolute right-6 top-6 flex items-center gap-2">
              <ProviderSwitch
                onProviderChange={(providerId, modelId) => {
                  setProviderSelection({ providerId, modelId });
                }}
              />
              <UserPanel user={user} onUserChange={handleUserChange} />
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="p-2 rounded-lg hover:bg-surface-elevated transition-colors text-zinc-500 hover:text-foreground"
                title="设置"
              >
                <Gear size={18} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* 商业化服务卡片 - Task 3 */}
      <section className="max-w-5xl mx-auto px-6 py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* 服务包设计 */}
          <div className="group relative p-5 rounded-xl bg-surface border border-border hover:border-accent transition-all cursor-pointer">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-accent/10 text-accent">
                <CheckCircle size={20} weight="fill" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground mb-1">首单服务包设计</h3>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-3">
                  为 AI 创作者定制 3-5 个首批客户服务套餐
                </p>
                <div className="flex items-center gap-2 text-accent text-sm font-medium">
                  <CurrencyCny size={14} />
                  99-299元
                  <span className="text-xs text-zinc-500">/次</span>
                </div>
              </div>
            </div>
          </div>

          {/* 获客话术 */}
          <div className="group relative p-5 rounded-xl bg-surface border border-border hover:border-accent transition-all cursor-pointer">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-accent/10 text-accent">
                <UsersThree size={20} weight="fill" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground mb-1">微信获客话术</h3>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-3">
                  朋友圈/私信文案模板，提升转化率 30%+
                </p>
                <div className="flex items-center gap-2 text-accent text-sm font-medium">
                  <CurrencyCny size={14} />
                  199元
                  <span className="text-xs text-zinc-500">/套</span>
                </div>
              </div>
            </div>
          </div>

          {/* 交付工具包 */}
          <div className="group relative p-5 rounded-xl bg-surface border border-border hover:border-accent transition-all cursor-pointer">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-accent/10 text-accent">
                <Sparkle size={20} weight="fill" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground mb-1">标准交付工具包</h3>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-3">
                  包含合同模板、需求清单、验收报告全套文档
                </p>
                <div className="flex items-center gap-2 text-accent text-sm font-medium">
                  <CurrencyCny size={14} />
                  299元
                  <span className="text-xs text-zinc-500">/套</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

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

      {/* Settings Panel */}
      <SettingsPanel isOpen={showSettings} onClose={() => setShowSettings(false)} />
    </div>
  );
}
