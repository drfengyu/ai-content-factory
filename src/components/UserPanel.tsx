'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { User } from '@/types';
import { clearCurrentUser, createLocalUser, loadCurrentUser } from '@/lib/user';
import {
  ArrowRight,
  CrownSimple,
  SignOut,
  UserCircle,
  UserPlus,
  X,
} from '@phosphor-icons/react';

interface UserPanelProps {
  user: User | null;
  onUserChange: (user: User | null) => void;
}

const PLAN_LABELS: Record<User['plan'], string> = {
  starter: '首单版',
  pro: '增长版',
  studio: '工作室版',
};

export function UserPanel({ user, onUserChange }: UserPanelProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('AI 内容服务主理人');

  useEffect(() => {
    onUserChange(loadCurrentUser());
  }, [onUserChange]);

  const usagePercent = useMemo(() => {
    if (!user) return 0;
    return Math.min(100, Math.round((user.usage / user.maxUsage) * 100));
  }, [user]);

  const handleCreateUser = (event: React.FormEvent) => {
    event.preventDefault();
    if (!email.trim()) return;
    const nextUser = createLocalUser({ name, email, role });
    onUserChange(nextUser);
    setOpen(false);
  };

  const handleLogout = () => {
    clearCurrentUser();
    onUserChange(null);
    setOpen(false);
  };

  return (
    <div className="relative">
      <motion.button
        type="button"
        whileTap={{ scale: 0.98 }}
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-xl border border-border-subtle bg-surface/90 px-3 py-2 text-xs text-zinc-500 shadow-sm transition-all hover:border-accent/40 hover:text-foreground dark:text-zinc-400"
      >
        {user ? (
          <>
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent/10 text-accent">
              <UserCircle size={18} weight="fill" />
            </span>
            <span className="hidden text-left sm:block">
              <span className="block text-[11px] text-zinc-400">{PLAN_LABELS[user.plan]}</span>
              <span className="block max-w-28 truncate font-medium text-foreground">{user.name}</span>
            </span>
          </>
        ) : (
          <>
            <UserPlus size={16} className="text-accent" />
            <span>登录 / 建档</span>
          </>
        )}
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className="absolute right-0 top-12 z-40 w-[min(92vw,360px)] overflow-hidden rounded-xl border border-border-subtle bg-surface shadow-2xl shadow-black/10"
          >
            <div className="flex items-center justify-between border-b border-border-subtle px-4 py-3">
              <div>
                <div className="text-sm font-semibold">用户系统</div>
                <div className="text-[11px] text-zinc-500 dark:text-zinc-400">本地档案，先服务首单验证</div>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-lg p-1.5 text-zinc-400 transition-all hover:bg-surface-elevated hover:text-foreground active:scale-[0.98]"
                aria-label="关闭用户面板"
              >
                <X size={14} />
              </button>
            </div>

            {user ? (
              <div className="space-y-4 p-4">
                <div className="rounded-xl border border-accent/20 bg-accent/5 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-base font-semibold">{user.name}</div>
                      <div className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{user.email}</div>
                      <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-surface px-2.5 py-1 text-[11px] text-accent">
                        <CrownSimple size={13} weight="fill" />
                        {PLAN_LABELS[user.plan]}
                      </div>
                    </div>
                    <div className="rounded-lg bg-surface px-2.5 py-1.5 text-right text-[11px] text-zinc-500 dark:text-zinc-400">
                      <div>今日生成</div>
                      <div className="text-sm font-semibold text-foreground">{user.usage}/{user.maxUsage}</div>
                    </div>
                  </div>

                  <div className="mt-4 h-2 overflow-hidden rounded-full bg-surface-elevated">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${usagePercent}%` }}
                      className="h-full rounded-full bg-accent"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center text-[11px] text-zinc-500 dark:text-zinc-400">
                  <div className="rounded-xl border border-border-subtle p-3">
                    <div className="font-semibold text-foreground">20</div>
                    <div>日额度</div>
                  </div>
                  <div className="rounded-xl border border-border-subtle p-3">
                    <div className="font-semibold text-foreground">本地</div>
                    <div>数据</div>
                  </div>
                  <div className="rounded-xl border border-border-subtle p-3">
                    <div className="font-semibold text-foreground">可升级</div>
                    <div>Auth</div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-border-subtle px-3 py-2.5 text-sm text-zinc-500 transition-all hover:border-red-500/30 hover:bg-red-500/5 hover:text-red-500 active:scale-[0.98] dark:text-zinc-400"
                >
                  <SignOut size={16} />
                  退出本地档案
                </button>
              </div>
            ) : (
              <form onSubmit={handleCreateUser} className="space-y-4 p-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium">你的称呼</label>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="例：内容服务主理人"
                    className="w-full rounded-xl border border-border-subtle bg-background px-3 py-2.5 text-sm outline-none transition-all placeholder:text-zinc-400 focus:border-accent focus:ring-2 focus:ring-accent/30"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium">邮箱 / 联系方式 <span className="text-red-500">*</span></label>
                  <input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="用于本地档案展示"
                    className="w-full rounded-xl border border-border-subtle bg-background px-3 py-2.5 text-sm outline-none transition-all placeholder:text-zinc-400 focus:border-accent focus:ring-2 focus:ring-accent/30"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium">身份定位</label>
                  <input
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    placeholder="例：AI 内容服务主理人"
                    className="w-full rounded-xl border border-border-subtle bg-background px-3 py-2.5 text-sm outline-none transition-all placeholder:text-zinc-400 focus:border-accent focus:ring-2 focus:ring-accent/30"
                  />
                </div>
                <button
                  type="submit"
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-accent px-3 py-2.5 text-sm font-semibold text-white transition-all hover:brightness-110 active:scale-[0.98]"
                >
                  创建本地档案
                  <ArrowRight size={16} weight="bold" />
                </button>
                <p className="text-[11px] leading-relaxed text-zinc-500 dark:text-zinc-400">
                  这是首单验证用的轻量用户系统，数据只保存在当前浏览器。上线后可替换为真实登录和数据库。
                </p>
              </form>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
