#!/usr/bin/env node
// 用法：node build.mjs            → 建出 demos/ 底下全部
//       node build.mjs starter    → 只建指定的 demo
// 產出：dist/<name>.html          → 可直接用瀏覽器打開
//       dist/<name>.artifact.html → 發布成 Claude Artifact 用（不含 <html>/<head>/<body>）
import { readFile, writeFile, mkdir, readdir } from 'node:fs/promises'
import { fileURLToPath, pathToFileURL } from 'node:url'
import path from 'node:path'

const ROOT = path.dirname(fileURLToPath(import.meta.url))

const DEFAULT_LIGHT = {
  brand: '#FFDD36', brandHover: '#FDCC12', brandInk: '#1A1812',
  ground: '#F7F5EF', card: '#FFFFFF', panel: '#EFEDE6', bubble: '#F2EFE6',
  text: '#2E2B24', text2: '#4A4A4A', muted: '#8C8677', border: '#E6E1D4',
  sidebar: '#FBFAF6', active: '#EAE6DA',
  flag: '#9A6212', flagBg: '#FFF4D6', ok: '#3F7D4E',
  shadow: '0 1px 2px rgba(60, 50, 20, .06), 0 12px 40px rgba(60, 50, 20, .08)',
  stageA: 'linear-gradient(150deg, #E9B48F 0%, #8FB0A4 55%, #3E5E5C 100%)',
  stageB: 'linear-gradient(180deg, #5E86A8 0%, #C9A7A0 70%, #F0A487 100%)'
}
const DEFAULT_DARK = {
  ground: '#121212', card: '#1C1C1C', panel: '#1A1A18', bubble: '#292824',
  text: '#EDEBE4', text2: '#E5E5E5', muted: '#9A958A', border: '#33312B',
  sidebar: '#181816', active: '#2A2924',
  flag: '#F2C14E', flagBg: '#3A3220', ok: '#7DC08E',
  shadow: '0 1px 2px rgba(0, 0, 0, .4), 0 12px 40px rgba(0, 0, 0, .35)'
}
const DEFAULT_UI = {
  replay: '播放這段對話', typing: '輸入中', unread: '有新進度',
  composer: '傳訊息給', search: '搜尋小編或對話', sendingTo: '傳送給'
}
const DEFAULT_FONT = {
  family: '"Noto Sans TC"',
  href: 'https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@400;500;700;900&display=swap'
}
const TOKEN = {
  brand: '--brand', brandHover: '--brand-hover', brandInk: '--brand-ink', ground: '--ground', card: '--card',
  panel: '--panel', bubble: '--bubble', text: '--text', text2: '--text-2', muted: '--muted', border: '--border',
  sidebar: '--sidebar', active: '--active', flag: '--flag', flagBg: '--flag-bg', ok: '--ok', shadow: '--shadow',
  stageA: '--stage-a', stageB: '--stage-b'
}
const EVENT_ICONS = ['clock', 'send', 'rule', 'handoff', 'tool']
const FEATURE_KINDS = ['computer', 'watch', 'memory', 'handoff']

function tokens(obj, where) {
  return Object.entries(obj).map(([k, v]) => {
    if (!TOKEN[k]) throw new Error(`${where} 有不認得的色彩欄位「${k}」，可用：${Object.keys(TOKEN).join(', ')}`)
    return `${TOKEN[k]}: ${v};`
  }).join(' ')
}

