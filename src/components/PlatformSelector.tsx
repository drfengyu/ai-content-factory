'use client';

import React from 'react';
import { motion } from 'motion/react';
import { PLATFORMS, CONTENT_TYPES } from '@/data/prompts';
import { Platform, ContentType } from '@/types';
import {
  BookOpenText,
  Briefcase,
  MusicNote,
  Newspaper,
  Sparkle,
  FileText,
  Tag,
  VideoCamera,
  Lightning,
  ListDashes,
  Article,
  Target,
  ChatCircleText,
  Package,
} from '@phosphor-icons/react';

interface PlatformSelectorProps {
  selected: Platform | null;
  onSelect: (platform: Platform) => void;
}

const PLATFORM_ICONS: Record<Platform, React.ReactNode> = {
  service: <Briefcase size={28} weight="regular" />,
  xiaohongshu: <BookOpenText size={28} weight="regular" />,
  douyin: <MusicNote size={28} weight="regular" />,
  gongzhonghao: <Newspaper size={28} weight="regular" />,
};

const PLATFORM_ACCENTS: Record<Platform, string> = {
  service: 'text-accent',
  xiaohongshu: 'text-rose-500',
  douyin: 'text-zinc-100',
  gongzhonghao: 'text-emerald-500',
};

export function PlatformSelector({ selected, onSelect }: PlatformSelectorProps) {
  const entries = Object.entries(PLATFORMS);

  return (
    <section className="mb-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {entries.map(([key, platform], i) => {
          const isSelected = selected === key;
          return (
            <motion.button
              key={key}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.06, ease: [0.16, 1, 0.3, 1] }}
              onClick={() => onSelect(key as Platform)}
              className={`group relative flex flex-col items-center gap-2 p-6 rounded-xl border transition-all duration-200 active:scale-[0.98] ${
                isSelected
                  ? 'border-accent bg-accent-soft'
                  : 'border-border-subtle bg-surface hover:border-zinc-400 dark:hover:border-zinc-500'
              }`}
            >
              <div className={`transition-colors duration-200 ${
                isSelected ? 'text-accent' : PLATFORM_ACCENTS[key as Platform]
              }`}>
                {PLATFORM_ICONS[key as Platform]}
              </div>
              <span className={`text-sm font-medium ${
                isSelected ? 'text-accent' : 'text-foreground'
              }`}>
                {platform.name}
              </span>
              <span className="text-[11px] text-zinc-500 dark:text-zinc-400 text-center leading-tight">
                {platform.description}
              </span>
            </motion.button>
          );
        })}
      </div>
    </section>
  );
}

const TYPE_ICONS: Record<ContentType, React.ReactNode> = {
  service_package: <Package size={20} weight="regular" />,
  client_outreach: <ChatCircleText size={20} weight="regular" />,
  delivery_kit: <Target size={20} weight="fill" />,
  xiaohongshu_title: <Sparkle size={20} weight="fill" />,
  xiaohongshu_copy: <FileText size={20} weight="regular" />,
  xiaohongshu_hashtag: <Tag size={20} weight="regular" />,
  douyin_script: <VideoCamera size={20} weight="regular" />,
  douyin_hook: <Lightning size={20} weight="fill" />,
  gongzhonghao_outline: <ListDashes size={20} weight="regular" />,
  gongzhonghao_article: <Article size={20} weight="regular" />,
};

interface ContentTypeSelectorProps {
  platform: Platform;
  selected: ContentType | null;
  onSelect: (type: ContentType) => void;
}

export function ContentTypeSelector({ platform, selected, onSelect }: ContentTypeSelectorProps) {
  const types = Object.entries(CONTENT_TYPES)
    .filter(([, config]) => config.platform === platform);

  return (
    <section className="mb-8">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {types.map(([key, config], i) => {
          const isSelected = selected === key;
          return (
            <motion.button
              key={key}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: 0.05 * i, ease: [0.16, 1, 0.3, 1] }}
              onClick={() => onSelect(key as ContentType)}
              className={`flex items-center gap-3 p-3 rounded-xl border transition-all duration-200 text-left active:scale-[0.98] ${
                isSelected
                  ? 'border-accent bg-accent-soft'
                  : 'border-border-subtle bg-surface hover:border-zinc-400 dark:hover:border-zinc-500'
              }`}
            >
              <div className={`flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center ${
                isSelected
                  ? 'bg-accent text-white'
                  : 'bg-surface-elevated text-zinc-500 dark:text-zinc-400'
              }`}>
                {TYPE_ICONS[key as ContentType]}
              </div>
              <div className="min-w-0">
                <div className="text-sm font-medium">{config.name}</div>
                <div className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate">
                  {config.description}
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>
    </section>
  );
}
