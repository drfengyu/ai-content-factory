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
import {
  Sparkle,
  SignOut,
  List,
  X,
  BookOpenText,
  MusicNote,
  Newspaper,
  ClockCounterClockwise,
  ArrowsClockwise,
  Export,
  FunnelSimple,
  CheckCircle,
  ArrowClockwise,
  WarningCircle,
} from '@phosphor-icons/react';
import { AuthModal } from '@/components/AuthModal';
import { LandingPage } from '@/components/LandingPage';
import { ProviderSwitch } from '@/components/ProviderSwitch';
import { SettingsPanel } from '@/components/SettingsPanel';
import { getCustomProviders } from '@/lib/settings';

/** 生成失败时分类的错误信息,用于提示用户下一步该做什么 */
interface GenerateError {
  kind: 'timeout' | 'server' | 'config' | 'network' | 'unknown';
  message: string;
}

/** 把 fetch / 业务层抛出的原始错误归类成上面 5 类之一 */
function classifyError(err: unknown, status?: number): GenerateError {
  if (err instanceof Error && err.name === 'AbortError') {
    return { kind: 'timeout', message: '请求超时,可能是网络较慢或上游响应过慢' };
  }
  const raw = err instanceof Error ? err.message : String(err);
  const lower = raw.toLowerCase();
  if (status && status >= 500) {
    return { kind: 'server', message: `服务端错误 (${status}):${raw}` };
  }
  if (
    status === 401 ||
    status === 403 ||
    /api[\s_-]?key|unauthorized|forbidden|invalid.*provider|baseurl/i.test(raw)
  ) {
    return { kind: 'config', message: `Provider 配置可能有问题:${raw}` };
  }
  if (lower.includes('fetch') || lower.includes('network') || lower.includes('failed to')) {
    return { kind: 'network', message: '网络异常,请检查连接后重试' };
  }
  return { kind: 'unknown', message: raw || '未知错误,请重试' };
}

type GenerateParams = {
  topic: string;
  keywords: string;
  tone: string;
  length: string;
  extraPrompt: string;
};

