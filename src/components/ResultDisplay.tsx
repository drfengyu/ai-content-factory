'use client';

import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  CopySimple,
  Check,
  FileText,
  FileCode,
  MarkdownLogo,
} from '@phosphor-icons/react';

interface ResultDisplayProps {
  content: string;
  tokens: number;
  model: string;
  topic?: string;
}

/** 将内容转为 HTML 片段 */
function contentToHtml(text: string, title?: string): string {
  const lines = text.split('\n').map((l) => {
    const trimmed = l.trim();
    if (!trimmed) return '<br>';
    // 检测标题
    if (/^#{1,6}\s/.test(trimmed)) {
      const level = trimmed.match(/^(#+)/)![1].length;
      return `<h${level}>${trimmed.replace(/^#+\s*/, '')}</h${level}>`;
    }
    // 检测加粗
    const bolded = trimmed.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    return `<p>${bolded}</p>`;
  });
  const titleHtml = title ? `<h1>${title}</h1>\n` : '';
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head><meta charset="utf-8"><title>${title || 'AI生成内容'}</title>
<style>
body { max-width:720px; margin:40px auto; padding:0 20px; font:16px/1.7 -apple-system,sans-serif; color:#222; }
h1 { font-size:24px; border-bottom:2px solid #eee; padding-bottom:8px; }
h2 { font-size:20px; margin-top:28px; }
h3 { font-size:17px; margin-top:22px; }
p { margin:8px 0; }
code { background:#f4f4f5; padding:2px 6px; border-radius:4px; font-size:14px; }
pre { background:#f4f4f5; padding:16px; border-radius:8px; overflow-x:auto; }
</style></head>
<body>${titleHtml}${lines.join('\n')}</body></html>`;
}

export function ResultDisplay({ content, tokens, model, topic }: ResultDisplayProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadFile = (blob: Blob, ext: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${topic ? topic.slice(0, 20) : 'content'}-${Date.now()}.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownload = (format: 'txt' | 'md' | 'html') => {
    let blob: Blob;
    let ext: string;
    switch (format) {
      case 'md':
        blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
        ext = 'md';
        break;
      case 'html':
        blob = new Blob([contentToHtml(content, topic)], { type: 'text/html;charset=utf-8' });
        ext = 'html';
        break;
      default:
        blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
        ext = 'txt';
    }
    downloadFile(blob, ext);
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

      {/* Actions */}
      <div className="flex gap-2 px-5 py-3 border-t border-border-subtle flex-wrap">
        <ActionButton icon={<CopySimple size={12} />} label={copied ? '已复制' : '复制'} onClick={handleCopy} active={copied} />
        <ActionButton icon={<FileText size={12} />} label="下载 .txt" onClick={() => handleDownload('txt')} />
        <ActionButton icon={<MarkdownLogo size={12} />} label="下载 .md" onClick={() => handleDownload('md')} />
        <ActionButton icon={<FileCode size={12} />} label="下载 .html" onClick={() => handleDownload('html')} />
      </div>
    </motion.div>
  );
}

function ActionButton({
  icon,
  label,
  onClick,
  active,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  active?: boolean;
}) {
  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all
        ${active ? 'bg-accent text-white' : 'bg-surface-elevated text-zinc-500 dark:text-zinc-400 hover:text-foreground'}`}
    >
      {icon}
      {label}
    </motion.button>
  );
}
