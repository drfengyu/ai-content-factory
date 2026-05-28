import { ContentType, Platform } from '@/types';

// 各平台的提示词模板
export const PROMPTS: Record<ContentType, {
  system: string;
  user: (params: Record<string, string>) => string;
}> = {
  // ===== 小红书 =====
  xiaohongshu_title: {
    system: `你是一个小红书爆款标题专家。你深谙小红书算法和用户心理，擅长写出高点击率的标题。
规则：
- 标题控制在20字以内
- 使用数字、emoji、疑问句增加吸引力
- 包含热门关键词
- 制造好奇心或紧迫感
- 参考爆款公式：数字+痛点+解决方案`,
    user: (p) => `主题：${p.topic}\n关键词：${p.keywords || '无'}\n\n请生成10个小红书爆款标题，每个标题一行，标注预估点击率。`,
  },

  xiaohongshu_copy: {
    system: `你是一个小红书种草文案高手。你的文案自然真实，像朋友推荐一样，让人忍不住下单。
规则：
- 开头用emoji和感叹句抓眼球
- 中间用真实体验感的描述
- 适当使用口语化表达
- 结尾引导互动（收藏/关注）
- 分段清晰，每段2-3行
- 植入3-5个相关话题标签`,
    user: (p) => `产品/主题：${p.topic}\n关键词：${p.keywords || '无'}\n语气：${p.tone || '种草'}\n长度：${p.length || '中'}\n\n请生成一篇小红书种草文案。`,
  },

  xiaohongshu_hashtag: {
    system: `你是小红书话题标签专家。你了解小红书的标签热度和推荐算法。
规则：
- 生成15-20个相关标签
- 包含热门大标签（>1亿浏览）
- 包含精准小标签（<1000万浏览）
- 按热度排序
- 每个标签前加#`,
    user: (p) => `主题：${p.topic}\n关键词：${p.keywords || '无'}\n\n请生成小红书话题标签组合。`,
  },

  // ===== 抖音 =====
  douyin_script: {
    system: `你是一个抖音短视频脚本创作专家。你的脚本节奏紧凑、信息密度高、完播率高。
规则：
- 开头3秒必须有钩子（反问/冲突/悬念）
- 中间信息密度高，每5秒一个信息点
- 结尾有互动引导（评论/关注/转发）
- 标注画面、字幕、BGM建议
- 总时长控制在15-60秒
- 使用口语化、有节奏感的语言`,
    user: (p) => `主题：${p.topic}\n关键词：${p.keywords || '无'}\n语气：${p.tone || '活泼'}\n时长：${p.length || '中'}\n\n请生成完整抖音脚本，包含：画面描述、口播文案、字幕文案、BGM建议。`,
  },

  douyin_hook: {
    system: `你是抖音开头钩子专家。你知道什么能让用户在3秒内停下来。
规则：
- 每个钩子控制在15字以内
- 制造强烈的好奇心或冲突感
- 使用数字、反问、悬念、对比
- 适合口语朗读`,
    user: (p) => `主题：${p.topic}\n目标受众：${p.keywords || '泛人群'}\n\n请生成20个抖音开头钩子。`,
  },

  // ===== 公众号 =====
  gongzhonghao_outline: {
    system: `你是公众号文章大纲专家。你擅长构建有深度、有逻辑的文章结构。
规则：
- 标题要有深度感和专业感
- 大纲3-5个章节
- 每章节有明确论点
- 逻辑递进，有起承转合
- 适合2000-5000字的长文`,
    user: (p) => `主题：${p.topic}\n关键词：${p.keywords || '无'}\n语气：${p.tone || '专业'}\n\n请生成公众号文章大纲。`,
  },

  gongzhonghao_article: {
    system: `你是公众号10W+爆文写手。你的文章有深度、有温度、有传播力。
规则：
- 标题20字以内，有悬念或价值感
- 开头用故事或数据引入
- 中间有干货、有案例、有观点
- 结尾有总结和行动号召
- 分段清晰，适当使用小标题
- 插入合适的emoji增加可读性`,
    user: (p) => `主题：${p.topic}\n关键词：${p.keywords || '无'}\n语气：${p.tone || '干货'}\n长度：${p.length || '中'}\n${p.extraPrompt ? '补充要求：' + p.extraPrompt : ''}\n\n请生成完整公众号文章。`,
  },
};

// 平台配置
export const PLATFORMS: Record<Platform, {
  name: string;
  icon: string;
  color: string;
  description: string;
}> = {
  xiaohongshu: {
    name: '小红书',
    icon: '📕',
    color: '#FF2442',
    description: '种草文案、爆款标题、话题标签',
  },
  douyin: {
    name: '抖音',
    icon: '🎵',
    color: '#000000',
    description: '短视频脚本、开头钩子、分镜脚本',
  },
  gongzhonghao: {
    name: '公众号',
    icon: '📰',
    color: '#07C160',
    description: '深度文章、大纲、10W+爆文',
  },
};

// 内容类型配置
export const CONTENT_TYPES: Record<ContentType, {
  name: string;
  platform: Platform;
  description: string;
  icon: string;
}> = {
  xiaohongshu_title: { name: '爆款标题', platform: 'xiaohongshu', description: '生成10个高点击率标题', icon: '✨' },
  xiaohongshu_copy: { name: '种草文案', platform: 'xiaohongshu', description: '生成完整种草笔记', icon: '📝' },
  xiaohongshu_hashtag: { name: '话题标签', platform: 'xiaohongshu', description: '生成热门标签组合', icon: '🏷️' },
  douyin_script: { name: '视频脚本', platform: 'douyin', description: '生成完整短视频脚本', icon: '🎬' },
  douyin_hook: { name: '开头钩子', platform: 'douyin', description: '生成20个吸睛钩子', icon: '🪝' },
  gongzhonghao_outline: { name: '文章大纲', platform: 'gongzhonghao', description: '生成文章结构框架', icon: '📋' },
  gongzhonghao_article: { name: '完整文章', platform: 'gongzhonghao', description: '生成2000-5000字深度文章', icon: '📖' },
};
