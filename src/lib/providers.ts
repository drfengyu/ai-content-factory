import * as fs from 'fs';
import * as path from 'path';
import type { ProviderConfig, ResolvedProvider, ActiveProviderState } from '@/types/providers';

// 默认路径前缀（按 type）
const DEFAULT_PATH_PREFIX: Record<string, string> = {
  openai: '/v1',
  anthropic: '',        // Anthropic 端点直接 /v1/messages
  gemini: '/v1beta',    // Gemini 端点直接 /v1beta/models/{model}:generateContent
};

// 配置文件路径
const CONFIG_PATH = path.join(process.cwd(), 'config', 'providers.json');

// 缓存
let _providers: ProviderConfig[] | null = null;

/**
 * 解析完整 API 基础地址：域名 + 路径前缀
 * 用户只需填域名（如 https://api.deepseek.com），运行时自动补全路径
 */
function resolveApiBase(config: ProviderConfig): string {
  const base = config.baseUrl.replace(/\/+$/, ''); // 去掉末尾斜杠
  const prefix = config.pathPrefix || DEFAULT_PATH_PREFIX[config.type] || '';
  return prefix ? `${base}${prefix}` : base;
}

// ==================== 公开 API ====================

/**
 * 加载所有配置的 Provider
 */
export function loadProviders(): ProviderConfig[] {
  if (_providers) return _providers;
  try {
    const raw = fs.readFileSync(CONFIG_PATH, 'utf-8');
    _providers = JSON.parse(raw) as ProviderConfig[];
    return _providers;
  } catch (err) {
    console.error('Failed to load providers config:', err);
    return [];
  }
}

/**
 * 清空缓存（开发时热重载）
 */
export function clearProviderCache() {
  _providers = null;
}

/**
 * 获取当前激活的 provider ID
 * 1. 环境变量 ACTIVE_PROVIDER
 * 2. 传入的默认 ID
 * 3. 配置文件第一个
 */
export function getActiveProviderId(defaultId?: string): string {
  return process.env.ACTIVE_PROVIDER || defaultId || loadProviders()[0]?.id || 'deepseek';
}

/**
 * 解析当前激活 Provider 的完整配置
 * baseUrl 自动补全路径前缀 → resolvedBaseUrl
 */
export function resolveActiveProvider(providerId?: string): ResolvedProvider | null {
  const providers = loadProviders();
  if (providers.length === 0) return null;

  const id = providerId || getActiveProviderId();
  const config = providers.find((p) => p.id === id);

  if (!config) {
    console.error(`Provider "${id}" not found in config`);
    return null;
  }

  const apiKey = process.env[config.apiKeyEnv] || '';
  if (!apiKey) {
    console.error(`API key env "${config.apiKeyEnv}" is not set for provider "${config.id}"`);
    return null;
  }

  return {
    config,
    apiKey,
    resolvedBaseUrl: resolveApiBase(config),
  };
}

/**
 * 获取当前激活状态
 */
export function getActiveProviderState(): ActiveProviderState {
  const providerId = getActiveProviderId();
  const resolved = resolveActiveProvider(providerId);
  const model = process.env.AI_MODEL || resolved?.config.defaultModel || 'deepseek-v4-flash';
  return { providerId, model };
}

/**
 * 获取所有 provider 的简要列表（不含 key）
 */
export function getProviderList(): { id: string; name: string; description: string; models: string[] }[] {
  return loadProviders().map((p) => ({
    id: p.id,
    name: p.name,
    description: p.description || '',
    models: p.models,
  }));
}

/**
 * 构建 API 请求头（含 Authorization）
 */
export function buildHeaders(resolved: ResolvedProvider): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${resolved.apiKey}`,
  };

  // 注入配置中的额外头部
  if (resolved.config.headers) {
    Object.assign(headers, resolved.config.headers);
  }

  // Anthropic 需要版本头
  if (resolved.config.type === 'anthropic') {
    headers['anthropic-version'] = '2023-06-01';
  }

  // Gemini 使用不同的鉴权方式（api key 在 URL 中）
  if (resolved.config.type === 'gemini') {
    headers['x-goog-api-key'] = resolved.apiKey;
    delete headers['Authorization']; // Gemini 不在 Header 传 Bearer
  }

  return headers;
}

/**
 * 构建请求体（按 type 自动适配格式）
 */
export function buildRequestBody(
  resolved: ResolvedProvider,
  messages: { role: string; content: string }[],
  options?: {
    model?: string;
    temperature?: number;
    maxTokens?: number;
    stream?: boolean;
  }
): object {
  const model = options?.model || process.env.AI_MODEL || resolved.config.defaultModel;
  const { temperature = 0.8, maxTokens = 20000, stream = true } = options || {};

  // OpenAI 兼容格式
  if (resolved.config.type === 'openai') {
    return {
      model,
      messages,
      temperature,
      max_tokens: maxTokens,
      stream,
      stream_options: stream ? { include_usage: true } : undefined,
    };
  }

  // Anthropic Claude 格式
  if (resolved.config.type === 'anthropic') {
    return {
      model,
      messages: messages.filter((m) => m.role !== 'system'),
      system: messages.find((m) => m.role === 'system')?.content,
      max_tokens: maxTokens,
      temperature,
      stream,
    };
  }

  // Google Gemini 格式
  if (resolved.config.type === 'gemini') {
    return {
      contents: [
        {
          role: 'user',
          parts: [{ text: messages.map((m) => `${m.role}: ${m.content}`).join('\n') }],
        },
      ],
      generationConfig: {
        temperature,
        maxOutputTokens: maxTokens,
      },
    };
  }

  return { model, messages, temperature, max_tokens: maxTokens, stream };
}

/**
 * 获取完整的 Chat 请求端点 URL
 *
 * 路径补全规则：
 *   openai    → {baseUrl}{pathPrefix}/chat/completions
 *               e.g. https://api.deepseek.com/v1/chat/completions
 *               e.g. https://openrouter.ai/api/v1/chat/completions
 *   anthropic → {baseUrl}/v1/messages
 *               e.g. https://api.anthropic.com/v1/messages
 *   gemini    → {baseUrl}{pathPrefix}/models/{model}:generateContent
 *               e.g. https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent
 *               + API key 作为查询参数: ?key=xxx
 */
export function getChatEndpoint(resolved: ResolvedProvider, modelOverride?: string): string {
  const base = resolved.resolvedBaseUrl; // 已包含 pathPrefix

  switch (resolved.config.type) {
    case 'anthropic':
      return `${resolved.config.baseUrl.replace(/\/+$/, '')}/v1/messages`;

    case 'gemini': {
      const model = modelOverride || process.env.AI_MODEL || resolved.config.defaultModel;
      return `${base}/models/${model}:generateContent?key=${resolved.apiKey}`;
    }

    case 'openai':
    default:
      return `${base}/chat/completions`;
  }
}