export default function Home() {
  const user = useSyncExternalStore(subscribeCurrentUser, getCurrentUserSnapshot, getCurrentUserServerSnapshot);
  const [platform, setPlatform] = useState<Platform | null>(null);
  const [contentType, setContentType] = useState<ContentType | null>(null);
  const [loading, setLoading] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  const [result, setResult] = useState<{ content: string; tokens: number; model: string } | null>(null);
  const [error, setError] = useState<GenerateError | null>(null);
  // 最近一次成功提交的参数,用于"重试"按钮 — 注意是参数而不是 result
  const [lastParams, setLastParams] = useState<GenerateParams | null>(null);
  // 流式生成完成统计;result 是非流式与流式都会设的,这里专门记录"流式是否刚结束"
  const [streamStats, setStreamStats] = useState<{ chars: number; ms: number } | null>(null);
  const [historyKey, setHistoryKey] = useState(0);
  const [activeTab, setActiveTab] = useState<'generate' | 'history'>('generate');
  const [authOpen, setAuthOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  // 当前激活的 Provider / 模型,用于把请求路由到正确的渠道(内置或自定义)
  const [activeProvider, setActiveProvider] = useState<{ id: string; model: string | null }>({
    id: '',
    model: null,
  });

  const handleAuthSuccess = () => {
    setAuthOpen(false);
  };

  const handleLogout = () => {
    clearCurrentUser();
  };

  const handleGenerate = async (params: GenerateParams): Promise<boolean> => {
    if (!contentType) return false;

    setLoading(true);
    setError(null);
    setResult(null);
    setStreamingContent('');
    setStreamStats(null);
    setLastParams(params);

    const startedAt = performance.now();

    try {
      // 判断当前 active 是否是用户自定义的 Provider
      // 自定义 Provider 的 id 以 "custom-" 开头(addCustomProvider 生成规则)
      let customProviderPayload: import('@/types').GenerateRequest['customProvider'];
      if (activeProvider.id.startsWith('custom-')) {
        const custom = getCustomProviders().find((p) => p.id === activeProvider.id);
        if (custom) {
          customProviderPayload = {
            baseUrl: custom.baseUrl,
            apiKey: custom.apiKey,
            type: custom.type,
            model: activeProvider.model || custom.defaultModel,
            pathPrefix: custom.pathPrefix,
          };
        }
      }

      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platform,
          contentType,
          // 内置 Provider 通过 providerId/modelId 传,自定义 Provider 通过 customProvider 传
          ...(customProviderPayload
            ? { customProvider: customProviderPayload }
            : {
                providerId: activeProvider.id || undefined,
                modelId: activeProvider.model || undefined,
              }),
          ...params,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        const err = new Error(data.error || '生成失败');
        setError(classifyError(err, response.status));
        return false;
      }

      const responseContentType = response.headers.get('content-type') || '';

      if (responseContentType.includes('application/json')) {
        const data = await response.json();
        const finalContent = data.content || '';
        if (!finalContent) {
          setError(classifyError(new Error('AI 未返回可用内容')));
          return false;
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
        return true;
      }

      const reader = response.body?.getReader();
      if (!reader) {
        setError(classifyError(new Error('无法读取响应流')));
        return false;
      }

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
      const elapsedMs = Math.max(0, Math.round(performance.now() - startedAt));
      setResult({
        content: finalContent,
        tokens: 0,
        model: response.headers.get('X-Model') || 'unknown',
      });
      setStreamingContent('');
      if (finalContent) {
        setStreamStats({ chars: finalContent.length, ms: elapsedMs });
      }

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
      return Boolean(finalContent);
    } catch (err) {
      setError(classifyError(err));
      return false;
    } finally {
      setLoading(false);
    }
  };

  /** 用最近一次提交的参数原样重发,用于"重试"按钮 */
  const handleRetry = () => {
    if (!lastParams || loading) return;
    void handleGenerate(lastParams);
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
          </nav>

          {/* User + Provider area */}
          <div className="flex items-center gap-3">
            <ProviderSwitch onProviderChange={(id, model) => setActiveProvider({ id, model })} />
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
            className="md:hidden border-t border-border-subtle bg-surface px-6 py-4 space-y-3"
          >
            <button
              onClick={() => { setActiveTab('generate'); setMenuOpen(false); }}
              className={`block w-full text-left py-2 ${activeTab === 'generate' ? 'text-accent font-medium' : 'text-zinc-400 hover:text-foreground'}`}
            >
              生成
            </button>
            <button
              onClick={() => { setActiveTab('history'); setMenuOpen(false); }}
              className={`block w-full text-left py-2 ${activeTab === 'history' ? 'text-accent font-medium' : 'text-zinc-400 hover:text-foreground'}`}
            >
              历史
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
                {/* Product Hero */}
                <section className="py-16 border-b border-border-subtle">
                  <div className="grid lg:grid-cols-[1.2fr_0.8fr] gap-10 items-end">
                    <div className="text-left">
                      <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center shadow-lg shadow-accent/5">
                        <Sparkle size={24} className="text-accent" weight="fill" />
                      </div>
                      <div className="mt-5">
                        <p className="text-xs font-semibold tracking-[0.24em] text-accent uppercase">AI Content Factory</p>
                        <h1 className="mt-3 text-3xl sm:text-5xl font-bold tracking-tight leading-tight">
                          把内容生成、模板填充和历史管理<br className="hidden sm:block" />集中到一个工作台里
                        </h1>
                        <p className="mt-4 text-sm sm:text-base text-zinc-400 max-w-xl leading-relaxed">
                          首页聚焦本项目的实际模块功能：平台选择、模板生成、历史记录、结果展示和导出能力，让内容工作流更顺手。
                        </p>
                      </div>
                      <div className="mt-6 flex flex-wrap gap-2 text-xs text-zinc-400">
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-border-subtle bg-surface px-3 py-1.5"><BookOpenText size={14} className="text-accent" /> 小红书内容</span>
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-border-subtle bg-surface px-3 py-1.5"><MusicNote size={14} className="text-accent" /> 抖音脚本</span>
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-border-subtle bg-surface px-3 py-1.5"><Newspaper size={14} className="text-accent" /> 公众号文章</span>
                      </div>
                    </div>
                    <div className="rounded-xl border border-accent/20 bg-surface/80 p-5 shadow-2xl shadow-accent/5">
                      <div className="text-sm font-semibold">工作台功能</div>
                      <div className="mt-4 space-y-3 text-sm text-zinc-400">
                        <div className="flex gap-3"><span className="text-accent font-semibold">01</span><span>选择平台和内容类型</span></div>
                        <div className="flex gap-3"><span className="text-accent font-semibold">02</span><span>套用模板并补全主题、关键词和语气</span></div>
                        <div className="flex gap-3"><span className="text-accent font-semibold">03</span><span>查看结果、进入历史并导出内容</span></div>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Module Cards */}
                <section className="py-10">
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="commercial-card rounded-xl p-5">
                      <div className="text-accent text-sm font-semibold mb-2">平台选择</div>
                      <h3 className="text-lg font-semibold mb-2">小红书 / 抖音 / 公众号</h3>
                      <p className="text-zinc-400 text-sm leading-relaxed">
                        从三类核心平台开始，按不同内容场景生成标题、文案、脚本和大纲。
                      </p>
                    </div>
                    <div className="commercial-card rounded-xl p-5">
                      <div className="text-accent text-sm font-semibold mb-2">模板系统</div>
                      <h3 className="text-lg font-semibold mb-2">一键套用常用模板</h3>
                      <p className="text-zinc-400 text-sm leading-relaxed">
                        用主题、关键词和语气快速填充模板，减少重复输入和空白页。
                      </p>
                    </div>
                    <div className="commercial-card rounded-xl p-5">
                      <div className="text-accent text-sm font-semibold mb-2">结果管理</div>
                      <h3 className="text-lg font-semibold mb-2">历史记录与导出</h3>
                      <p className="text-zinc-400 text-sm leading-relaxed">
                        结果可回看、可复用、可导出为文本内容，方便整理和后续修改。
                      </p>
                    </div>
                  </div>
                </section>

                <section className="py-8">
                  <div className="grid lg:grid-cols-[0.85fr_1.15fr] gap-4">
                    <div className="rounded-2xl border border-border-subtle bg-surface p-5 shadow-sm">
                      <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                        <FunnelSimple size={16} className="text-accent" />
                        真实模块
                      </div>
                      <div className="mt-4 space-y-4 text-sm text-zinc-400">
                        <div className="flex items-start gap-3">
                          <ClockCounterClockwise size={18} className="mt-0.5 text-accent" />
                          <div>
                            <div className="font-medium text-foreground">历史列表</div>
                            <div className="mt-1">查看最近生成内容，继续编辑或重新载入。</div>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <ArrowsClockwise size={18} className="mt-0.5 text-accent" />
                          <div>
                            <div className="font-medium text-foreground">模板回填</div>
                            <div className="mt-1">从快捷模板直接填充主题、关键词和语气。</div>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <Export size={18} className="mt-0.5 text-accent" />
                          <div>
                            <div className="font-medium text-foreground">结果导出</div>
                            <div className="mt-1">将内容复制或导出，进入后续编辑流程。</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-border-subtle bg-surface/80 p-5 shadow-sm">
                      <div className="text-sm font-semibold text-foreground">推荐使用路径</div>
                      <div className="mt-4 grid gap-3 sm:grid-cols-3">
                        <div className="rounded-xl border border-border-subtle bg-background p-4">
                          <div className="text-xs font-semibold text-accent">01</div>
                          <div className="mt-2 text-sm font-medium">先选平台</div>
                          <p className="mt-1 text-xs text-zinc-500">选择小红书、抖音或公众号。</p>
                        </div>
                        <div className="rounded-xl border border-border-subtle bg-background p-4">
                          <div className="text-xs font-semibold text-accent">02</div>
                          <div className="mt-2 text-sm font-medium">套模板</div>
                          <p className="mt-1 text-xs text-zinc-500">用模板快速生成初稿。</p>
                        </div>
                        <div className="rounded-xl border border-border-subtle bg-background p-4">
                          <div className="text-xs font-semibold text-accent">03</div>
                          <div className="mt-2 text-sm font-medium">看历史与导出</div>
                          <p className="mt-1 text-xs text-zinc-500">回看结果并导出到本地。</p>
                        </div>
                      </div>
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
                      <div className="mt-6 rounded-2xl border border-border-subtle bg-surface p-6 shadow-sm">
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
                      className="mt-6 p-4 rounded-xl border border-red-500/30 bg-red-500/10 text-sm"
                    >
                      <div className="flex items-start gap-3">
                        <WarningCircle size={20} weight="fill" className="text-red-400 mt-0.5 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-red-300">
                            {error.kind === 'timeout' && '请求超时'}
                            {error.kind === 'server' && '服务端错误'}
                            {error.kind === 'config' && 'Provider 配置问题'}
                            {error.kind === 'network' && '网络异常'}
                            {error.kind === 'unknown' && '生成失败'}
                          </div>
                          <div className="mt-1 text-red-200/80 break-words">{error.message}</div>
                          {error.kind === 'config' && (
                            <div className="mt-1 text-xs text-red-200/60">
                              建议:打开右上角设置面板,检查 API Key、baseUrl 是否正确,或切换其他 Provider。
                            </div>
                          )}
                          <div className="mt-3 flex gap-2">
                            {lastParams && (
                              <button
                                onClick={handleRetry}
                                disabled={loading}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent text-white text-xs font-medium hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50"
                              >
                                <ArrowClockwise size={12} weight="bold" />
                                重试
                              </button>
                            )}
                            <button
                              onClick={() => setError(null)}
                              className="px-3 py-1.5 rounded-lg border border-red-500/30 text-xs text-red-200 hover:bg-red-500/10 transition-all"
                            >
                              关闭
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Streaming */}
                <AnimatePresence>
                  {streamingContent && (
                    <motion.div
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-6 p-6 rounded-2xl border border-border-subtle bg-surface shadow-sm"
                    >
                      <div className="flex items-center gap-2 mb-4">
                        <span className="relative flex h-2.5 w-2.5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75" />
                          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-accent" />
                        </span>
                        <span className="text-sm text-zinc-400">AI 正在生成</span>
                      </div>
                      <div className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
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
                      className="mt-6 space-y-3"
                    >
                      {streamStats && (
                        <div className="flex items-center gap-2 text-xs text-emerald-300/90 bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-3 py-2">
                          <CheckCircle size={14} weight="fill" className="text-emerald-400" />
                          <span>
                            生成完成 · 共 {streamStats.chars} 字 · {(streamStats.ms / 1000).toFixed(1)} 秒
                          </span>
                        </div>
                      )}
                      <ResultDisplay
                        content={result.content}
                        tokens={result.tokens}
                        model={result.model}
                        platform={platform}
                        contentType={contentType || undefined}
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
      <footer className="bg-surface border-t border-border-subtle py-8">
        <div className="max-w-6xl mx-auto px-6 text-center text-sm text-zinc-500">
          AI Content Factory · 让AI触手可得
        </div>
      </footer>
    </div>
  );
}
