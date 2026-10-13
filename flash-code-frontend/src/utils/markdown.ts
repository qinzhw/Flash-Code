import MarkdownIt from 'markdown-it'
import hljs from 'highlight.js/lib/core'
import xml from 'highlight.js/lib/languages/xml'
import css from 'highlight.js/lib/languages/css'
import javascript from 'highlight.js/lib/languages/javascript'
import typescript from 'highlight.js/lib/languages/typescript'
import json from 'highlight.js/lib/languages/json'
import bash from 'highlight.js/lib/languages/bash'
import java from 'highlight.js/lib/languages/java'
import markdown from 'highlight.js/lib/languages/markdown'

/**
 * 按需注册语言，避免引入 highlight.js 全量包（体积约 1MB）
 * xml 自带 html 别名，javascript 自带 js/jsx 别名
 */
hljs.registerLanguage('xml', xml)
hljs.registerLanguage('css', css)
hljs.registerLanguage('javascript', javascript)
hljs.registerLanguage('typescript', typescript)
hljs.registerLanguage('json', json)
hljs.registerLanguage('bash', bash)
hljs.registerLanguage('java', java)
hljs.registerLanguage('markdown', markdown)

/** 自动识别时参与候选的语言，控制开销 */
const AUTO_DETECT_LANGUAGES = [
  'xml',
  'css',
  'javascript',
  'typescript',
  'json',
  'bash',
  'java',
  'markdown',
]

/** 纯文本代码块，不做高亮 */
const PLAIN_LANGUAGES = ['text', 'plain', 'plaintext', 'txt', 'none']

const escapeHtml = (source: string): string =>
  source.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

/**
 * 代码高亮：已知语言按语言高亮，未知语言尝试自动识别
 */
const highlightCode = (code: string, lang: string): string => {
  if (lang && hljs.getLanguage(lang)) {
    try {
      return hljs.highlight(code, { language: lang, ignoreIllegals: true }).value
    } catch {
      return escapeHtml(code)
    }
  }
  if (PLAIN_LANGUAGES.includes(lang)) {
    return escapeHtml(code)
  }
  // 未标注语言时，在已注册的语言中自动识别
  try {
    return hljs.highlightAuto(code, AUTO_DETECT_LANGUAGES).value
  } catch {
    return escapeHtml(code)
  }
}

/**
 * Markdown 解析实例
 * - html: false 不解析原始 HTML，避免 AI 输出中的标签（含 script）直接注入
 * - breaks: true 单个换行渲染为 <br>，更贴近对话场景
 * - linkify: true 自动识别纯文本链接
 */
const md = new MarkdownIt({
  html: false,
  xhtmlOut: false,
  breaks: true,
  linkify: true,
  typographer: false,
})

// 代码块渲染：语言标签 + 复制按钮 + 高亮后的代码
md.renderer.rules.fence = (tokens, idx) => {
  const token = tokens[idx]
  const info = token.info ? md.utils.unescapeAll(token.info).trim() : ''
  const [rawLang = '', ...rest] = info.split(/\s+/)
  const lang = rawLang.toLowerCase()
  const langLabel = lang || 'text'
  const extraLabel = rest.join(' ')
  // 去掉代码块末尾的换行，避免多渲染出一行空白
  const code = token.content.replace(/\n$/, '')
  const highlighted = highlightCode(code, lang)

  return `<div class="md-code-block">
  <div class="md-code-header">
    <span class="md-code-lang">${escapeHtml(langLabel)}</span>
    ${extraLabel ? `<span class="md-code-title">${escapeHtml(extraLabel)}</span>` : ''}
    <button type="button" class="md-code-copy" data-code-copy>复制</button>
  </div>
  <pre class="md-code-pre hljs"><code class="language-${escapeHtml(langLabel)}">${highlighted}</code></pre>
</div>`
}

// 行内代码
md.renderer.rules.code_inline = (tokens, idx) =>
  `<code class="md-code-inline">${escapeHtml(tokens[idx].content)}</code>`

// 链接统一新窗口打开
const defaultLinkOpen =
  md.renderer.rules.link_open ??
  ((tokens, idx, options, _env, self) => self.renderToken(tokens, idx, options))

md.renderer.rules.link_open = (tokens, idx, options, env, self) => {
  tokens[idx].attrSet('target', '_blank')
  tokens[idx].attrSet('rel', 'noopener noreferrer')
  return defaultLinkOpen(tokens, idx, options, env, self)
}

/**
 * 渲染 Markdown 文本为 HTML
 * 注意：流式输出时传入的是「不完整」的 Markdown，markdown-it 会把未闭合的
 * 代码围栏按代码块处理，因此可以直接用于实时渲染。
 */
export const renderMarkdown = (content: string): string => {
  if (!content) {
    return ''
  }
  return md.render(content)
}
