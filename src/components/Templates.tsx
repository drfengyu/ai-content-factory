'use client';

import React from 'react';
import { getTemplatesByPlatform, Template } from '@/data/templates';
import { Platform } from '@/types';

interface TemplatesProps {
  platform: Platform;
  onSelect: (template: Template) => void;
}

export function Templates({ platform, onSelect }: TemplatesProps) {
  const templates = getTemplatesByPlatform(platform);

  if (templates.length === 0) return null;

  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
          💡 快捷模板
        </span>
        <span className="text-xs text-gray-400">点击一键填充</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {templates.map((template) => (
          <button
            key={template.id}
            onClick={() => onSelect(template)}
            className="group flex items-center gap-2 px-3 py-2 rounded-lg 
                       bg-gray-100 dark:bg-gray-800 
                       hover:bg-blue-100 dark:hover:bg-blue-900/30
                       border border-transparent hover:border-blue-300 dark:hover:border-blue-700
                       transition-all text-sm"
            title={template.description}
          >
            <span>{template.icon}</span>
            <span className="text-gray-700 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400">
              {template.name}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
