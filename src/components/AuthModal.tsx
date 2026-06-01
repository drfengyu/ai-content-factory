'use client';

import React, { useState, useSyncExternalStore } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User } from '@/types';
import {
  clearCurrentUser,
  createLocalUser,
  getCurrentUserServerSnapshot,
  getCurrentUserSnapshot,
  subscribeCurrentUser,
} from '@/lib/user';
import { X, ArrowRight, UserPlus, SignOut } from '@phosphor-icons/react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (user: User) => void;
}

export function AuthModal({ isOpen, onClose, onAuthSuccess }: AuthModalProps) {
  const currentUser = useSyncExternalStore(subscribeCurrentUser, getCurrentUserSnapshot, getCurrentUserServerSnapshot);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('AI 内容服务主理人');
  const [error, setError] = useState<string | null>(null);
  const existingUser = isOpen ? currentUser : null;

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('请输入邮箱或联系方式');
      return;
    }
    const user = createLocalUser({ name, email, role });
    onAuthSuccess(user);
    onClose();
    setError(null);
  };

  const handleLogout = () => {
    clearCurrentUser();
    onClose();
    // Refresh page to show landing
    window.location.reload();
  };

  const handleClose = () => {
    setError(null);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={handleClose}
          />

          {/* Modal Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: 8 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="relative w-full max-w-md rounded-2xl bg-white border border-black/10 card-shadow p-8"
          >
            {/* Close button */}
            <button
              onClick={handleClose}
              className="absolute right-4 top-4 rounded-lg p-2 text-gray-400 hover:bg-gray-50 hover:text-gray-600 transition-colors"
              aria-label="关闭"
            >
              <X size={20} />
            </button>

            {/* Header */}
            <div className="text-center mb-8">
              <div className="mx-auto w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center mb-4">
                <UserPlus size={32} className="text-accent" weight="fill" />
              </div>
              <h2 className="text-2xl font-semibold text-gray-900 tracking-tight">
                {existingUser ? '欢迎回来' : '开始使用'}
              </h2>
              <p className="mt-2 text-gray-600">
                {existingUser
                  ? '你已有本地档案，是否退出？'
                  : '创建本地档案，开始生成内容。数据保存在当前浏览器。'}
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
                {error}
              </div>
            )}

            {existingUser ? (
              <div className="space-y-6">
                <div className="rounded-xl border border-gray-200 p-4 bg-gray-50/50">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-electric-blue/10 flex items-center justify-center">
                      <span className="text-electric-blue font-semibold text-sm">
                        {existingUser.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{existingUser.name}</div>
                      <div className="text-xs text-gray-500">{existingUser.email}</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="rounded-lg bg-white p-3 border border-gray-200">
                      <div className="text-lg font-semibold text-gray-900">{existingUser.usage}</div>
                      <div className="text-xs text-gray-500">今日生成</div>
                    </div>
                    <div className="rounded-lg bg-white p-3 border border-gray-200">
                      <div className="text-lg font-semibold text-gray-900">20</div>
                      <div className="text-xs text-gray-500">日额度</div>
                    </div>
                    <div className="rounded-lg bg-white p-3 border border-gray-200">
                      <div className="text-lg font-semibold text-electric-blue">本地</div>
                      <div className="text-xs text-gray-500">数据</div>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-700 font-medium hover:bg-gray-50 hover:border-red-300 hover:text-red-600 transition-all active:scale-[0.98]"
                >
                  <SignOut size={18} />
                  退出本地档案
                </button>

                <p className="text-xs text-gray-500 text-center">
                  退出后，本地数据保留，你可以用同一账号重新登录。
                </p>
              </div>
            ) : (
              <form onSubmit={handleCreateUser} className="space-y-5">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700">你的称呼</label>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="例：内容服务主理人"
                    className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none transition-all placeholder:text-gray-400 focus:border-electric-blue focus:ring-2 focus:ring-electric-blue/20"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700">
                    邮箱 / 联系方式 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="用于本地档案展示和联系"
                    className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none transition-all placeholder:text-gray-400 focus:border-electric-blue focus:ring-2 focus:ring-electric-blue/20"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700">身份定位</label>
                  <input
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    placeholder="例：AI 内容服务主理人"
                    className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none transition-all placeholder:text-gray-400 focus:border-electric-blue focus:ring-2 focus:ring-electric-blue/20"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-electric-blue px-4 py-3.5 text-white font-semibold shadow-sm hover:bg-blue-500 hover:shadow-md transition-all active:scale-[0.98]"
                >
                  创建本地档案
                  <ArrowRight size={18} weight="bold" />
                </button>

                <p className="text-xs text-gray-500 text-center leading-relaxed">
                  这是首单验证用的轻量用户系统，数据只保存在当前浏览器。上线后可替换为真实登录和数据库。
                </p>
              </form>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
