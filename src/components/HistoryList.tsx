'use client';

import React, { useState, useEffect } from 'react';

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

// 获取历史记录
export function getHistory(): HistoryItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

// 保存历史记录
export function saveToHistory(item: Omit<HistoryItem, 'id' | 'createdAt'>): HistoryItem {
  const newItem: HistoryItem = {
    ...item,
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    createdAt: Date.now(),
  };
  
  const history = getHistory();
  history.unshift(newItem);
  
  // 限制最大数量
  if (history.length > MAX_ITEMS) {
    history.splice(MAX_ITEMS);
  }
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  return newItem;
}

// 删除历史记录
export function deleteFromHistory(id: string): void {
  const history = getHistory().filter(item => item.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
}

// 清空历史记录
export function clearHistory(): void {
  localStorage.removeItem(STORAGE_KEY);
}

// 格式化时间
function formatTime(timestamp: number): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  
  if (diff < 60 * 1000) return '刚刚';
  if (diff < 60 * 60 * 1000) return `${Math.floor(diff / 60 / 1000)} 分钟前`;
  if (diff < 24 * 60 * 60 * 1000) return `${Math.floor(diff / 60 / 60 / 1000)} 小时前`;
  
  return date.toLocaleDateString('zh-CN', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// 平台图标
const PLATFORM_ICONS: Record<string, string> = {
  xiaohongshu: '📕',
  douyin: '🎵',
  gongzhonghao: '📰',
};

// 内容类型名称
const CONTENT_TYPE_NAMES: Record<string, string> = {
  xiaohongshu_title: '爆款标题',
  xiaohongshu_copy: '种草文案',
  xiaohongshu_hashtag: '话题标签',
  douyin_script: '视频脚本',
  douyin_hook: '开头钩子',
  gongzhonghao_outline: '文章大纲',
  gongzhonghao_article: '完整文章',
};

interface HistoryListProps {
  onSelect: (item: HistoryItem) => void;
}

export function HistoryList({ onSelect }: HistoryListProps) {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    setHistory(getHistory());
  }, []);

  const handleDelete = (id: string) => {
    deleteFromHistory(id);
    setHistory(getHistory());
  };

  const handleClear = () => {
    if (confirm('确定要清空所有历史记录吗？')) {
      clearHistory();
      setHistory([]);
    }
  };

  const handleCopy = async (id: string, content: string) => {
    await navigator.clipboard.writeText(content);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  if (history.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400">
        <div className="text-4xl mb-2">📝</div>
        <p>暂无历史记录</p>
        <p className="text-sm mt-1">生成的内容会自动保存在这里</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-700 dark:text-gray-300">
          历史记录 ({history.length})
        </h3>
        <button
          onClick={handleClear}
          className="text-sm text-gray-400 hover:text-red-500 transition-colors"
        >
          清空
        </button>
      </div>
      
      {history.map((item) => (
        <div
          key={item.id}
          className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-blue-300 dark:hover:border-blue-600 transition-all"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span>{PLATFORM_ICONS[item.platform] || '📄'}</span>
                <span className="text-xs text-gray-400">
                  {CONTENT_TYPE_NAMES[item.contentType] || item.contentType}
                </span>
                <span className="text-xs text-gray-400">·</span>
                <span className="text-xs text-gray-400">
                  {formatTime(item.createdAt)}
                </span>
              </div>
              <p className="font-medium text-gray-800 dark:text-gray-200 truncate">
                {item.topic}
              </p>
              
              {/* 展开内容 */}
              {expanded === item.id && (
                <div className="mt-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-900 text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap max-h-48 overflow-y-auto">
                  {item.content}
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-1">
              <button
                onClick={() => setExpanded(expanded === item.id ? null : item.id)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-400"
                title={expanded === item.id ? '收起' : '展开'}
              >
                {expanded === item.id ? '↑' : '↓'}
              </button>
              <button
                onClick={() => handleCopy(item.id, item.content)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-400"
                title="复制"
              >
                {copied === item.id ? '✓' : '📋'}
              </button>
              <button
                onClick={() => onSelect(item)}
                className="p-2 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors text-blue-500"
                title="重新使用"
              >
                ↺
              </button>
              <button
                onClick={() => handleDelete(item.id)}
                className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors text-gray-400 hover:text-red-500"
                title="删除"
              >
                ×
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
