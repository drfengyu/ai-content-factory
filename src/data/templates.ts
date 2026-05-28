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
  // ===== 小红书模板 =====
  {
    id: 'xhs-beauty',
    name: '美妆种草',
    icon: '💄',
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
    icon: '🧴',
    platform: 'xiaohongshu',
    contentType: 'xiaohongshu_copy',
    topic: '敏感肌冬季护肤心得',
    keywords: '敏感肌,冬季,护肤,修护,温和',
    tone: '干货',
    description: '适合护肤博主分享护肤心得',
  },
  {
    id: 'xhs-travel',
    name: '旅行攻略',
    icon: '✈️',
    platform: 'xiaohongshu',
    contentType: 'xiaohongshu_copy',
    topic: '周末短途旅行推荐',
    keywords: '周末,短途,旅行,拍照,打卡',
    tone: '活泼',
    description: '适合旅行博主分享周末出游',
  },
  {
    id: 'xhs-food',
    name: '美食探店',
    icon: '🍜',
    platform: 'xiaohongshu',
    contentType: 'xiaohongshu_copy',
    topic: '隐藏在巷子里的宝藏小店',
    keywords: '美食,探店,宝藏,好吃,推荐',
    tone: '种草',
    description: '适合美食博主探店分享',
  },

  // ===== 抖音模板 =====
  {
    id: 'dy-knowledge',
    name: '知识分享',
    icon: '📚',
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
    icon: '💡',
    platform: 'douyin',
    contentType: 'douyin_script',
    topic: '提升生活幸福感的小技巧',
    keywords: '生活,技巧,幸福,实用,日常',
    tone: '活泼',
    description: '适合生活博主分享技巧',
  },
  {
    id: 'dy-food',
    name: '美食教程',
    icon: '🍳',
    platform: 'douyin',
    contentType: 'douyin_script',
    topic: '在家也能做的网红美食',
    keywords: '美食,教程,简单,好吃,网红',
    tone: '活泼',
    description: '适合美食博主拍摄教程',
  },

  // ===== 公众号模板 =====
  {
    id: 'gzh-industry',
    name: '行业分析',
    icon: '📊',
    platform: 'gongzhonghao',
    contentType: 'gongzhonghao_article',
    topic: '2024年行业趋势分析',
    keywords: '行业,趋势,分析,2024,展望',
    tone: '专业',
    description: '适合行业分析师撰写深度文章',
  },
  {
    id: 'gzh-career',
    name: '职场成长',
    icon: '💼',
    platform: 'gongzhonghao',
    contentType: 'gongzhonghao_article',
    topic: '职场新人必看的生存指南',
    keywords: '职场,新人,成长,技巧,经验',
    tone: '干货',
    description: '适合职场博主分享经验',
  },
  {
    id: 'gzh-emotion',
    name: '情感故事',
    icon: '❤️',
    platform: 'gongzhonghao',
    contentType: 'gongzhonghao_article',
    topic: '那些年我们错过的人和事',
    keywords: '情感,故事,回忆,成长,感悟',
    tone: '故事',
    description: '适合情感博主撰写故事',
  },
];

// 按平台分组获取模板
export function getTemplatesByPlatform(platform: Platform): Template[] {
  return TEMPLATES.filter(t => t.platform === platform);
}
