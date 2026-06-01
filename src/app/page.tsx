'use client';

import React, { useState, useSyncExternalStore } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PlatformSelector, ContentTypeSelector } from '@/components/PlatformSelector';
import { GenerateForm } from '@/components/GenerateForm';
import { ResultDisplay } from '@/components/ResultDisplay';
import { HistoryList, saveToHistory, HistoryItem } from '@/components/HistoryList';
import {
  incrementUserUsage,
  clearCurrentUser,
  getCurrentUserServerSnapshot,
  getCurrentUserSnapshot,
  subscribeCurrentUser,
} from '@/lib/user';
import { Platform, ContentType } from '@/types';
import { Sparkle, SignOut, List, X, UsersThree, CurrencyCny, CheckCircle } from '@phosphor-icons/react';
import { AuthModal } from '@/components/AuthModal';
import { LandingPage } from '@/components/LandingPage';
import { ProviderSwitch } from '@/components/ProviderSwitch';
import { SettingsPanel } from '@/components/SettingsPanel';

export default function Home() {
  const user = useSyncExternalStore(subscribeCurrentUser, getCurrentUserSnapshot, getCurrentUserServerSnapshot);
  const [platform, setPlatform] = useState<Platform | null>(null);
  const [contentType, setContentType] = useState<ContentType | null>(null);
  const [loading, setLoading] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  const [result, setResult] = useState<{ content: string; tokens: number; model: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [historyKey, setHistoryKey] = useState(0);
  const [activeTab, setActiveTab] = useState<'generate' | 'history'>('generate');
  const [authOpen, setAuthOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const handleAuthSuccess = () => {
    setAuthOpen(false);
  };

  const handleLogout = () => {
    clearCurrentUser();
  };

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
        incrementUserUsage();
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
      if (finalContent) incrementUserUsage();
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

  // Not logged in: show landing page
  if (!user) {
    return (
      <>
        <LandingPage onGetStarted={() => setAuthOpen(true)} />
        <AuthModal
          isOpen={authOpen}
          onClose={() => setAuthOpen(false)}
          onAuthSuccess={handleAuthSuccess}
        />
      </>
    );
  }

  // Logged in: show main app
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Top Navigation */}
      <header className="sticky top-0 z-40 bg-surface-glass/80 backdrop-blur-md border-b border-border-subtle">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
              <Sparkle size={18} className="text-accent" weight="fill" />
            </div>
            <span className="font-semibold text-foreground">AI Content Factory</span>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 text-zinc-400"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X size={24} /> : <List size={24} />}
          </button>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6 text-sm text-zinc-400">
            <button
              onClick={() => setActiveTab('generate')}
              className={`hover:text-accent transition-colors ${activeTab === 'generate' ? 'text-accent font-medium' : ''}`}
            >
              生成
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`hover:text-accent transition-colors ${activeTab === 'history' ? 'text-accent font-medium' : ''}`}
            >
              历史
            </button>
            <button
              className="hover:text-accent transition-colors"
              onClick={() => {} /* settings later */}
            >
              设置
            </button>
          </nav>

          {/* User + Provider area */}
          <div className="flex items-center gap-3">
            <ProviderSwitch />
            <SettingsPanel />
            <div className="hidden sm:flex flex-col text-right mr-2">
              <div className="text-sm font-medium text-foreground">{user.name}</div>
              <div className="text-xs text-zinc-500">今日 {user.usage}/{user.maxUsage}</div>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 rounded-lg hover:bg-surface-elevated text-zinc-400 transition-colors"
              title="退出"
            >
              <SignOut size={20} />
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="md:hidden border-t border-gray-200 bg-white px-6 py-4 space-y-3"
          >
            <button
              onClick={() => { setActiveTab('generate'); setMenuOpen(false); }}
              className={`block w-full text-left py-2 ${activeTab === 'generate' ? 'text-accent font-medium' : 'text-gray-600'}`}
            >
              生成
            </button>
            <button
              onClick={() => { setActiveTab('history'); setMenuOpen(false); }}
              className={`block w-full text-left py-2 ${activeTab === 'history' ? 'text-accent font-medium' : 'text-gray-600'}`}
            >
              历史
            </button>
            <button
              onClick={() => { setMenuOpen(false); }}
              className="block w-full text-left py-2 text-gray-600"
            >
              设置
            </button>
          </motion.div>
        )}
      </header>

      {/* Main Content */}
      <main className="pb-20">
        <AnimatePresence mode="wait">
          {activeTab === 'generate' ? (
            <motion.div
              key="generate"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="max-w-6xl mx-auto px-6">
                {/* Commercial Hero */}
                <section className="py-16 border-b border-border-subtle">
                  <div className="grid lg:grid-cols-[1.2fr_0.8fr] gap-10 items-end">
                    <div className="text-left">
                      <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center shadow-lg shadow-accent/5">
                        <Sparkle size={24} className="text-accent" weight="fill" />
                      </div>
                      <div className="mt-5">
                        <p className="text-xs font-semibold tracking-[0.24em] text-accent uppercase">AI Content Factory</p>
                        <h1 className="mt-3 text-3xl sm:text-5xl font-bold tracking-tight leading-tight">
                          把 AI 内容能力包装成<br className="hidden sm:block" />你的第一单服务收入
                        </h1>
                        <p className="mt-4 text-sm sm:text-base text-zinc-400 max-w-xl leading-relaxed">
                          参考头部网站的转化架构：先展示能力，再引导生成服务包、获客话术与交付工具。不做复杂支付，首单通过微信完成。
                        </p>
                      </div>
                      <div className="mt-6 flex flex-wrap gap-2 text-xs text-zinc-400">
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-border-subtle bg-surface px-3 py-1.5"><CurrencyCny size={14} className="text-accent" /> 首单 99-299 元</span>
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-border-subtle bg-surface px-3 py-1.5"><UsersThree size={14} className="text-accent" /> 熟人/本地商家获客</span>
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-border-subtle bg-surface px-3 py-1.5"><CheckCircle size={14} className="text-accent" /> 当天可交付</span>
                      </div>
                    </div>
                    <div className="rounded-xl border border-accent/20 bg-surface/80 p-5 shadow-2xl shadow-accent/5">
                      <div className="text-sm font-semibold">首单路径</div>
                      <div className="mt-4 space-y-3 text-sm text-zinc-400">
                        <div className="flex gap-3"><span className="text-accent font-semibold">01</span><span>生成可卖服务包和报价</span></div>
                        <div className="flex gap-3"><span className="text-accent font-semibold">02</span><span>复制微信/朋友圈获客话术</span></div>
                        <div className="flex gap-3"><span className="text-accent font-semibold">03</span><span>用内容工厂完成客户交付</span></div>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Value Cards */}
                <section className="py-10">
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="commercial-card rounded-xl p-5">
                      <div className="text-accent text-sm font-semibold mb-2">首单变现</div>
                      <h3 className="text-lg font-semibold mb-2">设计 99/199/299 套餐</h3>
                      <p className="text-zinc-400 text-sm leading-relaxed">
                        产出落地页文案、服务详情、交付规则与卖点提炼，直接复制发朋友圈。
                      </p>
                    </div>
                    <div className="commercial-card rounded-xl p-5">
                      <div className="text-accent text-sm font-semibold mb-2">微信成交</div>
                      <h3 className="text-lg font-semibold mb-2">生成获客与跟进话术</h3>
                      <p className="text-zinc-400 text-sm leading-relaxed">
                        微信私信、朋友圈预热、低压力跟进、转介绍文案；全套即用。
                      </p>
                    </div>
                    <div className="commercial-card rounded-xl p-5">
                      <div className="text-accent text-sm font-semibold mb-2">交付保障</div>
                      <h3 className="text-lg font-semibold mb-2">标准交付工具包</h3>
                      <p className="text-zinc-400 text-sm leading-relaxed">
                        客户信息收集表、SOP、验收话术与复购建议，确保首单不翻车。
                      </p>
                    </div>
                  </div>
                </section>

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
                      <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
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
                      className="mt-6 p-4 rounded-xl border border-red-200 bg-red-50 text-red-700 text-sm"
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
                      className="mt-6 p-6 rounded-2xl border border-gray-200 bg-white shadow-sm"
                    >
                      <div className="flex items-center gap-2 mb-4">
                        <span className="relative flex h-2.5 w-2.5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75" />
                          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-accent" />
                        </span>
                        <span className="text-sm text-gray-500">AI 正在生成</span>
                      </div>
                      <div className="whitespace-pre-wrap text-sm leading-relaxed text-gray-900">
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
                <section className="mt-12 pt-8 border-t border-gray-200">
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
              <div className="max-w-6xl mx-auto px-6 pt-8 pb-20">
                <HistoryList
                  key={'full-' + historyKey}
                  onSelect={handleSelectHistory}
                  fullView
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="bg-gray-50 border-t border-gray-200 py-8">
        <div className="max-w-6xl mx-auto px-6 text-center text-sm text-gray-500">
          AI Content Factory · 让AI触手可得
        </div>
      </footer>
    </div>
  );
}
