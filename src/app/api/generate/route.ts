import { NextRequest } from 'next/server';
import { GenerateRequest } from '@/types';
import { PROMPTS } from '@/data/prompts';

// POST /api/generate — 流式输出
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

    // 调用 AI API（流式）
    const apiKey = process.env.AI_API_KEY;
    if (!apiKey) {
      return Response.json(
        { error: 'AI API 未配置' },
        { status: 500 }
      );
    }

    const apiBase = process.env.NEXT_PUBLIC_AI_API_BASE || 'https://openrouter.ai/api/v1';

    const response = await fetch(`${apiBase}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'deepseek/deepseek-chat',
        messages: [
          { role: 'system', content: prompt.system },
          { role: 'user', content: userMessage },
        ],
        temperature: 0.8,
        max_tokens: 2000,
        stream: true,
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      console.error('AI API error:', error);
      return Response.json(
        { error: 'AI 服务暂时不可用，请稍后重试' },
        { status: 502 }
      );
    }

    // 转发 SSE 流给前端
    const reader = response.body?.getReader();
    if (!reader) {
      return Response.json(
        { error: '无法读取 AI 响应流' },
        { status: 500 }
      );
    }

    const encoder = new TextEncoder();
    const decoder = new TextDecoder();

    const stream = new ReadableStream({
      async start(controller) {
        let buffer = '';
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';

            for (const line of lines) {
              const trimmed = line.trim();
              if (!trimmed || !trimmed.startsWith('data: ')) continue;
              
              const data = trimmed.slice(6);
              if (data === '[DONE]') {
                controller.enqueue(encoder.encode('data: [DONE]\n\n'));
                continue;
              }

              try {
                const parsed = JSON.parse(data);
                const content = parsed.choices?.[0]?.delta?.content;
                if (content) {
                  controller.enqueue(
                    encoder.encode(`data: ${JSON.stringify({ content })}\n\n`)
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
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
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
