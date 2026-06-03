'use client';

import React, { useMemo, useSyncExternalStore } from 'react';
import { motion } from 'motion/react';
import { ContentType, Platform, Template } from '@/types';
import { Templates } from './Templates';
import {
  ArrowRight,
  MagicWand,
} from '@phosphor-icons/react';
import {
  getSettingsSnapshot,
  getSettingsServerSnapshot,
  subscribeSettings,
} from '@/lib/settings';
import { useDraft } from '@/hooks/useDraft';

interface GenerateFormProps {
  platform: Platform | null;
  contentType: ContentType;
  /**
   * 生成回调。
   * - 返回 true 表示生成成功，表单会清空当前 platform+contentType 的草稿。
   * - 返回 false / 抛错时草稿保留，方便用户在错误恢复后直接重试。
   */
  onGenerate: (params: {
    topic: string;
    keywords: string;
    tone: string;
    length: string;
    extraPrompt: string;
  }) => Promise<boolean> | boolean | void;
  loading: boolean;
}

const TONES = ['自然', '直接', '专业', '克制', '活泼'];
const LENGTHS = ['轻量', '标准', '完整'];

interface DraftShape {
  topic: string;
  keywords: string;
  // tone / length 用 null 表示“未手动选过”，渲染时落到偏好默认值
  tone: string | null;
  length: string | null;
  extraPrompt: string;
}

const EMPTY_DRAFT: DraftShape = {
  topic: '',
  keywords: '',
  tone: null,
  length: null,
  extraPrompt: '',
};

// 平台标题字数软参考（仅供 UI 提示，不强制限制）
const TOPIC_SOFT_HINTS: Partial<Record<Platform, { tip: string; soft: number }>> = {
  xiaohongshu: { tip: '小红书标题建议 ≤ 20 字', soft: 20 },
  douyin: { tip: '抖音口播单段建议 ≤ 50 字', soft: 50 },
  gongzhonghao: { tip: '公众号主题建议 ≤ 30 字', soft: 30 },
};

