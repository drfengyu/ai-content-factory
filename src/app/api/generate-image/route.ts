import { NextRequest, NextResponse } from 'next/server';

const CF_ACCOUNT_ID = process.env.CF_ACCOUNT_ID;
const CF_API_TOKEN = process.env.CF_API_TOKEN;

interface ImageRequest {
  content: string;
  platform: 'xiaohongshu' | 'douyin' | 'gongzhonghao';
  contentType: string;
}

export async function POST(req: NextRequest) {
  if (!CF_ACCOUNT_ID || !CF_API_TOKEN) {
    return NextResponse.json(
      { error: 'Cloudflare credentials not configured' },
      { status: 500 }
    );
  }

  try {
    const { content, platform, contentType }: ImageRequest = await req.json();

    const prompt = generateImagePrompt(content, platform, contentType);
    
    const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT_ID}/ai/run/@cf/black-forest-labs/flux-1-schnell`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${CF_API_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ prompt })
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Cloudflare API error:', errorText);
      return NextResponse.json(
        { error: `Cloudflare API failed: ${response.status}` },
        { status: response.status }
      );
    }

    const result = await response.json();
    const base64 = result.result.image;
    const imageUrl = `data:image/png;base64,${base64}`;
    
    return NextResponse.json({ imageUrl, prompt });

  } catch (error) {
    console.error('Generate image error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

function generateImagePrompt(
  content: string,
  platform: string,
  contentType: string
): string {
  // 提取内容关键词（简单实现）
  const firstLine = content.split('\n')[0].substring(0, 100);
  
  const templates = {
    xiaohongshu: `A vibrant and aesthetic lifestyle photo for Xiaohongshu (Little Red Book), featuring: ${firstLine}. Clean composition, warm lighting, Instagram-worthy aesthetic, 3:4 vertical format`,
    douyin: `A dynamic and eye-catching video thumbnail for Douyin (TikTok), featuring: ${firstLine}. Bold colors, high contrast, energetic vibe, 9:16 vertical format`,
    gongzhonghao: `A professional and informative illustration for WeChat official account article, featuring: ${firstLine}. Modern design, clean layout, business style, 16:9 horizontal format`
  };

  return templates[platform as keyof typeof templates] || templates.gongzhonghao;
}
