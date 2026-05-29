import { NextRequest } from 'next/server';
import { GenerateRequest } from '@/types';
import { PROMPTS } from '@/data/prompts';
import {
  resolveActiveProvider,
  getActiveProviderId,
  clearProviderCache,
  buildHeaders,
  buildRequestBody,
  getChatEndpoint,
} from '@/lib/providers';
import { extractContentFromJson, extractContentFromStream } from '@/lib/stream-parser';

// POST /api/generate — 多渠道流式输出
// 支持通过 config/providers.json 配置多个 API 提供商，用 ACTIVE_PROVIDER 环境变量切换
export async function POST(request: NextRequest) {
  try {
    const body: GenerateRequest = await request.json();

    // 验证必填字段
    if (!body.contentType || !body.topic) {
      return Response.json(
        { error: '请填写内容类型和主题' },
        { status: 400 }
      );
    }

    // 验证内容类型
    const prompt = PROMPTS[body.contentType];
    if (!prompt) {
      return Response.json(
        { error: '不支持的内容类型' },
        { status: 400 }
      );
    }

    // 构建用户消息
    const userMessage = prompt.user({
      topic: body.topic,
      keywords: body.keywords || '',
      tone: body.tone || '种草',
      length: body.length || '中',
      extraPrompt: body.extraPrompt || '',
    });

    // ===== 解析当前激活的 Provider（支持请求体内指定）=====
    const resolved = resolveActiveProvider(body.providerId);
    if (!resolved) {
      const activeId = getActiveProviderId();
      return Response.json(
        {
          error: `Provider "${activeId}" 配置不完整，请检查 .env 中对应的 API Key 和环境变量`,
          providers: getProviderDebugInfo(),
        },
        { status: 500 }
      );
    }

    const apiBase = resolved.resolvedBaseUrl;
    const headers = buildHeaders(resolved);

    const response = await fetch(getChatEndpoint(resolved), {
      method: 'POST',
      headers,
      body: JSON.stringify(
        buildRequestBody(resolved, [
          { role: 'system', content: prompt.system },
          { role: 'user', content: userMessage },
        ])
      ),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI API error:', response.status, errorText);
      try {
        const error = JSON.parse(errorText);
        return Response.json(
          { error: error.error?.message || 'AI 服务暂时不可用，请稍后重试' },
          { status: 502 }
        );
      } catch {
        return Response.json(
          { error: `AI 服务返回错误 (${response.status})` },
          { status: 502 }
        );
      }
    }

    const contentType = response.headers.get('content-type') || '';

    // 非流式响应：直接解析 JSON 返回
    if (!contentType.includes('text/event-stream') && !contentType.includes('text/plain')) {
      try {
        const data = await response.json();
        const text = extractContentFromJson(data);
        if (text) {
          return Response.json({
            content: text,
            model: process.env.AI_MODEL || resolved.config.defaultModel,
            tokens: data.usage?.total_tokens || 0,
            provider: resolved.config.id,
          });
        }
      } catch {
        // fall through to text extraction
      }
    }

    // 流式响应：转发 SSE
    const reader = response.body?.getReader();
    if (!reader) {
      return Response.json(
        { error: '无法读取 AI 响应流' },
        { status: 500 }
      );
    }

    const encoder = new TextEncoder();
    const decoder = new TextDecoder();
    const isAnthropic = resolved.config.type === 'anthropic';

    const stream = new ReadableStream({
      async start(controller) {
        let buffer = '';
        let lastEventType = '';

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });

            // 按行分割（兼容 \r\n 和 \n）
            const lines = buffer.split(/\r?\n/);
            buffer = lines.pop() || '';

            for (const rawLine of lines) {
              const line = rawLine.trim();
              if (!line) continue;

              // 记录 event 类型（Claude 等使用 event: 行）
              if (line.startsWith('event: ')) {
                lastEventType = line.slice(7);
                continue;
              }

              // 只处理 data: 行
              if (!line.startsWith('data: ')) continue;

              const data = line.slice(6);

              // 流结束标记
              if (data === '[DONE]') {
                controller.enqueue(encoder.encode('data: [DONE]\n\n'));
                continue;
              }

              try {
                const parsed = JSON.parse(data);
                const text = extractContentFromStream(parsed, lastEventType);

                if (text) {
                  controller.enqueue(
                    encoder.encode(`data: ${JSON.stringify({ content: text })}\n\n`)
                  );
                }
              } catch {
                // 忽略解析失败的行
              }
            }
          }
        } catch (err) {
          console.error('Stream error:', err);
        } finally {
          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'X-Provider': resolved.config.id,
      },
    });

  } catch (error) {
    console.error('Generate error:', error);
    return Response.json(
      { error: '服务器内部错误' },
      { status: 500 }
    );
  }
}

/** 获取所有 provider 的配置状态（用于错误提示，不含 key） */
function getProviderDebugInfo() {
  try {
    clearProviderCache();
    const { loadProviders } = require('@/lib/providers');
    return loadProviders().map((p: any) => ({
      id: p.id,
      name: p.name,
      configured: !!process.env[p.apiKeyEnv],
      models: p.models,
    }));
  } catch {
    return [];
  }
}
