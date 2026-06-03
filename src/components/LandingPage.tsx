'use client';

import React from 'react';
import { motion } from 'motion/react';
import {
  Sparkle,
  RocketLaunch,
  ShieldCheck,
  Lightning,
  CheckCircle,
  ArrowRight,
} from '@phosphor-icons/react';

interface LandingPageProps {
  onGetStarted: () => void;
}

const features = [
  {
    icon: Lightning,
    title: '多平台生成',
    description: '围绕小红书、抖音、公众号三类场景，快速产出可直接发布的内容',
  },
  {
    icon: ShieldCheck,
    title: '本地安全',
    description: '所有数据保存在本地浏览器，隐私安全可控',
  },
  {
    icon: RocketLaunch,
    title: '模板驱动',
    description: '从常用模板快速开始，减少空白页和反复试探',
  },
  {
    icon: Sparkle,
    title: '结果导向',
    description: '兼顾标题、正文、脚本和标签，输出更接近发布状态的结果',
  },
];

const pricingPlans = [
  {
    name: '基础工作台',
    price: '3',
    unit: '个核心平台',
    features: ['小红书内容', '抖音脚本', '公众号文章', '本地数据存储'],
    popular: false,
  },
  {
    name: '模板工作流',
    price: '1',
    unit: '次点击套用',
    features: ['常用模板', '主题回填', '关键词补全', '语气切换'],
    popular: true,
  },
  {
    name: '结果管理',
    price: '2',
    unit: '个导出方式',
    features: ['历史记录', '结果展示', '文本导出', '本地留存'],
    popular: false,
  },
];

export function LandingPage({ onGetStarted }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
              <Sparkle size={18} className="text-accent" weight="fill" />
            </div>
            <span className="font-semibold text-gray-900">AI Content Factory</span>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8 text-sm text-gray-600">
            <a href="#features" className="hover:text-accent transition-colors">功能</a>
            <a href="#pricing" className="hover:text-accent transition-colors">价格</a>
            <a href="#faq" className="hover:text-accent transition-colors">常见问题</a>
          </nav>

          {/* CTA */}
          <div className="flex items-center gap-3">
            <button
              onClick={onGetStarted}
              className="px-5 py-2 rounded-lg bg-accent text-white text-sm font-medium hover:bg-blue-600 transition-colors"
            >
              开始使用
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-24 pb-20 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 tracking-tight leading-tight mb-6">
              把内容生成能力
              <br className="hidden sm:block" />
              放进一个清晰的工作台
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-10 leading-relaxed">
              这个项目聚焦真实的内容生产流程：平台选择、模板生成、历史记录和导出，方便快速产出小红书、抖音和公众号内容。
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <button
                onClick={onGetStarted}
                className="flex items-center gap-2 px-8 py-3.5 rounded-xl bg-accent text-white text-base font-semibold hover:bg-blue-600 transition-all shadow-sm hover:shadow-md active:scale-[0.98]"
              >
                进入工作台
                <ArrowRight size={18} weight="bold" />
              </button>
              <a
                href="#features"
                className="flex items-center gap-2 px-8 py-3.5 rounded-xl border border-gray-300 text-gray-700 text-base font-medium hover:border-accent hover:text-accent transition-all"
              >
                了解更多
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">核心功能模块</h2>
            <p className="text-gray-600 max-w-xl mx-auto">
              以真实功能为中心，快速生成、套用模板、查看历史和导出结果
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="p-6 rounded-2xl bg-white border border-gray-200 shadow-sm hover:shadow-md hover:border-accent/30 transition-all group"
              >
                <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mb-4 group-hover:bg-accent/20 transition-colors">
                  <feature.icon size={24} className="text-accent" weight="fill" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">工作流展示</h2>
            <p className="text-gray-600">围绕实际使用场景，先看能力，再决定怎么用</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {pricingPlans.map((plan, index) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className={`relative p-8 rounded-2xl border-2 ${
                  plan.popular
                    ? 'border-accent bg-accent/5 shadow-lg'
                    : 'border-gray-200 bg-white hover:border-accent/50'
                } transition-all`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-accent text-white text-xs font-semibold rounded-full">
                    推荐
                  </div>
                )}
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{plan.name}</h3>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-gray-900">¥{plan.price}</span>
                  <span className="text-gray-500 text-sm">{plan.unit}</span>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-gray-700">
                      <CheckCircle size={18} className="text-accent" weight="fill" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                <button
                  onClick={onGetStarted}
                  className={`w-full py-3 rounded-xl font-medium transition-all ${
                    plan.popular
                      ? 'bg-accent text-white hover:bg-blue-600'
                      : 'bg-gray-100 text-gray-900 hover:bg-accent hover:text-white'
                  }`}
                >
                    查看详情
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-accent/5">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            准备好开始生成内容了吗？
          </h2>
          <p className="text-gray-600 mb-10 text-lg">
            直接进入工作台，选择平台和模板，开始生成你的第一版内容
          </p>
          <button
            onClick={onGetStarted}
            className="inline-flex items-center gap-2 px-10 py-4 rounded-xl bg-accent text-white text-lg font-semibold hover:bg-blue-600 transition-all shadow-lg hover:shadow-xl active:scale-[0.98]"
          >
            进入工作台
            <ArrowRight size={20} weight="bold" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-50 border-t border-gray-200 py-12">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <Sparkle size={18} className="text-accent" weight="fill" />
              <span className="text-sm text-gray-600">AI Content Factory</span>
            </div>
            <div className="text-sm text-gray-500">
              © 2025 AI Content Factory. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
