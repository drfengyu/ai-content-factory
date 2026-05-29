'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ClockCounterClockwise,
  BookOpenText,
  MusicNote,
  Newspaper,
  TrashSimple,
  CopySimple,
  Check,
  CaretDown,
  CaretUp,
  ArrowCounterClockwise,
  MagnifyingGlass,
  FunnelSimple,
  DownloadSimple,
  FileText,
  FileCode,
  MarkdownLogo,
  SelectionPlus,
  SelectionSlash,
} from '@phosphor-icons/react';

export interface HistoryItem {
  id: string;
  platform: string;
  contentType: string;
  topic: string;
  content: string;
  createdAt: number;
}

const STORAGE_KEY = 'ai-content-factory-history';
const MAX_ITEMS = 50;

export function getHistory(): HistoryItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function saveToHistory(item: Omit<HistoryItem, 'id' | 'createdAt'>): HistoryItem {
  const newItem: HistoryItem = {
    ...item,
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    createdAt: Date.now(),
  };
  const history = getHistory();
  history.unshift(newItem);
  if (history.length > MAX_ITEMS) history.splice(MAX_ITEMS);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  return newItem;
}

export function deleteFromHistory(id: string): void {
  const history = getHistory().filter((item) => item.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
}

export function clearHistory(): void {
  localStorage.removeItem(STORAGE_KEY);
}

function formatTime(timestamp: number): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  if (diff < 60 * 1000) return '刚刚';
  if (diff < 60 * 60 * 1000) return `${Math.floor(diff / 60 / 1000)} 分钟前`;
  if (diff < 24 * 60 * 60 * 1000) return `${Math.floor(diff / 60 / 60 / 1000)} 小时前`;
  return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

const PLATFORM_CONFIG: Record<string, { icon: React.ReactNode; label: string }> = {
  xiaohongshu: { icon: <BookOpenText size={14} weight="fill" className="text-rose-500" />, label: '小红书' },
  douyin: { icon: <MusicNote size={14} weight="fill" className="text-zinc-400" />, label: '抖音' },
  gongzhonghao: { icon: <Newspaper size={14} weight="fill" className="text-emerald-500" />, label: '公众号' },
};

const CONTENT_TYPE_NAMES: Record<string, string> = {
  xiaohongshu_title: '爆款标题', xiaohongshu_copy: '种草文案', xiaohongshu_hashtag: '话题标签',
  douyin_script: '视频脚本', douyin_hook: '开头钩子',
  gongzhonghao_outline: '文章大纲', gongzhonghao_article: '完整文章',
};

/** 将内容导出为 HTML */
function contentToHtml(text: string, title: string): string {
  const lines = text.split('\n').map(l => {
    const t = l.trim();
    if (!t) return '<br>';
    if (/^#{1,6}\s/.test(t)) {
      const level = t.match(/^(#+)/)![1].length;
      return `<h${level}>${t.replace(/^#+\s*/, '')}</h${level}>`;
    }
    return `<p>${t.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')}</p>`;
  });
  return `<!DOCTYPE html><html lang="zh-CN"><head><meta charset="utf-8"><title>${title}</title>
<style>body{max-width:720px;margin:40px auto;padding:0 20px;font:16px/1.7 -apple-system,sans-serif;color:#222;}
h1{font-size:24px;border-bottom:2px solid #eee;padding-bottom:8px;}
h2{font-size:20px;margin-top:28px;}p{margin:8px 0;}
code{background:#f4f4f5;padding:2px 6px;border-radius:4px;font-size:14px;}
pre{background:#f4f4f5;padding:16px;border-radius:8px;overflow-x:auto;}</style></head>
<body>${lines.join('\n')}</body></html>`;
}

/** 导出文件 */
function downloadFile(content: string, filename: string, mime: string, ext: string) {
  const blob = new Blob([content], { type: `${mime};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}.${ext}`;
  a.click();
  URL.revokeObjectURL(url);
}

interface HistoryListProps {
  onSelect: (item: HistoryItem) => void;
  fullView?: boolean;
}

export function HistoryList({ onSelect, fullView }: HistoryListProps) {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [platformFilter, setPlatformFilter] = useState<string>('all');
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    setHistory(getHistory());
  }, []);

  // 过滤 + 搜索
  const filtered = useMemo(() => {
    let items = history;
    if (platformFilter !== 'all') items = items.filter((i) => i.platform === platformFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      items = items.filter((i) => i.topic.toLowerCase().includes(q) || i.content.toLowerCase().includes(q));
    }
    return items;
  }, [history, platformFilter, search]);

  const displayItems = fullView ? filtered : filtered.slice(0, 5);

  // ===== 操作 =====
  const handleDelete = (id: string) => {
    deleteFromHistory(id);
    setHistory(getHistory());
    selectedIds.delete(id);
  };

  const handleClear = () => {
    if (confirm('确定要清空所有历史记录吗？')) {
      clearHistory();
      setHistory([]);
      setSelectedIds(new Set());
    }
  };

  const handleCopy = async (id: string, content: string) => {
    await navigator.clipboard.writeText(content);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const toggleSelect = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const handleBatchDelete = () => {
    if (selectedIds.size === 0) return;
    if (!confirm(`确定要删除选中的 ${selectedIds.size} 条记录吗？`)) return;
    for (const id of selectedIds) deleteFromHistory(id);
    setHistory(getHistory());
    setSelectedIds(new Set());
  };

  const handleBatchExport = (format: 'txt' | 'md' | 'html') => {
    const items = history.filter((i) => selectedIds.has(i.id));
    if (items.length === 0) return;
    const combined = items
      .map((i) => {
        const platform = PLATFORM_CONFIG[i.platform]?.label || i.platform;
        const type = CONTENT_TYPE_NAMES[i.contentType] || i.contentType;
        const header = format === 'html' ? `<h2>${platform} · ${type}：${i.topic}</h2>` : `## ${platform} · ${type}：${i.topic}\n`;
        const body = format === 'html' ? contentToHtml(i.content, `${i.topic}`) : i.content;
        return format === 'html' ? header + body : `${header}\n${body}\n---\n`;
      })
      .join('\n');
    const mime = format === 'html' ? 'text/html' : format === 'md' ? 'text/markdown' : 'text/plain';
    downloadFile(format === 'html' ? contentToHtml(combined, `历史记录导出 ${new Date().toLocaleDateString()}`) : combined, `历史记录-${Date.now()}`, mime, format);
  };

  if (history.length === 0) {
    return (
      <div className="py-12 text-center">
        <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-surface-elevated flex items-center justify-center">
          <ClockCounterClockwise size={24} className="text-zinc-400" weight="light" />
        </div>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">暂无历史记录</p>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">生成的内容会自动保存在这里</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ClockCounterClockwise size={16} className="text-zinc-500 dark:text-zinc-400" />
          <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400">历史记录</span>
          <span className="text-xs text-zinc-500 dark:text-zinc-400">{history.length}</span>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => { setSelectMode(!selectMode); setSelectedIds(new Set()); }}
            className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs transition-all ${
              selectMode ? 'bg-accent/10 text-accent' : 'text-zinc-400 hover:text-foreground'}`}
            title={selectMode ? '退出选择' : '批量选择'}
          >
            {selectMode ? <SelectionSlash size={12} /> : <SelectionPlus size={12} />}
            {selectMode ? '退出' : '选择'}
          </button>
          <button onClick={handleClear}
            className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs text-zinc-400 hover:text-red-500 transition-all">
            <TrashSimple size={12} />清空
          </button>
        </div>
      </div>

      {/* Search + Filter */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <MagnifyingGlass size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="搜索主题或内容…"
            className="w-full pl-8 pr-3 py-2 rounded-lg border border-border-subtle bg-background text-xs text-foreground
                       placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent transition-all"
          />
        </div>
        <select value={platformFilter} onChange={(e) => setPlatformFilter(e.target.value)}
          className="px-2 py-2 rounded-lg border border-border-subtle bg-background text-xs text-foreground
                     focus:outline-none focus:ring-2 focus:ring-accent/40 transition-all appearance-none cursor-pointer"
        >
          <option value="all">全部平台</option>
          <option value="xiaohongshu">小红书</option>
          <option value="douyin">抖音</option>
          <option value="gongzhonghao">公众号</option>
        </select>
      </div>

      {/* Batch actions bar */}
      {selectMode && selectedIds.size > 0 && (
        <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-accent/5 border border-accent/20"
        >
          <span className="text-xs text-accent font-medium">已选 {selectedIds.size} 项</span>
          <div className="flex-1" />
          <button onClick={handleBatchDelete} className="flex items-center gap-1 px-2 py-1 rounded text-xs text-red-500 hover:bg-red-500/10 transition-all">
            <TrashSimple size={11} />删除
          </button>
          <button onClick={() => handleBatchExport('md')} className="flex items-center gap-1 px-2 py-1 rounded text-xs text-zinc-500 hover:text-foreground transition-all">
            <MarkdownLogo size={11} />导出 .md
          </button>
          <button onClick={() => handleBatchExport('html')} className="flex items-center gap-1 px-2 py-1 rounded text-xs text-zinc-500 hover:text-foreground transition-all">
            <FileCode size={11} />导出 .html
          </button>
        </motion.div>
      )}

      {/* List */}
      <AnimatePresence initial={false}>
        {displayItems.map((item) => (
          <motion.div key={item.id} layout
            initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, height: 0 }}
            className={`group rounded-xl border transition-all ${
              selectedIds.has(item.id) ? 'border-accent/50 bg-accent/[0.03]' : 'border-border-subtle bg-surface hover:border-accent/30'
            }`}
          >
            <div className="flex items-start gap-3 p-3">
              {/* Checkbox (select mode) */}
              {selectMode && (
                <button onClick={() => toggleSelect(item.id)}
                  className={`flex-shrink-0 w-5 h-5 mt-0.5 rounded border-2 transition-all ${
                    selectedIds.has(item.id) ? 'bg-accent border-accent' : 'border-zinc-300 dark:border-zinc-600'
                  }`}
                >
                  {selectedIds.has(item.id) && <Check size={12} weight="bold" className="text-white mx-auto" />}
                </button>
              )}

              {/* Platform icon */}
              <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-surface-elevated flex items-center justify-center">
                {PLATFORM_CONFIG[item.platform]?.icon || <BookOpenText size={14} />}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
                    {CONTENT_TYPE_NAMES[item.contentType] || item.contentType}
                  </span>
                  <span className="text-zinc-600 dark:text-zinc-500">·</span>
                  <span className="text-[11px] text-zinc-500 dark:text-zinc-400">{formatTime(item.createdAt)}</span>
                </div>
                <p className="text-sm font-medium truncate">{item.topic}</p>

                <AnimatePresence>
                  {expanded === item.id && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.2 }} className="mt-2 overflow-hidden"
                    >
                      <div className="p-3 rounded-lg bg-surface-elevated text-xs text-zinc-500 dark:text-zinc-400 whitespace-pre-wrap max-h-40 overflow-y-auto leading-relaxed">
                        {item.content}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Actions */}
              {!selectMode && (
                <div className="flex items-center gap-0.5 flex-shrink-0">
                  <button onClick={() => setExpanded(expanded === item.id ? null : item.id)}
                    className="p-1.5 rounded-lg hover:bg-surface-elevated text-zinc-400 transition-all" title={expanded === item.id ? '收起' : '展开'}>
                    {expanded === item.id ? <CaretUp size={12} weight="bold" /> : <CaretDown size={12} weight="bold" />}
                  </button>
                  <button onClick={() => handleCopy(item.id, item.content)}
                    className="p-1.5 rounded-lg hover:bg-surface-elevated text-zinc-400 transition-all" title="复制">
                    {copied === item.id ? <Check size={12} weight="bold" className="text-accent" /> : <CopySimple size={12} />}
                  </button>
                  <button onClick={() => handleCopy(item.id, item.content)}
                    className="p-1.5 rounded-lg hover:bg-surface-elevated text-zinc-400 transition-all" title="复制 Markdown">
                    <MarkdownLogo size={12} />
                  </button>
                  <button onClick={() => onSelect(item)}
                    className="p-1.5 rounded-lg hover:bg-accent/10 text-zinc-400 hover:text-accent transition-all" title="重新使用">
                    <ArrowCounterClockwise size={12} />
                  </button>
                  <button onClick={() => handleDelete(item.id)}
                    className="p-1.5 rounded-lg hover:bg-red-500/10 text-zinc-400 hover:text-red-500 transition-all" title="删除">
                    <TrashSimple size={12} />
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
