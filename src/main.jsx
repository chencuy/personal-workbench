import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'
import {
  AppWindow, ArrowLeft, ArrowUpRight, BookOpen, Check, ChevronDown, Clipboard, Copy, Eye, EyeOff,
  Database, ExternalLink, FolderOpen, Grid2X2, KeyRound, LayoutDashboard, LockKeyhole, LogOut, Menu,
  MoreHorizontal, Pencil, Play, Plus, RefreshCw, Search, Settings2, ShieldCheck, Sparkles,
  Trash2, UnlockKeyhole, Upload, UserRound, X, Zap, PanelLeftClose, PanelLeftOpen, Download, FileUp, Power,
  Timer, Pause, RotateCcw, ChevronUp, Globe2
} from 'lucide-react'
import './styles.css'

const seedPrompts = [
  { id: 1, title: '产品需求拆解', content: '你是一名资深产品经理。请将下面的需求拆解为目标、用户故事、功能清单和验收标准，并指出潜在风险。', tags: ['产品', '工作'], updatedAt: '今天 09:42' },
  { id: 2, title: '代码 Review 助手', content: '请审查以下代码，重点关注正确性、可维护性、性能和安全性。输出问题清单，并给出修改建议。', tags: ['开发', '高频'], updatedAt: '昨天 18:20' },
  { id: 3, title: '文章润色', content: '请在保留原意的前提下，润色这段文字。让表达更自然、简洁、有逻辑，避免过度书面化。', tags: ['写作'], updatedAt: '8月 20日' },
  { id: 4, title: '周报总结', content: '根据本周的工作记录，整理一份简明的周报，包含完成事项、数据结果、问题与下周计划。', tags: ['工作', '写作'], updatedAt: '8月 19日' },
  { id: 5, title: '会议纪要整理', content: '请将以下会议记录整理为议题、结论、待办事项和负责人，并标注截止时间。', tags: ['工作', '效率'], updatedAt: '8月 18日' },
  { id: 6, title: '竞品分析框架', content: '请根据提供的资料，输出竞品定位、核心功能、优劣势和差异化机会。', tags: ['产品', '分析'], updatedAt: '8月 17日' },
  { id: 7, title: '用户访谈提纲', content: '为目标用户设计一份半结构化访谈提纲，覆盖背景、痛点、行为和理想方案。', tags: ['产品', '研究'], updatedAt: '8月 16日' },
  { id: 8, title: 'SQL 查询优化', content: '请分析这段 SQL 的执行逻辑，指出可能的性能瓶颈，并给出索引和查询改写建议。', tags: ['开发', '数据库'], updatedAt: '8月 15日' },
  { id: 9, title: '接口文档生成', content: '根据下面的接口代码生成清晰的 API 文档，包括参数、响应示例和错误码。', tags: ['开发', '文档'], updatedAt: '8月 14日' },
  { id: 10, title: 'Bug 排查助手', content: '请根据复现步骤、日志和代码定位问题根因，列出验证假设和最小修复方案。', tags: ['开发', '高频'], updatedAt: '8月 13日' },
  { id: 11, title: '英文邮件回复', content: '请将下面的中文意图写成礼貌、简洁、自然的英文工作邮件，并提供主题。', tags: ['写作', '英文'], updatedAt: '8月 12日' },
  { id: 12, title: '社交媒体文案', content: '根据产品卖点写 3 条适合社交媒体发布的短文案，语气真诚，不要夸张承诺。', tags: ['写作', '内容'], updatedAt: '8月 11日' },
  { id: 13, title: '长文摘要', content: '提炼这篇文章的核心论点、关键证据和结论，输出一份 200 字以内的摘要。', tags: ['阅读', '写作'], updatedAt: '8月 10日' },
  { id: 14, title: '学习计划制定', content: '根据目标、当前基础和每周可投入时间，制定一份可执行的阶段性学习计划。', tags: ['学习', '效率'], updatedAt: '8月 09日' },
  { id: 15, title: '书籍章节笔记', content: '将下面的章节内容整理为概念、案例、金句和可实践行动，保留原文逻辑。', tags: ['阅读', '学习'], updatedAt: '8月 08日' },
  { id: 16, title: '旅行行程规划', content: '根据目的地、天数、预算和偏好设计行程，平衡交通、景点和休息时间。', tags: ['生活', '规划'], updatedAt: '8月 07日' },
  { id: 17, title: '决策对比表', content: '将多个方案按成本、收益、风险、实施难度和长期影响进行结构化对比。', tags: ['分析', '决策'], updatedAt: '8月 06日' },
  { id: 18, title: 'OKR 目标拆解', content: '将年度目标拆解为季度 Objective 和可量化 Key Results，并补充衡量方式。', tags: ['工作', '目标'], updatedAt: '8月 05日' },
  { id: 19, title: '代码注释生成', content: '为下面的复杂函数补充必要注释，解释输入输出、关键分支和边界情况。', tags: ['开发', '文档'], updatedAt: '8月 04日' },
  { id: 20, title: '测试用例设计', content: '根据功能描述设计覆盖正常、异常、边界和权限场景的测试用例。', tags: ['开发', '测试'], updatedAt: '8月 03日' },
  { id: 21, title: '需求优先级排序', content: '使用影响范围、价值、成本和风险对需求进行排序，并解释每项判断依据。', tags: ['产品', '决策'], updatedAt: '8月 02日' },
  { id: 22, title: '项目复盘模板', content: '从目标达成、过程协作、问题根因和改进行动四个方面生成项目复盘提纲。', tags: ['工作', '项目'], updatedAt: '8月 01日' },
  { id: 23, title: '信息整理助手', content: '将零散信息按主题分类，去除重复内容，标记待确认事项并给出下一步建议。', tags: ['效率', '整理'], updatedAt: '7月 31日' },
  { id: 24, title: '每日计划安排', content: '根据任务优先级、预计时长和固定安排，生成一份现实可执行的今日计划。', tags: ['效率', '生活'], updatedAt: '7月 30日' }
]

let portableStorage = { version: 1, workspaces: [], data: {} }
const getInitialPrompts = (workspaceId = 'personal') => {
  const stored = portableStorage.data?.[workspaceId]?.prompts
  if (!Array.isArray(stored)) return workspaceId === 'personal' ? seedPrompts : []
  const existingTitles = new Set(stored.map(prompt => prompt.title))
  return [...stored, ...seedPrompts.filter(prompt => !existingTitles.has(prompt.title))]
}

const seedLinks = [
  { id: 1, title: 'OpenAI Platform', url: 'https://platform.openai.com/', content: '模型、API 和用量管理', tags: ['AI', '开发'] },
  { id: 2, title: 'GitHub', url: 'https://github.com/', content: '代码仓库与项目协作', tags: ['开发', '工具'] },
  { id: 3, title: 'Figma', url: 'https://www.figma.com/', content: '界面设计与原型', tags: ['设计'] },
  { id: 4, title: 'Notion', url: 'https://www.notion.so/', content: '知识库和项目记录', tags: ['效率', '工具'] },
  ...Array.from({ length: 20 }, (_, index) => ({
    id: 100 + index,
    title: `分页测试网址 ${String(index + 1).padStart(2, '0')}`,
    url: `https://example.com/workbench-test-${index + 1}`,
    content: `用于验证网址收藏分页的第 ${index + 1} 条测试数据`,
    tags: ['测试', '分页']
  }))
]

const PAGE_SIZE = 6

const useAdaptivePageSize = kind => {
  const calculate = () => {
    if (typeof window === 'undefined') return PAGE_SIZE
    const height = window.innerHeight
    const width = window.innerWidth
    if (kind === 'prompt') {
      const columns = width <= 620 ? 1 : width <= 900 ? 2 : 3
      const cardHeight = width <= 620 ? 250 : 238
      const rows = Math.max(1, Math.floor((height - 410) / cardHeight))
      return columns * rows
    }
    if (kind === 'book') {
      const columns = width <= 620 ? 1 : width <= 900 ? 2 : 3
      const cardHeight = width <= 620 ? 224 : 238
      const rows = Math.max(1, Math.floor((height - 410) / cardHeight))
      return columns * rows
    }
    const rowHeight = kind === 'app' ? 124 : 86
    return Math.max(1, Math.min(12, Math.floor((height - 280) / rowHeight)))
  }
  const [pageSize, setPageSize] = useState(calculate)
  useEffect(() => {
    const update = () => setPageSize(calculate())
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [kind])
  return pageSize
}

const getInitialLinks = (workspaceId = 'personal') => {
  const stored = portableStorage.data?.[workspaceId]?.links
  if (!Array.isArray(stored)) return workspaceId === 'personal' ? seedLinks : []
  const existingTitles = new Set(stored.map(link => link.title))
  return [...stored, ...seedLinks.filter(link => !existingTitles.has(link.title))]
}

const getInitialBooks = (workspaceId = 'personal') => {
  const stored = portableStorage.data?.[workspaceId]?.books
  return Array.isArray(stored) ? stored.filter(book => book.fileId && book.fileName).map(({ progress, progressVersion, ...book }) => book) : []
}

const BOOK_FILE_TYPES = ['.pdf', '.epub', '.txt', '.md', '.markdown', '.html', '.htm']
const bookFileType = fileName => `.${String(fileName).split('.').pop().toLowerCase()}`
const legacyBookDbPromises = new Map()
const getLegacyBookDbPromise = (workspaceId = 'personal') => {
  if (!legacyBookDbPromises.has(workspaceId)) legacyBookDbPromises.set(workspaceId, new Promise((resolve, reject) => {
    const databaseName = workspaceId === 'personal' ? 'workbench-books-files' : `workbench-books-files-${workspaceId}`
    const request = indexedDB.open(databaseName, 1)
    request.onupgradeneeded = () => request.result.createObjectStore('files')
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  }))
  return legacyBookDbPromises.get(workspaceId)
}
const readLegacyBookFile = (workspaceId, id) => getLegacyBookDbPromise(workspaceId).then(db => new Promise((resolve, reject) => { const tx = db.transaction('files', 'readonly'); const request = tx.objectStore('files').get(id); request.onsuccess = () => resolve(request.result); request.onerror = () => reject(request.error) }))
const deleteLegacyBookFile = (workspaceId, id) => getLegacyBookDbPromise(workspaceId).then(db => new Promise((resolve, reject) => { const tx = db.transaction('files', 'readwrite'); tx.objectStore('files').delete(id); tx.oncomplete = resolve; tx.onerror = () => reject(tx.error) }))

const requestJson = async (url, options) => {
  const response = await fetch(url, options)
  const result = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(result.error || '本地数据保存失败')
  return result
}

const pendingStorageWrites = new Set()
const trackStorageWrite = promise => {
  pendingStorageWrites.add(promise)
  promise.finally(() => pendingStorageWrites.delete(promise)).catch(() => {})
  return promise
}

const loadPortableStorage = async () => {
  portableStorage = await requestJson('/api/storage')
}

const persistWorkspaceRegistry = async workspaces => {
  portableStorage = await trackStorageWrite(requestJson('/api/storage/registry', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ workspaces })
  }))
}

