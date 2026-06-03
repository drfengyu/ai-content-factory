// 平台类型
export type Platform = 'xiaohongshu' | 'douyin' | 'gongzhonghao';

// 内容类型
export type ContentType = 
  | 'xiaohongshu_title'      // 小红书标题
  | 'xiaohongshu_copy'       // 小红书种草文案
  | 'xiaohongshu_hashtag'    // 小红书话题标签
  | 'douyin_script'          // 抖音短视频脚本
  | 'douyin_hook'            // 抖音开头钩子
  | 'gongzhonghao_outline'   // 公众号文章大纲
  | 'gongzhonghao_article';  // 公众号完整文章

// 生成请求
export interface GenerateRequest {
  platform: Platform;
  contentType: ContentType;
  topic: string;
  keywords?: string;
  tone?: string;
  length?: string;
  extraPrompt?: string;
  /** 可选：指定使用的 API Provider ID，不传则用 ACTIVE_PROVIDER 环境变量 */
  providerId?: string;
  /** 可选：指定模型名，不传则用 AI_MODEL 或 Provider 默认模型 */
  modelId?: string;
  /** 自定义 Provider（用于用户界面添加的 Provider） */
  customProvider?: {
    baseUrl: string;
    apiKey: string;
    type: 'openai' | 'anthropic' | 'gemini';
    model: string;
    pathPrefix?: string;
  };
}

// 生成响应
export interface GenerateResponse {
  content: string;
  tokens: number;
  model: string;
}

// 用户
export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  plan: 'starter' | 'pro' | 'studio';
  usage: number;  // 今日已用次数
  maxUsage: number;
  usageDate: string;
  createdAt: string;
}

// 模板
export interface Template {
  id: string;
  name: string;
  platform: Platform;
  contentType: ContentType;
  topic: string;
  keywords: string;
  tone: string;
  description: string;
  /** 可选分类，用于 Templates UI 的横向 Tab 筛选 */
  category?: TemplateCategory;
}

// 模板分类
export type TemplateCategory = 'planting' | 'knowledge' | 'story' | 'review';