export function GenerateForm({ platform, contentType, onGenerate, loading }: GenerateFormProps) {
  // 直接订阅 settings 当前快照，作为表单字段的默认值
  // 用户在表单里手动选过的字段会保留为局部 state；未交互的字段始终跟随偏好
  const settings = useSyncExternalStore(
    subscribeSettings,
    getSettingsSnapshot,
    getSettingsServerSnapshot,
  );
  const defaultTone = settings.preferences?.defaultTone ?? '专业';
  const defaultLength = settings.preferences?.defaultLength ?? '标准';

  // 草稿按 platform+contentType 维度命名空间存储，避免不同平台/类型互相覆盖
  const draftKey = useMemo(
    () => `acf:draft:${platform ?? 'none'}:${contentType ?? 'none'}`,
    [platform, contentType],
  );
  const [draft, setDraft, clearDraft] = useDraft<DraftShape>(draftKey, EMPTY_DRAFT);

  const effectiveTone = draft.tone ?? defaultTone;
  const effectiveLength = draft.length ?? defaultLength;

  const handleTemplateSelect = (template: Template) => {
    setDraft((d) => ({
      ...d,
      topic: template.topic,
      keywords: template.keywords,
      tone: template.tone,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft.topic.trim()) return;
    const result = await onGenerate({
      topic: draft.topic,
      keywords: draft.keywords,
      tone: effectiveTone,
      length: effectiveLength,
      extraPrompt: draft.extraPrompt,
    });
    // 只有明确返回 true 才视作成功并清空草稿；undefined / false 都保留草稿
    if (result === true) {
      clearDraft();
      setDraft(EMPTY_DRAFT);
    }
  };

  if (loading) {
    return <GenerateFormSkeleton />;
  }

  const topicHint = platform ? TOPIC_SOFT_HINTS[platform] : null;
  const topicLen = draft.topic.length;
  const overSoft = topicHint ? topicLen > topicHint.soft : false;

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Templates */}
      <Templates platform={platform} onSelect={handleTemplateSelect} />

      {/* Topic */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">
            主题内容 <span className="text-red-500">*</span>
          </label>
          {/* 字符计数 + 平台软提示 */}
          <span
            className={`text-xs tabular-nums ${
              overSoft ? 'text-amber-400' : 'text-zinc-500'
            }`}
          >
            {topicHint ? (
              <>
                {topicLen} / 建议 {topicHint.soft}
              </>
            ) : (
              <>{topicLen} 字</>
            )}
          </span>
        </div>
        <input
          type="text"
          value={draft.topic}
          onChange={(e) => setDraft((d) => ({ ...d, topic: e.target.value }))}
          placeholder="例:夏季护肤攻略、职场成长心得、美食探店分享"
          className="w-full px-4 py-2.5 rounded-xl border border-border-subtle bg-background
                     text-sm text-foreground placeholder:text-zinc-400 dark:placeholder:text-zinc-500
                     focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent
                     transition-all"
          required
        />
        {topicHint && (
          <p className="text-[11px] text-zinc-500 leading-relaxed">
            {topicHint.tip}（超过仅是软提示，不会阻止生成）
          </p>
        )}
      </div>

      {/* Keywords */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium">关键词 / 标签</label>
        <input
          type="text"
          value={draft.keywords}
          onChange={(e) => setDraft((d) => ({ ...d, keywords: e.target.value }))}
          placeholder="例:敏感肌、学生党、平价好物、干货分享"
          className="w-full px-4 py-2.5 rounded-xl border border-border-subtle bg-background
                     text-sm text-foreground placeholder:text-zinc-400 dark:placeholder:text-zinc-500
                     focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent
                     transition-all"
        />
      </div>

      {/* Tone + Length in a 2-col grid (taste-skill: grid over flex-math) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-sm font-medium">文案语气</label>
          <div className="flex flex-wrap gap-1.5">
            {TONES.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setDraft((d) => ({ ...d, tone: t }))}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all active:scale-[0.97] ${
                  effectiveTone === t
                    ? 'bg-accent text-white'
                    : 'bg-surface-elevated text-zinc-500 dark:text-zinc-400 hover:text-foreground'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium">方案复杂度</label>
          <div className="flex gap-1.5">
            {LENGTHS.map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => setDraft((d) => ({ ...d, length: l }))}
                className={`flex-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all active:scale-[0.97] ${
                  effectiveLength === l
                    ? 'bg-accent text-white'
                    : 'bg-surface-elevated text-zinc-500 dark:text-zinc-400 hover:text-foreground'
                }`}
              >
                {l}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Extra Prompt */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium">补充要求</label>
        <textarea
          value={draft.extraPrompt}
          onChange={(e) => setDraft((d) => ({ ...d, extraPrompt: e.target.value }))}
          placeholder="例:突出产品卖点、加入案例、用更贴近用户的口吻"
          rows={3}
          className="w-full px-4 py-2.5 rounded-xl border border-border-subtle bg-background
                     text-sm text-foreground placeholder:text-zinc-400 dark:placeholder:text-zinc-500
                     focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent
                     transition-all resize-none"
        />
      </div>

      {/* Submit */}
      <motion.button
        type="submit"
        disabled={!draft.topic.trim()}
        whileTap={{ scale: 0.98 }}
        className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all ${
          !draft.topic.trim()
            ? 'bg-surface-elevated text-zinc-400 dark:text-zinc-500 cursor-not-allowed'
            : 'bg-accent text-white hover:brightness-110 shadow-sm'
        }`}
      >
        <MagicWand size={16} weight="fill" />
        生成内容
        <ArrowRight size={16} weight="bold" />
      </motion.button>
    </form>
  );
}

function GenerateFormSkeleton() {
  return (
    <div className="space-y-5">
      <div className="flex gap-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="skeleton h-7 w-20" />
        ))}
      </div>
      <div className="space-y-1.5">
        <div className="skeleton h-4 w-24" />
        <div className="skeleton h-10 w-full" />
      </div>
      <div className="space-y-1.5">
        <div className="skeleton h-4 w-16" />
        <div className="skeleton h-10 w-full" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <div className="skeleton h-4 w-16" />
          <div className="flex gap-1.5">
            {[1, 2, 3].map((i) => (
              <div key={i} className="skeleton h-7 flex-1" />
            ))}
          </div>
        </div>
        <div className="space-y-1.5">
          <div className="skeleton h-4 w-16" />
          <div className="flex gap-1.5">
            {[1, 2, 3].map((i) => (
              <div key={i} className="skeleton h-7 flex-1" />
            ))}
          </div>
        </div>
      </div>
      <div className="skeleton h-20 w-full" />
      <div className="skeleton h-11 w-full" />
    </div>
  );
}
