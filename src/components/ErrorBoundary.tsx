'use client';

import React from 'react';
import { ArrowClockwise, WarningOctagon } from '@phosphor-icons/react';

interface ErrorBoundaryState {
  error: Error | null;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  /**
   * 可选的自定义 fallback 渲染函数;不传则用默认的全屏错误面板。
   */
  fallback?: (error: Error, reset: () => void) => React.ReactNode;
}

/**
 * 顶层 React 错误边界
 *
 * 范围:只兜底渲染阶段抛出的同步异常,异步错误(fetch / setTimeout / Promise rejection)
 * 仍需要业务自己 try-catch + setError。这是 React 错误边界的固有限制,不是疏忽。
 *
 * 设计选择:
 * - 用 class 组件,因为 hooks 没有等价的 getDerivedStateFromError / componentDidCatch
 * - 错误日志 console.error 出去,方便开发期排查;线上若接监控系统在这里上报
 * - 提供"重新尝试":只清空 error state,让子树重挂载;若是持久性 bug 会立刻再次触发,
 *   用户能感知到不是"按钮坏了",而是"问题没解决"
 */
export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo): void {
    // 开发期至少留下完整堆栈;生产环境可以替换为上报到监控
    console.error('[ErrorBoundary] caught:', error, info.componentStack);
  }

  reset = () => {
    this.setState({ error: null });
  };

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;
    if (this.props.fallback) return this.props.fallback(error, this.reset);
    return <DefaultFallback error={error} onReset={this.reset} />;
  }
}

function DefaultFallback({ error, onReset }: { error: Error; onReset: () => void }) {
  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center px-6">
      <div className="max-w-md w-full rounded-2xl border border-border-subtle bg-surface p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-500/10 text-red-400 flex items-center justify-center">
            <WarningOctagon size={22} weight="fill" />
          </div>
          <div>
            <div className="text-base font-semibold">页面出现意外错误</div>
            <div className="text-xs text-zinc-500">已自动停止渲染,避免后续问题扩散</div>
          </div>
        </div>
        <pre className="mt-4 text-xs text-zinc-400 bg-background border border-border-subtle rounded-lg p-3 overflow-auto max-h-48 whitespace-pre-wrap">
          {error.message || String(error)}
        </pre>
        <div className="mt-4 flex gap-2">
          <button
            onClick={onReset}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-accent text-white text-sm font-medium hover:brightness-110 active:scale-[0.98] transition-all"
          >
            <ArrowClockwise size={14} weight="bold" />
            重新尝试
          </button>
          <button
            onClick={() => {
              if (typeof window !== 'undefined') window.location.reload();
            }}
            className="px-3 py-2 rounded-lg border border-border-subtle text-sm text-zinc-300 hover:bg-surface-elevated transition-all"
          >
            刷新页面
          </button>
        </div>
      </div>
    </div>
  );
}
