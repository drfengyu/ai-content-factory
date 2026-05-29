/**
 * 从非流式 JSON 响应中提取文本内容
 * 兼容多种上游 API 格式
 */
export function extractContentFromJson(data: any): string {
  // OpenAI Chat
  if (data.choices?.[0]?.message?.content) {
    return data.choices[0].message.content;
  }
  // OpenAI Responses
  if (data.output) {
    return data.output
      .filter((item: any) => item.type === 'message' || item.type === 'output_text')
      .map((item: any) => item.content?.[0]?.text || item.text || '')
      .join('');
  }
  // Claude
  if (data.content && Array.isArray(data.content)) {
    return data.content.map((c: any) => c.text || '').join('');
  }
  // Gemini
  if (data.candidates?.[0]?.content?.parts) {
    return data.candidates[0].content.parts.map((p: any) => p.text || '').join('');
  }
  // 传统补全
  if (data.choices?.[0]?.text) {
    return data.choices[0].text;
  }
  return data.content || data.text || '';
}

/**
 * 从 SSE data: JSON 行中提取文本内容
 * 兼容多种上游流式格式
 */
export function extractContentFromStream(parsed: any, eventType: string): string {
  // === OpenAI Chat Completions（最常见）===
  if (parsed.choices?.[0]?.delta?.content) {
    return parsed.choices[0].delta.content;
  }
  // message 而非 delta（某些 API 的非流式 chunk）
  if (parsed.choices?.[0]?.message?.content) {
    return parsed.choices[0].message.content;
  }
  // 传统补全流式
  if (parsed.choices?.[0]?.text) {
    return parsed.choices[0].text;
  }

  // === OpenAI Responses API ===
  if (parsed.type === 'response.output_text.delta' && parsed.delta) {
    return parsed.delta;
  }
  if (parsed.type === 'response.content_part.added' && parsed.content?.text) {
    return parsed.content.text;
  }

  // === Anthropic Claude ===
  if (parsed.type === 'content_block_delta' && parsed.delta?.text) {
    return parsed.delta.text;
  }
  if (parsed.type === 'content_block_start' && parsed.content_block?.text) {
    return parsed.content_block.text;
  }
  if (parsed.type === 'message_start' && parsed.message?.content) {
    if (Array.isArray(parsed.message.content)) {
      return parsed.message.content.map((c: any) => c.text || '').join('');
    }
  }

  // === Google Gemini ===
  if (parsed.candidates?.[0]?.content?.parts) {
    return parsed.candidates[0].content.parts.map((p: any) => p.text || '').join('');
  }

  // === 兜底 ===
  if (parsed.content) return parsed.content;
  if (parsed.text) return parsed.text;

  return '';
}