const persistWorkspaceData = async (workspaceId, key, value) => {
  const result = await trackStorageWrite(requestJson(`/api/storage/workspaces/${encodeURIComponent(workspaceId)}/${encodeURIComponent(key)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ value })
  }))
  portableStorage.data[workspaceId] = { ...(portableStorage.data[workspaceId] || {}), [key]: result.value }
}

const persistWorkspaceImport = async (workspaces, workspaceId, data) => {
  portableStorage = await trackStorageWrite(requestJson('/api/storage/import', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ workspaces, workspaceId, data })
  }))
}

const persistWorkspaceSecurity = async (workspaces, workspaceId, apiKeys) => {
  portableStorage = await trackStorageWrite(requestJson('/api/storage/security', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ workspaces, workspaceId, apiKeys })
  }))
}

const bookFileUrl = (workspaceId, id, fileType = '') => `/api/books/${encodeURIComponent(workspaceId)}/${encodeURIComponent(id)}${fileType ? `?type=${encodeURIComponent(fileType)}` : ''}`
const saveBookFile = async (workspaceId, id, file) => {
  const response = await fetch(bookFileUrl(workspaceId, id), { method: 'PUT', headers: { 'Content-Type': file.type || 'application/octet-stream' }, body: file })
  if (!response.ok) {
    const result = await response.json().catch(() => ({}))
    throw new Error(result.error || '书籍文件保存失败')
  }
}
const readBookFile = async (workspaceId, id, fileType) => {
  let response = await fetch(bookFileUrl(workspaceId, id, fileType))
  if (response.ok) return response.blob()
  if (response.status !== 404) throw new Error('书籍文件读取失败')
  const legacyFile = await readLegacyBookFile(workspaceId, id)
  if (!legacyFile) return null
  await saveBookFile(workspaceId, id, legacyFile)
  response = await fetch(bookFileUrl(workspaceId, id, fileType))
  return response.ok ? response.blob() : legacyFile
}
const deleteBookFile = async (workspaceId, id) => {
  const response = await fetch(bookFileUrl(workspaceId, id), { method: 'DELETE' })
  if (!response.ok && response.status !== 404) throw new Error('书籍文件删除失败')
  await deleteLegacyBookFile(workspaceId, id).catch(() => {})
}

const encoder = new TextEncoder()
const decoder = new TextDecoder()
const toBase64 = bytes => {
  const array = new Uint8Array(bytes)
  let binary = ''
  for (let offset = 0; offset < array.length; offset += 0x8000) binary += String.fromCharCode(...array.subarray(offset, offset + 0x8000))
  return btoa(binary)
}
const fromBase64 = value => Uint8Array.from(atob(value), char => char.charCodeAt(0))
const deriveMaterial = async (password, salt, purpose, bits = false) => {
  const baseKey = await crypto.subtle.importKey('raw', encoder.encode(password), 'PBKDF2', false, ['deriveBits', 'deriveKey'])
  const purposeSalt = new Uint8Array([...salt, ...encoder.encode(purpose)])
  if (bits) return crypto.subtle.deriveBits({ name: 'PBKDF2', salt: purposeSalt, iterations: 250000, hash: 'SHA-256' }, baseKey, 256)
  return crypto.subtle.deriveKey({ name: 'PBKDF2', salt: purposeSalt, iterations: 250000, hash: 'SHA-256' }, baseKey, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt'])
}
const createPasswordConfig = async password => { const salt = crypto.getRandomValues(new Uint8Array(16)); const verifier = await deriveMaterial(password, salt, 'workbench-verifier', true); return { salt: toBase64(salt), verifier: toBase64(verifier) } }
const unlockWithPassword = async (password, config) => { if (!config) return null; const salt = fromBase64(config.salt); const verifier = await deriveMaterial(password, salt, 'workbench-verifier', true); if (toBase64(verifier) !== config.verifier) return null; return deriveMaterial(password, salt, 'workbench-encryption') }
const encryptApiValue = async (key, value) => { const iv = crypto.getRandomValues(new Uint8Array(12)); const ciphertext = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, encoder.encode(value)); return { iv: toBase64(iv), ciphertext: toBase64(ciphertext) } }
const decryptApiValue = async (key, record) => decoder.decode(await crypto.subtle.decrypt({ name: 'AES-GCM', iv: fromBase64(record.iv) }, key, fromBase64(record.ciphertext)))
const encryptExportData = async (key, value) => { const iv = crypto.getRandomValues(new Uint8Array(12)); const ciphertext = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, encoder.encode(JSON.stringify(value))); return { iv: toBase64(iv), ciphertext: toBase64(ciphertext) } }
const decryptExportData = async (key, record) => JSON.parse(decoder.decode(await crypto.subtle.decrypt({ name: 'AES-GCM', iv: fromBase64(record.iv) }, key, fromBase64(record.ciphertext))))

const navGroups = [
  { label: '工作台', items: [{ id: 'overview', label: '概述', icon: LayoutDashboard }] },
  { label: '资源中心', items: [
    { id: 'prompts', label: '提示词库', icon: Sparkles, count: 12 },
    { id: 'links', label: '网址收藏', icon: ArrowUpRight },
    { id: 'keys', label: 'API Keys', icon: KeyRound }
  ] },
  { label: '工具', items: [
    { id: 'apps', label: '应用启动器', icon: AppWindow },
    { id: 'books', label: '个人书库', icon: BookOpen },
    { id: 'pomodoro', label: '番茄钟', icon: Timer }
  ] }
]

const LANGUAGE_OPTIONS = [
  { id: 'zh', label: '中文' },
  { id: 'en', label: 'English' },
  { id: 'ja', label: '日本語' }
]
const LANGUAGE_LABELS = {
  zh: { overview: '概述', prompts: '提示词库', links: '网址收藏', keys: 'API Keys', apps: '应用启动器', books: '个人书库', pomodoro: '番茄钟', settings: '设置' },
  en: { overview: 'Overview', prompts: 'Prompt Library', links: 'Bookmarks', keys: 'API Keys', apps: 'App Launcher', books: 'Book Library', pomodoro: 'Pomodoro', settings: 'Settings' },
  ja: { overview: '概要', prompts: 'プロンプト', links: 'ブックマーク', keys: 'API Keys', apps: 'アプリランチャー', books: '本棚', pomodoro: 'ポモドーロ', settings: '設定' }
}
const storedLanguage = () => {
  if (typeof window === 'undefined') return 'zh'
  const value = window.localStorage.getItem('workbench-language')
  return LANGUAGE_OPTIONS.some(option => option.id === value) ? value : 'zh'
}
const languageLabel = (id, language) => LANGUAGE_LABELS[language]?.[id] || LANGUAGE_LABELS.zh[id] || id
const getWorkspaces = () => {
  return Array.isArray(portableStorage.workspaces) ? portableStorage.workspaces : []
}

function App() {
  const [workspaces, setWorkspaces] = useState(getWorkspaces)
  const [workspaceId, setWorkspaceId] = useState(() => getWorkspaces()[0]?.id || '')
  const [encryptionKey, setEncryptionKey] = useState(null)
  const [strictWorkspaceId, setStrictWorkspaceId] = useState('')
  const workspace = workspaces.find(item => item.id === workspaceId)
  const setupWorkspace = async (name, password) => {
    for (const item of workspaces) if (await unlockWithPassword(password, item)) return '该密码已属于其他工作区，请设置不同密码'
    const config = await createPasswordConfig(password)
    const next = { id: crypto.randomUUID(), name: name.trim(), description: '本地工作区', avatar: name.trim().slice(0, 1).toUpperCase(), ...config }
    const registry = [...workspaces, next]
    try { await persistWorkspaceRegistry(registry) } catch (error) { return error.message || '工作区保存失败' }
    setWorkspaces(registry); setWorkspaceId(next.id); setStrictWorkspaceId(''); setEncryptionKey(await deriveMaterial(password, fromBase64(config.salt), 'workbench-encryption'))
    return true
  }
  const unlockWorkspace = async password => {
    const candidates = strictWorkspaceId ? workspaces.filter(item => item.id === strictWorkspaceId) : workspaces
    for (const item of candidates) {
      const key = await unlockWithPassword(password, item)
      if (key) { setWorkspaceId(item.id); setStrictWorkspaceId(''); setEncryptionKey(key); return true }
    }
    return false
  }
  const importConfigFile = async file => {
    if (!file) return
    try {
      const imported = JSON.parse(await file.text())
      if (imported?.format !== 'personal-workbench-encrypted-config' || imported.version !== 1 || !imported.workspace?.salt || !imported.workspace?.verifier) throw new Error('配置文件格式无效')
      const originalPassword = window.prompt('请输入该配置原来的工作区密码')
      if (originalPassword === null) return
      const importedKey = await unlockWithPassword(originalPassword, imported.workspace)
      if (!importedKey) throw new Error('原密码不正确，无法导入配置')
      const payload = await decryptExportData(importedKey, imported)
      if (payload?.format !== 'personal-workbench-config' || !Array.isArray(payload.data?.prompts) || !Array.isArray(payload.data?.links)) throw new Error('配置内容无效')
      const existing = workspaces.find(item => item.name.trim().toLocaleLowerCase() === imported.workspace.name.trim().toLocaleLowerCase())
      if (existing && !window.confirm(`配置名“${imported.workspace.name}”已存在，是否覆盖配置？\n\n注意：工作区密码也会被覆盖。`)) return
      const nextWorkspace = { ...imported.workspace, id: existing?.id || imported.workspace.id }
      const registry = existing ? workspaces.map(item => item.id === existing.id ? nextWorkspace : item) : [...workspaces, nextWorkspace]
      await persistWorkspaceImport(registry, nextWorkspace.id, payload.data)
      setWorkspaces(registry); setWorkspaceId(nextWorkspace.id); setStrictWorkspaceId(''); setEncryptionKey(importedKey)
    } catch (error) { window.alert(error.message || '配置导入失败') }
  }
  if (!workspace || !encryptionKey) return <SecurityGate language={storedLanguage()} mode={workspace ? 'unlock' : 'setup'} workspace={workspace} onSetup={setupWorkspace} onUnlock={unlockWorkspace} workspaces={workspaces} switchingWorkspace={Boolean(strictWorkspaceId)} onImportConfig={importConfigFile} onSelectWorkspace={id => { setStrictWorkspaceId(''); setWorkspaceId(id); setEncryptionKey(null) }} />
  const replaceWorkspace = async (nextWorkspace, importedKey, persist = true) => {
    const registry = workspaces.some(item => item.id === nextWorkspace.id)
      ? workspaces.map(item => item.id === nextWorkspace.id ? nextWorkspace : item)
      : [...workspaces, nextWorkspace]
    if (persist) await persistWorkspaceRegistry(registry)
    setWorkspaces(registry)
    if (nextWorkspace.id === workspaceId && importedKey) setEncryptionKey(importedKey)
  }
  return <WorkbenchApp key={workspaceId} workspace={workspace} workspaces={workspaces} onSwitchWorkspace={id => { setStrictWorkspaceId(id); setEncryptionKey(null); setWorkspaceId(id) }} encryptionKey={encryptionKey} onReplaceWorkspace={replaceWorkspace} />
}

function WorkbenchApp({ workspace, workspaces, onSwitchWorkspace, encryptionKey, onReplaceWorkspace }) {
  const [active, setActive] = useState('overview')
  const [language, setLanguage] = useState(storedLanguage)
  const [systemUsername, setSystemUsername] = useState('')
  const [prompts, setPrompts] = useState(() => getInitialPrompts(workspace.id))
  const [links, setLinks] = useState(() => getInitialLinks(workspace.id))
  const [books, setBooks] = useState(() => getInitialBooks(workspace.id))
  const [apiKeys, setApiKeys] = useState(() => portableStorage.data?.[workspace.id]?.['api-keys'] || [])
  const [query, setQuery] = useState('')
  const [selectedTag, setSelectedTag] = useState('全部')
  const [bookQuery, setBookQuery] = useState('')
  const [bookType, setBookType] = useState('全部')
  const [bookImporting, setBookImporting] = useState(false)
  const [readerBook, setReaderBook] = useState(null)
  const [modal, setModal] = useState(null)
  const [globalSearchOpen, setGlobalSearchOpen] = useState(false)
  const [toast, setToast] = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [page, setPage] = useState(1)
  const [bookPage, setBookPage] = useState(1)
  const promptPageSize = useAdaptivePageSize('prompt')
  const bookPageSize = useAdaptivePageSize('book')
  const localize = (zh, en, ja) => language === 'en' ? en : language === 'ja' ? ja : zh

  useEffect(() => {
    fetch('/api/system').then(response => response.ok ? response.json() : null).then(result => {
      if (result?.username) setSystemUsername(String(result.username))
    }).catch(() => {})
  }, [])
  useEffect(() => {
    const handleLanguageChange = event => setLanguage(event.detail?.language || storedLanguage())
    window.addEventListener('workbench-language-change', handleLanguageChange)
    document.documentElement.lang = language === 'en' ? 'en' : language === 'ja' ? 'ja' : 'zh-CN'
    return () => window.removeEventListener('workbench-language-change', handleLanguageChange)
  }, [language])

  useEffect(() => { persistWorkspaceData(workspace.id, 'prompts', prompts).catch(() => setToast(localize('提示词保存失败，请重试', 'Unable to save prompts. Try again.', 'プロンプトを保存できません。もう一度お試しください。'))) }, [workspace.id, prompts])
  useEffect(() => { persistWorkspaceData(workspace.id, 'links', links).catch(() => setToast(localize('网址保存失败，请重试', 'Unable to save bookmarks. Try again.', 'ブックマークを保存できません。もう一度お試しください。'))) }, [workspace.id, links])
  useEffect(() => { persistWorkspaceData(workspace.id, 'books', books).catch(() => setToast(localize('书库保存失败，请重试', 'Unable to save the book library. Try again.', '本棚を保存できません。もう一度お試しください。'))) }, [workspace.id, books])
  useEffect(() => { persistWorkspaceData(workspace.id, 'api-keys', apiKeys).catch(() => setToast(localize('API Key 保存失败，请重试', 'Unable to save API keys. Try again.', 'API Keyを保存できません。もう一度お試しください。'))) }, [workspace.id, apiKeys])
  useEffect(() => { if (toast) { const timer = setTimeout(() => setToast(''), 2200); return () => clearTimeout(timer) } }, [toast])
  useEffect(() => {
    const handleShortcut = event => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        setGlobalSearchOpen(open => !open)
      }
    }
    window.addEventListener('keydown', handleShortcut)
    return () => window.removeEventListener('keydown', handleShortcut)
  }, [])

  const tags = useMemo(() => ['全部', ...new Set(prompts.flatMap(p => p.tags))], [prompts])
  const filtered = useMemo(() => prompts.filter(p => {
    const matchQuery = `${p.title} ${p.content} ${p.tags.join(' ')}`.toLowerCase().includes(query.toLowerCase())
    return matchQuery && (selectedTag === '全部' || p.tags.includes(selectedTag))
  }), [prompts, query, selectedTag])
  const pageCount = Math.max(1, Math.ceil(filtered.length / promptPageSize))
  const pagedPrompts = filtered.slice((page - 1) * promptPageSize, page * promptPageSize)

  const filteredBooks = useMemo(() => books.filter(book => {
    const matchQuery = `${book.title} ${book.author || ''} ${book.category || ''} ${book.fileName || ''}`.toLowerCase().includes(bookQuery.toLowerCase())
    return matchQuery && (bookType === '全部' || book.fileType === bookType)
  }), [books, bookQuery, bookType])
  const bookPageCount = Math.max(1, Math.ceil(filteredBooks.length / bookPageSize))
  const pagedBooks = filteredBooks.slice((bookPage - 1) * bookPageSize, bookPage * bookPageSize)

  useEffect(() => { setPage(1) }, [query, selectedTag])
  useEffect(() => { if (page > pageCount) setPage(pageCount) }, [page, pageCount])
  useEffect(() => { setBookPage(1) }, [bookQuery, bookType])
  useEffect(() => { if (bookPage > bookPageCount) setBookPage(bookPageCount) }, [bookPage, bookPageCount])

  const openCreate = () => setModal({ mode: 'create', item: { title: '', content: '', tags: [] } })
  const openEdit = item => setModal({ mode: 'edit', item: { ...item, tags: [...item.tags] } })
  const savePrompt = (item) => {
    const normalized = { ...item, title: item.title.trim(), content: item.content.trim(), tags: item.tags.filter(Boolean), updatedAt: '刚刚' }
    if (!normalized.title || !normalized.content) return
    setPrompts(prev => modal.mode === 'create' ? [{ ...normalized, id: Date.now() }, ...prev] : prev.map(p => p.id === normalized.id ? normalized : p))
    setModal(null); setToast(modal.mode === 'create' ? localize('提示词已创建', 'Prompt created.', 'プロンプトを作成しました。') : localize('提示词已更新', 'Prompt updated.', 'プロンプトを更新しました。'))
  }
  const deletePrompt = id => { setPrompts(prev => prev.filter(p => p.id !== id)); setToast(localize('提示词已删除', 'Prompt deleted.', 'プロンプトを削除しました。')) }
  const copyPrompt = async item => { try { await navigator.clipboard.writeText(item.content); setToast(localize('内容已复制到剪贴板', 'Copied to clipboard.', 'クリップボードにコピーしました。')) } catch { setToast(localize('复制失败，请检查浏览器权限', 'Copy failed. Check browser permission.', 'コピーに失敗しました。ブラウザの権限を確認してください。')) } }
  const saveLink = link => { const normalized = { ...link, title: link.title.trim(), url: link.url.trim(), content: link.content.trim(), tags: link.tags.filter(Boolean) }; let safeUrl = false; try { const parsed = new URL(normalized.url); safeUrl = ['http:', 'https:'].includes(parsed.protocol) } catch { /* invalid URLs stay in the form */ } if (!normalized.title || !safeUrl) return setToast(localize('请输入有效的 HTTP 或 HTTPS 网址', 'Enter a valid HTTP or HTTPS URL.', '有効なHTTPまたはHTTPS URLを入力してください。')); setLinks(prev => link.id ? prev.map(item => item.id === link.id ? normalized : item) : [{ ...normalized, id: Date.now() }, ...prev]); setModal(null); setToast(link.id ? localize('网址已更新', 'Bookmark updated.', 'ブックマークを更新しました。') : localize('网址已保存', 'Bookmark saved.', 'ブックマークを保存しました。')) }
  const deleteLink = id => { setLinks(prev => prev.filter(link => link.id !== id)); setToast(localize('网址已删除', 'Bookmark deleted.', 'ブックマークを削除しました。')) }
  const importBook = async event => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    const fileType = bookFileType(file.name)
    if (!BOOK_FILE_TYPES.includes(fileType)) return setToast(localize('支持 PDF、EPUB、TXT、Markdown 和 HTML 文件', 'Supported files: PDF, EPUB, TXT, Markdown and HTML.', 'PDF、EPUB、TXT、Markdown、HTMLファイルに対応しています。'))
    setBookImporting(true)
    try {
      const fileId = crypto.randomUUID()
      await saveBookFile(workspace.id, fileId, file)
      const title = file.name.replace(/\.[^.]+$/, '')
      setBooks(prev => [{ id: Date.now(), fileId, fileName: file.name, fileType, title, author: '', category: '', size: file.size, updatedAt: '刚刚' }, ...prev])
      setToast(localize('书籍已导入本机书库', 'Book imported to the local library.', '書籍をローカル本棚に追加しました。'))
    } catch { setToast(localize('书籍导入失败，请重试', 'Unable to import the book. Try again.', '書籍を取り込めません。もう一度お試しください。')) } finally { setBookImporting(false) }
  }
  const openEditBook = book => setModal({ mode: 'book-edit', item: { ...book } })
  const saveBook = book => {
    const normalized = { ...book, title: book.title.trim(), author: book.author.trim(), category: book.category.trim(), updatedAt: '刚刚' }
    if (!normalized.title) return setToast(localize('请填写书名', 'Enter a book title.', '書名を入力してください。'))
    setBooks(prev => book.id ? prev.map(item => item.id === book.id ? normalized : item) : [{ ...normalized, id: Date.now() }, ...prev])
    setModal(null); setToast(book.id ? localize('书籍已更新', 'Book updated.', '書籍を更新しました。') : localize('书籍已加入书库', 'Book added to the library.', '書籍を本棚に追加しました。'))
  }
  const deleteBook = async book => { if (!window.confirm(localize(`确定从书库删除“${book.title}”吗？`, `Delete “${book.title}” from the library?`, `本棚から「${book.title}」を削除しますか？`))) return; await deleteBookFile(workspace.id, book.fileId).catch(() => {}); setBooks(prev => prev.filter(item => item.id !== book.id)); setToast(localize('书籍已删除', 'Book deleted.', '書籍を削除しました。')) }
  const updateBookLocation = useCallback((bookId, location, textOffset) => {
    setBooks(prev => prev.map(item => item.id === bookId ? {
      ...item,
      ...(location ? { location } : {}),
      ...(typeof textOffset === 'number' ? { textOffset } : {})
    } : item))
  }, [])
  const saveApiKey = async record => { let requestUrl = ''; try { requestUrl = new URL(record.requestUrl.trim()).href } catch { return setToast('请输入有效的 HTTP 或 HTTPS 请求地址') } if (!['http:', 'https:'].includes(new URL(requestUrl).protocol)) return setToast('请求地址仅支持 HTTP 或 HTTPS'); if (!record.name.trim() || !record.provider.trim() || !record.value.trim()) return setToast('请填写名称、服务商和 API Key'); const encrypted = await encryptApiValue(encryptionKey, record.value.trim()); const saved = { id: record.id || Date.now(), name: record.name.trim(), provider: record.provider.trim(), requestUrl, encrypted, updatedAt: '刚刚' }; setApiKeys(prev => record.id ? prev.map(item => item.id === record.id ? saved : item) : [saved, ...prev]); setModal(null); setToast(record.id ? 'API Key 已更新' : 'API Key 已加密保存') }
  const deleteApiKey = id => { setApiKeys(prev => prev.filter(item => item.id !== id)); setToast('API Key 已删除') }
  const renameWorkspace = async name => {
    const normalized = name.trim()
    if (!normalized) throw new Error('工作区名称不能为空')
    const duplicate = workspaces.some(item => item.id !== workspace.id && item.name.trim().toLocaleLowerCase() === normalized.toLocaleLowerCase())
    if (duplicate) throw new Error('工作区名称已存在')
    if (normalized === workspace.name) return
    await onReplaceWorkspace({ ...workspace, name: normalized, avatar: normalized.slice(0, 1).toUpperCase() })
    setToast('工作区名称已更新')
  }
  const changeWorkspacePassword = async ({ currentPassword, newPassword, confirmPassword }) => {
    if (!currentPassword) throw new Error('请输入当前密码')
    if (newPassword.length < 8) throw new Error('新密码至少需要 8 位字符')
    if (newPassword !== confirmPassword) throw new Error('两次输入的新密码不一致')
    if (!(await unlockWithPassword(currentPassword, workspace))) throw new Error('当前密码错误')
    if (currentPassword === newPassword) throw new Error('新密码不能与当前密码相同')
    for (const item of workspaces) {
      if (item.id !== workspace.id && await unlockWithPassword(newPassword, item)) throw new Error('该密码已属于其他工作区，请使用不同密码')
    }

    const plaintextKeys = await Promise.all(apiKeys.map(async item => ({ item, value: await decryptApiValue(encryptionKey, item.encrypted) })))
    const config = await createPasswordConfig(newPassword)
    const nextKey = await deriveMaterial(newPassword, fromBase64(config.salt), 'workbench-encryption')
    const reencryptedKeys = await Promise.all(plaintextKeys.map(async ({ item, value }) => ({ ...item, encrypted: await encryptApiValue(nextKey, value) })))
    const nextWorkspace = { ...workspace, ...config }
    const registry = workspaces.map(item => item.id === workspace.id ? nextWorkspace : item)
    await persistWorkspaceSecurity(registry, workspace.id, reencryptedKeys)
    setApiKeys(reencryptedKeys)
    await onReplaceWorkspace(nextWorkspace, nextKey, false)
    setToast('工作区密码已更新')
  }
  const exportWorkspace = async () => {
    const payload = {
      format: 'personal-workbench-config',
      version: 1,
      exportedAt: new Date().toISOString(),
      data: { prompts, links, books, apiKeys }
    }
    try {
      const encrypted = await encryptExportData(encryptionKey, payload)
      const output = JSON.stringify({ format: 'personal-workbench-encrypted-config', version: 1, workspace: { id: workspace.id, name: workspace.name, description: workspace.description, avatar: workspace.avatar, salt: workspace.salt, verifier: workspace.verifier }, ...encrypted }, null, 2)
      const blob = new Blob([output], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const anchor = document.createElement('a')
      anchor.href = url
      anchor.download = `${workspace.name.replace(/[\\/:*?"<>|]/g, '_')}-工作区配置.json`
      anchor.click()
      URL.revokeObjectURL(url)
      setToast('配置数据已导出')
    } catch { setToast('配置导出失败，请重试') }
  }
  const importWorkspace = async file => {
    if (!file) return
    try {
      const imported = JSON.parse(await file.text())
      if (imported?.format !== 'personal-workbench-encrypted-config' || imported.version !== 1 || !imported.workspace?.salt || !imported.workspace?.verifier) throw new Error('配置文件格式无效')
      const originalPassword = window.prompt('请输入该配置原来的工作区密码')
      if (originalPassword === null) return
      const importedKey = await unlockWithPassword(originalPassword, imported.workspace)
      if (!importedKey) throw new Error('原密码不正确，无法导入配置')
      const payload = await decryptExportData(importedKey, imported)
      if (payload?.format !== 'personal-workbench-config' || !Array.isArray(payload.data?.prompts) || !Array.isArray(payload.data?.links)) throw new Error('配置内容无效')
      const existing = workspaces.find(item => item.name.trim().toLocaleLowerCase() === imported.workspace.name.trim().toLocaleLowerCase())
      if (existing && !window.confirm(`配置名“${imported.workspace.name}”已存在，是否覆盖配置？\n\n注意：工作区密码也会被覆盖。`)) return
      const nextWorkspace = { ...imported.workspace, id: existing?.id || imported.workspace.id }
      const registry = existing ? workspaces.map(item => item.id === existing.id ? nextWorkspace : item) : [...workspaces, nextWorkspace]
      await persistWorkspaceImport(registry, nextWorkspace.id, payload.data || {})
      await onReplaceWorkspace(nextWorkspace, importedKey, false)
      if (existing?.id === workspace.id) {
        setToast('配置已覆盖，页面将重新加载并使用新密码')
        window.setTimeout(() => window.location.reload(), 500)
      } else setToast(existing ? '配置已覆盖，请从工作区列表进入' : '配置已导入，请从工作区列表进入')
    } catch (error) { setToast(error.message || '配置导入失败') }
  }
  const [startupEnabled, setStartupEnabled] = useState(false)
  const [serverPort, setServerPort] = useState(5180)
  useEffect(() => {
    Promise.all([fetch('/api/startup'), fetch('/api/server')]).then(async ([startupResponse, serverResponse]) => {
      const [startup, server] = await Promise.all([startupResponse.json().catch(() => ({})), serverResponse.json().catch(() => ({}))])
      if (startupResponse.ok) setStartupEnabled(Boolean(startup.enabled))
      if (serverResponse.ok && Number.isInteger(server.port)) setServerPort(server.port)
    }).catch(() => {})
  }, [])
  const toggleStartup = async event => {
    const enabled = event.target.checked
    try {
      const response = await fetch('/api/startup', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ enabled }) })
      const result = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(result.error || '开机自启动设置失败')
      setStartupEnabled(Boolean(result.enabled))
      setToast(result.enabled ? `已开启开机自启动，登录 Windows 后会启动 127.0.0.1:${result.port} 服务` : '已关闭开机自启动')
    } catch (error) {
      setStartupEnabled(previous => previous)
      setToast(error.message || '开机自启动设置失败')
      throw error
    }
  }
  const saveServerPort = async port => {
    await Promise.all([...pendingStorageWrites])
    const response = await fetch('/api/server', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ port }) })
    const result = await response.json().catch(() => ({}))
    if (!response.ok) throw new Error(result.error || '端口设置失败')
    setServerPort(result.port)
    setToast(result.restarting ? `端口已保存，服务正在自动重启到 127.0.0.1:${result.port}` : '当前服务已绑定该端口')
    if (result.restarting) window.setTimeout(() => window.location.replace(`http://127.0.0.1:${result.port}/`), 3000)
    return result
  }
  const getServiceStatus = async () => requestJson('/api/server/status')
  const restartService = async () => {
    const result = await requestJson('/api/server/restart', { method: 'POST' })
    window.setTimeout(() => window.location.replace(`http://127.0.0.1:${result.port}/`), 2800)
    return result
  }
  const getServiceLogs = async () => requestJson('/api/server/logs')
  const resetWorkbench = async () => {
    const result = await requestJson('/api/server/reset', { method: 'POST' })
    window.setTimeout(() => window.location.replace(`http://127.0.0.1:${result.port}/`), 2800)
    return result
  }
  const openSearchResult = result => {
    setReaderBook(null)
    setGlobalSearchOpen(false)
    setSidebarOpen(false)
    if (result.kind === 'prompt') { setQuery(result.title); setSelectedTag('全部'); setPage(1) }
    if (result.kind === 'book') { setBookQuery(result.title); setBookType('全部'); setBookPage(1) }
    setActive(result.section)
  }

  return <div className={`app-shell ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
    <aside className={`sidebar ${sidebarOpen ? 'is-open' : ''}`}>
      <div className="brand"><div className="brand-mark"><Grid2X2 size={17} strokeWidth={2.5} /></div><span>{language === 'en' ? 'Workbench' : language === 'ja' ? 'ワークベンチ' : '工作台'}</span></div>
      <button className="sidebar-collapse-button" style={sidebarCollapsed ? { position: 'static', width: '100%', height: 39, margin: '48px 0 5px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 } : undefined} title={sidebarCollapsed ? (language === 'en' ? 'Expand sidebar' : language === 'ja' ? 'サイドバーを開く' : '展开侧边栏') : (language === 'en' ? 'Collapse sidebar' : language === 'ja' ? 'サイドバーを閉じる' : '收起侧边栏')} aria-label={sidebarCollapsed ? (language === 'en' ? 'Expand sidebar' : language === 'ja' ? 'サイドバーを開く' : '展开侧边栏') : (language === 'en' ? 'Collapse sidebar' : language === 'ja' ? 'サイドバーを閉じる' : '收起侧边栏')} onClick={() => setSidebarCollapsed(value => !value)}>{sidebarCollapsed ? <PanelLeftOpen size={17} /> : <PanelLeftClose size={17} />}</button>
      <WorkspaceSwitcher language={language} workspace={workspace} workspaces={workspaces} onSwitch={onSwitchWorkspace} onCreate={() => onSwitchWorkspace('__create__')} />
      <nav className="nav">
        {navGroups.map(group => <div className="nav-group" key={group.label}><div className="nav-label">{language === 'en' ? (group.label === '工作台' ? 'WORKSPACE' : group.label === '资源中心' ? 'RESOURCES' : 'TOOLS') : language === 'ja' ? (group.label === '工作台' ? 'ワークスペース' : group.label === '资源中心' ? 'リソース' : 'ツール') : group.label}</div>{group.items.map(item => <button key={item.id} className={`nav-item ${active === item.id ? 'active' : ''}`} onClick={() => { setReaderBook(null); setActive(item.id); setSidebarOpen(false) }}><item.icon size={17} /><span>{languageLabel(item.id, language)}</span>{item.id === 'prompts' && <span className="nav-count">{prompts.length}</span>}</button>)}</div>)}
      </nav>
       <div className="sidebar-footer"><button className={`nav-item ${active === 'settings' ? 'active' : ''}`} onClick={() => { setReaderBook(null); setActive('settings'); setSidebarOpen(false) }}><Settings2 size={17} /><span>{languageLabel('settings', language)}</span></button></div>
    </aside>
    {sidebarOpen && <button className="backdrop" aria-label={language === 'en' ? 'Close menu' : language === 'ja' ? 'メニューを閉じる' : '关闭菜单'} onClick={() => setSidebarOpen(false)} />}
    <main className="main-content">
      <header className="topbar"><button className="mobile-menu" onClick={() => setSidebarOpen(true)}><Menu size={20} /></button><div className="breadcrumbs"><span>{language === 'en' ? 'Workspace' : language === 'ja' ? 'ワークスペース' : '工作台'}</span><span className="slash">/</span><strong>{languageLabel(active, language)}</strong></div><div className="topbar-actions"><button className="icon-button global-search-trigger" title={language === 'en' ? 'Global search' : language === 'ja' ? 'グローバル検索' : '全局搜索'} aria-label={language === 'en' ? 'Global search' : language === 'ja' ? 'グローバル検索' : '全局搜索'} onClick={() => setGlobalSearchOpen(true)}><Search size={18} /></button></div></header>
       {readerBook ? <BookReader language={language} workspaceId={workspace.id} book={readerBook} onClose={() => setReaderBook(null)} onLocation={updateBookLocation} /> : active === 'overview' ? <Overview language={language} username={systemUsername} prompts={prompts} links={links} apiKeys={apiKeys} onNavigate={setActive} onCopy={copyPrompt} onStopService={async () => {
         const response = await fetch('/api/server/stop', { method: 'POST' })
         const result = await response.json().catch(() => ({}))
         if (!response.ok) throw new Error(result.error || '关闭服务失败')
         return result
       }} /> : active === 'prompts' ? <PromptLibrary language={language} prompts={pagedPrompts} allPrompts={prompts} filteredCount={filtered.length} page={page} pageCount={pageCount} setPage={setPage} tags={tags} query={query} setQuery={setQuery} selectedTag={selectedTag} setSelectedTag={setSelectedTag} onCreate={openCreate} onEdit={openEdit} onDelete={deletePrompt} onCopy={copyPrompt} /> : active === 'links' ? <LinksLibrary language={language} links={links} onCreate={() => setModal({ mode: 'link-create', item: { title: '', url: '', content: '', tags: [] } })} onEdit={link => setModal({ mode: 'link-edit', item: { ...link, tags: [...link.tags] } })} onDelete={deleteLink} /> : active === 'keys' ? <ApiKeyLibrary language={language} apiKeys={apiKeys} encryptionKey={encryptionKey} onCreate={() => setModal({ mode: 'key-create', item: { name: '', provider: '', value: '', requestUrl: '' } })} onEdit={async record => { try { setModal({ mode: 'key-edit', item: { ...record, requestUrl: record.requestUrl || '', value: await decryptApiValue(encryptionKey, record.encrypted) } }) } catch { setToast(language === 'en' ? 'Unable to decrypt this API key' : language === 'ja' ? 'このAPI Keyを復号できません' : '无法解密该 API Key') } }} onDelete={deleteApiKey} /> : active === 'books' ? <BookLibrary language={language} books={pagedBooks} allBooks={books} filteredCount={filteredBooks.length} page={bookPage} pageCount={bookPageCount} setPage={setBookPage} query={bookQuery} setQuery={setBookQuery} type={bookType} setType={bookType} importing={bookImporting} onImport={importBook} onEdit={openEditBook} onDelete={deleteBook} onRead={setReaderBook} /> : active === 'apps' ? <AppLauncher language={language} workspaceId={workspace.id} /> : active === 'pomodoro' ? <PomodoroTimer language={language} /> : active === 'settings' ? <SettingsPage language={language} workspace={workspace} startupEnabled={startupEnabled} serverPort={serverPort} onToggleStartup={toggleStartup} onSaveServerPort={saveServerPort} onGetServiceStatus={getServiceStatus} onRestartService={restartService} onGetServiceLogs={getServiceLogs} onResetWorkbench={resetWorkbench} onRenameWorkspace={renameWorkspace} onChangePassword={changeWorkspacePassword} onExport={exportWorkspace} onImport={file => importWorkspace(file)} /> : <Placeholder language={language} title={languageLabel(active, language)} icon={navGroups.flatMap(g => g.items).find(i => i.id === active)?.icon} />}
    </main>
      {modal?.mode === 'create' || modal?.mode === 'edit' ? <PromptModal language={language} modal={modal} onClose={() => setModal(null)} onSave={savePrompt} /> : null}
      {modal?.mode?.startsWith('link-') ? <LinkModal language={language} modal={modal} onClose={() => setModal(null)} onSave={saveLink} /> : null}
      {modal?.mode?.startsWith('key-') ? <ApiKeyModal language={language} modal={modal} onClose={() => setModal(null)} onSave={saveApiKey} /> : null}
      {modal?.mode?.startsWith('book-') ? <BookModal language={language} modal={modal} onClose={() => setModal(null)} onSave={saveBook} /> : null}
      {globalSearchOpen && <GlobalSearch language={language} workspaceId={workspace.id} prompts={prompts} links={links} apiKeys={apiKeys} books={books} onClose={() => setGlobalSearchOpen(false)} onSelect={openSearchResult} />}
    {toast && <div className="toast"><Check size={16} />{toast}</div>}
  </div>
}

const searchModules = [
  { key: 'module-overview', kind: 'module', section: 'overview', title: '概述', detail: '工作台首页', keywords: '首页 仪表盘 dashboard', icon: LayoutDashboard },
  { key: 'module-prompts', kind: 'module', section: 'prompts', title: '提示词库', detail: '提示词管理', keywords: 'prompt 提示词', icon: Sparkles },
  { key: 'module-links', kind: 'module', section: 'links', title: '网址收藏', detail: '常用网站和资料', keywords: '链接 书签 bookmark url', icon: ExternalLink },
  { key: 'module-keys', kind: 'module', section: 'keys', title: 'API Keys', detail: 'API Key 管理', keywords: '密钥 key 服务商', icon: KeyRound },
  { key: 'module-apps', kind: 'module', section: 'apps', title: '应用启动器', detail: '本机应用快捷方式', keywords: '软件 程序 快捷方式 launcher', icon: AppWindow },
  { key: 'module-books', kind: 'module', section: 'books', title: '个人书库', detail: '本地书籍和阅读', keywords: 'book epub pdf 阅读', icon: BookOpen },
  { key: 'module-pomodoro', kind: 'module', section: 'pomodoro', title: '番茄钟', detail: '专注计时工具', keywords: '番茄钟 pomodoro 专注 计时 timer', icon: Timer },
  { key: 'module-settings', kind: 'module', section: 'settings', title: '设置', detail: '工作台设置', keywords: 'settings 配置', icon: Settings2 }
]

function GlobalSearch({ language = 'zh', workspaceId, prompts, links, apiKeys, books, onClose, onSelect }) {
  const [query, setQuery] = useState('')
  const [shortcuts, setShortcuts] = useState([])

  useEffect(() => {
    const handleEscape = event => { if (event.key === 'Escape') onClose() }
    window.addEventListener('keydown', handleEscape)
    listShortcuts(workspaceId).then(result => setShortcuts(Array.isArray(result?.shortcuts) ? result.shortcuts : [])).catch(() => {})
    return () => window.removeEventListener('keydown', handleEscape)
  }, [onClose, workspaceId])

  const results = useMemo(() => {
    const entries = [
      ...searchModules.map(item => ({ ...item, title: languageLabel(item.section, language), detail: language === 'en' ? 'Workbench module' : language === 'ja' ? 'ワークベンチのモジュール' : '工作台模块', type: language === 'en' ? 'Module' : language === 'ja' ? 'モジュール' : '模块' })),
      ...prompts.map(item => ({ key: `prompt-${item.id}`, kind: 'prompt', section: 'prompts', title: item.title, detail: item.content, keywords: item.tags.join(' '), type: language === 'en' ? 'Prompt' : language === 'ja' ? 'プロンプト' : '提示词', icon: Sparkles })),
      ...links.map(item => ({ key: `link-${item.id}`, kind: 'link', section: 'links', title: item.title, detail: item.content || item.url, keywords: `${item.url} ${item.tags.join(' ')}`, type: language === 'en' ? 'Bookmark' : language === 'ja' ? 'ブックマーク' : '网址', icon: ExternalLink })),
      ...apiKeys.map(item => ({ key: `key-${item.id}`, kind: 'api-key', section: 'keys', title: item.name, detail: `${item.provider || (language === 'en' ? 'Provider not set' : language === 'ja' ? 'サービス未設定' : '未设置服务商')} · ${item.requestUrl || (language === 'en' ? 'Request URL not set' : language === 'ja' ? 'リクエストURL未設定' : '未设置请求地址')}`, keywords: `${item.provider || ''} ${item.requestUrl || ''}`, type: 'API Key', icon: KeyRound })),
      ...books.map(item => ({ key: `book-${item.id}`, kind: 'book', section: 'books', title: item.title, detail: item.author || item.fileName, keywords: `${item.category || ''} ${item.fileName || ''} ${item.fileType || ''}`, type: language === 'en' ? 'Book' : language === 'ja' ? '書籍' : '书籍', icon: BookOpen })),
      ...shortcuts.map(item => ({ key: `app-${item.id}`, kind: 'app', section: 'apps', title: item.name, detail: item.fileName, keywords: `${item.extension || ''} shortcut application`, type: language === 'en' ? 'App' : language === 'ja' ? 'アプリ' : '应用', icon: AppWindow }))
    ]
    const term = query.trim().toLocaleLowerCase()
    if (!term) return entries.slice(0, 12)
    return entries.filter(item => `${item.title} ${item.detail} ${item.keywords || ''} ${item.type || ''}`.toLocaleLowerCase().includes(term)).slice(0, 30)
  }, [apiKeys, books, language, links, prompts, query, shortcuts])

  return <div className="global-search-backdrop" onMouseDown={event => { if (event.target === event.currentTarget) onClose() }}>
    <section className="global-search-panel" role="dialog" aria-modal="true" aria-label={language === 'en' ? 'Global search' : language === 'ja' ? 'グローバル検索' : '全局搜索'}>
      <div className="global-search-input"><Search size={19} /><input autoFocus value={query} onChange={event => setQuery(event.target.value)} onKeyDown={event => { if (event.key === 'Enter' && results[0]) onSelect(results[0]) }} placeholder={language === 'en' ? 'Search modules, prompts, bookmarks, API keys, books or apps...' : language === 'ja' ? 'モジュール、プロンプト、ブックマーク、API Key、書籍、アプリを検索...' : '搜索模块、提示词、网址、API Key、书籍或应用...'} /><button className="icon-button" aria-label={language === 'en' ? 'Close search' : language === 'ja' ? '検索を閉じる' : '关闭搜索'} onClick={onClose}><X size={18} /></button></div>
      <div className="global-search-results">
        {results.map(item => <button className="global-search-result" key={item.key} onClick={() => onSelect(item)}><span className="global-search-result-icon"><item.icon size={17} /></span><span className="global-search-result-main"><strong>{item.title}</strong><span>{item.detail}</span></span><span className="global-search-result-type">{item.type || (language === 'en' ? 'Module' : language === 'ja' ? 'モジュール' : '模块')}</span><ArrowUpRight size={15} /></button>)}
        {results.length === 0 && <div className="global-search-empty"><Search size={22} /><strong>{language === 'en' ? 'No matching content' : language === 'ja' ? '一致する内容がありません' : '没有找到相关内容'}</strong><span>{language === 'en' ? 'Try a title, tag, URL, provider or filename' : language === 'ja' ? 'タイトル、タグ、URL、サービス名、ファイル名で検索してください' : '尝试使用标题、标签、网址、服务商或文件名搜索'}</span></div>}
      </div>
    </section>
  </div>
}

function Overview({ language = 'zh', username, prompts, links, apiKeys, onNavigate, onCopy, onStopService }) {
  const [now, setNow] = useState(() => new Date())
  const [stoppingService, setStoppingService] = useState(false)
  const [serviceMessage, setServiceMessage] = useState('')
  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000)
    return () => window.clearInterval(timer)
  }, [])
  const locale = language === 'en' ? 'en-US' : language === 'ja' ? 'ja-JP' : 'zh-CN'
  const time = now.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })
  const date = now.toLocaleDateString(locale, { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })
  const hour = now.getHours()
  const greeting = language === 'en'
    ? (hour >= 5 && hour < 12 ? 'Good morning' : hour >= 12 && hour < 18 ? 'Good afternoon' : 'Good evening')
    : language === 'ja'
      ? (hour >= 5 && hour < 12 ? 'おはようございます' : hour >= 12 && hour < 18 ? 'こんにちは' : 'こんばんは')
      : (hour >= 5 && hour < 12 ? '早上好' : hour >= 12 && hour < 18 ? '下午好' : '晚上好')
  const copy = language === 'en'
    ? { tools: 'Quick tools', toolsHint: 'Choose a tool to get started', recent: 'Recently used prompts', recentHint: 'Recently edited and used', all: 'View all', prompt: 'Prompt Library', promptDetail: 'Find and reuse prompts', links: 'Bookmarks', linksDetail: 'Open saved websites and resources', keys: 'API Keys', keysDetail: 'Manage encrypted API keys', apps: 'App Launcher', appsDetail: 'Launch apps on this computer', books: 'Book Library', booksDetail: 'Continue reading local books', pomodoro: 'Pomodoro', pomodoroDetail: 'Start a focused session', content: 'items', bookmark: 'bookmarks', keysMeta: 'keys', local: 'Local tools', stop: 'Stop service', stopping: 'Stopping service...', stopped: 'Service is stopping', stopConfirm: 'Stop the local service? The workbench will become unavailable until you start it again.' }
    : language === 'ja'
      ? { tools: 'ツールショートカット', toolsHint: 'ツールを選んで開始', recent: '最近使用したプロンプト', recentHint: '最近編集・使用した内容', all: 'すべて表示', prompt: 'プロンプト', promptDetail: 'プロンプトを検索・再利用', links: 'ブックマーク', linksDetail: '保存したサイトと資料を開く', keys: 'API Keys', keysDetail: '暗号化キーを管理', apps: 'アプリランチャー', appsDetail: 'このPCのアプリを起動', books: '本棚', booksDetail: 'ローカル書籍を読む', pomodoro: 'ポモドーロ', pomodoroDetail: '集中セッションを開始', content: '件', bookmark: '件', keysMeta: '個', local: 'ローカルツール', stop: 'サービスを停止', stopping: '停止中...', stopped: 'サービスを停止しました', stopConfirm: 'ローカルサービスを停止しますか？再度起動するまでワークベンチは利用できません。' }
      : { tools: '工具快捷入口', toolsHint: '选择一个工具，立即开始', recent: '最近使用的提示词', recentHint: '最近编辑和使用的内容', all: '查看全部', prompt: '提示词库', promptDetail: '查找和复用提示词', links: '网址收藏', linksDetail: '打开常用网站和资料', keys: 'API Keys', keysDetail: '管理加密的接口密钥', apps: '应用启动器', appsDetail: '一键打开本机应用', books: '个人书库', booksDetail: '继续阅读本地书籍', pomodoro: '番茄钟', pomodoroDetail: '开始一段专注时间', content: '条内容', bookmark: '个网址', keysMeta: '个密钥', local: '专注计时', stop: '关闭服务', stopping: '正在关闭服务...', stopped: '服务正在关闭', stopConfirm: '确定关闭本地服务吗？关闭后需要重新启动服务才能再次打开工作台。' }
  const stopService = async () => {
    if (stoppingService || !window.confirm(copy.stopConfirm)) return
    setStoppingService(true)
    setServiceMessage(copy.stopping)
    try {
      await onStopService()
      setServiceMessage(copy.stopped)
    } catch (error) {
      setStoppingService(false)
      setServiceMessage(error.message || copy.stop)
    }
  }
  const toolShortcuts = [
    { id: 'prompts', title: copy.prompt, detail: copy.promptDetail, icon: Sparkles, meta: `${prompts.length} ${copy.content}`, tone: 'accent' },
    { id: 'links', title: copy.links, detail: copy.linksDetail, icon: ArrowUpRight, meta: `${links.length} ${copy.bookmark}` },
    { id: 'keys', title: copy.keys, detail: copy.keysDetail, icon: KeyRound, meta: `${apiKeys.length} ${copy.keysMeta}` },
    { id: 'apps', title: copy.apps, detail: copy.appsDetail, icon: AppWindow, meta: copy.local },
    { id: 'books', title: copy.books, detail: copy.booksDetail, icon: BookOpen, meta: copy.local },
    { id: 'pomodoro', title: copy.pomodoro, detail: copy.pomodoroDetail, icon: Timer, meta: copy.local, tone: 'focus' }
  ]
  return <section className="page overview-page">
    <div className="overview-hero">
      <div className="overview-hero-copy"><p className="overview-greeting">{greeting}, {username || (language === 'en' ? 'there' : language === 'ja' ? 'ユーザー' : '朋友')}</p><strong className="overview-time">{time}</strong><span className="overview-date">{date}</span></div>
    </div>
    <div className="overview-tools-heading"><div><h2>{copy.tools}</h2><span>{serviceMessage || copy.toolsHint}</span></div><button className="overview-stop-service" onClick={stopService} disabled={stoppingService}><Power size={15} />{stoppingService ? copy.stopping : copy.stop}</button></div>
    <div className="overview-tools-grid">{toolShortcuts.map(tool => <button key={tool.id} className={`overview-tool-card ${tool.tone || ''}`} onClick={() => onNavigate(tool.id)}><span className="overview-tool-icon"><tool.icon size={19} /></span><span className="overview-tool-main"><strong>{tool.title}</strong><span>{tool.detail}</span></span><span className="overview-tool-meta">{tool.meta}</span><ArrowUpRight size={16} /></button>)}</div>
    <div className="section-head overview-recent-heading"><div><h2>{copy.recent}</h2><span>{copy.recentHint}</span></div><button className="text-button" onClick={() => onNavigate('prompts')}>{copy.all} <ArrowUpRight size={15} /></button></div>
    <div className="recent-list">{prompts.slice(0, 3).map(item => <div className="recent-row" key={item.id}><div className="recent-symbol"><Clipboard size={16} /></div><div className="recent-info"><strong>{item.title}</strong><span>{item.content}</span></div><div className="row-tags">{item.tags.slice(0, 2).map(tag => <span key={tag}>{tag}</span>)}</div><span className="recent-time">{item.updatedAt}</span><button className="row-copy" title="复制" onClick={() => onCopy(item)}><Copy size={16} /></button></div>)}</div>
  </section>
}

const POMODORO_OPTIONS = [15, 25, 45, 60]

function PomodoroTimer({ language = 'zh' }) {
  const [durationMinutes, setDurationMinutes] = useState(25)
  const [remainingSeconds, setRemainingSeconds] = useState(25 * 60)
  const [running, setRunning] = useState(false)
  const [completed, setCompleted] = useState(false)
  const [customValue, setCustomValue] = useState('')
  const [customUnit, setCustomUnit] = useState('minutes')
  const [customError, setCustomError] = useState('')
  const endTimeRef = useRef(0)
  const copy = language === 'en' ? { title: 'Pomodoro', desc: 'Use a focused session to finish the most important task.', ready: 'Ready to start', running: 'Focusing now', done: 'Session complete', good: 'Well done', focus: 'Focus time', start: 'Start focus', pause: 'Pause', again: 'Start again', reset: 'Reset', choose: 'Choose session length', chooseHint: 'Pick a duration that fits the task before starting.', minutes: 'minutes', custom: 'Custom duration', input: 'Enter time', apply: 'Apply', note: 'The timer keeps running while you switch tools.', invalid: 'Enter a whole number of at least 1.', limit: 'A session cannot exceed 24 hours.', increase: 'Increase custom duration', decrease: 'Decrease custom duration', remaining: (minutes, seconds) => `${minutes} minutes ${seconds} seconds remaining` } : language === 'ja' ? { title: 'ポモドーロ', desc: '集中時間を使って、重要なタスクを終わらせます。', ready: '開始準備完了', running: '集中しています', done: 'セッション完了', good: 'お疲れさまでした', focus: '集中時間', start: '集中開始', pause: '一時停止', again: 'もう一度', reset: 'リセット', choose: '時間を選択', chooseHint: '開始前にタスクに合う時間を選びます。', minutes: '分', custom: 'カスタム時間', input: '時間を入力', apply: '適用', note: 'ツールを切り替えてもタイマーは継続します。', invalid: '1以上の整数を入力してください。', limit: '1回の計時は24時間を超えられません。', increase: 'カスタム時間を増やす', decrease: 'カスタム時間を減らす', remaining: (minutes, seconds) => `残り ${minutes} 分 ${seconds} 秒` } : { title: '番茄钟', desc: '用一段专注时间，完成眼前最重要的事。', ready: '准备开始', running: '正在专注', done: '本轮专注完成', good: '做得很好', focus: '专注时间', start: '开始专注', pause: '暂停', again: '再来一轮', reset: '重置', choose: '选择计时时间', chooseHint: '开始前选择一段适合当前任务的专注时长。', minutes: '分钟', custom: '自定义时长', input: '输入时间', apply: '应用', note: '计时器会在当前页面保持运行，切换工具不会丢失本轮状态。', invalid: '请输入大于等于 1 的整数', limit: '单次计时不能超过 24 小时', increase: '增加自定义时长', decrease: '减少自定义时长', remaining: (minutes, seconds) => `剩余 ${minutes} 分 ${seconds} 秒` }

  useEffect(() => {
    if (!running) return undefined
    const tick = () => {
      const next = Math.max(0, Math.ceil((endTimeRef.current - Date.now()) / 1000))
      setRemainingSeconds(next)
      if (next === 0) {
        setRunning(false)
        setCompleted(true)
      }
    }
    tick()
    const interval = window.setInterval(tick, 250)
    return () => window.clearInterval(interval)
  }, [running])

  const chooseDuration = minutes => {
    if (running) return
    setDurationMinutes(minutes)
    setRemainingSeconds(minutes * 60)
    setCompleted(false)
    setCustomError('')
  }

  const applyCustomDuration = event => {
    event.preventDefault()
    if (running) return
    const value = Number(customValue)
    if (!Number.isInteger(value) || value < 1) return setCustomError(copy.invalid)
    const minutes = customUnit === 'hours' ? value * 60 : value
    if (minutes > 24 * 60) return setCustomError(copy.limit)
    const normalizedMinutes = Math.max(1, Math.round(minutes))
    setDurationMinutes(normalizedMinutes)
    setRemainingSeconds(normalizedMinutes * 60)
    setCompleted(false)
    setCustomError('')
  }

  const adjustCustomValue = direction => {
    if (running) return
    const current = Number(customValue)
    const base = Number.isFinite(current) && current >= 1 ? current : 1
    const step = customUnit === 'hours' ? 1 : 10
    const max = customUnit === 'hours' ? 24 : 1440
    const next = Math.min(max, Math.max(1, Math.round(base) + direction * step))
    setCustomValue(String(next))
    setCustomError('')
  }

  const toggleTimer = () => {
    if (remainingSeconds <= 0) {
      setRemainingSeconds(durationMinutes * 60)
      setCompleted(false)
      endTimeRef.current = Date.now() + durationMinutes * 60 * 1000
      setRunning(true)
      return
    }
    if (running) {
      setRemainingSeconds(Math.max(0, Math.ceil((endTimeRef.current - Date.now()) / 1000)))
      setRunning(false)
      return
    }
    endTimeRef.current = Date.now() + remainingSeconds * 1000
    setCompleted(false)
    setRunning(true)
  }

  const resetTimer = () => {
    setRunning(false)
    setCompleted(false)
    setRemainingSeconds(durationMinutes * 60)
    endTimeRef.current = 0
  }

  const minutes = String(Math.floor(remainingSeconds / 60)).padStart(2, '0')
  const seconds = String(remainingSeconds % 60).padStart(2, '0')
  const totalSeconds = durationMinutes * 60
  const progress = totalSeconds ? (totalSeconds - remainingSeconds) / totalSeconds : 0
  const circumference = 2 * Math.PI * 108
  const dashOffset = circumference * (1 - progress)

  return <section className="page pomodoro-page">
    <div className="page-heading library-heading">
      <div><p className="eyebrow">FOCUS TOOL</p><h1>{copy.title}</h1><p className="subheading">{copy.desc}</p></div>
    </div>
    <div className="pomodoro-layout">
      <div className="pomodoro-panel">
        <div className="pomodoro-status"><span className={`pomodoro-status-dot ${running ? 'is-running' : ''}`} />{completed ? copy.done : running ? copy.running : copy.ready}</div>
        <div className="pomodoro-dial" aria-label={copy.remaining(minutes, seconds)}>
          <svg viewBox="0 0 240 240" aria-hidden="true">
            <circle className="pomodoro-track" cx="120" cy="120" r="108" />
            <circle className="pomodoro-progress" cx="120" cy="120" r="108" style={{ strokeDasharray: circumference, strokeDashoffset: dashOffset }} />
          </svg>
          <div className="pomodoro-time"><strong>{minutes}:{seconds}</strong><span>{completed ? copy.good : copy.focus}</span></div>
        </div>
        <div className="pomodoro-actions">
          <button className="primary-button pomodoro-start" onClick={toggleTimer}>{running ? <><Pause size={17} />{copy.pause}</> : <><Play size={17} />{remainingSeconds === 0 ? copy.again : copy.start}</>}</button>
          <button className="secondary-button pomodoro-reset" onClick={resetTimer} title={copy.reset}><RotateCcw size={16} />{copy.reset}</button>
        </div>
      </div>
      <div className="pomodoro-settings">
        <div className="pomodoro-section-heading"><span className="pomodoro-kicker">SESSION LENGTH</span><h2>{copy.choose}</h2><p>{copy.chooseHint}</p></div>
        <div className="pomodoro-options" role="group" aria-label={copy.choose}>{POMODORO_OPTIONS.map(option => <button key={option} className={durationMinutes === option ? 'selected' : ''} onClick={() => chooseDuration(option)} disabled={running} aria-pressed={durationMinutes === option}><strong>{option}</strong><span>{copy.minutes}</span></button>)}</div>
        <form className="pomodoro-custom" onSubmit={applyCustomDuration}>
          <label htmlFor="pomodoro-custom-value">{copy.custom}</label>
          <div className="pomodoro-custom-controls">
            <div className="pomodoro-number-control">
              <input id="pomodoro-custom-value" type="number" min="1" max={customUnit === 'hours' ? '24' : '1440'} step="1" value={customValue} onChange={event => { setCustomValue(event.target.value); setCustomError('') }} placeholder={copy.input} disabled={running} />
              <div className="pomodoro-number-stepper"><button type="button" aria-label={copy.increase} onClick={() => adjustCustomValue(1)} disabled={running}><ChevronUp size={14} /></button><button type="button" aria-label={copy.decrease} onClick={() => adjustCustomValue(-1)} disabled={running}><ChevronDown size={14} /></button></div>
            </div>
            <select value={customUnit} onChange={event => { setCustomUnit(event.target.value); setCustomError('') }} disabled={running} aria-label={copy.custom}><option value="minutes">{language === 'en' ? 'Minutes' : language === 'ja' ? '分' : '分钟'}</option><option value="hours">{language === 'en' ? 'Hours' : language === 'ja' ? '時間' : '小时'}</option></select>
            <button className="secondary-button" type="submit" disabled={running || !customValue.trim()}>{copy.apply}</button>
          </div>
          {customError && <span className="pomodoro-custom-error">{customError}</span>}
        </form>
        <div className="pomodoro-note"><Timer size={17} /><span>{copy.note}</span></div>
      </div>
    </div>
  </section>
}

function PromptLibrary({ language = 'zh', prompts, allPrompts, filteredCount, page, pageCount, setPage, tags, query, setQuery, selectedTag, setSelectedTag, onCreate, onEdit, onDelete, onCopy }) {
  const copy = language === 'en' ? { title: 'Prompt Library', desc: 'Capture your thinking and improve every prompt.', create: 'New prompt', search: 'Search title, content or tags...', all: 'All prompts', sorted: 'Sorted by recent edits', filtered: count => `${count} results`, empty: 'No matching prompts', emptyHint: 'Try another keyword or tag' } : language === 'ja' ? { title: 'プロンプト', desc: '考え方を蓄積し、質問の質を高めます。', create: '新規プロンプト', search: 'タイトル、内容、タグを検索...', all: 'すべてのプロンプト', sorted: '最近の編集順', filtered: count => `${count} 件`, empty: '一致するプロンプトがありません', emptyHint: '別のキーワードやタグを試してください' } : { title: '提示词库', desc: '沉淀你的思考方式，让每一次提问都更有质量。', create: '新建提示词', search: '搜索标题、内容或标签...', all: '全部提示词', sorted: '按最近编辑排序', filtered: count => `筛选出 ${count} 条结果`, empty: '没有找到匹配的提示词', emptyHint: '试试其他关键词或标签' }
  return <section className="page prompts-page"><div className="page-heading library-heading"><div><p className="eyebrow">RESOURCE CENTER</p><h1>{copy.title}</h1><p className="subheading">{copy.desc}</p></div><button className="primary-button" onClick={onCreate}><Plus size={17} />{copy.create}</button></div><div className="library-toolbar"><div className="search-box"><Search size={17} /><input value={query} onChange={e => setQuery(e.target.value)} placeholder={copy.search} /><kbd>⌘ K</kbd></div><div className="tag-filter">{tags.slice(0, 5).map(tag => <button key={tag} className={selectedTag === tag ? 'selected' : ''} onClick={() => setSelectedTag(tag)}>{tag === '全部' ? (language === 'en' ? 'All' : language === 'ja' ? 'すべて' : tag) : tag}</button>)}{tags.length > 5 && <button className="tag-more"><MoreHorizontal size={16} /></button>}</div></div><div className="library-meta"><span>{copy.all} <strong>{allPrompts.length}</strong></span><span className="meta-divider" /><span>{filteredCount === allPrompts.length ? copy.sorted : copy.filtered(filteredCount)}</span></div><div className="prompt-grid">{prompts.map(item => <PromptCard key={item.id} language={language} item={item} onEdit={onEdit} onDelete={onDelete} onCopy={onCopy} />)}{prompts.length === 0 && <div className="empty-state"><Search size={24} /><strong>{copy.empty}</strong><span>{copy.emptyHint}</span></div>}</div>{pageCount > 1 && <ResourcePagination language={language} page={page} pageCount={pageCount} setPage={setPage} />}</section>
}

function WorkspaceSwitcher({ language = 'zh', workspace, workspaces, onSwitch, onCreate }) {
  const [open, setOpen] = useState(false)
  const copy = language === 'en' ? { local: 'Local workspace', switch: 'Switch workspace', create: 'Create workspace' } : language === 'ja' ? { local: 'ローカルワークスペース', switch: 'ワークスペースを切り替え', create: 'ワークスペースを作成' } : { local: '本地工作区', switch: '切换工作区', create: '新建工作区' }
  return <div className="workspace-switch-wrap"><button className="workspace-switch" onClick={() => setOpen(value => !value)} aria-expanded={open}><div className="workspace-avatar">{workspace.avatar || 'W'}</div><div><strong>{workspace.name}</strong><span>{workspace.description || copy.local}</span></div><ChevronDown size={15} /></button>{open && <div className="workspace-menu"><div className="workspace-menu-label">{copy.switch}</div>{workspaces.map(item => <button key={item.id} className={item.id === workspace.id ? 'active' : ''} onClick={() => { setOpen(false); if (item.id !== workspace.id) onSwitch(item.id) }}><span className="workspace-menu-avatar">{item.avatar || item.name.slice(0, 1)}</span><span>{item.name}</span>{item.id === workspace.id && <Check size={14} />}</button>)}<button className="workspace-create" onClick={() => { setOpen(false); onCreate() }}><Plus size={15} />{copy.create}</button></div>}</div>
}

function SecurityGate({ language = 'zh', mode, workspace, onSetup, onUnlock, workspaces, switchingWorkspace, onImportConfig, onSelectWorkspace }) {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const submit = async event => { event.preventDefault(); setError(''); if (mode === 'setup' && !name.trim()) return setError(language === 'en' ? 'Enter a workspace name' : language === 'ja' ? 'ワークスペース名を入力してください' : '请填写工作区名称'); if (password.length < 8) return setError(language === 'en' ? 'Password must be at least 8 characters' : language === 'ja' ? 'パスワードは8文字以上必要です' : '密码至少需要 8 位字符'); if (mode === 'setup' && password !== confirm) return setError(language === 'en' ? 'Passwords do not match' : language === 'ja' ? 'パスワードが一致しません' : '两次输入的密码不一致'); const result = mode === 'setup' ? await onSetup(name, password) : await onUnlock(password); if (typeof result === 'string') return setError(result); if (mode === 'unlock' && !result) setError(switchingWorkspace ? (language === 'en' ? 'Incorrect password' : language === 'ja' ? 'パスワードが違います' : '密码错误，请重试') : (language === 'en' ? 'Password does not match any workspace' : language === 'ja' ? 'パスワードが一致するワークスペースがありません' : '密码不属于任何工作区，请重试')) }
  const copy = language === 'en' ? { setup: 'Create workspace', unlock: name => `Unlock ${name}`, setupHint: 'Each workspace has its own password and data.', unlockHint: 'Enter the workspace password to continue.', name: 'Workspace name', namePlaceholder: 'e.g. Personal', password: 'Password', passwordPlaceholder: 'At least 8 characters', confirm: 'Confirm password', create: 'Create workspace', submit: 'Unlock workspace', import: 'Import existing config', switch: 'Switch workspace', local: 'Data is stored on this device only' } : language === 'ja' ? { setup: 'ワークスペースを作成', unlock: name => `${name}をロック解除`, setupHint: 'ワークスペースごとにパスワードとデータを管理します。', unlockHint: 'パスワードを入力して続行します。', name: 'ワークスペース名', namePlaceholder: '例：個人用', password: 'パスワード', passwordPlaceholder: '8文字以上', confirm: 'パスワードを確認', create: '作成', submit: 'ロック解除', import: '既存の設定をインポート', switch: 'ワークスペースを切り替え', local: 'データはこのデバイスにのみ保存されます' } : { setup: '创建工作区', unlock: name => `解锁${name}`, setupHint: '每个工作区都有独立密码和独立数据。', unlockHint: '输入该工作区密码后继续。', name: '工作区名称', namePlaceholder: '例如：个人空间', password: '密码', passwordPlaceholder: '至少 8 位字符', confirm: '确认密码', create: '创建工作区', submit: '解锁工作区', import: '导入已有配置', switch: '切换其他工作区', local: '数据仅存储在当前设备' }
  return <div className="security-screen"><div className="security-panel"><div className="security-mark"><LockKeyhole size={25} /></div><p className="eyebrow">PERSONAL WORKSPACE</p><h1>{mode === 'setup' ? copy.setup : copy.unlock(workspace.name)}</h1><p className="security-copy">{mode === 'setup' ? copy.setupHint : copy.unlockHint}</p><form onSubmit={submit}>{mode === 'setup' && <label className="security-label">{copy.name}<input value={name} onChange={event => setName(event.target.value)} autoFocus placeholder={copy.namePlaceholder} /></label>}<label className="security-label">{copy.password}<input type="password" value={password} onChange={event => setPassword(event.target.value)} autoFocus={mode !== 'setup'} placeholder={copy.passwordPlaceholder} /></label>{mode === 'setup' && <label className="security-label">{copy.confirm}<input type="password" value={confirm} onChange={event => setConfirm(event.target.value)} placeholder={copy.passwordPlaceholder} /></label>}{error && <div className="security-error">{error}</div>}<button className="primary-button security-submit" type="submit">{mode === 'setup' ? <><ShieldCheck size={17} />{copy.create}</> : <><UnlockKeyhole size={17} />{copy.submit}</>}</button></form>{mode === 'setup' && <label className="security-import-link">{copy.import}<input type="file" accept="application/json,.json" onChange={event => { const file = event.target.files?.[0]; event.target.value = ''; onImportConfig(file) }} /></label>}{workspaces.length > 1 && <div className="security-workspaces"><span>{copy.switch}</span>{workspaces.map(item => <button key={item.id} onClick={() => onSelectWorkspace(item.id)}>{item.name}</button>)}</div>}<div className="security-foot"><ShieldCheck size={14} />{copy.local}</div></div></div>
}

const BOOK_TYPES = ['全部', '.pdf', '.epub', '.txt', '.md', '.html']
const formatFileSize = size => size < 1024 * 1024 ? `${Math.max(1, Math.round(size / 1024))} KB` : `${(size / 1024 / 1024).toFixed(1)} MB`

function BookLibrary({ language = 'zh', books, allBooks, filteredCount, page, pageCount, setPage, query, setQuery, type, setType, importing, onImport, onEdit, onDelete, onRead }) {
  const copy = language === 'en' ? { title: 'Book Library', desc: 'Import local books and read them inside the workbench.', import: 'Import book', importing: 'Importing...', search: 'Search title, author or filename...', all: 'All', local: 'Local books', sorted: 'Sorted by import time', filtered: count => `${count} books`, empty: 'No books imported yet', emptyHint: 'Click “Import book” to choose a local file' } : language === 'ja' ? { title: '本棚', desc: 'ローカル書籍を取り込み、ワークベンチで読めます。', import: '書籍を追加', importing: '取り込み中...', search: '書名、著者、ファイル名を検索...', all: 'すべて', local: 'ローカル書籍', sorted: '取り込み順', filtered: count => `${count} 冊`, empty: '書籍はまだありません', emptyHint: '「書籍を追加」からファイルを選択してください' } : { title: '个人书库', desc: '导入本地书籍，在工作台里直接阅读。', import: '导入书籍', importing: '正在导入...', search: '搜索书名、作者或文件名...', all: '全部', local: '本地书籍', sorted: '按导入时间排序', filtered: count => `筛选出 ${count} 本`, empty: '还没有导入书籍', emptyHint: '点击右上角“导入书籍”选择本机文件' }
  return <section className="page resource-page book-library-page">
    <div className="page-heading library-heading"><div><p className="eyebrow">PERSONAL LIBRARY</p><h1>{copy.title}</h1><p className="subheading">{copy.desc}</p></div><label className={`primary-button book-import-button ${importing ? 'is-loading' : ''}`}><Upload size={17} />{importing ? copy.importing : copy.import}<input type="file" accept={BOOK_FILE_TYPES.join(',')} onChange={onImport} disabled={importing} /></label></div>
    <div className="library-toolbar book-toolbar"><div className="search-box"><Search size={17} /><input value={query} onChange={event => setQuery(event.target.value)} placeholder={copy.search} /></div><div className="tag-filter">{BOOK_TYPES.map(option => <button key={option} className={type === option ? 'selected' : ''} onClick={() => setType(option)}>{option === '全部' ? copy.all : option.replace('.', '').toUpperCase()}</button>)}</div></div>
    <div className="library-meta"><span>{copy.local} <strong>{allBooks.length}</strong></span><span className="meta-divider" /><span>{filteredCount === allBooks.length ? copy.sorted : copy.filtered(filteredCount)}</span></div>
    <div className="book-grid">{books.map(book => <BookCard key={book.id} language={language} book={book} onEdit={onEdit} onDelete={onDelete} onRead={onRead} />)}{books.length === 0 && <div className="empty-state"><BookOpen size={24} /><strong>{allBooks.length ? (language === 'en' ? 'No matching books' : language === 'ja' ? '一致する書籍がありません' : '没有找到匹配的书籍') : copy.empty}</strong><span>{allBooks.length ? (language === 'en' ? 'Try another keyword or file type' : language === 'ja' ? '別のキーワードや形式を試してください' : '试试其他关键词或文件类型') : copy.emptyHint}</span></div>}</div>
    {pageCount > 1 && <ResourcePagination language={language} page={page} pageCount={pageCount} setPage={setPage} />}
  </section>
}

function BookCard({ language = 'zh', book, onEdit, onDelete, onRead }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const run = action => { setMenuOpen(false); action() }
  const copy = language === 'en' ? { more: 'More actions', edit: 'Edit', remove: 'Delete', author: 'Author not set', imported: 'Imported', read: 'Read' } : language === 'ja' ? { more: 'その他の操作', edit: '編集', remove: '削除', author: '著者未設定', imported: '追加', read: '読む' } : { more: '更多操作', edit: '编辑', remove: '删除', author: '未填写作者', imported: '导入于', read: '阅读' }
  return <article className="book-card"><div className="book-card-top"><div className="book-cover"><BookOpen size={20} /></div><div className="book-card-top-actions"><span className="book-file-type">{book.fileType.replace('.', '').toUpperCase()}</span><div className="card-menu"><button className="more-button" title={copy.more} aria-label={`${copy.more} ${book.title}`} aria-expanded={menuOpen} onClick={() => setMenuOpen(open => !open)}><MoreHorizontal size={18} /></button>{menuOpen && <div className="card-menu-popover" role="menu"><button role="menuitem" onClick={() => run(() => onEdit(book))}><Pencil size={15} />{copy.edit}</button><button role="menuitem" className="delete-action" onClick={() => run(() => onDelete(book))}><Trash2 size={15} />{copy.remove}</button></div>}</div></div></div><h3>{book.title}</h3><p className="book-author">{book.author || copy.author}</p>{book.category && <span className="book-category">{book.category}</span>}<p className="book-file-name">{book.fileName} · {formatFileSize(book.size || 0)}</p><div className="book-card-footer"><span>{copy.imported} {book.updatedAt}</span><div className="book-actions"><button className="book-read-button" onClick={() => onRead(book)} title={copy.read}><BookOpen size={15} />{copy.read}</button></div></div></article>
}

function LinksLibrary({ language = 'zh', links, onCreate, onEdit, onDelete }) { const [page, setPage] = useState(1); const pageSize = useAdaptivePageSize('resource'); const pageCount = Math.max(1, Math.ceil(links.length / pageSize)); useEffect(() => { if (page > pageCount) setPage(pageCount) }, [page, pageCount]); const visibleLinks = links.slice((page - 1) * pageSize, page * pageSize); const copy = language === 'en' ? { title: 'Bookmarks', desc: 'Keep useful websites organized and ready to open.', create: 'New bookmark', count: 'bookmarks', open: 'Open bookmark', edit: 'Edit', remove: 'Delete', empty: 'No bookmarks yet', hint: 'Add your first useful website' } : language === 'ja' ? { title: 'ブックマーク', desc: 'よく使うサイトを整理して、いつでも開けます。', create: '新規ブックマーク', count: '件', open: '開く', edit: '編集', remove: '削除', empty: 'ブックマークはありません', hint: '最初のサイトを追加してください' } : { title: '网址收藏', desc: '把常用网站整理好，随时打开。', create: '新建网址', count: '个网址', open: '打开网址', edit: '编辑', remove: '删除', empty: '还没有网址收藏', hint: '添加你的第一个常用网址' }; return <section className="page resource-page"><div className="page-heading library-heading"><div><p className="eyebrow">RESOURCE CENTER</p><h1>{copy.title}</h1><p className="subheading">{copy.desc}</p></div><button className="primary-button" onClick={onCreate}><Plus size={17} />{copy.create}</button></div><div className="resource-meta">{language === 'en' ? `${links.length} ${copy.count}` : `共 ${links.length} ${copy.count}`}</div><div className="resource-list">{visibleLinks.map(link => <article className="resource-row" key={link.id}><div className="resource-favicon"><ExternalLink size={17} /></div><div className="resource-main"><strong>{link.title}</strong><span>{link.content || link.url}</span><small>{link.url}</small></div><div className="row-tags">{link.tags.map(tag => <span key={tag}>{tag}</span>)}</div><div className="resource-actions"><a href={link.url} target="_blank" rel="noreferrer" title={copy.open}><ExternalLink size={16} /></a><button onClick={() => onEdit(link)} title={copy.edit}><Pencil size={16} /></button><button onClick={() => onDelete(link.id)} title={copy.remove}><Trash2 size={16} /></button></div></article>)}{links.length === 0 && <div className="empty-state"><ExternalLink size={24} /><strong>{copy.empty}</strong><span>{copy.hint}</span></div>}</div>{pageCount > 1 && <ResourcePagination language={language} page={page} pageCount={pageCount} setPage={setPage} />}</section> }

function ApiKeyLibrary({ language = 'zh', apiKeys, encryptionKey, onCreate, onEdit, onDelete }) { const [visible, setVisible] = useState({}); const [values, setValues] = useState({}); const [page, setPage] = useState(1); const pageSize = useAdaptivePageSize('resource'); const pageCount = Math.max(1, Math.ceil(apiKeys.length / pageSize)); useEffect(() => { if (page > pageCount) setPage(pageCount) }, [page, pageCount]); const reveal = async record => { if (values[record.id]) return setVisible(prev => ({ ...prev, [record.id]: !prev[record.id] })); try { const value = await decryptApiValue(encryptionKey, record.encrypted); setValues(prev => ({ ...prev, [record.id]: value })); setVisible(prev => ({ ...prev, [record.id]: true })) } catch { /* corrupted records stay masked */ } }; const visibleKeys = apiKeys.slice((page - 1) * pageSize, page * pageSize); const copy = language === 'en' ? { desc: 'Encrypted locally with AES-256-GCM.', add: 'Add API key', notice: 'Key values are never written to browser storage in plaintext.', count: 'API keys', provider: 'Provider not set', url: 'Request URL not set', hide: 'Hide', show: 'Show', edit: 'Edit', remove: 'Delete', empty: 'No API keys yet', hint: 'Keys are encrypted with AES-256-GCM' } : language === 'ja' ? { desc: 'AES-256-GCMでローカル暗号化して保存します。', add: 'API Keyを追加', notice: 'キーの値は平文でブラウザストレージに保存されません。', count: '個のAPI Key', provider: 'サービス未設定', url: 'リクエストURL未設定', hide: '非表示', show: '表示', edit: '編集', remove: '削除', empty: 'API Keyはありません', hint: 'AES-256-GCMで暗号化して保存します' } : { desc: '使用 AES-256-GCM 加密保存在本机。', add: '添加 API Key', notice: '密钥内容不会明文写入浏览器存储，只有解锁后才会在内存中解密。', count: '个 API Key', provider: '未设置服务商', url: '未设置请求地址', hide: '隐藏', show: '显示', edit: '编辑', remove: '删除', empty: '还没有 API Keys', hint: '添加后会使用 AES-256-GCM 加密' }; return <section className="page resource-page"><div className="page-heading library-heading"><div><p className="eyebrow">RESOURCE CENTER</p><h1>API Keys</h1><p className="subheading">{copy.desc}</p></div><button className="primary-button" onClick={onCreate}><Plus size={17} />{copy.add}</button></div><div className="key-notice"><ShieldCheck size={17} /><span>{copy.notice}</span></div><div className="resource-meta">{language === 'en' ? `${apiKeys.length} ${copy.count}` : `${apiKeys.length} ${copy.count}`}</div><div className="resource-list">{visibleKeys.map(record => <article className="resource-row key-row" key={record.id}><div className="resource-favicon key-favicon"><KeyRound size={17} /></div><div className="resource-main"><strong>{record.name}</strong><span>{record.provider || copy.provider} · {record.requestUrl || copy.url}</span><div className="masked-key">{visible[record.id] ? values[record.id] : '••••••••••••••••••••'}</div></div><div className="resource-actions"><button onClick={() => reveal(record)} title={visible[record.id] ? copy.hide : copy.show}>{visible[record.id] ? <EyeOff size={16} /> : <Eye size={16} />}</button><button onClick={() => onEdit(record)} title={copy.edit}><Pencil size={16} /></button><button onClick={() => onDelete(record.id)} title={copy.remove}><Trash2 size={16} /></button></div></article>)}{apiKeys.length === 0 && <div className="empty-state"><KeyRound size={24} /><strong>{copy.empty}</strong><span>{copy.hint}</span></div>}</div>{pageCount > 1 && <ResourcePagination language={language} page={page} pageCount={pageCount} setPage={setPage} />}</section> }

function ResourcePagination({ language = 'zh', page, pageCount, setPage }) { const visibleCount = Math.min(5, pageCount); const start = Math.min(Math.max(1, page - Math.floor(visibleCount / 2)), pageCount - visibleCount + 1); const numbers = Array.from({ length: visibleCount }, (_, index) => start + index); const copy = language === 'en' ? { label: 'Pagination', previous: 'Previous', next: 'Next', page: number => `Page ${number}` } : language === 'ja' ? { label: 'ページ送り', previous: '前へ', next: '次へ', page: number => `${number}ページ` } : { label: '分页', previous: '上一页', next: '下一页', page: number => `第 ${number} 页` }; return <div className="pagination resource-pagination" aria-label={copy.label}><button className="page-arrow" disabled={page === 1} onClick={() => setPage(page - 1)}>{copy.previous}</button><div className="page-numbers">{numbers.map(number => <button key={number} className={page === number ? 'active' : ''} onClick={() => setPage(number)} aria-label={copy.page(number)}>{number}</button>)}</div><button className="page-arrow" disabled={page === pageCount} onClick={() => setPage(page + 1)}>{copy.next}</button></div> }

function PromptCard({ language = 'zh', item, onEdit, onDelete, onCopy }) { const [menuOpen, setMenuOpen] = useState(false); const run = action => { setMenuOpen(false); action() }; const copy = language === 'en' ? ['Prompt', 'More actions', 'Copy', 'Edit', 'Delete'] : language === 'ja' ? ['プロンプト', 'その他の操作', 'コピー', '編集', '削除'] : ['提示词', '更多操作', '复制', '编辑', '删除']; return <article className="prompt-card"><div className="prompt-card-top"><div className="prompt-type"><Sparkles size={15} />{copy[0]}</div><div className="card-menu"><button className="more-button" title={copy[1]} aria-label={`${copy[1]} ${item.title}`} aria-expanded={menuOpen} onClick={() => setMenuOpen(open => !open)}><MoreHorizontal size={18} /></button>{menuOpen && <div className="card-menu-popover" role="menu"><button role="menuitem" onClick={() => run(() => onCopy(item))}><Copy size={15} />{copy[2]}</button><button role="menuitem" onClick={() => run(() => onEdit(item))}><Pencil size={15} />{copy[3]}</button><button role="menuitem" className="delete-action" onClick={() => run(() => onDelete(item.id))}><Trash2 size={15} />{copy[4]}</button></div>}</div></div><h3>{item.title}</h3><p>{item.content}</p><div className="prompt-card-footer"><div className="card-tags">{item.tags.map(tag => <span key={tag}>{tag}</span>)}</div><span className="card-date">{item.updatedAt}</span></div></article> }

function PromptModal({ language = 'zh', modal, onClose, onSave }) { const [item, setItem] = useState(modal.item); const [tagInput, setTagInput] = useState(''); const set = (key, value) => setItem(prev => ({ ...prev, [key]: value })); const addTag = e => { if ((e.key === 'Enter' || e.key === ',') && tagInput.trim()) { e.preventDefault(); if (!item.tags.includes(tagInput.trim())) set('tags', [...item.tags, tagInput.trim()]); setTagInput('') } }; const copy = language === 'en' ? { create: 'New prompt', edit: 'Edit prompt', title: 'Title', titleHint: 'e.g. Product requirement breakdown', content: 'Content', contentHint: 'Enter prompt content...', tags: 'Tags', addTag: 'Press Enter to add', tagHint: 'Add a tag', cancel: 'Cancel', save: 'Save prompt' } : language === 'ja' ? { create: '新規プロンプト', edit: 'プロンプトを編集', title: 'タイトル', titleHint: '例：要件の分解', content: '内容', contentHint: 'プロンプトの内容を入力...', tags: 'タグ', addTag: 'Enterで追加', tagHint: 'タグを追加', cancel: 'キャンセル', save: '保存' } : { create: '新建提示词', edit: '编辑提示词', title: '标题', titleHint: '例如：产品需求拆解', content: '内容', contentHint: '输入提示词内容...', tags: '标签', addTag: '用 Enter 添加', tagHint: '添加标签', cancel: '取消', save: '保存提示词' }; return <div className="modal-backdrop"><div className="modal"><div className="modal-header"><div><span className="modal-kicker">{modal.mode === 'create' ? 'NEW RESOURCE' : 'EDIT RESOURCE'}</span><h2>{modal.mode === 'create' ? copy.create : copy.edit}</h2></div><button className="icon-button" aria-label={copy.cancel} onClick={onClose}><X size={19} /></button></div><div className="form-field"><label>{copy.title}</label><input autoFocus value={item.title} onChange={e => set('title', e.target.value)} placeholder={copy.titleHint} /></div><div className="form-field"><label>{copy.content}</label><textarea value={item.content} onChange={e => set('content', e.target.value)} placeholder={copy.contentHint} rows="6" /></div><div className="form-field"><label>{copy.tags} <span>{copy.addTag}</span></label><div className="tag-input">{item.tags.map(tag => <span key={tag}>{tag}<button onClick={() => set('tags', item.tags.filter(t => t !== tag))}><X size={12} /></button></span>)}<input value={tagInput} onChange={e => setTagInput(e.target.value)} onKeyDown={addTag} placeholder={item.tags.length ? '' : copy.tagHint} /></div></div><div className="modal-footer"><button className="secondary-button" onClick={onClose}>{copy.cancel}</button><button className="primary-button" onClick={() => onSave(item)}><Check size={16} />{copy.save}</button></div></div></div> }

function LinkModal({ language = 'zh', modal, onClose, onSave }) { const [item, setItem] = useState(modal.item); const [tagInput, setTagInput] = useState(''); const set = (key, value) => setItem(prev => ({ ...prev, [key]: value })); const addTag = event => { if ((event.key === 'Enter' || event.key === ',') && tagInput.trim()) { event.preventDefault(); if (!item.tags.includes(tagInput.trim())) set('tags', [...item.tags, tagInput.trim()]); setTagInput('') } }; const copy = language === 'en' ? { create: 'New bookmark', edit: 'Edit bookmark', title: 'Title', url: 'URL', note: 'Note', noteHint: 'Briefly describe this bookmark', tags: 'Tags', addTag: 'Press Enter to add', tagHint: 'Add a tag', cancel: 'Cancel', save: 'Save bookmark' } : language === 'ja' ? { create: '新規ブックマーク', edit: 'ブックマークを編集', title: 'タイトル', url: 'URL', note: 'メモ', noteHint: 'このブックマークの説明', tags: 'タグ', addTag: 'Enterで追加', tagHint: 'タグを追加', cancel: 'キャンセル', save: '保存' } : { create: '新建网址', edit: '编辑网址', title: '标题', url: '网址', note: '备注', noteHint: '简短描述这个网址', tags: '标签', addTag: '用 Enter 添加', tagHint: '添加标签', cancel: '取消', save: '保存网址' }; return <div className="modal-backdrop"><div className="modal"><div className="modal-header"><div><span className="modal-kicker">{modal.mode === 'link-create' ? 'NEW BOOKMARK' : 'EDIT BOOKMARK'}</span><h2>{modal.mode === 'link-create' ? copy.create : copy.edit}</h2></div><button className="icon-button" aria-label={copy.cancel} onClick={onClose}><X size={19} /></button></div><div className="form-field"><label>{copy.title}</label><input autoFocus value={item.title} onChange={event => set('title', event.target.value)} placeholder="OpenAI Platform" /></div><div className="form-field"><label>{copy.url}</label><input value={item.url} onChange={event => set('url', event.target.value)} placeholder="https://" /></div><div className="form-field"><label>{copy.note}</label><input value={item.content} onChange={event => set('content', event.target.value)} placeholder={copy.noteHint} /></div><div className="form-field"><label>{copy.tags} <span>{copy.addTag}</span></label><div className="tag-input">{item.tags.map(tag => <span key={tag}>{tag}<button onClick={() => set('tags', item.tags.filter(t => t !== tag))}><X size={12} /></button></span>)}<input value={tagInput} onChange={event => setTagInput(event.target.value)} onKeyDown={addTag} placeholder={item.tags.length ? '' : copy.tagHint} /></div></div><div className="modal-footer"><button className="secondary-button" onClick={onClose}>{copy.cancel}</button><button className="primary-button" onClick={() => onSave(item)}><Check size={16} />{copy.save}</button></div></div></div> }

function BookModal({ language = 'zh', modal, onClose, onSave }) {
  const [item, setItem] = useState(modal.item)
  const set = (key, value) => setItem(prev => ({ ...prev, [key]: value }))
  const copy = language === 'en' ? { title: 'Edit book information', name: 'Title', author: 'Author', authorHint: 'Author (optional)', category: 'Category', categoryHint: 'Category (optional)', cancel: 'Cancel', save: 'Save information' } : language === 'ja' ? { title: '書籍情報を編集', name: '書名', author: '著者', authorHint: '著者（任意）', category: 'カテゴリ', categoryHint: 'カテゴリ（任意）', cancel: 'キャンセル', save: '情報を保存' } : { title: '编辑书籍信息', name: '书名', author: '作者', authorHint: '作者（可选）', category: '分类', categoryHint: '分类（可选）', cancel: '取消', save: '保存信息' }
  return <div className="modal-backdrop"><div className="modal book-modal"><div className="modal-header"><div><span className="modal-kicker">EDIT BOOK INFO</span><h2>{copy.title}</h2></div><button className="icon-button" aria-label={copy.cancel} onClick={onClose}><X size={19} /></button></div><div className="book-file-note"><BookOpen size={16} />{item.fileName}</div><div className="form-field"><label>{copy.name}</label><input autoFocus value={item.title} onChange={event => set('title', event.target.value)} placeholder={copy.name} /></div><div className="form-field"><label>{copy.author}</label><input value={item.author || ''} onChange={event => set('author', event.target.value)} placeholder={copy.authorHint} /></div><div className="form-field"><label>{copy.category}</label><input value={item.category || ''} onChange={event => set('category', event.target.value)} placeholder={copy.categoryHint} /></div><div className="modal-footer"><button className="secondary-button" onClick={onClose}>{copy.cancel}</button><button className="primary-button" onClick={() => onSave(item)}><Check size={16} />{copy.save}</button></div></div></div>
}

function BookReader({ language = 'zh', workspaceId, book, onClose, onLocation }) {
  const [url, setUrl] = useState('')
  const [text, setText] = useState('')
  const [error, setError] = useState('')
  const [readerBusy, setReaderBusy] = useState(false)
  const epubRef = useRef(null)
  const epubBookRef = useRef(null)
  const renditionRef = useRef(null)
  const textReaderRef = useRef(null)
  const initialLocationRef = useRef(book.location || '')
  const copy = language === 'en' ? { missing: 'The local book file was not found. Import it again.', openFailed: 'Unable to open this book. Confirm that the file is not damaged.', pageFailed: 'Unable to turn the page. Reopen this book and try again.', back: 'Back to library', reading: 'READING', previous: 'Previous', next: 'Next', saved: 'Reading position saved', active: 'Reading', frameTitle: title => `Reading ${title}` } : language === 'ja' ? { missing: 'ローカル書籍ファイルが見つかりません。もう一度取り込んでください。', openFailed: 'この書籍を開けません。ファイルが破損していないか確認してください。', pageFailed: 'ページをめくれません。書籍を開き直してください。', back: '本棚に戻る', reading: '閲覧中', previous: '前のページ', next: '次のページ', saved: '読書位置を保存しました', active: '読書中', frameTitle: title => `${title}を読む` } : { missing: '找不到本地书籍文件，请重新导入', openFailed: '无法打开这本书，请确认文件没有损坏', pageFailed: '翻页失败，请重新打开这本书', back: '返回书库', reading: '阅读中', previous: '上一页', next: '下一页', saved: '已保存阅读位置', active: '阅读中', frameTitle: title => `阅读 ${title}` }
  useEffect(() => {
    let objectUrl = ''
    let disposed = false
    const load = async () => {
      try {
        const file = await readBookFile(workspaceId, book.fileId, book.fileType)
        if (!file || disposed) return setError(copy.missing)
        if (book.fileType === '.epub') {
          const arrayBuffer = await file.arrayBuffer()
          const { default: ePub } = await import('epubjs')
          const epubBook = ePub(arrayBuffer)
          epubBookRef.current = epubBook
          await epubBook.ready
          if (!disposed && epubRef.current) {
            const rendition = epubBook.renderTo(epubRef.current, { width: '100%', height: '100%', flow: 'paginated', spread: 'none' })
            renditionRef.current = rendition
            rendition.on('relocated', location => {
              const cfi = location?.start?.cfi || ''
              if (cfi) onLocation?.(book.id, cfi)
            })
            if (initialLocationRef.current) {
              try { await rendition.display(initialLocationRef.current) } catch { await rendition.display() }
            } else {
              await rendition.display()
            }
          }
        } else {
          objectUrl = URL.createObjectURL(file)
          if (book.fileType === '.pdf' || book.fileType === '.html' || book.fileType === '.htm') setUrl(objectUrl)
          else setText(await file.text())
        }
      } catch { if (!disposed) setError(copy.openFailed) }
    }
    load()
    return () => { disposed = true; renditionRef.current = null; if (objectUrl) URL.revokeObjectURL(objectUrl); epubBookRef.current?.destroy?.() }
  }, [workspaceId, book.id, book.fileId, book.fileType, book.title, book.fileName, copy.missing, copy.openFailed, onLocation])
  useEffect(() => {
    if (book.fileType === '.epub' || !text || !textReaderRef.current || typeof book.textOffset !== 'number') return
    const target = textReaderRef.current
    target.scrollTop = Math.max(0, Math.min(target.scrollHeight - target.clientHeight, book.textOffset))
  }, [book.fileType, book.textOffset, text])
  const isPdf = book.fileType === '.pdf'
  const isHtml = book.fileType === '.html' || book.fileType === '.htm'
  const movePage = async direction => { if (book.fileType !== '.epub' || !renditionRef.current || readerBusy) return; setReaderBusy(true); try { await renditionRef.current[direction]() } catch { setError(copy.pageFailed) } finally { setReaderBusy(false) } }
  const updateTextPosition = event => { const target = event.currentTarget; onLocation?.(book.id, '', target.scrollTop) }
  return <section className="page reader-page"><div className="reader-page-header"><button className="reader-back-button" onClick={onClose}><ArrowLeft size={17} />{copy.back}</button><div className="reader-title"><span className="reader-kicker">{copy.reading}</span><h1>{book.title}</h1><span>{book.fileName}</span></div></div><main className={`reader-content ${isPdf ? 'pdf-reader' : ''}`}>{error ? <div className="reader-error"><BookOpen size={25} /><strong>{error}</strong></div> : book.fileType === '.epub' ? <div ref={epubRef} className="epub-reader" /> : isPdf ? <iframe title={copy.frameTitle(book.title)} src={url} /> : isHtml ? <iframe title={copy.frameTitle(book.title)} src={url} sandbox="" /> : <article ref={textReaderRef} className="text-reader" onScroll={updateTextPosition}>{text}</article>}</main><footer className="reader-controls"><button className="secondary-button" onClick={() => movePage('prev')} disabled={book.fileType !== '.epub' || readerBusy}><ArrowLeft size={15} />{copy.previous}</button><span>{book.fileType === '.epub' ? copy.saved : copy.active}</span><button className="secondary-button" onClick={() => movePage('next')} disabled={book.fileType !== '.epub' || readerBusy}>{copy.next}<ArrowLeft className="next-page-icon" size={15} /></button></footer></section>
}

function ApiKeyModal({ language = 'zh', modal, onClose, onSave }) { const [item, setItem] = useState(modal.item); const set = (key, value) => setItem(prev => ({ ...prev, [key]: value })); const copy = language === 'en' ? { create: 'Add API key', edit: 'Edit API key', note: 'Only the API key field is encrypted with AES-256-GCM.', name: 'Name', provider: 'Provider', value: 'API key', valueHint: 'Paste your API key', url: 'Request URL', cancel: 'Cancel', save: 'Encrypt and save' } : language === 'ja' ? { create: 'API Keyを追加', edit: 'API Keyを編集', note: 'API Keyの値のみAES-256-GCMで暗号化されます。', name: '名前', provider: 'サービス', value: 'API Key', valueHint: 'API Keyを貼り付け', url: 'リクエストURL', cancel: 'キャンセル', save: '暗号化して保存' } : { create: '添加 API Key', edit: '编辑 API Key', note: '仅 API Key 字段会使用 AES-256-GCM 加密', name: '名称', provider: '服务商', value: 'API Key', valueHint: '粘贴你的 API Key', url: '请求地址', cancel: '取消', save: '加密保存' }; return <div className="modal-backdrop"><div className="modal"><div className="modal-header"><div><span className="modal-kicker">{modal.mode === 'key-create' ? 'NEW SECRET' : 'EDIT SECRET'}</span><h2>{modal.mode === 'key-create' ? copy.create : copy.edit}</h2></div><button className="icon-button" aria-label={copy.cancel} onClick={onClose}><X size={19} /></button></div><div className="key-modal-note"><LockKeyhole size={16} />{copy.note}</div><div className="form-field"><label>{copy.name}</label><input autoFocus value={item.name} onChange={event => set('name', event.target.value)} placeholder="OpenAI Production" /></div><div className="form-field"><label>{copy.provider}</label><input value={item.provider} onChange={event => set('provider', event.target.value)} placeholder="OpenAI" /></div><div className="form-field"><label>{copy.value}</label><input type="password" value={item.value} onChange={event => set('value', event.target.value)} placeholder={copy.valueHint} /></div><div className="form-field"><label>{copy.url}</label><input value={item.requestUrl} onChange={event => set('requestUrl', event.target.value)} placeholder="https://api.example.com/v1" /></div><div className="modal-footer"><button className="secondary-button" onClick={onClose}>{copy.cancel}</button><button className="primary-button" onClick={() => onSave(item)}><ShieldCheck size={16} />{copy.save}</button></div></div></div> }

const fileToBase64 = async file => {
  const bytes = new Uint8Array(await file.arrayBuffer())
  let binary = ''
  for (let offset = 0; offset < bytes.length; offset += 0x8000) binary += String.fromCharCode(...bytes.subarray(offset, offset + 0x8000))
  return btoa(binary)
}

const listShortcuts = async workspaceId => {
  const response = await fetch(`/api/shortcuts?workspace=${encodeURIComponent(workspaceId)}`)
  const result = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(result.error || '无法读取本机快捷方式')
  return result
}
const addShortcutRecord = async (workspaceId, payload) => {
  const response = await fetch(`/api/shortcuts?workspace=${encodeURIComponent(workspaceId)}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
  const result = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(result.error || '快捷方式保存失败')
  return result
}
const launchShortcutRecord = async (workspaceId, id) => {
  const response = await fetch(`/api/shortcuts/${encodeURIComponent(id)}/launch?workspace=${encodeURIComponent(workspaceId)}`, { method: 'POST' })
  const result = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(result.error || '启动失败')
  return result
}
const removeShortcutRecord = async (workspaceId, id) => {
  const response = await fetch(`/api/shortcuts/${encodeURIComponent(id)}?workspace=${encodeURIComponent(workspaceId)}`, { method: 'DELETE' })
  const result = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(result.error || '删除失败')
  return result
}