// 劇本寫錯時在建置階段就擋下來，而不是打開頁面才發現一片空白
function validate(d, name) {
  const errs = []
  const agentIds = Object.keys(d.agents || {})
  const hasAgent = (id) => agentIds.includes(id)
  if (!d.title) errs.push('缺少 title')
  if (!d.intro?.headline) errs.push('缺少 intro.headline')
  if (!d.app?.brand || !d.app?.user?.name) errs.push('缺少 app.brand 或 app.user.name')
  if (!Array.isArray(d.convos) || d.convos.length === 0) errs.push('convos 至少要有一段對話')
  const convoIds = (d.convos || []).map((c) => c.id)
  if (!convoIds.includes(d.app?.defaultConvo)) errs.push(`app.defaultConvo「${d.app?.defaultConvo}」不在 convos 裡`)
  if (new Set(convoIds).size !== convoIds.length) errs.push('convos 的 id 有重複')

  for (const c of d.convos || []) {
    const where = `對話「${c.id}」`
    if (c.group) {
      if (!c.name) errs.push(`${where} 是群組，需要 name`)
      if (c.group.length !== 2 || !c.group.every(hasAgent)) errs.push(`${where} 的 group 要列兩個存在的 agents`)
    } else if (!hasAgent(c.id)) {
      errs.push(`${where} 的 id 要對應 agents 裡的某一位`)
    }
    ;(c.script || []).forEach((s, i) => {
      const at = `${where} 第 ${i + 1} 步`
      const kinds = ['t', 'u', 'b', 'c', 'e'].filter((k) => k in s)
      if (kinds.length !== 1) return errs.push(`${at} 必須剛好是 t/u/b/c/e 其中一種，現在是 [${kinds.join(',')}]`)
      if (s.e && !EVENT_ICONS.includes(s.e)) errs.push(`${at} 的事件圖示「${s.e}」不存在，可用：${EVENT_ICONS.join(', ')}`)
      if (s.e && !s.label) errs.push(`${at} 事件缺少 label`)
      if (s.c && !s.c.every((r) => Array.isArray(r) && r.length === 3 && ['ok', 'flag'].includes(r[0]))) {
        errs.push(`${at} 清單每一行要是 ['ok' 或 'flag', 項目, 結果]`)
      }
      if (s.from && !hasAgent(s.from)) errs.push(`${at} 的 from「${s.from}」不在 agents 裡`)
      if (c.group && (s.b || s.c) && !s.from) errs.push(`${at} 在群組裡，小編訊息要標 from`)
    })
  }

  for (const [i, f] of (d.features?.cards || []).entries()) {
    const at = `功能卡第 ${i + 1} 張`
    if (!FEATURE_KINDS.includes(f.kind)) { errs.push(`${at} kind「${f.kind}」不存在，可用：${FEATURE_KINDS.join(', ')}`); continue }
    if (!f.title || !f.desc) errs.push(`${at} 缺少 title 或 desc`)
    if (f.kind === 'memory' && !hasAgent(f.agent)) errs.push(`${at} 的 agent「${f.agent}」不在 agents 裡`)
    if (f.kind === 'handoff' && !(f.agents?.length >= 2 && f.agents.every(hasAgent))) errs.push(`${at} 的 agents 至少要兩位且都存在`)
  }

  if (errs.length) throw new Error(`demos/${name} 劇本有 ${errs.length} 個問題：\n  - ${errs.join('\n  - ')}`)
}

const escHtml = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c])

async function build(name, css, player) {
  const { default: demo } = await import(pathToFileURL(path.join(ROOT, 'demos', name, 'demo.mjs')))
  validate(demo, name)

  const light = { ...DEFAULT_LIGHT, ...(demo.theme?.light || {}) }
  const dark = { ...DEFAULT_DARK, ...(demo.theme?.dark || {}) }
  const font = { ...DEFAULT_FONT, ...(demo.font || {}) }
  const data = { ...demo, ui: { ...DEFAULT_UI, ...(demo.ui || {}) } }
  delete data.theme
  delete data.font

  const fragment = [
    `<title>${escHtml(demo.title)}</title>`,
    `<link rel="preconnect" href="https://fonts.googleapis.com">`,
    `<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>`,
    `<link rel="stylesheet" href="${escHtml(font.href)}">`,
    `<style>`,
    `:root { --font: ${font.family}; ${tokens(light, 'theme.light')} }`,
    `@media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) { ${tokens(dark, 'theme.dark')} } }`,
    `:root[data-theme="dark"] { ${tokens(dark, 'theme.dark')} }`,
    css,
    `</style>`,
    `<div class="wrap" id="app"></div>`,
    `<script>window.DEMO = ${JSON.stringify(data).replace(/</g, '\\u003c')};</script>`,
    `<script>\n${player}</script>`,
    ''
  ].join('\n')

  const full = `<!doctype html>\n<html lang="${demo.lang || 'zh-Hant'}">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1">\n</head>\n<body>\n${fragment}</body>\n</html>\n`

  await mkdir(path.join(ROOT, 'dist'), { recursive: true })
  await writeFile(path.join(ROOT, 'dist', `${name}.html`), full)
  await writeFile(path.join(ROOT, 'dist', `${name}.artifact.html`), fragment)
  console.log(`✓ ${name} → dist/${name}.html、dist/${name}.artifact.html`)
}

const css = await readFile(path.join(ROOT, 'engine', 'style.css'), 'utf8')
const player = await readFile(path.join(ROOT, 'engine', 'player.js'), 'utf8')
const all = (await readdir(path.join(ROOT, 'demos'), { withFileTypes: true })).filter((e) => e.isDirectory()).map((e) => e.name)
const targets = process.argv.slice(2).length ? process.argv.slice(2) : all

let failed = false
for (const name of targets) {
  try {
    await build(name, css, player)
  } catch (err) {
    failed = true
    console.error(`✗ ${err.message}`)
  }
}
process.exitCode = failed ? 1 : 0
