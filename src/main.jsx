import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'
import {
  AppWindow, ArrowLeft, ArrowUpRight, BookOpen, Check, ChevronDown, Clipboard, Copy, Eye, EyeOff,
  ExternalLink, FolderOpen, Grid2X2, KeyRound, LayoutDashboard, LockKeyhole, LogOut, Menu,
  MoreHorizontal, Pencil, Play, Plus, RefreshCw, Search, Settings2, ShieldCheck, Sparkles,
  Trash2, UnlockKeyhole, Upload, X, Zap
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

const getInitialPrompts = () => {
  try {
    const stored = JSON.parse(localStorage.getItem('workbench-prompts'))
    if (!Array.isArray(stored)) return seedPrompts
    const existingTitles = new Set(stored.map(prompt => prompt.title))
    return [...stored, ...seedPrompts.filter(prompt => !existingTitles.has(prompt.title))]
  } catch { return seedPrompts }
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

const getInitialLinks = () => {
  try {
    const stored = JSON.parse(localStorage.getItem('workbench-links'))
    if (!Array.isArray(stored)) return seedLinks
    const existingTitles = new Set(stored.map(link => link.title))
    return [...stored, ...seedLinks.filter(link => !existingTitles.has(link.title))]
  } catch { return seedLinks }
}

const getInitialBooks = () => {
  try {
    const stored = JSON.parse(localStorage.getItem('workbench-books'))
    return Array.isArray(stored) ? stored.filter(book => book.fileId && book.fileName).map(({ progress, progressVersion, ...book }) => book) : []
  } catch { return [] }
}

const BOOK_FILE_TYPES = ['.pdf', '.epub', '.txt', '.md', '.markdown', '.html', '.htm']
const bookFileType = fileName => `.${String(fileName).split('.').pop().toLowerCase()}`
const bookDbPromise = new Promise((resolve, reject) => {
  const request = indexedDB.open('workbench-books-files', 1)
  request.onupgradeneeded = () => request.result.createObjectStore('files')
  request.onsuccess = () => resolve(request.result)
  request.onerror = () => reject(request.error)
})
const saveBookFile = (id, file) => bookDbPromise.then(db => new Promise((resolve, reject) => { const tx = db.transaction('files', 'readwrite'); tx.objectStore('files').put(file, id); tx.oncomplete = resolve; tx.onerror = () => reject(tx.error) }))
const readBookFile = id => bookDbPromise.then(db => new Promise((resolve, reject) => { const tx = db.transaction('files', 'readonly'); const request = tx.objectStore('files').get(id); request.onsuccess = () => resolve(request.result); request.onerror = () => reject(request.error) }))
const deleteBookFile = id => bookDbPromise.then(db => new Promise((resolve, reject) => { const tx = db.transaction('files', 'readwrite'); tx.objectStore('files').delete(id); tx.oncomplete = resolve; tx.onerror = () => reject(tx.error) }))

const encoder = new TextEncoder()
const decoder = new TextDecoder()
const toBase64 = bytes => btoa(String.fromCharCode(...new Uint8Array(bytes)))
const fromBase64 = value => Uint8Array.from(atob(value), char => char.charCodeAt(0))
const deriveMaterial = async (password, salt, purpose, bits = false) => {
  const baseKey = await crypto.subtle.importKey('raw', encoder.encode(password), 'PBKDF2', false, ['deriveBits', 'deriveKey'])
  const purposeSalt = new Uint8Array([...salt, ...encoder.encode(purpose)])
  if (bits) return crypto.subtle.deriveBits({ name: 'PBKDF2', salt: purposeSalt, iterations: 250000, hash: 'SHA-256' }, baseKey, 256)
  return crypto.subtle.deriveKey({ name: 'PBKDF2', salt: purposeSalt, iterations: 250000, hash: 'SHA-256' }, baseKey, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt'])
}
const createPasswordConfig = async password => { const salt = crypto.getRandomValues(new Uint8Array(16)); const verifier = await deriveMaterial(password, salt, 'workbench-verifier', true); return { salt: toBase64(salt), verifier: toBase64(verifier) } }
const unlockWithPassword = async password => { const config = JSON.parse(localStorage.getItem('workbench-password') || 'null'); if (!config) return null; const salt = fromBase64(config.salt); const verifier = await deriveMaterial(password, salt, 'workbench-verifier', true); if (toBase64(verifier) !== config.verifier) return null; return deriveMaterial(password, salt, 'workbench-encryption') }
const encryptApiValue = async (key, value) => { const iv = crypto.getRandomValues(new Uint8Array(12)); const ciphertext = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, encoder.encode(value)); return { iv: toBase64(iv), ciphertext: toBase64(ciphertext) } }
const decryptApiValue = async (key, record) => decoder.decode(await crypto.subtle.decrypt({ name: 'AES-GCM', iv: fromBase64(record.iv) }, key, fromBase64(record.ciphertext)))

const navGroups = [
  { label: '工作台', items: [{ id: 'overview', label: '概述', icon: LayoutDashboard }] },
  { label: '资源中心', items: [
    { id: 'prompts', label: '提示词库', icon: Sparkles, count: 12 },
    { id: 'links', label: '网址收藏', icon: ArrowUpRight },
    { id: 'keys', label: 'API Keys', icon: KeyRound }
  ] },
  { label: '工具', items: [
    { id: 'apps', label: '应用启动器', icon: AppWindow },
    { id: 'books', label: '个人书库', icon: BookOpen }
  ] }
]

function App() {
  const [securityReady, setSecurityReady] = useState(() => Boolean(localStorage.getItem('workbench-password')))
  const [encryptionKey, setEncryptionKey] = useState(null)
  const [securityMode, setSecurityMode] = useState(() => localStorage.getItem('workbench-password') ? 'unlock' : 'setup')
  if (!securityReady || !encryptionKey) return <SecurityGate mode={securityMode} onSetup={async password => { const config = await createPasswordConfig(password); localStorage.setItem('workbench-password', JSON.stringify(config)); setEncryptionKey(await deriveMaterial(password, fromBase64(config.salt), 'workbench-encryption')); setSecurityReady(true) }} onUnlock={async password => { const key = await unlockWithPassword(password); if (!key) return false; setEncryptionKey(key); return true }} />
  return <WorkbenchApp encryptionKey={encryptionKey} />
}

function WorkbenchApp({ encryptionKey }) {
  const [active, setActive] = useState('overview')
  const [prompts, setPrompts] = useState(getInitialPrompts)
  const [links, setLinks] = useState(getInitialLinks)
  const [books, setBooks] = useState(getInitialBooks)
  const [apiKeys, setApiKeys] = useState(() => { try { return JSON.parse(localStorage.getItem('workbench-api-keys')) || [] } catch { return [] } })
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
  const [page, setPage] = useState(1)
  const [bookPage, setBookPage] = useState(1)
  const promptPageSize = useAdaptivePageSize('prompt')
  const bookPageSize = useAdaptivePageSize('book')

  useEffect(() => { localStorage.setItem('workbench-prompts', JSON.stringify(prompts)) }, [prompts])
  useEffect(() => { localStorage.setItem('workbench-links', JSON.stringify(links)) }, [links])
  useEffect(() => { localStorage.setItem('workbench-books', JSON.stringify(books)) }, [books])
  useEffect(() => { localStorage.setItem('workbench-api-keys', JSON.stringify(apiKeys)) }, [apiKeys])
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
    setModal(null); setToast(modal.mode === 'create' ? '提示词已创建' : '提示词已更新')
  }
  const deletePrompt = id => { setPrompts(prev => prev.filter(p => p.id !== id)); setToast('提示词已删除') }
  const copyPrompt = async item => { try { await navigator.clipboard.writeText(item.content); setToast('内容已复制到剪贴板') } catch { setToast('复制失败，请检查浏览器权限') } }
  const saveLink = link => { const normalized = { ...link, title: link.title.trim(), url: link.url.trim(), content: link.content.trim(), tags: link.tags.filter(Boolean) }; let safeUrl = false; try { const parsed = new URL(normalized.url); safeUrl = ['http:', 'https:'].includes(parsed.protocol) } catch { /* invalid URLs stay in the form */ } if (!normalized.title || !safeUrl) return setToast('请输入有效的 HTTP 或 HTTPS 网址'); setLinks(prev => link.id ? prev.map(item => item.id === link.id ? normalized : item) : [{ ...normalized, id: Date.now() }, ...prev]); setModal(null); setToast(link.id ? '网址已更新' : '网址已保存') }
  const deleteLink = id => { setLinks(prev => prev.filter(link => link.id !== id)); setToast('网址已删除') }
  const importBook = async event => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    const fileType = bookFileType(file.name)
    if (!BOOK_FILE_TYPES.includes(fileType)) return setToast('支持 PDF、EPUB、TXT、Markdown 和 HTML 文件')
    setBookImporting(true)
    try {
      const fileId = crypto.randomUUID()
      await saveBookFile(fileId, file)
      const title = file.name.replace(/\.[^.]+$/, '')
      setBooks(prev => [{ id: Date.now(), fileId, fileName: file.name, fileType, title, author: '', category: '', size: file.size, updatedAt: '刚刚' }, ...prev])
      setToast('书籍已导入本机书库')
    } catch { setToast('书籍导入失败，请重试') } finally { setBookImporting(false) }
  }
  const openEditBook = book => setModal({ mode: 'book-edit', item: { ...book } })
  const saveBook = book => {
    const normalized = { ...book, title: book.title.trim(), author: book.author.trim(), category: book.category.trim(), updatedAt: '刚刚' }
    if (!normalized.title) return setToast('请填写书名')
    setBooks(prev => book.id ? prev.map(item => item.id === book.id ? normalized : item) : [{ ...normalized, id: Date.now() }, ...prev])
    setModal(null); setToast(book.id ? '书籍已更新' : '书籍已加入书库')
  }
  const deleteBook = async book => { if (!window.confirm(`确定从书库删除“${book.title}”吗？`)) return; await deleteBookFile(book.fileId).catch(() => {}); setBooks(prev => prev.filter(item => item.id !== book.id)); setToast('书籍已删除') }
  const updateBookLocation = useCallback((bookId, location, textOffset) => {
    setBooks(prev => prev.map(item => item.id === bookId ? {
      ...item,
      ...(location ? { location } : {}),
      ...(typeof textOffset === 'number' ? { textOffset } : {})
    } : item))
  }, [])
  const saveApiKey = async record => { let requestUrl = ''; try { requestUrl = new URL(record.requestUrl.trim()).href } catch { return setToast('请输入有效的 HTTP 或 HTTPS 请求地址') } if (!['http:', 'https:'].includes(new URL(requestUrl).protocol)) return setToast('请求地址仅支持 HTTP 或 HTTPS'); if (!record.name.trim() || !record.provider.trim() || !record.value.trim()) return setToast('请填写名称、服务商和 API Key'); const encrypted = await encryptApiValue(encryptionKey, record.value.trim()); const saved = { id: record.id || Date.now(), name: record.name.trim(), provider: record.provider.trim(), requestUrl, encrypted, updatedAt: '刚刚' }; setApiKeys(prev => record.id ? prev.map(item => item.id === record.id ? saved : item) : [saved, ...prev]); setModal(null); setToast(record.id ? 'API Key 已更新' : 'API Key 已加密保存') }
  const deleteApiKey = id => { setApiKeys(prev => prev.filter(item => item.id !== id)); setToast('API Key 已删除') }
  const openSearchResult = result => {
    setReaderBook(null)
    setGlobalSearchOpen(false)
    setSidebarOpen(false)
    if (result.kind === 'prompt') { setQuery(result.title); setSelectedTag('全部'); setPage(1) }
    if (result.kind === 'book') { setBookQuery(result.title); setBookType('全部'); setBookPage(1) }
    setActive(result.section)
  }

  return <div className="app-shell">
    <aside className={`sidebar ${sidebarOpen ? 'is-open' : ''}`}>
      <div className="brand"><div className="brand-mark"><Grid2X2 size={17} strokeWidth={2.5} /></div><span>工作台</span><span className="brand-dot" /></div>
      <div className="workspace-switch"><div className="workspace-avatar">W</div><div><strong>个人空间</strong><span>本地工作区</span></div><ChevronDown size={15} /></div>
      <nav className="nav">
        {navGroups.map(group => <div className="nav-group" key={group.label}><div className="nav-label">{group.label}</div>{group.items.map(item => <button key={item.id} className={`nav-item ${active === item.id ? 'active' : ''}`} onClick={() => { setReaderBook(null); setActive(item.id); setSidebarOpen(false) }}><item.icon size={17} /><span>{item.label}</span>{item.id === 'prompts' && <span className="nav-count">{prompts.length}</span>}</button>)}</div>)}
      </nav>
       <div className="sidebar-footer"><button className={`nav-item ${active === 'settings' ? 'active' : ''}`} onClick={() => { setReaderBook(null); setActive('settings'); setSidebarOpen(false) }}><Settings2 size={17} /><span>设置</span></button></div>
    </aside>
    {sidebarOpen && <button className="backdrop" aria-label="关闭菜单" onClick={() => setSidebarOpen(false)} />}
    <main className="main-content">
      <header className="topbar"><button className="mobile-menu" onClick={() => setSidebarOpen(true)}><Menu size={20} /></button><div className="breadcrumbs"><span>工作台</span><span className="slash">/</span><strong>{active === 'overview' ? '概述' : active === 'prompts' ? '提示词库' : active === 'settings' ? '设置' : navGroups.flatMap(g => g.items).find(i => i.id === active)?.label}</strong></div><div className="topbar-actions"><div className="status"><span className="status-dot" />本地运行中</div><button className="icon-button global-search-trigger" title="全局搜索" aria-label="全局搜索" onClick={() => setGlobalSearchOpen(true)}><Search size={18} /></button><div className="top-avatar">C</div></div></header>
       {readerBook ? <BookReader book={readerBook} onClose={() => setReaderBook(null)} onLocation={updateBookLocation} /> : active === 'overview' ? <Overview prompts={prompts} links={links} apiKeys={apiKeys} onNavigate={setActive} onCopy={copyPrompt} /> : active === 'prompts' ? <PromptLibrary prompts={pagedPrompts} allPrompts={prompts} filteredCount={filtered.length} page={page} pageCount={pageCount} setPage={setPage} tags={tags} query={query} setQuery={setQuery} selectedTag={selectedTag} setSelectedTag={setSelectedTag} onCreate={openCreate} onEdit={openEdit} onDelete={deletePrompt} onCopy={copyPrompt} /> : active === 'links' ? <LinksLibrary links={links} onCreate={() => setModal({ mode: 'link-create', item: { title: '', url: '', content: '', tags: [] } })} onEdit={link => setModal({ mode: 'link-edit', item: { ...link, tags: [...link.tags] } })} onDelete={deleteLink} /> : active === 'keys' ? <ApiKeyLibrary apiKeys={apiKeys} encryptionKey={encryptionKey} onCreate={() => setModal({ mode: 'key-create', item: { name: '', provider: '', value: '', requestUrl: '' } })} onEdit={async record => { try { setModal({ mode: 'key-edit', item: { ...record, requestUrl: record.requestUrl || '', value: await decryptApiValue(encryptionKey, record.encrypted) } }) } catch { setToast('无法解密该 API Key') } }} onDelete={deleteApiKey} /> : active === 'books' ? <BookLibrary books={pagedBooks} allBooks={books} filteredCount={filteredBooks.length} page={bookPage} pageCount={bookPageCount} setPage={setBookPage} query={bookQuery} setQuery={setBookQuery} type={bookType} setType={setBookType} importing={bookImporting} onImport={importBook} onEdit={openEditBook} onDelete={deleteBook} onRead={setReaderBook} /> : active === 'apps' ? <AppLauncher /> : active === 'settings' ? <Placeholder title="设置" icon={Settings2} /> : <Placeholder title={navGroups.flatMap(g => g.items).find(i => i.id === active)?.label} icon={navGroups.flatMap(g => g.items).find(i => i.id === active)?.icon} />}
    </main>
      {modal?.mode === 'create' || modal?.mode === 'edit' ? <PromptModal modal={modal} onClose={() => setModal(null)} onSave={savePrompt} /> : null}
      {modal?.mode?.startsWith('link-') ? <LinkModal modal={modal} onClose={() => setModal(null)} onSave={saveLink} /> : null}
      {modal?.mode?.startsWith('key-') ? <ApiKeyModal modal={modal} onClose={() => setModal(null)} onSave={saveApiKey} /> : null}
      {modal?.mode?.startsWith('book-') ? <BookModal modal={modal} onClose={() => setModal(null)} onSave={saveBook} /> : null}
      {globalSearchOpen && <GlobalSearch prompts={prompts} links={links} apiKeys={apiKeys} books={books} onClose={() => setGlobalSearchOpen(false)} onSelect={openSearchResult} />}
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
  { key: 'module-settings', kind: 'module', section: 'settings', title: '设置', detail: '工作台设置', keywords: 'settings 配置', icon: Settings2 }
]