function AppLauncher({ language = 'zh', workspaceId = 'personal' }) {
  const [shortcuts, setShortcuts] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [busyId, setBusyId] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const appPageSize = useAdaptivePageSize('app')
  const [page, setPage] = useState(1)
  const pageCount = Math.max(1, Math.ceil(shortcuts.length / appPageSize))
  useEffect(() => { if (page > pageCount) setPage(pageCount) }, [page, pageCount])
  const pickerRef = useRef(null)

  const loadShortcuts = async () => {
    setLoading(true)
    setError('')
    try {
      const result = await listShortcuts(workspaceId)
      setShortcuts(Array.isArray(result.shortcuts) ? result.shortcuts : [])
    } catch (loadError) {
      setError(loadError.message || copy.serviceUnavailable)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadShortcuts() }, [workspaceId])

  const addShortcut = async event => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    const extension = file.name.slice(file.name.lastIndexOf('.')).toLowerCase()
    if (!['.lnk', '.url'].includes(extension)) return setError(copy.unsupported)
    setSaving(true); setError(''); setMessage('')
    try {
      const result = await addShortcutRecord(workspaceId, { name: file.name.replace(/\.(lnk|url)$/i, ''), fileName: file.name, data: await fileToBase64(file) })
      setShortcuts(prev => [...prev, result.shortcut])
      setMessage(copy.added)
    } catch (saveError) {
      setError(saveError.message || copy.saveFailed)
    } finally {
      setSaving(false)
    }
  }

  const launchShortcut = async id => {
    setBusyId(id); setError(''); setMessage('')
    try {
      await launchShortcutRecord(workspaceId, id)
      setMessage(copy.sent)
    } catch (launchError) {
      setError(launchError.message || copy.failed)
    } finally {
      setBusyId('')
    }
  }

  const launchAll = async () => {
    if (!shortcuts.length || busyId) return
    setBusyId('all'); setError(''); setMessage('')
    try {
      await Promise.all(shortcuts.map(shortcut => launchShortcutRecord(workspaceId, shortcut.id).catch(error => { throw new Error(`${shortcut.name}: ${error.message || copy.failed}`) })))
      setMessage(copy.allSent(shortcuts.length))
    } catch (launchError) {
      setError(launchError.message || copy.someFailed)
    } finally {
      setBusyId('')
    }
  }

  const removeShortcut = async shortcut => {
    if (!window.confirm(copy.deleteConfirm(shortcut.name))) return
    setError(''); setMessage('')
    try {
      await removeShortcutRecord(workspaceId, shortcut.id)
      setShortcuts(prev => prev.filter(item => item.id !== shortcut.id))
      setMessage(copy.deleted)
    } catch (removeError) {
      setError(removeError.message || copy.remove)
    }
  }

  const copy = language === 'en' ? { title: 'App Launcher', desc: 'Choose a local shortcut and launch your apps with one click.', all: 'Launch all', launching: 'Launching...', choose: 'Choose shortcut', saving: 'Saving...', notice: 'Shortcuts stay in this local workspace; launches are handled by the local service.', refresh: 'Refresh list', empty: 'No app shortcuts yet', emptyHint: 'Choose a .lnk or .url file to get started', first: 'Choose your first shortcut', reading: 'Loading shortcuts...', launch: 'Launch', started: 'Started', remove: 'Delete shortcut', serviceUnavailable: 'Unable to connect to the local shortcut service.', unsupported: 'Choose a Windows .lnk or .url shortcut.', added: 'Shortcut added.', sent: 'Launch command sent.', allSent: count => `Launch commands sent to ${count} apps.`, failed: 'Launch failed.', someFailed: 'Some apps could not be launched.', deleteConfirm: name => `Delete “${name}”?`, deleted: 'Shortcut deleted.', saveFailed: 'Unable to save the shortcut.' } : language === 'ja' ? { title: 'アプリランチャー', desc: 'ローカルショートカットを選び、ワンクリックで起動します。', all: 'すべて起動', launching: '起動中...', choose: 'ショートカットを選択', saving: '保存中...', notice: 'ショートカットはローカルワークスペースに保存されます。', refresh: '一覧を更新', empty: 'アプリショートカットはありません', emptyHint: '.lnk または .url ファイルを選択してください', first: '最初のショートカットを選択', reading: 'ショートカットを読み込み中...', launch: '起動', started: '起動済み', remove: 'ショートカットを削除', serviceUnavailable: 'ローカルショートカットサービスに接続できません。', unsupported: 'Windows の .lnk または .url ショートカットを選択してください。', added: 'ショートカットを追加しました。', sent: '起動指示を送信しました。', allSent: count => `${count} 個のアプリに起動指示を送信しました。`, failed: '起動に失敗しました。', someFailed: '一部のアプリを起動できませんでした。', deleteConfirm: name => `「${name}」を削除しますか？`, deleted: 'ショートカットを削除しました。', saveFailed: 'ショートカットを保存できませんでした。' } : { title: '应用启动器', desc: '选择本机快捷方式，点击一次即可启动常用软件。', all: '全部启动', launching: '启动中...', choose: '选择快捷方式', saving: '正在保存...', notice: '快捷方式仅保存在本机工作区，启动操作由本地服务执行。', refresh: '刷新列表', empty: '还没有应用快捷方式', emptyHint: '选择一个 .lnk 或 .url 文件开始使用', first: '选择第一个快捷方式', reading: '正在读取快捷方式...', launch: '启动', started: '启动中', remove: '删除快捷方式', serviceUnavailable: '无法连接本机快捷方式服务', unsupported: '请选择 Windows .lnk 或 .url 快捷方式', added: '快捷方式已添加', sent: '启动指令已发送', allSent: count => `已发送 ${count} 个应用的启动指令`, failed: '启动失败', someFailed: '部分应用启动失败', deleteConfirm: name => `确定删除“${name}”吗？`, deleted: '快捷方式已删除', saveFailed: '快捷方式保存失败' }
  return <section className="page resource-page app-launcher-page">
    <div className="page-heading library-heading">
      <div><p className="eyebrow">LOCAL TOOLS</p><h1>{copy.title}</h1><p className="subheading">{copy.desc}</p></div>
      <div className="app-launcher-actions">
        <button className="secondary-button app-launch-all" onClick={launchAll} disabled={!shortcuts.length || loading || Boolean(busyId)}><Play size={16} />{busyId === 'all' ? copy.launching : copy.all}</button>
        <label className={`primary-button shortcut-picker ${saving ? 'is-loading' : ''}`}>
          <Upload size={17} />{saving ? copy.saving : copy.choose}
          <input ref={pickerRef} type="file" accept=".lnk,.url" onChange={addShortcut} disabled={saving} />
        </label>
      </div>
    </div>
    <div className="app-launcher-notice"><FolderOpen size={17} /><span>{copy.notice}</span><button className="icon-button" title={copy.refresh} onClick={loadShortcuts} disabled={loading}><RefreshCw size={16} /></button></div>
    {error && <div className="app-launcher-error">{error}</div>}
    {message && !error && <div className="app-launcher-message"><Check size={15} />{message}</div>}
    {loading ? <div className="app-launcher-loading"><RefreshCw size={19} />{copy.reading}</div> : shortcuts.length === 0 ? <div className="empty-state app-empty-state"><AppWindow size={24} /><strong>{copy.empty}</strong><span>{copy.emptyHint}</span><button className="text-button" onClick={() => pickerRef.current?.click()}><Upload size={15} />{copy.first}</button></div> : <><div className="app-grid">{shortcuts.slice((page - 1) * appPageSize, page * appPageSize).map(shortcut => <article className="app-card" key={shortcut.id}><div className="app-card-icon"><AppWindow size={20} /></div><div className="app-card-main"><strong>{shortcut.name}</strong><span>{shortcut.fileName}</span><small>{shortcut.extension.toUpperCase()} · {copy.choose}</small></div><div className="app-card-actions"><button className="app-launch-button" onClick={() => launchShortcut(shortcut.id)} disabled={Boolean(busyId)}><Play size={15} />{busyId === shortcut.id ? copy.started : copy.launch}</button><button className="resource-delete-button" title={copy.remove} onClick={() => removeShortcut(shortcut)} disabled={Boolean(busyId)}><Trash2 size={16} /></button></div></article>)}</div>{pageCount > 1 && <ResourcePagination language={language} page={page} pageCount={pageCount} setPage={setPage} />}</>}
  </section>
}

