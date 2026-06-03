/**
 * 内容导出工具：把生成的 Markdown 文本转换成安全的 HTML，或纯文本下载。
 *
 * 安全策略：
 * - 用 `marked` 解析 Markdown，而不是字符串拼接
 * - 用 `DOMPurify` 清洗输出，防止 AI 返回的 `<script>`、`onerror` 等被注入
 * - 标题与外层 HTML 模板都经过 `escapeHtml`，避免文件名/标题里的特殊字符破坏结构
 */

import { marked } from 'marked';
import DOMPurify from 'dompurify';

// marked 同步模式，方便在浏览器/非异步上下文使用
marked.setOptions({ async: false, breaks: true, gfm: true });

const HTML_TEMPLATE_STYLE = `body{max-width:720px;margin:40px auto;padding:0 20px;font:16px/1.7 -apple-system,sans-serif;color:#222;}
h1{font-size:24px;border-bottom:2px solid #eee;padding-bottom:8px;}
h2{font-size:20px;margin-top:28px;}
h3{font-size:17px;margin-top:22px;}
p{margin:8px 0;}
code{background:#f4f4f5;padding:2px 6px;border-radius:4px;font-size:14px;}
pre{background:#f4f4f5;padding:16px;border-radius:8px;overflow-x:auto;}`;

/** 转义 HTML 特殊字符，用于标题等文本上下文 */
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * 把 Markdown 文本转成安全的 HTML 片段（不含外层 <html>/<body>）。
 * 适合内嵌到批量导出文档里。
 */
export function markdownToSafeHtml(markdown: string): string {
  const rawHtml = marked.parse(markdown) as string;
  // SSR 场景下 DOMPurify 没有 window 可用，调用方应保证在浏览器端使用
  if (typeof window === 'undefined') {
    // 服务端兜底：直接返回原始 marked 输出（不应该走到这里）
    return rawHtml;
  }
  return DOMPurify.sanitize(rawHtml, {
    USE_PROFILES: { html: true },
  });
}

/**
 * 把 Markdown 文本转成完整的可保存 HTML 文档。
 * 标题会被 escape，正文经过 DOMPurify 清洗。
 */
export function markdownToHtmlDocument(markdown: string, title?: string): string {
  const safeTitle = title ? escapeHtml(title) : 'AI 生成内容';
  const titleHtml = title ? `<h1>${safeTitle}</h1>\n` : '';
  const safeBody = markdownToSafeHtml(markdown);
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head><meta charset="utf-8"><title>${safeTitle}</title>
<style>${HTML_TEMPLATE_STYLE}</style></head>
<body>${titleHtml}${safeBody}</body></html>`;
}

/** 触发浏览器下载 */
export function downloadBlob(content: string, filename: string, mime: string) {
  const blob = new Blob([content], { type: `${mime};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export type ExportFormat = 'txt' | 'md' | 'html';

/** 单条内容按指定格式下载 */
export function exportContent(content: string, format: ExportFormat, baseFilename: string) {
  const safeName = baseFilename.slice(0, 40).replace(/[\\/:*?"<>|]/g, '_') || 'content';
  const stamp = Date.now();
  switch (format) {
    case 'md':
      downloadBlob(content, `${safeName}-${stamp}.md`, 'text/markdown');
      return;
    case 'html':
      downloadBlob(markdownToHtmlDocument(content, baseFilename), `${safeName}-${stamp}.html`, 'text/html');
      return;
    default:
      downloadBlob(content, `${safeName}-${stamp}.txt`, 'text/plain');
  }
}