function GlobalSearch({ prompts, links, apiKeys, books, onClose, onSelect }) {
  const [query, setQuery] = useState('')
  const [shortcuts, setShortcuts] = useState([])

  useEffect(() => {
    const handleEscape = event => { if (event.key === 'Escape') onClose() }
    window.addEventListener('keydown', handleEscape)
    fetch('/api/shortcuts').then(response => response.ok ? response.json() : null).then(result => setShortcuts(Array.isArray(result?.shortcuts) ? result.shortcuts : [])).catch(() => {})
    return () => window.removeEventListener('keydown', handleEscape)
  }, [onClose])

  const results = useMemo(() => {
    const entries = [
      ...searchModules,
      ...prompts.map(item => ({ key: `prompt-${item.id}`, kind: 'prompt', section: 'prompts', title: item.title, detail: item.content, keywords: item.tags.join(' '), type: '提示词', icon: Sparkles })),
      ...links.map(item => ({ key: `link-${item.id}`, kind: 'link', section: 'links', title: item.title, detail: item.content || item.url, keywords: `${item.url} ${item.tags.join(' ')}`, type: '网址', icon: ExternalLink })),
      ...apiKeys.map(item => ({ key: `key-${item.id}`, kind: 'api-key', section: 'keys', title: item.name, detail: `${item.provider || '未设置服务商'} · ${item.requestUrl || '未设置请求地址'}`, keywords: `${item.provider || ''} ${item.requestUrl || ''}`, type: 'API Key', icon: KeyRound })),
      ...books.map(item => ({ key: `book-${item.id}`, kind: 'book', section: 'books', title: item.title, detail: item.author || item.fileName, keywords: `${item.category || ''} ${item.fileName || ''} ${item.fileType || ''}`, type: '书籍', icon: BookOpen })),
      ...shortcuts.map(item => ({ key: `app-${item.id}`, kind: 'app', section: 'apps', title: item.name, detail: item.fileName, keywords: `${item.extension || ''} 快捷方式 应用`, type: '应用', icon: AppWindow }))
    ]
    const term = query.trim().toLocaleLowerCase()
    if (!term) return entries.slice(0, 12)
    return entries.filter(item => `${item.title} ${item.detail} ${item.keywords || ''} ${item.type || ''}`.toLocaleLowerCase().includes(term)).slice(0, 30)
  }, [apiKeys, books, links, prompts, query, shortcuts])

  return <div className="global-search-backdrop" onMouseDown={event => { if (event.target === event.currentTarget) onClose() }}>
    <section className="global-search-panel" role="dialog" aria-modal="true" aria-label="全局搜索">
      <div className="global-search-input"><Search size={19} /><input autoFocus value={query} onChange={event => setQuery(event.target.value)} onKeyDown={event => { if (event.key === 'Enter' && results[0]) onSelect(results[0]) }} placeholder="搜索模块、提示词、网址、API Key、书籍或应用..." /><button className="icon-button" aria-label="关闭搜索" onClick={onClose}><X size={18} /></button></div>
      <div className="global-search-results">
        {results.map(item => <button className="global-search-result" key={item.key} onClick={() => onSelect(item)}><span className="global-search-result-icon"><item.icon size={17} /></span><span className="global-search-result-main"><strong>{item.title}</strong><span>{item.detail}</span></span><span className="global-search-result-type">{item.type || '模块'}</span><ArrowUpRight size={15} /></button>)}
        {results.length === 0 && <div className="global-search-empty"><Search size={22} /><strong>没有找到相关内容</strong><span>尝试使用标题、标签、网址、服务商或文件名搜索</span></div>}
      </div>
    </section>
  </div>
}