const settingsSections = [
  { id: 'workspace', label: '工作区', icon: UserRound },
  { id: 'security', label: '密码与安全', icon: LockKeyhole },
  { id: 'data', label: '数据管理', icon: Database },
  { id: 'startup', label: '启动设置', icon: Power },
  { id: 'language', label: '语言', icon: Globe2 }
]

function SettingsPage({ language = 'zh', workspace, startupEnabled, serverPort, onToggleStartup, onSaveServerPort, onGetServiceStatus, onRestartService, onGetServiceLogs, onResetWorkbench, onRenameWorkspace, onChangePassword, onExport, onImport }) {
  const [section, setSection] = useState('workspace')
  const [workspaceName, setWorkspaceName] = useState(workspace.name)
  const [nameError, setNameError] = useState('')
  const [nameSaved, setNameSaved] = useState(false)
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [passwordError, setPasswordError] = useState('')
  const [passwordSaved, setPasswordSaved] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)
  const [portValue, setPortValue] = useState(String(serverPort))
  const [portMessage, setPortMessage] = useState('')
  const [portError, setPortError] = useState('')
  const [savingPort, setSavingPort] = useState(false)
  const [startupError, setStartupError] = useState('')
  const [languageValue, setLanguageValue] = useState(language)
  const [serviceStatus, setServiceStatus] = useState(null)
  const [serviceError, setServiceError] = useState('')
  const [serviceMessage, setServiceMessage] = useState('')
  const [serviceBusy, setServiceBusy] = useState('')
  const [serviceLogs, setServiceLogs] = useState(null)
  const settingsCopy = language === 'en' ? { title: 'Settings', desc: 'Manage the current workspace, security, data and local service.', nav: 'Settings', workspace: 'Workspace', security: 'Password & security', data: 'Data management', startup: 'Startup', language: 'Language', workspaceDesc: 'Change the display name of this workspace.', name: 'Workspace name', save: 'Save changes', id: 'Workspace ID', idHint: 'Used to isolate local data and cannot be changed.', securityDesc: `Change the password used to enter “${workspace.name}”.`, dataDesc: 'Export this workspace or restore it from an encrypted file.', startupDesc: 'Control the local service after signing in to Windows.', current: 'Current password', newPassword: 'New password', confirmPassword: 'Confirm new password', passwordPlaceholder: 'Enter workspace password', newPasswordPlaceholder: 'At least 8 characters', reencrypt: 'Saved API Keys will be re-encrypted with the new password.', update: 'Update password', exporting: 'Export workspace config', importing: 'Import workspace config', exportHint: 'Prompts, bookmarks, book metadata and encrypted API keys are included.', importHint: 'Enter the original password; an existing workspace can be overwritten.', auto: 'Start on Windows login', autoHint: 'Start the local workbench service after signing in to Windows.', port: 'Binding port', portHint: 'Listens only on 127.0.0.1; changes restart the service automatically.', on: 'On', off: 'Off', saving: 'Saving...', savePort: 'Save port', service: 'Service status', serviceHint: 'Monitor and manage the local service currently running this workbench.', online: 'Running', offline: 'Unavailable', refresh: 'Refresh status', restart: 'Restart service', restarting: 'Restarting...', logs: 'View logs', hideLogs: 'Hide logs', noLogs: 'No local service logs yet.', pid: 'PID', uptime: 'Uptime', restartQueued: 'The service is restarting. This page will reopen shortly.', statusLoaded: 'Service status refreshed.', reset: 'Restore initial state', resetHint: 'Deletes every workspace, password, API key, prompt, bookmark, book file and shortcut. Startup is disabled and the port returns to 5180. Export a backup first.', resetConfirm: 'Restore the workbench to its initial state?\n\nAll local workspaces and data will be permanently deleted. The service will restart on port 5180.', resetting: 'Restoring...', resetQueued: 'Initial state is being restored. This page will reopen at port 5180 shortly.', resetFailed: 'Unable to restore the initial state.', portRestart: port => `The service is restarting. It will open http://127.0.0.1:${port}/ shortly.`, portCurrent: 'The service is already bound to this port.' } : language === 'ja' ? { title: '設定', desc: 'ワークスペース、セキュリティ、データ、ローカルサービスを管理します。', nav: '設定', workspace: 'ワークスペース', security: 'パスワードとセキュリティ', data: 'データ管理', startup: '起動設定', language: '言語', workspaceDesc: 'ワークスペースの表示名を変更します。', name: 'ワークスペース名', save: '変更を保存', id: 'ワークスペースID', idHint: 'ローカルデータの分離に使用され、変更できません。', securityDesc: `「${workspace.name}」に入るパスワードを変更します。`, dataDesc: '暗号化ファイルからデータをエクスポート・復元します。', startupDesc: 'Windowsログイン後のローカルサービスを制御します。', current: '現在のパスワード', newPassword: '新しいパスワード', confirmPassword: '新しいパスワードを確認', passwordPlaceholder: 'ワークスペースのパスワードを入力', newPasswordPlaceholder: '8文字以上', reencrypt: '保存済みのAPI Keyは新しいパスワードで再暗号化されます。', update: 'パスワードを更新', exporting: 'ワークスペース設定をエクスポート', importing: 'ワークスペース設定をインポート', exportHint: 'プロンプト、ブックマーク、書籍メタデータ、暗号化API Keyを含みます。', importHint: '元のパスワードが必要です。同名ワークスペースは上書きできます。', auto: 'Windowsログイン時に起動', autoHint: 'Windowsログイン後にローカルサービスを起動します。', port: 'バインドポート', portHint: '127.0.0.1のみで待ち受け、変更後は自動再起動します。', on: 'オン', off: 'オフ', saving: '保存中...', savePort: 'ポートを保存', service: 'サービス状態', serviceHint: 'このワークベンチを実行中のローカルサービスを管理します。', online: '稼働中', offline: '利用不可', refresh: '状態を更新', restart: 'サービスを再起動', restarting: '再起動中...', logs: 'ログを表示', hideLogs: 'ログを隠す', noLogs: 'ローカルサービスのログはまだありません。', pid: 'PID', uptime: '稼働時間', restartQueued: 'サービスを再起動しています。このページはまもなく再度開きます。', statusLoaded: 'サービス状態を更新しました。', reset: '初期状態に戻す', resetHint: 'すべてのワークスペース、パスワード、API Key、プロンプト、ブックマーク、書籍ファイル、ショートカットを削除します。自動起動は無効になり、ポートは5180に戻ります。先にバックアップをエクスポートしてください。', resetConfirm: 'ワークベンチを初期状態に戻しますか？\n\nすべてのローカルワークスペースとデータが完全に削除され、ポート5180で再起動します。', resetting: '復元中...', resetQueued: '初期状態を復元しています。まもなくポート5180で開きます。', resetFailed: '初期状態を復元できません。', portRestart: port => `サービスを再起動しています。まもなく http://127.0.0.1:${port}/ を開きます。`, portCurrent: 'サービスはすでにこのポートにバインドされています。' } : { title: '设置', desc: '管理当前工作区、安全、数据与本地服务。', nav: '设置', workspace: '工作区', security: '密码与安全', data: '数据管理', startup: '启动设置', language: '语言', workspaceDesc: '修改当前工作区的显示名称。', name: '工作区名称', save: '保存更改', id: '工作区标识', idHint: '用于隔离本机数据，创建后不可修改。', securityDesc: `修改进入“${workspace.name}”时使用的密码。`, dataDesc: '导出当前工作区，或从加密配置文件恢复数据。', startupDesc: '控制 Windows 登录后的本地服务行为。', current: '当前密码', newPassword: '新密码', confirmPassword: '确认新密码', passwordPlaceholder: '输入当前工作区密码', newPasswordPlaceholder: '至少 8 位字符', reencrypt: '修改后，当前工作区保存的 API Key 会自动使用新密码重新加密。', update: '更新密码', exporting: '导出工作区配置', importing: '导入工作区配置', exportHint: '提示词、网址、书籍元数据和 API Key 密文会被打包并再次加密。', importHint: '需要输入配置原密码；同名工作区可以选择覆盖，密码也会被覆盖。', auto: '开机自启动', autoHint: '登录 Windows 后自动启动本地工作台服务。', port: '绑定端口', portHint: '服务只监听 127.0.0.1；修改后会自动重启并打开新地址。', on: '已开启', off: '已关闭', saving: '保存中...', savePort: '保存端口', service: '服务状态', serviceHint: '查看并管理当前运行此工作台的本地服务。', online: '运行中', offline: '无法连接', refresh: '刷新状态', restart: '重启服务', restarting: '正在重启...', logs: '查看日志', hideLogs: '收起日志', noLogs: '暂时没有本地服务日志。', pid: '进程 ID', uptime: '运行时长', restartQueued: '服务正在重启，页面将在几秒后重新打开。', statusLoaded: '服务状态已刷新。', reset: '恢复初始状态', resetHint: '会删除所有工作区、密码、API Key、提示词、网址、书籍文件和快捷方式；同时关闭自启动，并将端口恢复为 5180。建议先导出配置备份。', resetConfirm: '确定恢复工作台初始状态吗？\n\n所有本地工作区和数据将被永久删除，服务会重启到 5180 端口。', resetting: '正在恢复...', resetQueued: '正在恢复初始状态，页面将在几秒后通过 5180 端口重新打开。', resetFailed: '恢复初始状态失败。', portRestart: port => `正在自动重启；服务就绪后会打开 http://127.0.0.1:${port}/`, portCurrent: '当前服务已绑定该端口。' }

  useEffect(() => setWorkspaceName(workspace.name), [workspace.name])
  useEffect(() => setPortValue(String(serverPort)), [serverPort])
  useEffect(() => setLanguageValue(language), [language])
  const refreshServiceStatus = async ({ feedback = false } = {}) => {
    setServiceError('')
    try {
      const result = await onGetServiceStatus()
      setServiceStatus(result)
      if (feedback) setServiceMessage(settingsCopy.statusLoaded)
      return result
    } catch (error) {
      setServiceStatus(null)
      setServiceError(error.message || settingsCopy.offline)
      throw error
    }
  }
  useEffect(() => {
    if (section === 'startup') refreshServiceStatus().catch(() => {})
  }, [section])

  const saveLanguage = event => {
    const nextLanguage = event.target.value
    setLanguageValue(nextLanguage)
    window.localStorage.setItem('workbench-language', nextLanguage)
    window.dispatchEvent(new CustomEvent('workbench-language-change', { detail: { language: nextLanguage } }))
  }

  const saveWorkspaceName = async event => {
    event.preventDefault()
    setNameError(''); setNameSaved(false)
    try {
      await onRenameWorkspace(workspaceName)
      setNameSaved(true)
    } catch (error) { setNameError(error.message || '工作区名称修改失败') }
  }
  const savePassword = async event => {
    event.preventDefault()
    setPasswordError(''); setPasswordSaved(false); setSavingPassword(true)
    try {
      await onChangePassword(passwords)
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' })
      setPasswordSaved(true)
    } catch (error) { setPasswordError(error.message || '工作区密码修改失败') } finally { setSavingPassword(false) }
  }
  const setPasswordField = (field, value) => setPasswords(previous => ({ ...previous, [field]: value }))
  const savePort = async event => {
    event.preventDefault()
    setPortError(''); setPortMessage(''); setSavingPort(true)
    try {
      const result = await onSaveServerPort(Number(portValue))
      setPortMessage(result.restarting ? settingsCopy.portRestart(result.port) : settingsCopy.portCurrent)
    } catch (error) { setPortError(error.message || '端口设置失败') } finally { setSavingPort(false) }
  }
  const toggleStartup = async event => {
    setStartupError('')
    try { await onToggleStartup(event) } catch (error) { setStartupError(error.message || (language === 'en' ? 'Unable to update startup.' : language === 'ja' ? '自動起動を更新できません。' : '无法更新开机自启动设置')) }
  }
  const restartService = async () => {
    setServiceError(''); setServiceMessage(''); setServiceBusy('restart')
    try { await onRestartService(); setServiceMessage(settingsCopy.restartQueued) } catch (error) { setServiceError(error.message || settingsCopy.offline) } finally { setServiceBusy('') }
  }
  const toggleLogs = async () => {
    if (serviceLogs) return setServiceLogs(null)
    setServiceError(''); setServiceBusy('logs')
    try { setServiceLogs(await onGetServiceLogs()) } catch (error) { setServiceError(error.message || settingsCopy.offline) } finally { setServiceBusy('') }
  }
  const resetWorkbench = async () => {
    if (!window.confirm(settingsCopy.resetConfirm)) return
    setServiceError(''); setServiceMessage(''); setServiceBusy('reset')
    try { await onResetWorkbench(); setServiceMessage(settingsCopy.resetQueued) } catch (error) { setServiceError(error.message || settingsCopy.resetFailed) } finally { setServiceBusy('') }
  }
  const formatUptime = seconds => {
    const total = Math.max(0, Number(seconds) || 0)
    const hours = Math.floor(total / 3600)
    const minutes = Math.floor((total % 3600) / 60)
    return language === 'en' ? `${hours}h ${minutes}m` : language === 'ja' ? `${hours}時間${minutes}分` : `${hours} 小时 ${minutes} 分钟`
  }

  return <section className="page settings-page">
     <div className="page-heading library-heading"><div><h1>{settingsCopy.title}</h1><p className="subheading">{settingsCopy.desc}</p></div></div>
    <div className="settings-shell">
      <nav className="settings-nav" aria-label={language === 'en' ? 'Settings sections' : language === 'ja' ? '設定カテゴリ' : '设置分类'}>
        <div className="settings-nav-heading">{settingsCopy.nav}</div>
        {settingsSections.map(item => <button key={item.id} className={section === item.id ? 'active' : ''} onClick={() => setSection(item.id)}><item.icon size={17} /><span>{settingsCopy[item.id]}</span></button>)}
      </nav>
      <div className="settings-content">
        {section === 'workspace' && <section className="settings-section">
          <div className="settings-section-heading"><h2>{settingsCopy.workspace}</h2><p>{settingsCopy.workspaceDesc}</p></div>
          <form className="settings-form" onSubmit={saveWorkspaceName}>
            <label><span>{settingsCopy.name}</span><input value={workspaceName} onChange={event => { setWorkspaceName(event.target.value); setNameError(''); setNameSaved(false) }} maxLength={40} /></label>
            <div className="settings-form-footer"><div className={`settings-feedback ${nameError ? 'error' : ''}`}>{nameError || (nameSaved ? (language === 'en' ? 'Name saved' : language === 'ja' ? '名前を保存しました' : '名称已保存') : '')}</div><button className="primary-button" type="submit" disabled={!workspaceName.trim() || workspaceName.trim() === workspace.name}>{settingsCopy.save}</button></div>
          </form>
           <div className="settings-detail-row"><div><strong>{settingsCopy.id}</strong><span>{settingsCopy.idHint}</span></div><code>{workspace.id}</code></div>
        </section>}
        {section === 'security' && <section className="settings-section">
          <div className="settings-section-heading"><h2>{settingsCopy.security}</h2><p>{settingsCopy.securityDesc}</p></div>
          <form className="settings-form settings-password-form" onSubmit={savePassword}>
            <label><span>{settingsCopy.current}</span><input type="password" autoComplete="current-password" value={passwords.currentPassword} onChange={event => setPasswordField('currentPassword', event.target.value)} placeholder={settingsCopy.passwordPlaceholder} /></label>
            <label><span>{settingsCopy.newPassword}</span><input type="password" autoComplete="new-password" value={passwords.newPassword} onChange={event => setPasswordField('newPassword', event.target.value)} placeholder={settingsCopy.newPasswordPlaceholder} /></label>
            <label><span>{settingsCopy.confirmPassword}</span><input type="password" autoComplete="new-password" value={passwords.confirmPassword} onChange={event => setPasswordField('confirmPassword', event.target.value)} placeholder={settingsCopy.newPasswordPlaceholder} /></label>
            <p className="settings-inline-note">{settingsCopy.reencrypt}</p>
            <div className="settings-form-footer"><div className={`settings-feedback ${passwordError ? 'error' : ''}`}>{passwordError || (passwordSaved ? (language === 'en' ? 'Password updated' : language === 'ja' ? 'パスワードを更新しました' : '密码已更新') : '')}</div><button className="primary-button" type="submit" disabled={savingPassword}>{savingPassword ? settingsCopy.saving : settingsCopy.update}</button></div>
          </form>
        </section>}
        {section === 'data' && <section className="settings-section">
          <div className="settings-section-heading"><h2>{settingsCopy.data}</h2><p>{settingsCopy.dataDesc}</p></div>
          <div className="settings-detail-row settings-action-row"><div><strong>{settingsCopy.exporting}</strong><span>{settingsCopy.exportHint}</span></div><button className="secondary-button" onClick={onExport}><Download size={16} />{language === 'en' ? 'Export' : language === 'ja' ? 'エクスポート' : '导出配置'}</button></div>
          <div className="settings-detail-row settings-action-row"><div><strong>{settingsCopy.importing}</strong><span>{settingsCopy.importHint}</span></div><label className="secondary-button settings-import-button"><FileUp size={16} />{language === 'en' ? 'Import' : language === 'ja' ? 'インポート' : '导入配置'}<input type="file" accept="application/json,.json" onChange={event => { const file = event.target.files?.[0]; event.target.value = ''; onImport(file) }} /></label></div>
          <div className="settings-detail-row settings-action-row settings-danger-row"><div><strong>{settingsCopy.reset}</strong><span>{settingsCopy.resetHint}</span></div><button className="secondary-button danger-button" onClick={resetWorkbench} disabled={serviceBusy === 'reset'}><RefreshCw size={16} />{serviceBusy === 'reset' ? settingsCopy.resetting : settingsCopy.reset}</button></div>
          {(serviceMessage || (serviceBusy === 'reset' && settingsCopy.resetting)) && <p className="settings-reset-feedback">{serviceMessage}</p>}
        </section>}
         {section === 'startup' && <section className="settings-section">
           <div className="settings-section-heading"><h2>{settingsCopy.startup}</h2><p>{settingsCopy.startupDesc}</p></div>
          <div className="settings-detail-row settings-toggle-row"><div><strong>{settingsCopy.auto}</strong><span>{settingsCopy.autoHint}</span>{startupError && <span className="settings-port-feedback error">{startupError}</span>}</div><label className="settings-toggle" title={settingsCopy.auto}><input type="checkbox" checked={startupEnabled} onChange={toggleStartup} /><span className="toggle-track" /><span className="settings-toggle-state">{startupEnabled ? settingsCopy.on : settingsCopy.off}</span></label></div>
           <form className="settings-detail-row settings-port-row" onSubmit={savePort}><div><strong>{settingsCopy.port}</strong><span>{settingsCopy.portHint}</span><span className={`settings-port-feedback ${portError ? 'error' : ''}`}>{portError || portMessage}</span></div><div className="settings-port-control"><input aria-label={settingsCopy.port} type="number" min="1024" max="65535" step="1" value={portValue} onChange={event => { setPortValue(event.target.value); setPortError(''); setPortMessage('') }} /><button className="secondary-button" type="submit" disabled={savingPort || !portValue}>{savingPort ? settingsCopy.saving : settingsCopy.savePort}</button></div></form>
          <div className="settings-detail-row settings-service-row"><div><strong>{settingsCopy.service}</strong><span>{settingsCopy.serviceHint}</span>{serviceError && <span className="settings-port-feedback error">{serviceError}</span>}{serviceMessage && <span className="settings-port-feedback">{serviceMessage}</span>}</div><div className="service-status-summary"><span className={`service-status-indicator ${serviceStatus?.running ? 'online' : 'offline'}`} /><strong>{serviceStatus?.running ? settingsCopy.online : settingsCopy.offline}</strong>{serviceStatus?.running && <code>127.0.0.1:{serviceStatus.port}</code>}</div></div>
          {serviceStatus?.running && <div className="settings-service-meta"><span>{settingsCopy.pid}: {serviceStatus.pid}</span><span>{settingsCopy.uptime}: {formatUptime(serviceStatus.uptimeSeconds)}</span></div>}
          <div className="settings-service-actions"><button className="secondary-button" onClick={() => refreshServiceStatus({ feedback: true }).catch(() => {})} disabled={serviceBusy === 'refresh'}><RefreshCw size={16} />{settingsCopy.refresh}</button><button className="secondary-button" onClick={restartService} disabled={serviceBusy === 'restart'}><Power size={16} />{serviceBusy === 'restart' ? settingsCopy.restarting : settingsCopy.restart}</button><button className="secondary-button" onClick={toggleLogs} disabled={serviceBusy === 'logs'}><Clipboard size={16} />{serviceBusy === 'logs' ? settingsCopy.saving : serviceLogs ? settingsCopy.hideLogs : settingsCopy.logs}</button></div>
          {serviceLogs && <div className="settings-service-log"><strong>{language === 'ja' ? '標準出力' : 'stdout'}</strong><pre>{serviceLogs.stdout || settingsCopy.noLogs}</pre><strong>{language === 'ja' ? '標準エラー' : 'stderr'}</strong><pre>{serviceLogs.stderr || settingsCopy.noLogs}</pre></div>}
         </section>}
         {section === 'language' && <section className="settings-section">
           <div className="settings-section-heading"><h2>{language === 'en' ? 'Language' : language === 'ja' ? '言語' : '语言'}</h2><p>{language === 'en' ? 'Choose the language used by the workbench.' : language === 'ja' ? 'ワークベンチで使用する言語を選択します。' : '选择工作台界面使用的语言。'}</p></div>
           <div className="settings-detail-row settings-language-row"><div><strong>{language === 'en' ? 'Interface language' : language === 'ja' ? '表示言語' : '界面语言'}</strong><span>{language === 'en' ? 'The main navigation and workbench entry update immediately.' : language === 'ja' ? '主要なナビゲーションと入口にすぐ反映されます。' : '切换后会立即更新主要导航和工作台入口。'}</span></div><select value={languageValue} onChange={saveLanguage} aria-label={language === 'en' ? 'Interface language' : language === 'ja' ? '表示言語' : '界面语言'}>{LANGUAGE_OPTIONS.map(option => <option key={option.id} value={option.id}>{option.label}</option>)}</select></div>
         </section>}
      </div>
    </div>
  </section>
}

function Placeholder({ language = 'zh', title, icon: Icon }) { const copy = language === 'en' ? { title: 'This module will be available in a future release.', hint: 'Build your workbench foundation first, then add capabilities step by step.' } : language === 'ja' ? { title: 'このモジュールは今後のバージョンで利用可能になります。', hint: 'まずワークベンチの土台を整え、機能を段階的に追加しましょう。' } : { title: '这个模块将在后续版本中开放。', hint: '先把你的工作台骨架搭好，再逐步加入更多能力。' }; return <section className="page placeholder-page"><div className="placeholder-icon">{Icon && <Icon size={28} />}</div><h1>{title}</h1><p>{copy.title}</p><span>{copy.hint}</span></section> }

const root = createRoot(document.getElementById('root'))
loadPortableStorage().then(() => {
  root.render(<App />)
}).catch(error => {
  root.render(<div className="security-screen"><div className="security-panel"><h1>无法读取本地数据</h1><p className="security-copy">{error.message || '请确认本地服务正在运行后刷新页面。'}</p></div></div>)
})
