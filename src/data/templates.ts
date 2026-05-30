import { Platform, ContentType } from '@/types';

export interface Template {
  id: string;
  name: string;
  icon: string;
  platform: Platform;
  contentType: ContentType;
  topic: string;
  keywords: string;
  tone: string;
  description: string;
}

export const TEMPLATES: Template[] = [
  {
    id: 'svc-content-pack',
    name: 'AI 内容代写首单',
    icon: 'package',
    platform: 'service',
    contentType: 'service_package',
    topic: 'AI Content Factory：为小商家和自媒体提供小红书笔记、抖音脚本、公众号文章代写服务',
    keywords: '本地餐饮店、咖啡店、美甲店、知识博主、想做账号但没时间的人',
    tone: '专业',
    description: '设计你能立刻售卖的 99/199/299 服务包',
  },
  {
    id: 'svc-local-business',
    name: '本地商家获客包',
    icon: 'store',
    platform: 'service',
    contentType: 'service_package',
    topic: '帮本地商家快速生成小红书探店文案、朋友圈促销文案、抖音短视频脚本',
    keywords: '餐饮店、咖啡店、美甲美睫、健身房、民宿老板',
    tone: '直接',
    description: '适合从身边商家拿第一单',
  },
  {
    id: 'svc-outreach',
    name: '微信成交话术',
    icon: 'chat',
    platform: 'service',
    contentType: 'client_outreach',
    topic: '199元 AI 内容代写试单：交付3篇小红书笔记或3条短视频脚本',
    keywords: '朋友圈熟人、本地小老板、小红书新手博主',
    tone: '自然',
    description: '生成今天就能发出去的获客内容',
  },
  {
    id: 'svc-delivery',
    name: '首单交付 SOP',
    icon: 'target',
    platform: 'service',
    contentType: 'delivery_kit',
    topic: '199元小红书内容代写服务：客户提供产品信息，我交付3篇可发布笔记',
    keywords: '小商家、个人品牌、探店账号、知识博主',
    tone: '专业',
    description: '把第一单交付流程标准化，避免翻车',
  },

  {
    id: 'xhs-beauty',
    name: '美妆种草',
    icon: 'beauty',
    platform: 'xiaohongshu',
    contentType: 'xiaohongshu_copy',
    topic: '平价好用的国货彩妆推荐',
    keywords: '国货,平价,学生党,好用,推荐',
    tone: '种草',
    description: '适合美妆博主种草国货彩妆',
  },
  {
    id: 'xhs-skincare',
    name: '护肤分享',
    icon: 'skincare',
    platform: 'xiaohongshu',
    contentType: 'xiaohongshu_copy',
    topic: '敏感肌冬季护肤心得',
    keywords: '敏感肌,冬季,护肤,修护,温和',
    tone: '干货',
    description: '适合护肤博主分享护肤心得',
  },
  {
    id: 'dy-knowledge',
    name: '知识分享',
    icon: 'book',
    platform: 'douyin',
    contentType: 'douyin_script',
    topic: '3分钟学会一个实用技能',
    keywords: '知识,干货,实用,技巧,教学',
    tone: '专业',
    description: '适合知识博主分享干货',
  },
  {
    id: 'dy-life',
    name: '生活技巧',
    icon: 'idea',
    platform: 'douyin',
    contentType: 'douyin_script',
    topic: '提升生活幸福感的小技巧',
    keywords: '生活,技巧,幸福,实用,日常',
    tone: '活泼',
    description: '适合生活博主分享技巧',
  },
  {
    id: 'gzh-industry',
    name: '行业分析',
    icon: 'chart',
    platform: 'gongzhonghao',
    contentType: 'gongzhonghao_article',
    topic: '2026年行业趋势分析',
    keywords: '行业,趋势,分析,2026,展望',
    tone: '专业',
    description: '适合行业分析师撰写深度文章',
  },
  {
    id: 'gzh-career',
    name: '职场成长',
    icon: 'career',
    platform: 'gongzhonghao',
    contentType: 'gongzhonghao_article',
    topic: '职场新人必看的生存指南',
    keywords: '职场,新人,成长,技巧,经验',
    tone: '干货',
    description: '适合职场博主分享经验',
  },
];

export function getTemplatesByPlatform(platform: Platform): Template[] {
  return TEMPLATES.filter(t => t.platform === platform);
}
