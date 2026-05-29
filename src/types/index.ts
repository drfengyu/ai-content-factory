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
  tone?: '活泼' | '专业' | '种草' | '干货' | '故事';
  length?: '短' | '中' | '长';
  extraPrompt?: string;
  /** 可选：指定使用的 API Provider ID，不传则用 ACTIVE_PROVIDER 环境变量 */
  providerId?: string;
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
  email: string;
  plan: 'free' | 'pro' | 'team';
  usage: number;  // 今日已用次数
  maxUsage: number;
}

// 模板
export interface Template {
  id: string;
  name: string;
  platform: Platform;
  contentType: ContentType;
  icon: string;
  description: string;
  placeholders: string[];  // 需要用户填写的字段
}