function Overview({ prompts, onNavigate, onCopy }) { return <section className="page overview-page"><div className="page-heading"><div><p className="eyebrow">GOOD MORNING, CC</p><h1>今天也高效工作。</h1><p className="subheading">把常用的工具和资源，放在触手可及的地方。</p></div><div className="date-chip">8月 21日，星期五 <span>·</span> 09:48</div></div><div className="quick-grid"><button className="quick-card accent" onClick={() => onNavigate('prompts')}><div className="quick-icon"><Sparkles size={19} /></div><div><strong>提示词库</strong><span>快速查找和复用你的提示词</span></div><ArrowUpRight size={17} /></button><button className="quick-card" onClick={() => onNavigate('apps')}><div className="quick-icon neutral"><Zap size={19} /></div><div><strong>应用启动器</strong><span>一键打开常用软件组合</span></div><ArrowUpRight size={17} /></button><button className="quick-card" onClick={() => onNavigate('links')}><div className="quick-icon neutral"><ArrowUpRight size={19} /></div><div><strong>网址收藏</strong><span>保存常用网站和工作资料</span></div><ArrowUpRight size={17} /></button></div><div className="section-head"><div><h2>最近使用的提示词</h2><span>最近编辑和使用的内容</span></div><button className="text-button" onClick={() => onNavigate('prompts')}>查看全部 <ArrowUpRight size={15} /></button></div><div className="recent-list">{prompts.slice(0, 3).map(item => <div className="recent-row" key={item.id}><div className="recent-symbol"><Clipboard size={16} /></div><div className="recent-info"><strong>{item.title}</strong><span>{item.content}</span></div><div className="row-tags">{item.tags.slice(0, 2).map(tag => <span key={tag}>{tag}</span>)}</div><span className="recent-time">{item.updatedAt}</span><button className="row-copy" title="复制" onClick={() => onCopy(item)}><Copy size={16} /></button></div>)}</div><div className="overview-bottom"><div className="tip-block"><div className="tip-icon"><Sparkles size={18} /></div><div><strong>让工作台适应你的习惯</strong><p>你可以在设置中调整默认打开页面、主题和快捷键。</p></div><button className="small-button">去设置 <ArrowUpRight size={14} /></button></div><div className="local-note"><KeyRound size={16} /><span>所有数据均保存在本地设备，安全且私密</span></div></div></section> }

