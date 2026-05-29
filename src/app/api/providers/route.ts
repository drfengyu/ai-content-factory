import { loadProviders, clearProviderCache } from '@/lib/providers';

// GET /api/providers — 返回所有可用 Provider 列表（不含 Key）
export async function GET() {
  clearProviderCache();
  const providers = loadProviders().map((p) => ({
    id: p.id,
    name: p.name,
    type: p.type,
    defaultModel: p.defaultModel,
    models: p.models,
    configured: Boolean(process.env[p.apiKeyEnv]),
    apiKeyEnv: p.apiKeyEnv,
    description: p.description || '',
  }));

  return Response.json({
    providers,
    active: process.env.ACTIVE_PROVIDER || providers[0]?.id || 'deepseek',
    activeModel: process.env.AI_MODEL || providers.find((p) => p.id === process.env.ACTIVE_PROVIDER)?.defaultModel || providers[0]?.defaultModel,
  });
}
