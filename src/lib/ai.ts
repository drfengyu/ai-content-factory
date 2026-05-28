import { PROMPTS, PLATFORMS, CONTENT_TYPES } from '@/data/prompts';
import { GenerateRequest, GenerateResponse, ContentType, Platform } from '@/types';

// AI API 配置
const API_BASE = process.env.NEXT_PUBLIC_AI_API_BASE || 'https://openrouter.ai/api/v1';
const API_KEY = process.env.AI_API_KEY || '';

// 生成内容
export async function generateContent(req: GenerateRequest): Promise<GenerateResponse> {
  const prompt = PROMPTS[req.contentType];
  if (!prompt) throw new Error(`未知内容类型: ${req.contentType}`);

  const userMessage = prompt.user({
    topic: req.topic,
    keywords: req.keywords || '',
    tone: req.tone || '种草',
    length: req.length || '中',
    extraPrompt: req.extraPrompt || '',
  });

  const response = await fetch(`${API_BASE}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({
      model: 'deepseek/deepseek-chat',
      messages: [
        { role: 'system', content: prompt.system },
        { role: 'user', content: userMessage },
      ],
      temperature: 0.8,
      max_tokens: 2000,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(`AI API 错误: ${error.error?.message || response.statusText}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content || '';
  const tokens = data.usage?.total_tokens || 0;

  return { content, tokens, model: data.model || 'deepseek-chat' };
}

// 获取平台信息
export function getPlatformInfo(platform: Platform) {
  return PLATFORMS[platform];
}

// 获取内容类型信息
export function getContentTypeInfo(contentType: ContentType) {
  return CONTENT_TYPES[contentType];
}

// 获取平台的所有内容类型
export function getContentTypesByPlatform(platform: Platform) {
  return Object.entries(CONTENT_TYPES)
    .filter(([, config]) => config.platform === platform)
    .map(([id, config]) => ({ id: id as ContentType, ...config }));
}
