'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Gear, CheckCircle, WarningCircle, Wrench } from '@phosphor-icons/react';

export function SettingsPanel() {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <motion.button
        whileTap={{ scale: 0.98 }}
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-medium bg-surface-elevated text-zinc-400 hover:text-accent hover:bg-accent/10 border border-border-subtle hover:border-accent/30 transition-all"
      >
        <Gear size={11} weight="bold" />
        设置
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-1.5 w-80 rounded-xl border border-border-subtle bg-surface shadow-2xl z-50 overflow-hidden p-4 space-y-4"
          >
            <div className="flex items-center gap-2 text-xs font-medium text-accent">
              <Wrench size={12} />
              开发者模式
            </div>
            <p className="text-[11px] leading-relaxed text-zinc-400">
              当前使用提供商的 API。自定义 Provider 配置可在后续版本添加。
            </p>
            <div className="flex items-center gap-2 text-[11px]">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              <span className="text-zinc-300">环境正常</span>
            </div>
            <div className="text-[10px] text-zinc-500">
              接口地址通过环境变量配置，支持 OpenAI / Anthropic 格式。
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
