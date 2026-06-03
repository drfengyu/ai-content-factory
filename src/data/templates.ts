import { Template } from '@/types';

export type { Template } from '@/types';

export const TEMPLATES: Template[] = [
  // ===== 小红书 =====
  {
    id: 'xhs-beauty',
    name: '美妆种草',
    platform: 'xiaohongshu',
    contentType: 'xiaohongshu_copy',
    topic: '平价好用的国货彩妆推荐',
    keywords: '国货,平价,学生党,好用,推荐',
    tone: '种草',
    description: '适合美妆博主种草国货彩妆',
    category: 'planting',
  },
  {
    id: 'xhs-skincare',
    name: '护肤分享',
    platform: 'xiaohongshu',
    contentType: 'xiaohongshu_copy',
    topic: '敏感肌冬季护肤心得',
    keywords: '敏感肌,冬季,护肤,修护,温和',
    tone: '干货',
    description: '适合护肤博主分享护肤心得',
    category: 'knowledge',
  },
  {
    id: 'xhs-travel',
    name: '旅行攻略',
    platform: 'xiaohongshu',
    contentType: 'xiaohongshu_copy',
    topic: '小众宝藏旅行地推荐',
    keywords: '小众,宝藏,旅行,出片,攻略',
    tone: '种草',
    description: '适合旅行博主分享目的地攻略',
    category: 'planting',
  },
  {
    id: 'xhs-food',
    name: '美食探店',
    platform: 'xiaohongshu',
    contentType: 'xiaohongshu_copy',
    topic: '本地宝藏小馆探店笔记',
    keywords: '探店,小馆,本地,宝藏,好吃',
    tone: '自然',
    description: '适合本地美食博主探店分享',
    category: 'review',
  },

  // ===== 抖音 =====
  {
    id: 'dy-knowledge',
    name: '知识分享',
    platform: 'douyin',
    contentType: 'douyin_script',
    topic: '3分钟学会一个实用技能',
    keywords: '知识,干货,实用,技巧,教学',
    tone: '专业',
    description: '适合知识博主分享干货',
    category: 'knowledge',
  },
  {
    id: 'dy-life',
    name: '生活技巧',
    platform: 'douyin',
    contentType: 'douyin_script',
    topic: '提升生活幸福感的小技巧',
    keywords: '生活,技巧,幸福,实用,日常',
    tone: '活泼',
    description: '适合生活博主分享技巧',
    category: 'knowledge',
  },
  {
    id: 'dy-food',
    name: '美食教程',
    platform: 'douyin',
    contentType: 'douyin_script',
    topic: '一口锅搞定的家常菜教程',
    keywords: '美食,家常菜,简单,教程,快手',
    tone: '活泼',
    description: '适合美食博主分享菜谱教程',
    category: 'knowledge',
  },

  // ===== 公众号 =====
  {
    id: 'gzh-industry',
    name: '行业分析',
    platform: 'gongzhonghao',
    contentType: 'gongzhonghao_article',
    topic: '2026年行业趋势分析',
    keywords: '行业,趋势,分析,2026,展望',
    tone: '专业',
    description: '适合行业分析师撰写深度文章',
    category: 'knowledge',
  },
  {
    id: 'gzh-career',
    name: '职场成长',
    platform: 'gongzhonghao',
    contentType: 'gongzhonghao_article',
    topic: '职场新人必看的生存指南',
    keywords: '职场,新人,成长,技巧,经验',
    tone: '干货',
    description: '适合职场博主分享经验',
    category: 'knowledge',
  },
  {
    id: 'gzh-emotion',
    name: '情感观察',
    platform: 'gongzhonghao',
    contentType: 'gongzhonghao_article',
    topic: '当代年轻人的情绪自救指南',
    keywords: '情感,情绪,年轻人,治愈,自我',
    tone: '克制',
    description: '适合情感号撰写共鸣型文章',
    category: 'story',
  },
];

export function getTemplatesByPlatform(platform: Template['platform']): Template[] {
  return TEMPLATES.filter(t => t.platform === platform);
}