function PromptLibrary({ prompts, allPrompts, filteredCount, page, pageCount, setPage, tags, query, setQuery, selectedTag, setSelectedTag, onCreate, onEdit, onDelete, onCopy }) { return <section className="page prompts-page"><div className="page-heading library-heading"><div><p className="eyebrow">RESOURCE CENTER</p><h1>提示词库</h1><p className="subheading">沉淀你的思考方式，让每一次提问都更有质量。</p></div><button className="primary-button" onClick={onCreate}><Plus size={17} />新建提示词</button></div><div className="library-toolbar"><div className="search-box"><Search size={17} /><input value={query} onChange={e => setQuery(e.target.value)} placeholder="搜索标题、内容或标签..." /><kbd>⌘ K</kbd></div><div className="tag-filter">{tags.slice(0, 5).map(tag => <button key={tag} className={selectedTag === tag ? 'selected' : ''} onClick={() => setSelectedTag(tag)}>{tag}</button>)}{tags.length > 5 && <button className="tag-more"><MoreHorizontal size={16} /></button>}</div></div><div className="library-meta"><span>全部提示词 <strong>{allPrompts.length}</strong></span><span className="meta-divider" /><span>{filteredCount === allPrompts.length ? '按最近编辑排序' : `筛选出 ${filteredCount} 条结果`}</span></div><div className="prompt-grid">{prompts.map(item => <PromptCard key={item.id} item={item} onEdit={onEdit} onDelete={onDelete} onCopy={onCopy} />)}{prompts.length === 0 && <div className="empty-state"><Search size={24} /><strong>没有找到匹配的提示词</strong><span>试试其他关键词或标签</span></div>}</div>{pageCount > 1 && <ResourcePagination page={page} pageCount={pageCount} setPage={setPage} />}</section> }

function SecurityGate({ mode, onSetup, onUnlock }) {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const submit = async event => { event.preventDefault(); setError(''); if (password.length < 8) return setError('密码至少需要 8 位字符'); if (mode === 'setup' && password !== confirm) return setError('两次输入的密码不一致'); const ok = mode === 'setup' ? await onSetup(password) : await onUnlock(password); if (mode === 'unlock' && !ok) setError('密码不正确，请重试') }
  return <div className="security-screen"><div className="security-panel"><div className="security-mark"><LockKeyhole size={25} /></div><p className="eyebrow">PERSONAL WORKSPACE</p><h1>{mode === 'setup' ? '设置工作台密码' : '解锁你的工作台'}</h1><p className="security-copy">{mode === 'setup' ? '密码只保存在本机，用于保护工作台和 API Keys。' : '输入密码后解锁本机数据。'}</p><form onSubmit={submit}><label className="security-label">密码<input type="password" value={password} onChange={event => setPassword(event.target.value)} autoFocus placeholder="至少 8 位字符" /></label>{mode === 'setup' && <label className="security-label">确认密码<input type="password" value={confirm} onChange={event => setConfirm(event.target.value)} placeholder="再次输入密码" /></label>}{error && <div className="security-error">{error}</div>}<button className="primary-button security-submit" type="submit">{mode === 'setup' ? <><ShieldCheck size={17} />创建本地密码</> : <><UnlockKeyhole size={17} />解锁工作台</>}</button></form><div className="security-foot"><ShieldCheck size={14} />数据仅存储在当前设备</div></div></div>
}

