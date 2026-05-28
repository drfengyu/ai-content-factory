'use client';

import React from 'react';
import { PLATFORMS, CONTENT_TYPES } from '@/data/prompts';
import { Platform, ContentType } from '@/types';

interface PlatformSelectorProps {
  selected: Platform | null;
  onSelect: (platform: Platform) => void;
}

export function PlatformSelector({ selected, onSelect }: PlatformSelectorProps) {
  return (
    <div className="grid grid-cols-3 gap-4 mb-8">
      {Object.entries(PLATFORMS).map(([key, platform]) => {
        const isSelected = selected === key;
        return (
          <button
            key={key}
            onClick={() => onSelect(key as Platform)}
            className={`relative p-6 rounded-2xl border-2 transition-all duration-300 text-left
              ${isSelected 
                ? 'border-blue-500 bg-blue-500/10 shadow-lg shadow-blue-500/20' 
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-500 bg-white dark:bg-gray-800'
              }`}
          >
            <div className="text-4xl mb-3">{platform.icon}</div>
            <h3 className="text-xl font-bold mb-1">{platform.name}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">{platform.description}</p>
            {isSelected && (
              <div className="absolute top-3 right-3 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}

interface ContentTypeSelectorProps {
  platform: Platform;
  selected: ContentType | null;
  onSelect: (type: ContentType) => void;
}

export function ContentTypeSelector({ platform, selected, onSelect }: ContentTypeSelectorProps) {
  const types = Object.entries(CONTENT_TYPES)
    .filter(([, config]) => config.platform === platform);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8">
      {types.map(([key, config]) => {
        const isSelected = selected === key;
        return (
          <button
            key={key}
            onClick={() => onSelect(key as ContentType)}
            className={`p-4 rounded-xl border-2 transition-all duration-200 text-left
              ${isSelected 
                ? 'border-blue-500 bg-blue-500/10' 
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-500'
              }`}
          >
            <div className="text-2xl mb-2">{config.icon}</div>
            <div className="font-semibold">{config.name}</div>
            <div className="text-xs text-gray-500 mt-1">{config.description}</div>
          </button>
        );
      })}
    </div>
  );
}
