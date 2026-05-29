# New API 接口格式参考

来源：https://github.com/QuantumNous/new-api（relay.json）

## 支持的 API 格式

| 端点 | 格式 | 说明 |
|------|------|------|
| `POST /v1/chat/completions` | OpenAI Chat | 标准聊天补全（流式/非流式） |
| `POST /v1/responses` | OpenAI Responses | 新版 Responses API |
| `POST /v1/responses/compact` | OpenAI Responses | 压缩对话 |
| `POST /v1/messages` | Anthropic Claude | Claude 消息格式 |
| `POST /v1beta/models/{model}:generateContent` | Google Gemini | Gemini 原生格式 |
| `POST /v1/completions` | OpenAI Completions | 传统文本补全 |
| `POST /v1/embeddings` | OpenAI Embeddings | 文本嵌入 |
| `POST /v1/images/generations` | OpenAI Images | 图像生成 |
| `POST /v1/audio/transcriptions` | OpenAI Audio | 音频转录 |
| `POST /v1/rerank` | Cohere/Jina | 重排序 |

## 流式响应格式

### 1. OpenAI Chat Completions (SSE)

```
data: {"id":"...","object":"chat.completion.chunk","choices":[{"delta":{"content":"text"},"index":0}]}
data: [DONE]
```

**响应结构：** `ChatCompletionStreamResponse`
- `id`: string
- `object`: string
- `created`: integer
- `model`: string
- `choices[]`:
  - `delta.content`: string — 流式内容片段
  - `index`: integer
  - `finish_reason`: string | null

### 2. OpenAI Responses API (SSE)

```
data: {"type":"response.output_text.delta","delta":"text","item_id":"..."}
data: {"type":"response.completed","response":{...}}
```

**响应结构：** `ResponsesStreamResponse`
- `type`: string — 事件类型（`response.output_text.delta`, `response.completed` 等）
- `response`: ResponsesResponse — completed 事件时携带完整响应
- `delta`: string — 文本增量
- `item`: object — 当前 item 元信息

**非流式响应结构：** `ResponsesResponse`
- `id`: string
- `object`: string
- `created_at`: integer
- `status`: string
- `model`: string
- `output[]`: array — 输出内容
- `usage`: Usage

### 3. Anthropic Claude Messages (SSE)

```
data: {"type":"content_block_delta","delta":{"text":"text"},"index":0}
data: {"type":"message_stop"}
```

**响应结构：** `ClaudeResponse`
- `id`: string
- `type`: string
- `role`: string
- `content[]`: array — 内容块数组
- `model`: string
- `stop_reason`: string
- `usage`: object

### 4. Google Gemini (SSE)

```
data: {"candidates":[{"content":{"parts":[{"text":"text"}],"role":"model"}}]}
```

**响应结构：** `GeminiResponse`
- `candidates[]`: array
  - `content.parts[].text`: string
  - `finishReason`: string
- `usageMetadata`: object

### 5. 传统文本补全

```
data: {"id":"...","object":"text_completion","choices":[{"text":"text","index":0}]}
```

**响应结构：** `CompletionResponse`
- `id`: string
- `object`: string
- `created`: integer
- `model`: string
- `choices[]`:
  - `text`: string — 补全文本
  - `index`: integer

## 前端统一格式

所有上游格式统一转换为以下 SSE 格式转发给前端：

```
data: {"content":"text"}
data: [DONE]
```
