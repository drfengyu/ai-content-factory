/**
 * 从非流式 JSON 响应中提取文本内容
 * 兼容多种上游 API 格式
 */
type ApiObject = Record<string, unknown>;

function isObject(value: unknown): value is ApiObject {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function asArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function asObject(value: unknown): ApiObject {
  return isObject(value) ? value : {};
}

function asString(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

function textFromParts(parts: unknown): string {
  return asArray(parts).map((part) => asString(asObject(part).text)).join('');
}

export function extractContentFromJson(data: unknown): string {
  const root = asObject(data);
  const firstChoice = asObject(asArray(root.choices)[0]);
  const message = asObject(firstChoice.message);

  // OpenAI Chat
  if (typeof message.content === 'string') {
    return message.content;
  }
  // OpenAI Responses
  if (Array.isArray(root.output)) {
    return root.output
      .filter((item) => {
        const outputItem = asObject(item);
        return outputItem.type === 'message' || outputItem.type === 'output_text';
      })
      .map((item) => {
        const outputItem = asObject(item);
        const firstContent = asObject(asArray(outputItem.content)[0]);
        return asString(firstContent.text) || asString(outputItem.text);
      })
      .join('');
  }
  // Claude
  if (Array.isArray(root.content)) {
    return root.content.map((content) => asString(asObject(content).text)).join('');
  }
  // Gemini
  const firstCandidate = asObject(asArray(root.candidates)[0]);
  const candidateContent = asObject(firstCandidate.content);
  if (Array.isArray(candidateContent.parts)) {
    return textFromParts(candidateContent.parts);
  }
  // 传统补全
  if (typeof firstChoice.text === 'string') {
    return firstChoice.text;
  }
  return asString(root.content) || asString(root.text);
}

/**
 * 从 SSE data: JSON 行中提取文本内容
 * 兼容多种上游流式格式
 */
export function extractContentFromStream(parsed: unknown): string {
  const root = asObject(parsed);
  const firstChoice = asObject(asArray(root.choices)[0]);
  const delta = asObject(firstChoice.delta);
  const message = asObject(firstChoice.message);

  // === OpenAI Chat Completions（最常见）===
  if (typeof delta.content === 'string') {
    return delta.content;
  }
  // message 而非 delta（某些 API 的非流式 chunk）
  if (typeof message.content === 'string') {
    return message.content;
  }
  // 传统补全流式
  if (typeof firstChoice.text === 'string') {
    return firstChoice.text;
  }

  // === OpenAI Responses API ===
  if (root.type === 'response.output_text.delta' && typeof root.delta === 'string') {
    return root.delta;
  }
  const content = asObject(root.content);
  if (root.type === 'response.content_part.added' && typeof content.text === 'string') {
    return content.text;
  }

  // === Anthropic Claude ===
  if (root.type === 'content_block_delta' && typeof delta.text === 'string') {
    return delta.text;
  }
  const contentBlock = asObject(root.content_block);
  if (root.type === 'content_block_start' && typeof contentBlock.text === 'string') {
    return contentBlock.text;
  }
  const rootMessage = asObject(root.message);
  if (root.type === 'message_start' && Array.isArray(rootMessage.content)) {
    return rootMessage.content.map((item) => asString(asObject(item).text)).join('');
  }

  // === Google Gemini ===
  const firstCandidate = asObject(asArray(root.candidates)[0]);
  const candidateContent = asObject(firstCandidate.content);
  if (Array.isArray(candidateContent.parts)) {
    return textFromParts(candidateContent.parts);
  }

  // === 兜底 ===
  if (typeof root.content === 'string') {
    return root.content;
  }
  if (typeof root.text === 'string') {
    return root.text;
  }

  return '';
}
