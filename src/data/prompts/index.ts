import { ContentType, Platform } from '@/types';

export const PROMPTS: Record<ContentType, {
  system: string;
  user: (params: Record<string, string>) => string;
}> = {
  service_package: {
    system: `你是 AI 内容服务商业化顾问。目标是帮助项目拥有者把“AI Content Factory”包装成可收费的服务，并尽快成交第一单。
你不是帮终端用户赚钱，而是帮服务提供者设计可卖、可交付、可展示的 AI 内容服务。
要求：
- 默认第一单通过微信沟通和转账成交，不设计复杂支付系统
- 聚焦 99/199/299 元轻量服务包
- 输出要能直接放到落地页、朋友圈、小红书和私信里
- 强调交付结果、交付速度、修改规则和适合客户
- 避免空泛商业术语`,
    user: (p) => `项目/能力说明：${p.topic}
你已有的资源或客户圈子：${p.keywords || '朋友圈、小红书、本地商家或自媒体朋友'}
服务风格：${p.tone || '专业'}
首单复杂度：${p.length || '中'}
${p.extraPrompt ? '补充要求：' + p.extraPrompt : ''}

请为 AI Content Factory 设计一个“可卖的首单服务包”，输出：
1. 服务定位一句话
2. 适合购买的客户画像
3. 99/199/299 三档套餐：价格、交付内容、交付时间、修改次数
4. 首单推荐主推哪一档，为什么
5. 落地页 Hero 文案
6. 服务详情页结构
7. 交付前客户需要填写的信息
8. 交付验收标准
9. 你今天就能发出去的成交邀约`,
  },

  client_outreach: {
    system: `你是中文私域成交文案专家，帮助 AI 内容服务提供者拿到第一单客户。
话术要自然、可信、轻量，不要像群发广告。
目标是让对方愿意回复、试单或转介绍。`,
    user: (p) => `我要出售的服务：${p.topic}
目标客户：${p.keywords || '小商家、自媒体新人、想做内容但没时间的人'}
语气：${p.tone || '自然'}
长度：${p.length || '中'}
${p.extraPrompt ? '补充要求：' + p.extraPrompt : ''}

请生成：
1. 发给熟人的微信私信 5 条
2. 发给潜在客户的冷启动私信 5 条
3. 朋友圈首单预热文案 3 条
4. 小红书获客笔记 2 篇
5. 对方问“多少钱”时的回复 3 条
6. 对方犹豫时的低压力跟进 3 条
7. 请求转介绍的话术 3 条`,
  },

  delivery_kit: {
    system: `你是服务产品化顾问，帮助 AI 内容服务提供者把交付流程标准化，以便第一单不翻车。
输出必须是可复制执行的 SOP、清单和模板。`,
    user: (p) => `准备出售的服务：${p.topic}
目标客户：${p.keywords || '小微商家/自媒体创作者'}
交付风格：${p.tone || '专业'}
复杂度：${p.length || '中'}
${p.extraPrompt ? '补充要求：' + p.extraPrompt : ''}

请生成首单交付工具包：
1. 客户下单前确认表
2. 素材收集清单
3. 交付流程 SOP
4. 内容交付模板
5. 修改规则
6. 交付验收话术
7. 复购加购建议
8. 转介绍话术`,
  },

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
  service: {
    name: '服务变现',
    icon: 'briefcase',
    color: '#38bdf8',
    description: '把本项目包装成可收费服务',
  },
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
  service_package: { name: '首单服务包', platform: 'service', description: '99/199/299 套餐与落地页文案', icon: 'package' },
  client_outreach: { name: '获客话术', platform: 'service', description: '微信、朋友圈、小红书成交内容', icon: 'chat' },
  delivery_kit: { name: '交付工具包', platform: 'service', description: '客户表单、SOP、验收与复购', icon: 'target' },
  xiaohongshu_title: { name: '爆款标题', platform: 'xiaohongshu', description: '生成10个高点击率标题', icon: 'sparkle' },
  xiaohongshu_copy: { name: '种草文案', platform: 'xiaohongshu', description: '生成完整种草笔记', icon: 'file' },
  xiaohongshu_hashtag: { name: '话题标签', platform: 'xiaohongshu', description: '生成热门标签组合', icon: 'tag' },
  douyin_script: { name: '视频脚本', platform: 'douyin', description: '生成完整短视频脚本', icon: 'video' },
  douyin_hook: { name: '开头钩子', platform: 'douyin', description: '生成20个吸睛钩子', icon: 'bolt' },
  gongzhonghao_outline: { name: '文章大纲', platform: 'gongzhonghao', description: '生成文章结构框架', icon: 'list' },
  gongzhonghao_article: { name: '完整文章', platform: 'gongzhonghao', description: '生成2000-5000字深度文章', icon: 'article' },
};