const BOOK_TYPES = ['全部', '.pdf', '.epub', '.txt', '.md', '.html']
const formatFileSize = size => size < 1024 * 1024 ? `${Math.max(1, Math.round(size / 1024))} KB` : `${(size / 1024 / 1024).toFixed(1)} MB`

function BookLibrary({ books, allBooks, filteredCount, page, pageCount, setPage, query, setQuery, type, setType, importing, onImport, onEdit, onDelete, onRead }) {
  return <section className="page resource-page book-library-page">
    <div className="page-heading library-heading"><div><p className="eyebrow">PERSONAL LIBRARY</p><h1>个人书库</h1><p className="subheading">导入本地书籍，在工作台里直接阅读。</p></div><label className={`primary-button book-import-button ${importing ? 'is-loading' : ''}`}><Upload size={17} />{importing ? '正在导入...' : '导入书籍'}<input type="file" accept={BOOK_FILE_TYPES.join(',')} onChange={onImport} disabled={importing} /></label></div>
    <div className="library-toolbar book-toolbar"><div className="search-box"><Search size={17} /><input value={query} onChange={event => setQuery(event.target.value)} placeholder="搜索书名、作者或文件名..." /></div><div className="tag-filter">{BOOK_TYPES.map(option => <button key={option} className={type === option ? 'selected' : ''} onClick={() => setType(option)}>{option === '全部' ? '全部' : option.replace('.', '').toUpperCase()}</button>)}</div></div>
    <div className="library-meta"><span>本地书籍 <strong>{allBooks.length}</strong></span><span className="meta-divider" /><span>{filteredCount === allBooks.length ? '按导入时间排序' : `筛选出 ${filteredCount} 本`}</span></div>
    <div className="book-grid">{books.map(book => <BookCard key={book.id} book={book} onEdit={onEdit} onDelete={onDelete} onRead={onRead} />)}{books.length === 0 && <div className="empty-state"><BookOpen size={24} /><strong>{allBooks.length ? '没有找到匹配的书籍' : '还没有导入书籍'}</strong><span>{allBooks.length ? '试试其他关键词或文件类型' : '点击右上角“导入书籍”选择本机文件'}</span></div>}</div>
    {pageCount > 1 && <ResourcePagination page={page} pageCount={pageCount} setPage={setPage} />}
  </section>
}

function BookCard({ book, onEdit, onDelete, onRead }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const run = action => { setMenuOpen(false); action() }
  return <article className="book-card"><div className="book-card-top"><div className="book-cover"><BookOpen size={20} /></div><div className="book-card-top-actions"><span className="book-file-type">{book.fileType.replace('.', '').toUpperCase()}</span><div className="card-menu"><button className="more-button" title="更多操作" aria-label={`打开 ${book.title} 操作菜单`} aria-expanded={menuOpen} onClick={() => setMenuOpen(open => !open)}><MoreHorizontal size={18} /></button>{menuOpen && <div className="card-menu-popover" role="menu"><button role="menuitem" onClick={() => run(() => onEdit(book))}><Pencil size={15} />编辑</button><button role="menuitem" className="delete-action" onClick={() => run(() => onDelete(book))}><Trash2 size={15} />删除</button></div>}</div></div></div><h3>{book.title}</h3><p className="book-author">{book.author || '未填写作者'}</p>{book.category && <span className="book-category">{book.category}</span>}<p className="book-file-name">{book.fileName} · {formatFileSize(book.size || 0)}</p><div className="book-card-footer"><span>导入于 {book.updatedAt}</span><div className="book-actions"><button className="book-read-button" onClick={() => onRead(book)} title="阅读"><BookOpen size={15} />阅读</button></div></div></article>
}

function LinksLibrary({ links, onCreate, onEdit, onDelete }) { const [page, setPage] = useState(1); const pageSize = useAdaptivePageSize('resource'); const pageCount = Math.max(1, Math.ceil(links.length / pageSize)); useEffect(() => { if (page > pageCount) setPage(pageCount) }, [page, pageCount]); const visibleLinks = links.slice((page - 1) * pageSize, page * pageSize); return <section className="page resource-page"><div className="page-heading library-heading"><div><p className="eyebrow">RESOURCE CENTER</p><h1>网址收藏</h1><p className="subheading">把常用网站整理好，随时打开。</p></div><button className="primary-button" onClick={onCreate}><Plus size={17} />新建网址</button></div><div className="resource-meta">共 {links.length} 个网址</div><div className="resource-list">{visibleLinks.map(link => <article className="resource-row" key={link.id}><div className="resource-favicon"><ExternalLink size={17} /></div><div className="resource-main"><strong>{link.title}</strong><span>{link.content || link.url}</span><small>{link.url}</small></div><div className="row-tags">{link.tags.map(tag => <span key={tag}>{tag}</span>)}</div><div className="resource-actions"><a href={link.url} target="_blank" rel="noreferrer" title="打开网址"><ExternalLink size={16} /></a><button onClick={() => onEdit(link)} title="编辑"><Pencil size={16} /></button><button onClick={() => onDelete(link.id)} title="删除"><Trash2 size={16} /></button></div></article>)}{links.length === 0 && <div className="empty-state"><ExternalLink size={24} /><strong>还没有网址收藏</strong><span>添加你的第一个常用网址</span></div>}</div>{pageCount > 1 && <ResourcePagination page={page} pageCount={pageCount} setPage={setPage} />}</section> }

