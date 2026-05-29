import { NextRequest } from 'next/server';
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
    description: p.description || '',
  }));

  return Response.json({
    providers,
    active: process.env.ACTIVE_PROVIDER || providers[0]?.id || 'deepseek',
  });
}
