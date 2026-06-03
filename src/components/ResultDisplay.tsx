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
import { exportContent, ExportFormat } from '@/lib/export';

interface ResultDisplayProps {
  content: string;
  tokens: number;
  model: string;
  topic?: string;
}

export function ResultDisplay({ content, tokens, model, topic }: ResultDisplayProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = (format: ExportFormat) => {
    exportContent(content, format, topic || 'content');
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