function ApiKeyLibrary({ apiKeys, encryptionKey, onCreate, onEdit, onDelete }) { const [visible, setVisible] = useState({}); const [values, setValues] = useState({}); const [page, setPage] = useState(1); const pageSize = useAdaptivePageSize('resource'); const pageCount = Math.max(1, Math.ceil(apiKeys.length / pageSize)); useEffect(() => { if (page > pageCount) setPage(pageCount) }, [page, pageCount]); const reveal = async record => { if (values[record.id]) return setVisible(prev => ({ ...prev, [record.id]: !prev[record.id] })); try { const value = await decryptApiValue(encryptionKey, record.encrypted); setValues(prev => ({ ...prev, [record.id]: value })); setVisible(prev => ({ ...prev, [record.id]: true })) } catch { /* corrupted records stay masked */ } }; const visibleKeys = apiKeys.slice((page - 1) * pageSize, page * pageSize); return <section className="page resource-page"><div className="page-heading library-heading"><div><p className="eyebrow">RESOURCE CENTER</p><h1>API Keys</h1><p className="subheading">使用 AES-256-GCM 加密保存在本机。</p></div><button className="primary-button" onClick={onCreate}><Plus size={17} />添加 API Key</button></div><div className="key-notice"><ShieldCheck size={17} /><span>密钥内容不会明文写入浏览器存储，只有解锁后才会在内存中解密。</span></div><div className="resource-meta">共 {apiKeys.length} 个 API Key</div><div className="resource-list">{visibleKeys.map(record => <article className="resource-row key-row" key={record.id}><div className="resource-favicon key-favicon"><KeyRound size={17} /></div><div className="resource-main"><strong>{record.name}</strong><span>{record.provider || '未设置服务商'} · {record.requestUrl || '未设置请求地址'}</span><div className="masked-key">{visible[record.id] ? values[record.id] : '••••••••••••••••••••'}</div></div><div className="resource-actions"><button onClick={() => reveal(record)} title={visible[record.id] ? '隐藏' : '显示'}>{visible[record.id] ? <EyeOff size={16} /> : <Eye size={16} />}</button><button onClick={() => onEdit(record)} title="编辑"><Pencil size={16} /></button><button onClick={() => onDelete(record.id)} title="删除"><Trash2 size={16} /></button></div></article>)}{apiKeys.length === 0 && <div className="empty-state"><KeyRound size={24} /><strong>还没有 API Keys</strong><span>添加后会使用 AES-256-GCM 加密</span></div>}</div>{pageCount > 1 && <ResourcePagination page={page} pageCount={pageCount} setPage={setPage} />}</section> }

function ResourcePagination({ page, pageCount, setPage }) { const visibleCount = Math.min(5, pageCount); const start = Math.min(Math.max(1, page - Math.floor(visibleCount / 2)), pageCount - visibleCount + 1); const numbers = Array.from({ length: visibleCount }, (_, index) => start + index); return <div className="pagination resource-pagination" aria-label="分页"><button className="page-arrow" disabled={page === 1} onClick={() => setPage(page - 1)}>上一页</button><div className="page-numbers">{numbers.map(number => <button key={number} className={page === number ? 'active' : ''} onClick={() => setPage(number)} aria-label={`第 ${number} 页`}>{number}</button>)}</div><button className="page-arrow" disabled={page === pageCount} onClick={() => setPage(page + 1)}>下一页</button></div> }

function PromptCard({ item, onEdit, onDelete, onCopy }) { const [menuOpen, setMenuOpen] = useState(false); const run = action => { setMenuOpen(false); action() }; return <article className="prompt-card"><div className="prompt-card-top"><div className="prompt-type"><Sparkles size={15} />提示词</div><div className="card-menu"><button className="more-button" title="更多操作" aria-label={`打开 ${item.title} 操作菜单`} aria-expanded={menuOpen} onClick={() => setMenuOpen(open => !open)}><MoreHorizontal size={18} /></button>{menuOpen && <div className="card-menu-popover" role="menu"><button role="menuitem" onClick={() => run(() => onCopy(item))}><Copy size={15} />复制</button><button role="menuitem" onClick={() => run(() => onEdit(item))}><Pencil size={15} />编辑</button><button role="menuitem" className="delete-action" onClick={() => run(() => onDelete(item.id))}><Trash2 size={15} />删除</button></div>}</div></div><h3>{item.title}</h3><p>{item.content}</p><div className="prompt-card-footer"><div className="card-tags">{item.tags.map(tag => <span key={tag}>{tag}</span>)}</div><span className="card-date">{item.updatedAt}</span></div></article> }

function PromptModal({ modal, onClose, onSave }) { const [item, setItem] = useState(modal.item); const [tagInput, setTagInput] = useState(''); const set = (key, value) => setItem(prev => ({ ...prev, [key]: value })); const addTag = e => { if ((e.key === 'Enter' || e.key === ',') && tagInput.trim()) { e.preventDefault(); if (!item.tags.includes(tagInput.trim())) set('tags', [...item.tags, tagInput.trim()]); setTagInput('') } }; return <div className="modal-backdrop"><div className="modal"><div className="modal-header"><div><span className="modal-kicker">{modal.mode === 'create' ? 'NEW RESOURCE' : 'EDIT RESOURCE'}</span><h2>{modal.mode === 'create' ? '新建提示词' : '编辑提示词'}</h2></div><button className="icon-button" onClick={onClose}><X size={19} /></button></div><div className="form-field"><label>标题</label><input autoFocus value={item.title} onChange={e => set('title', e.target.value)} placeholder="例如：产品需求拆解" /></div><div className="form-field"><label>内容</label><textarea value={item.content} onChange={e => set('content', e.target.value)} placeholder="输入提示词内容..." rows="6" /></div><div className="form-field"><label>标签 <span>用 Enter 添加</span></label><div className="tag-input">{item.tags.map(tag => <span key={tag}>{tag}<button onClick={() => set('tags', item.tags.filter(t => t !== tag))}><X size={12} /></button></span>)}<input value={tagInput} onChange={e => setTagInput(e.target.value)} onKeyDown={addTag} placeholder={item.tags.length ? '' : '添加标签'} /></div></div><div className="modal-footer"><button className="secondary-button" onClick={onClose}>取消</button><button className="primary-button" onClick={() => onSave(item)}><Check size={16} />保存提示词</button></div></div></div> }

