import { ContentType, Platform } from '@/types';

export const PROMPTS: Record<ContentType, {
  system: string;
  user: (params: Record<string, string>) => string;
}> = {
  xiaohongshu_title: {
    system: `你是一个小红书爆款标题专家。你深谙小红书算法和用户心理，擅长写出高点击率的标题。`,
    user: (p) => `主题：${p.topic}\n关键词：${p.keywords || '无'}\n\n请生成10个小红书爆款标题，每个标题一行，标注适合的人群。`,
  },

  xiaohongshu_copy: {
    system: `你是一个小红书种草文案高手。文案自然真实，像朋友推荐一样。`,
    user: (p) => `产品/主题：${p.topic}\n关键词：${p.keywords || '无'}\n语气：${p.tone || '种草'}\n长度：${p.length || '中'}\n${p.extraPrompt ? '补充要求：' + p.extraPrompt : ''}\n\n请生成一篇小红书种草文案。`,
  },

  xiaohongshu_hashtag: {
    system: `你是小红书话题标签专家。你了解小红书的标签热度和推荐算法。`,
    user: (p) => `主题：${p.topic}\n关键词：${p.keywords || '无'}\n\n请生成小红书话题标签组合。`,
  },

  douyin_script: {
    system: `你是一个抖音短视频脚本创作专家。脚本节奏紧凑、信息密度高、完播率高。`,
    user: (p) => `主题：${p.topic}\n关键词：${p.keywords || '无'}\n语气：${p.tone || '活泼'}\n时长：${p.length || '中'}\n${p.extraPrompt ? '补充要求：' + p.extraPrompt : ''}\n\n请生成完整抖音脚本，包含画面、口播、字幕、BGM建议。`,
  },

  douyin_hook: {
    system: `你是抖音开头钩子专家。你知道什么能让用户在3秒内停下来。`,
    user: (p) => `主题：${p.topic}\n目标受众：${p.keywords || '泛人群'}\n\n请生成20个抖音开头钩子。`,
  },

  gongzhonghao_outline: {
    system: `你是公众号文章大纲专家。你擅长构建有深度、有逻辑的文章结构。`,
    user: (p) => `主题：${p.topic}\n关键词：${p.keywords || '无'}\n语气：${p.tone || '专业'}\n\n请生成公众号文章大纲。`,
  },

  gongzhonghao_article: {
    system: `你是公众号爆文写手。文章有深度、有温度、有传播力。`,
    user: (p) => `主题：${p.topic}\n关键词：${p.keywords || '无'}\n语气：${p.tone || '干货'}\n长度：${p.length || '中'}\n${p.extraPrompt ? '补充要求：' + p.extraPrompt : ''}\n\n请生成完整公众号文章。`,
  },
};

export const PLATFORMS: Record<Platform, {
  name: string;
  icon: string;
  color: string;
  description: string;
}> = {
  xiaohongshu: {
    name: '小红书',
    icon: 'book',
    color: '#FF2442',
    description: '种草文案、爆款标题、话题标签',
  },
  douyin: {
    name: '抖音',
    icon: 'music',
    color: '#18181b',
    description: '短视频脚本、开头钩子、分镜脚本',
  },
  gongzhonghao: {
    name: '公众号',
    icon: 'news',
    color: '#07C160',
    description: '深度文章、大纲、10W+爆文',
  },
};

export const CONTENT_TYPES: Record<ContentType, {
  name: string;
  platform: Platform;
  description: string;
  icon: string;
}> = {
  xiaohongshu_title: { name: '爆款标题', platform: 'xiaohongshu', description: '生成10个高点击率标题', icon: 'sparkle' },
  xiaohongshu_copy: { name: '种草文案', platform: 'xiaohongshu', description: '生成完整种草笔记', icon: 'file' },
  xiaohongshu_hashtag: { name: '话题标签', platform: 'xiaohongshu', description: '生成热门标签组合', icon: 'tag' },
  douyin_script: { name: '视频脚本', platform: 'douyin', description: '生成完整短视频脚本', icon: 'video' },
  douyin_hook: { name: '开头钩子', platform: 'douyin', description: '生成20个吸睛钩子', icon: 'bolt' },
  gongzhonghao_outline: { name: '文章大纲', platform: 'gongzhonghao', description: '生成文章结构框架', icon: 'list' },
  gongzhonghao_article: { name: '完整文章', platform: 'gongzhonghao', description: '生成2000-5000字深度文章', icon: 'article' },
};
