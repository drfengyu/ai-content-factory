'use client';

import React, { useState, useSyncExternalStore } from 'react';
import { motion } from 'motion/react';
import {
  CopySimple,
  Check,
  FileText,
  FileCode,
  MarkdownLogo,
  Info,
  Image,
  Spinner,
} from '@phosphor-icons/react';
import { exportContent, ExportFormat } from '@/lib/export';
import {
  getSettingsSnapshot,
  getSettingsServerSnapshot,
  subscribeSettings,
} from '@/lib/settings';
import { Platform } from '@/types';

interface ResultDisplayProps {
  content: string;
  tokens: number;
  model: string;
  topic?: string;
  /** 用于显示平台相关的内容长度软提示 */
  platform?: Platform | null;
  contentType?: string;
}

/** 每个平台给一句"内容上限"参考,UI 仅展示,不强制 */
const PLATFORM_HINTS: Record<Platform, { label: string; soft: number; tip: string }> = {
  xiaohongshu: { label: '小红书正文', soft: 1000, tip: '小红书正文建议 ≤ 1000 字,标题 ≤ 20 字最佳' },
  douyin: { label: '抖音脚本', soft: 800, tip: '抖音脚本建议拆分为 ≤ 15 秒的小段,整体 ≤ 800 字' },
  gongzhonghao: { label: '公众号文章', soft: 5000, tip: '公众号正文 ≤ 5000 字易读' },
};

export function ResultDisplay({ content, tokens, model, topic, platform, contentType }: ResultDisplayProps) {
  const [copied, setCopied] = useState(false);
  const [generatingImage, setGeneratingImage] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  // 跟随设置面板里的"默认导出格式"高亮对应按钮
  const settings = useSyncExternalStore(
    subscribeSettings,
    getSettingsSnapshot,
    getSettingsServerSnapshot,
  );
  const defaultFormat: ExportFormat = settings.preferences?.defaultExportFormat ?? 'md';

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = (format: ExportFormat) => {
    exportContent(content, format, topic || 'content');
  };

  const handleGenerateImage = async () => {
    if (!platform) return;
    setGeneratingImage(true);
    setImageError(null);

    try {
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content,
          platform,
          contentType: contentType || 'default'
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to generate image');
      }

      const { imageUrl: url } = await response.json();
      setImageUrl(url);
    } catch (error) {
      setImageError(error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setGeneratingImage(false);
    }
  };

  if (!content) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-border-subtle bg-surface overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-border-subtle">
        <div className="flex items-center gap-2">
          <FileText size={16} className="text-accent" weight="regular" />
          <span className="text-sm font-medium">生成结果</span>
          {tokens > 0 && (
            <span className="text-[11px] text-zinc-400 ml-1">
              {tokens.toLocaleString()} tokens
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-zinc-500 dark:text-zinc-400">{model}</span>
          <div className="flex gap-1">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={handleCopy}
              className={`p-2 rounded-lg transition-all ${
                copied
                  ? 'bg-accent text-white'
                  : 'hover:bg-surface-elevated text-zinc-500 dark:text-zinc-400'
              }`}
              title="复制"
            >
              {copied ? <Check size={14} weight="bold" /> : <CopySimple size={14} weight="regular" />}
            </motion.button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-5 py-4 max-h-[60vh] overflow-y-auto">
        <div className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/80">
          {content}
        </div>
      </div>

      {/* Platform length hint */}
      {platform && PLATFORM_HINTS[platform] && (
        <div className="px-5 py-2 border-t border-border-subtle flex items-center gap-2 text-[11px] text-zinc-500">
          <Info size={12} weight="regular" />
          <span>
            {PLATFORM_HINTS[platform].tip} · 当前
            <span
              className={`ml-1 tabular-nums ${
                content.length > PLATFORM_HINTS[platform].soft ? 'text-amber-400' : 'text-zinc-400'
              }`}
            >
              {content.length} 字
            </span>
          </span>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2 px-5 py-3 border-t border-border-subtle flex-wrap">
        <ActionButton icon={<CopySimple size={12} />} label={copied ? '已复制' : '复制'} onClick={handleCopy} active={copied} />
        {platform && (
          <ActionButton
            icon={generatingImage ? <Spinner size={12} className="animate-spin" /> : <Image size={12} />}
            label={generatingImage ? '生成中...' : '生成配图'}
            onClick={handleGenerateImage}
            disabled={generatingImage}
          />
        )}
        <ActionButton
          icon={<FileText size={12} />}
          label={defaultFormat === 'txt' ? '下载 .txt · 默认' : '下载 .txt'}
          onClick={() => handleDownload('txt')}
          highlight={defaultFormat === 'txt'}
        />
        <ActionButton
          icon={<MarkdownLogo size={12} />}
          label={defaultFormat === 'md' ? '下载 .md · 默认' : '下载 .md'}
          onClick={() => handleDownload('md')}
          highlight={defaultFormat === 'md'}
        />
        <ActionButton
          icon={<FileCode size={12} />}
          label={defaultFormat === 'html' ? '下载 .html · 默认' : '下载 .html'}
          onClick={() => handleDownload('html')}
          highlight={defaultFormat === 'html'}
        />
      </div>

      {/* Generated Image */}
      {imageUrl && (
        <div className="px-5 py-4 border-t border-border-subtle">
          <div className="flex items-center gap-2 mb-2">
            <Image size={14} className="text-accent" weight="bold" />
            <span className="text-xs font-medium">生成的配图</span>
          </div>
          <img src={imageUrl} alt="Generated" className="w-full rounded-lg" />
          <a
            href={imageUrl}
            download
            className="inline-flex items-center gap-1.5 mt-2 px-3 py-1.5 rounded-lg text-xs font-medium bg-surface-elevated text-zinc-500 hover:text-foreground transition-all"
          >
            <FileText size={12} />
            下载图片
          </a>
        </div>
      )}

      {/* Image Error */}
      {imageError && (
        <div className="px-5 py-3 border-t border-border-subtle text-xs text-red-400">
          ⚠️ {imageError}
        </div>
      )}
    </motion.div>
  );
}

function ActionButton({
  icon,
  label,
  onClick,
  active,
  highlight,
  disabled,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  active?: boolean;
  /** 设置面板里被标为默认时高亮一圈边框 */
  highlight?: boolean;
  disabled?: boolean;
}) {
  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      disabled={disabled}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all
        ${active
          ? 'bg-accent text-white'
          : highlight
            ? 'bg-accent/10 text-accent border border-accent/30'
            : 'bg-surface-elevated text-zinc-500 dark:text-zinc-400 hover:text-foreground'}
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {icon}
      {label}
    </motion.button>
  );
}
