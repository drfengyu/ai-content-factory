'use client';

import React from 'react';
import { motion } from 'motion/react';
import { getTemplatesByPlatform, Template } from '@/data/templates';
import { Platform } from '@/types';
import {
  Package,
  Storefront,
  ChatCircleText,
  Target,
  Palette,
  Drop,
  Compass,
  ForkKnife,
  Books,
  Lightbulb,
  CookingPot,
  ChartBar,
  Briefcase,
  Heart,
} from '@phosphor-icons/react';

interface TemplatesProps {
  platform: Platform | null;
  onSelect: (template: Template) => void;
}

const TEMPLATE_ICONS: Record<string, React.ReactNode> = {
  'svc-content-pack': <Package size={16} weight="duotone" />,
  'svc-local-business': <Storefront size={16} weight="duotone" />,
  'svc-outreach': <ChatCircleText size={16} weight="duotone" />,
  'svc-delivery': <Target size={16} weight="duotone" />,
  'xhs-beauty': <Palette size={16} weight="duotone" />,
  'xhs-skincare': <Drop size={16} weight="duotone" />,
  'xhs-travel': <Compass size={16} weight="duotone" />,
  'xhs-food': <ForkKnife size={16} weight="duotone" />,
  'dy-knowledge': <Books size={16} weight="duotone" />,
  'dy-life': <Lightbulb size={16} weight="duotone" />,
  'dy-food': <CookingPot size={16} weight="duotone" />,
  'gzh-industry': <ChartBar size={16} weight="duotone" />,
  'gzh-career': <Briefcase size={16} weight="duotone" />,
  'gzh-emotion': <Heart size={16} weight="duotone" />,
};

export function Templates({ platform, onSelect }: TemplatesProps) {
  if (!platform) return null;
  const templates = getTemplatesByPlatform(platform);

  if (templates.length === 0) return null;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400 tracking-wide uppercase">
          快捷模板
        </span>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {templates.map((template) => (
          <motion.button
            key={template.id}
            type="button"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onSelect(template)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg
                       bg-surface-elevated text-xs text-zinc-500 dark:text-zinc-400
                       hover:text-accent hover:bg-accent/10
                       border border-border-subtle hover:border-accent/30
                       transition-all"
          >
            {TEMPLATE_ICONS[template.id] || null}
            <span>{template.name}</span>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