function LinkModal({ modal, onClose, onSave }) { const [item, setItem] = useState(modal.item); const [tagInput, setTagInput] = useState(''); const set = (key, value) => setItem(prev => ({ ...prev, [key]: value })); const addTag = event => { if ((event.key === 'Enter' || event.key === ',') && tagInput.trim()) { event.preventDefault(); if (!item.tags.includes(tagInput.trim())) set('tags', [...item.tags, tagInput.trim()]); setTagInput('') } }; return <div className="modal-backdrop"><div className="modal"><div className="modal-header"><div><span className="modal-kicker">{modal.mode === 'link-create' ? 'NEW BOOKMARK' : 'EDIT BOOKMARK'}</span><h2>{modal.mode === 'link-create' ? '新建网址' : '编辑网址'}</h2></div><button className="icon-button" onClick={onClose}><X size={19} /></button></div><div className="form-field"><label>标题</label><input autoFocus value={item.title} onChange={event => set('title', event.target.value)} placeholder="例如：OpenAI Platform" /></div><div className="form-field"><label>网址</label><input value={item.url} onChange={event => set('url', event.target.value)} placeholder="https://" /></div><div className="form-field"><label>备注</label><input value={item.content} onChange={event => set('content', event.target.value)} placeholder="简短描述这个网址" /></div><div className="form-field"><label>标签 <span>用 Enter 添加</span></label><div className="tag-input">{item.tags.map(tag => <span key={tag}>{tag}<button onClick={() => set('tags', item.tags.filter(t => t !== tag))}><X size={12} /></button></span>)}<input value={tagInput} onChange={event => setTagInput(event.target.value)} onKeyDown={addTag} placeholder={item.tags.length ? '' : '添加标签'} /></div></div><div className="modal-footer"><button className="secondary-button" onClick={onClose}>取消</button><button className="primary-button" onClick={() => onSave(item)}><Check size={16} />保存网址</button></div></div></div> }

function BookModal({ modal, onClose, onSave }) {
  const [item, setItem] = useState(modal.item)
  const set = (key, value) => setItem(prev => ({ ...prev, [key]: value }))
  return <div className="modal-backdrop"><div className="modal book-modal"><div className="modal-header"><div><span className="modal-kicker">EDIT BOOK INFO</span><h2>编辑书籍信息</h2></div><button className="icon-button" onClick={onClose}><X size={19} /></button></div><div className="book-file-note"><BookOpen size={16} />{item.fileName}</div><div className="form-field"><label>书名</label><input autoFocus value={item.title} onChange={event => set('title', event.target.value)} placeholder="书名" /></div><div className="form-field"><label>作者</label><input value={item.author || ''} onChange={event => set('author', event.target.value)} placeholder="作者（可选）" /></div><div className="form-field"><label>分类</label><input value={item.category || ''} onChange={event => set('category', event.target.value)} placeholder="分类（可选）" /></div><div className="modal-footer"><button className="secondary-button" onClick={onClose}>取消</button><button className="primary-button" onClick={() => onSave(item)}><Check size={16} />保存信息</button></div></div></div>
}

function BookReader({ book, onClose, onLocation }) {
  const [url, setUrl] = useState('')
  const [text, setText] = useState('')
  const [error, setError] = useState('')
  const [readerBusy, setReaderBusy] = useState(false)
  const epubRef = useRef(null)
  const epubBookRef = useRef(null)
  const renditionRef = useRef(null)
  const textReaderRef = useRef(null)
  const initialLocationRef = useRef(book.location || '')
  useEffect(() => {
    let objectUrl = ''
    let disposed = false
    const load = async () => {
      try {
        const file = await readBookFile(book.fileId)
        if (!file || disposed) return setError('找不到本地书籍文件，请重新导入')
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
      } catch { if (!disposed) setError('无法打开这本书，请确认文件没有损坏') }
    }
    load()
    return () => { disposed = true; renditionRef.current = null; if (objectUrl) URL.revokeObjectURL(objectUrl); epubBookRef.current?.destroy?.() }
  }, [book.id, book.fileId, book.fileType, book.title, book.fileName, onLocation])
  useEffect(() => {
    if (book.fileType === '.epub' || !text || !textReaderRef.current || typeof book.textOffset !== 'number') return
    const target = textReaderRef.current
    target.scrollTop = Math.max(0, Math.min(target.scrollHeight - target.clientHeight, book.textOffset))
  }, [book.fileType, book.textOffset, text])
  const isPdf = book.fileType === '.pdf'
  const isHtml = book.fileType === '.html' || book.fileType === '.htm'
  const movePage = async direction => { if (book.fileType !== '.epub' || !renditionRef.current || readerBusy) return; setReaderBusy(true); try { await renditionRef.current[direction]() } catch { setError('翻页失败，请重新打开这本书') } finally { setReaderBusy(false) } }
  const updateTextPosition = event => { const target = event.currentTarget; onLocation?.(book.id, '', target.scrollTop) }
  return <section className="page reader-page"><div className="reader-page-header"><button className="reader-back-button" onClick={onClose}><ArrowLeft size={17} />返回书库</button><div className="reader-title"><span className="reader-kicker">READING</span><h1>{book.title}</h1><span>{book.fileName}</span></div></div><main className={`reader-content ${isPdf ? 'pdf-reader' : ''}`}>{error ? <div className="reader-error"><BookOpen size={25} /><strong>{error}</strong></div> : book.fileType === '.epub' ? <div ref={epubRef} className="epub-reader" /> : isPdf ? <iframe title={`阅读 ${book.title}`} src={url} /> : isHtml ? <iframe title={`阅读 ${book.title}`} src={url} sandbox="" /> : <article ref={textReaderRef} className="text-reader" onScroll={updateTextPosition}>{text}</article>}</main><footer className="reader-controls"><button className="secondary-button" onClick={() => movePage('prev')} disabled={book.fileType !== '.epub' || readerBusy}><ArrowLeft size={15} />上一页</button><span>{book.fileType === '.epub' ? '已保存阅读位置' : '阅读中'}</span><button className="secondary-button" onClick={() => movePage('next')} disabled={book.fileType !== '.epub' || readerBusy}>下一页<ArrowLeft className="next-page-icon" size={15} /></button></footer></section>
}

function ApiKeyModal({ modal, onClose, onSave }) { const [item, setItem] = useState(modal.item); const set = (key, value) => setItem(prev => ({ ...prev, [key]: value })); return <div className="modal-backdrop"><div className="modal"><div className="modal-header"><div><span className="modal-kicker">{modal.mode === 'key-create' ? 'NEW SECRET' : 'EDIT SECRET'}</span><h2>{modal.mode === 'key-create' ? '添加 API Key' : '编辑 API Key'}</h2></div><button className="icon-button" onClick={onClose}><X size={19} /></button></div><div className="key-modal-note"><LockKeyhole size={16} />仅 API Key 字段会使用 AES-256-GCM 加密</div><div className="form-field"><label>名称</label><input autoFocus value={item.name} onChange={event => set('name', event.target.value)} placeholder="例如：OpenAI Production" /></div><div className="form-field"><label>服务商</label><input value={item.provider} onChange={event => set('provider', event.target.value)} placeholder="例如：OpenAI" /></div><div className="form-field"><label>API Key</label><input type="password" value={item.value} onChange={event => set('value', event.target.value)} placeholder="粘贴你的 API Key" /></div><div className="form-field"><label>请求地址</label><input value={item.requestUrl} onChange={event => set('requestUrl', event.target.value)} placeholder="https://api.example.com/v1" /></div><div className="modal-footer"><button className="secondary-button" onClick={onClose}>取消</button><button className="primary-button" onClick={() => onSave(item)}><ShieldCheck size={16} />加密保存</button></div></div></div> }

