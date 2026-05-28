import { NextRequest, NextResponse } from 'next/server';
import { GenerateRequest } from '@/types';
import { PROMPTS } from '@/data/prompts';

// POST /api/generate
export async function POST(request: NextRequest) {
  try {
    const body: GenerateRequest = await request.json();
    
    // 验证必填字段
    if (!body.contentType || !body.topic) {
      return NextResponse.json(
        { error: '请填写内容类型和主题' },
        { status: 400 }
      );
    }

    // 验证内容类型
    const prompt = PROMPTS[body.contentType];
    if (!prompt) {
      return NextResponse.json(
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

    // 调用 AI API
    const apiKey = process.env.AI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'AI API 未配置' },
        { status: 500 }
      );
    }

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
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
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      console.error('AI API error:', error);
      return NextResponse.json(
        { error: 'AI 服务暂时不可用，请稍后重试' },
        { status: 502 }
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';
    const tokens = data.usage?.total_tokens || 0;

    return NextResponse.json({
      content,
      tokens,
      model: data.model || 'deepseek-chat',
    });

  } catch (error) {
    console.error('Generate error:', error);
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    );
  }
}
