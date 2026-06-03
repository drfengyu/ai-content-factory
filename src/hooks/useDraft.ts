'use client';

import { useEffect, useState } from 'react';

/**
 * 表单草稿持久化
 *
 * - 以 `key` 为命名空间存进 localStorage(不同平台 / 内容类型用不同 key,避免相互覆盖)
 * - 写入做 300ms debounce,避免每个按键都触发 setItem
 * - 暴露 `clearDraft`,让调用方在生成成功后手动清空
 * - key 变化时用 React 推荐的"在渲染中调用 setState"模式重新拉草稿:
 *   把上一次的 key 也放进 useState,在 render 里比较——React 会立刻 re-render 而不提交 DOM,
 *   等价于"派生 state"。这样既不会触发 useEffect 的级联渲染告警,也不会读 ref。
 *
 * 注意:仅依赖 `key` 重新拉取草稿,不会监听 initial 变化——initial 通常是常量,
 * 不希望它的引用变化导致草稿被冲掉。
 */
export function useDraft<T>(
  key: string,
  initial: T,
): [T, (value: T | ((prev: T) => T)) => void, () => void] {
  const [value, setValue] = useState<T>(() => readDraft(key, initial));
  const [prevKey, setPrevKey] = useState(key);

  // 派生 state:key 变了就同步拉新草稿,React 在本次 render 后立刻重渲,不提交首帧
  if (prevKey !== key) {
    setPrevKey(key);
    setValue(readDraft(key, initial));
  }

  // 写入:debounce 300ms
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const timer = setTimeout(() => {
      try {
        window.localStorage.setItem(key, JSON.stringify(value));
      } catch {
        // 存储满 / 隐私模式:静默忽略,不影响表单可用
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [key, value]);

  const clearDraft = () => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.removeItem(key);
    } catch {
      // ignore
    }
  };

  return [value, setValue, clearDraft];
}

function readDraft<T>(key: string, initial: T): T {
  if (typeof window === 'undefined') return initial;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : initial;
  } catch {
    return initial;
  }
}