const fileToBase64 = async file => {
  const bytes = new Uint8Array(await file.arrayBuffer())
  let binary = ''
  for (let offset = 0; offset < bytes.length; offset += 0x8000) binary += String.fromCharCode(...bytes.subarray(offset, offset + 0x8000))
  return btoa(binary)
}

function AppLauncher() {
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
      const response = await fetch('/api/shortcuts')
      const result = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(result.error || '无法读取本机快捷方式')
      setShortcuts(Array.isArray(result.shortcuts) ? result.shortcuts : [])
    } catch (loadError) {
      setError(loadError.message || '无法连接本机快捷方式服务')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadShortcuts() }, [])

  const addShortcut = async event => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    const extension = file.name.slice(file.name.lastIndexOf('.')).toLowerCase()
    if (!['.lnk', '.url'].includes(extension)) return setError('请选择 Windows .lnk 或 .url 快捷方式')
    setSaving(true); setError(''); setMessage('')
    try {
      const response = await fetch('/api/shortcuts', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: file.name.replace(/\.(lnk|url)$/i, ''), fileName: file.name, data: await fileToBase64(file) }) })
      const result = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(result.error || '快捷方式保存失败')
      setShortcuts(prev => [...prev, result.shortcut])
      setMessage('快捷方式已添加')
    } catch (saveError) {
      setError(saveError.message || '快捷方式保存失败')
    } finally {
      setSaving(false)
    }
  }

  const launchShortcut = async id => {
    setBusyId(id); setError(''); setMessage('')
    try {
      const response = await fetch(`/api/shortcuts/${encodeURIComponent(id)}/launch`, { method: 'POST' })
      const result = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(result.error || '启动失败')
      setMessage('启动指令已发送')
    } catch (launchError) {
      setError(launchError.message || '启动失败')
    } finally {
      setBusyId('')
    }
  }

  const launchAll = async () => {
    if (!shortcuts.length || busyId) return
    setBusyId('all'); setError(''); setMessage('')
    try {
      await Promise.all(shortcuts.map(async shortcut => {
        const response = await fetch(`/api/shortcuts/${encodeURIComponent(shortcut.id)}/launch`, { method: 'POST' })
        const result = await response.json().catch(() => ({}))
        if (!response.ok) throw new Error(`${shortcut.name}: ${result.error || '启动失败'}`)
      }))
      setMessage(`已发送 ${shortcuts.length} 个应用的启动指令`)
    } catch (launchError) {
      setError(launchError.message || '部分应用启动失败')
    } finally {
      setBusyId('')
    }
  }

  const removeShortcut = async shortcut => {
    if (!window.confirm(`确定删除“${shortcut.name}”吗？`)) return
    setError(''); setMessage('')
    try {
      const response = await fetch(`/api/shortcuts/${encodeURIComponent(shortcut.id)}`, { method: 'DELETE' })
      const result = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(result.error || '删除失败')
      setShortcuts(prev => prev.filter(item => item.id !== shortcut.id))
      setMessage('快捷方式已删除')
    } catch (removeError) {
      setError(removeError.message || '删除失败')
    }
  }

  return <section className="page resource-page app-launcher-page">
    <div className="page-heading library-heading">
      <div><p className="eyebrow">LOCAL TOOLS</p><h1>应用启动器</h1><p className="subheading">选择本机快捷方式，点击一次即可启动常用软件。</p></div>
      <div className="app-launcher-actions">
        <button className="secondary-button app-launch-all" onClick={launchAll} disabled={!shortcuts.length || loading || Boolean(busyId)}><Play size={16} />{busyId === 'all' ? '启动中...' : '全部启动'}</button>
        <label className={`primary-button shortcut-picker ${saving ? 'is-loading' : ''}`}>
          <Upload size={17} />{saving ? '正在保存...' : '选择快捷方式'}
          <input ref={pickerRef} type="file" accept=".lnk,.url" onChange={addShortcut} disabled={saving} />
        </label>
      </div>
    </div>
    <div className="app-launcher-notice"><FolderOpen size={17} /><span>快捷方式仅保存在本机工作区，启动操作由本地服务执行。</span><button className="icon-button" title="刷新列表" onClick={loadShortcuts} disabled={loading}><RefreshCw size={16} /></button></div>
    {error && <div className="app-launcher-error">{error}</div>}
    {message && !error && <div className="app-launcher-message"><Check size={15} />{message}</div>}
    {loading ? <div className="app-launcher-loading"><RefreshCw size={19} />正在读取快捷方式...</div> : shortcuts.length === 0 ? <div className="empty-state app-empty-state"><AppWindow size={24} /><strong>还没有应用快捷方式</strong><span>选择一个 .lnk 或 .url 文件开始使用</span><button className="text-button" onClick={() => pickerRef.current?.click()}><Upload size={15} />选择第一个快捷方式</button></div> : <><div className="app-grid">{shortcuts.slice((page - 1) * appPageSize, page * appPageSize).map(shortcut => <article className="app-card" key={shortcut.id}><div className="app-card-icon"><AppWindow size={20} /></div><div className="app-card-main"><strong>{shortcut.name}</strong><span>{shortcut.fileName}</span><small>{shortcut.extension.toUpperCase()} · 本机快捷方式</small></div><div className="app-card-actions"><button className="app-launch-button" onClick={() => launchShortcut(shortcut.id)} disabled={Boolean(busyId)}><Play size={15} />{busyId === shortcut.id ? '启动中' : '启动'}</button><button className="resource-delete-button" title="删除快捷方式" onClick={() => removeShortcut(shortcut)} disabled={Boolean(busyId)}><Trash2 size={16} /></button></div></article>)}</div>{pageCount > 1 && <ResourcePagination page={page} pageCount={pageCount} setPage={setPage} />}</>}
  </section>
}

function Placeholder({ title, icon: Icon }) { return <section className="page placeholder-page"><div className="placeholder-icon">{Icon && <Icon size={28} />}</div><h1>{title}</h1><p>这个模块将在后续版本中开放。</p><span>先把你的工作台骨架搭好，再逐步加入更多能力。</span></section> }

createRoot(document.getElementById('root')).render(<App />)
