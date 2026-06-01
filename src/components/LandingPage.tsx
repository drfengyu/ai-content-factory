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
    title: '快速生成',
    description: '几秒钟生成高质量内容，支持多平台格式一键导出',
  },
  {
    icon: ShieldCheck,
    title: '本地安全',
    description: '所有数据保存在本地浏览器，隐私安全可控',
  },
  {
    icon: RocketLaunch,
    title: '商业就绪',
    description: '内置99/199/299三档服务包模板，快速变现',
  },
  {
    icon: Sparkle,
    title: 'AI原生',
    description: '智能分析需求，自动优化内容，让AI为你工作',
  },
];

const pricingPlans = [
  {
    name: '首单体验',
    price: '99',
    unit: '元/次',
    features: ['5万字生成额度', '20张AI绘图', '基础模板', '本地数据存储'],
    popular: false,
  },
  {
    name: '增长版',
    price: '199',
    unit: '元/月',
    features: ['10万字额度', '40张AI绘图', '全部高级功能', '3个团队成员'],
    popular: true,
  },
  {
    name: '工作室',
    price: '299',
    unit: '元/月',
    features: ['20万字额度', '80张AI绘图', '优先队列', '无限团队席位', '专属客服'],
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
              把 AI 内容能力
              <br className="hidden sm:block" />
              包装成你的第一单服务收入
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-10 leading-relaxed">
              先不做复杂 SaaS。用这个项目展示能力、生成交付内容、设计 99/199/299 服务包，通过微信完成第一笔成交。
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <button
                onClick={onGetStarted}
                className="flex items-center gap-2 px-8 py-3.5 rounded-xl bg-accent text-white text-base font-semibold hover:bg-blue-600 transition-all shadow-sm hover:shadow-md active:scale-[0.98]"
              >
                免费开始创作
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
            <h2 className="text-3xl font-bold text-gray-900 mb-4">全场景 AI 应用</h2>
            <p className="text-gray-600 max-w-xl mx-auto">
              支持多种内容类型，一站式解决你的创作需求
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
            <h2 className="text-3xl font-bold text-gray-900 mb-4">灵活的定价</h2>
            <p className="text-gray-600">选择适合你的服务包，开始AI内容创作之旅</p>
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
                    最受欢迎
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
                  选择此方案
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
            准备好开始你的AI内容服务了吗？
          </h2>
          <p className="text-gray-600 mb-10 text-lg">
            立即注册，获得首单体验额度，开启商业化之路
          </p>
          <button
            onClick={onGetStarted}
            className="inline-flex items-center gap-2 px-10 py-4 rounded-xl bg-accent text-white text-lg font-semibold hover:bg-blue-600 transition-all shadow-lg hover:shadow-xl active:scale-[0.98]"
          >
            免费注册
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
