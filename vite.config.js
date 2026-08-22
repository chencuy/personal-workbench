import { promises as fs } from 'node:fs'
import path from 'node:path'
import { randomUUID } from 'node:crypto'
import { spawn } from 'node:child_process'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const DATA_DIR = path.resolve(process.cwd(), '.workbench-data')
const SHORTCUT_DIR = path.join(DATA_DIR, 'shortcuts')
const SHORTCUT_INDEX = path.join(DATA_DIR, 'shortcuts.json')
const ALLOWED_EXTENSIONS = new Set(['.lnk', '.url'])
const MAX_BODY_SIZE = 8 * 1024 * 1024

const sendJson = (response, status, payload) => {
  response.statusCode = status
  response.setHeader('Content-Type', 'application/json; charset=utf-8')
  response.end(JSON.stringify(payload))
}

const readJsonBody = request => new Promise((resolve, reject) => {
  let size = 0
  const chunks = []
  request.on('data', chunk => {
    size += chunk.length
    if (size > MAX_BODY_SIZE) {
      reject(new Error('请求体过大'))
      request.destroy()
      return
    }
    chunks.push(chunk)
  })
  request.on('end', () => {
    try { resolve(JSON.parse(Buffer.concat(chunks).toString('utf8'))) } catch { reject(new Error('请求数据格式无效')) }
  })
  request.on('error', reject)
})

const readShortcuts = async () => {
  try {
    const value = JSON.parse(await fs.readFile(SHORTCUT_INDEX, 'utf8'))
    return Array.isArray(value) ? value : []
  } catch {
    return []
  }
}

const writeShortcuts = shortcuts => fs.writeFile(SHORTCUT_INDEX, JSON.stringify(shortcuts, null, 2), 'utf8')

const normalizeName = value => {
  const name = String(value || '').trim().replace(/[\\/:*?"<>|]/g, ' ')
  return name.slice(0, 80) || '未命名应用'
}

const extensionFor = value => {
  const extension = path.extname(String(value || '')).toLowerCase()
  return ALLOWED_EXTENSIONS.has(extension) ? extension : ''
}

const launchShortcut = filePath => new Promise((resolve, reject) => {
  if (process.platform !== 'win32') return reject(new Error('应用启动器当前仅支持 Windows'))
  const child = spawn(
    'powershell.exe',
    ['-NoLogo', '-NoProfile', '-NonInteractive', '-Command', '$ErrorActionPreference = "Stop"; $shortcut = [Environment]::GetEnvironmentVariable("WORKBENCH_SHORTCUT_PATH"); Start-Process -FilePath $shortcut'],
    {
      windowsHide: true,
      stdio: ['ignore', 'ignore', 'pipe'],
      env: { ...process.env, WORKBENCH_SHORTCUT_PATH: filePath }
    }
  )
  let errorOutput = ''
  child.stderr.on('data', chunk => { errorOutput += chunk.toString() })
  child.once('error', reject)
  child.once('close', code => {
    if (code === 0) return resolve()
    reject(new Error(errorOutput.trim() || `Windows 启动进程失败（退出码 ${code ?? '未知'}）`))
  })
})

const shortcutMiddleware = () => async (request, response, next) => {
  const requestUrl = new URL(request.url || '/', 'http://127.0.0.1')
  const parts = requestUrl.pathname.split('/').filter(Boolean)
  if (parts[0] !== 'api' || parts[1] !== 'shortcuts') return next()

  try {
    await fs.mkdir(SHORTCUT_DIR, { recursive: true })
    const shortcuts = await readShortcuts()
    const id = parts[2]

    if (request.method === 'GET' && parts.length === 2) return sendJson(response, 200, { shortcuts })

    if (request.method === 'POST' && parts.length === 2) {
      const body = await readJsonBody(request)
      const extension = extensionFor(body.fileName || body.name || body.extension)
      if (!extension) return sendJson(response, 400, { error: '只支持 .lnk 或 .url 快捷方式' })
      if (typeof body.data !== 'string' || !body.data) return sendJson(response, 400, { error: '快捷方式文件内容为空' })

      const content = Buffer.from(body.data, 'base64')
      if (!content.length || content.length > MAX_BODY_SIZE) return sendJson(response, 400, { error: '快捷方式文件大小无效' })

      const shortcutId = randomUUID()
      await fs.writeFile(path.join(SHORTCUT_DIR, `${shortcutId}${extension}`), content)
      const record = { id: shortcutId, name: normalizeName(body.name || body.fileName), fileName: String(body.fileName || `${shortcutId}${extension}`).slice(0, 160), extension, createdAt: new Date().toISOString() }
      await writeShortcuts([...shortcuts, record])
      return sendJson(response, 201, { shortcut: record })
    }

    if (!id || !/^[0-9a-f-]{36}$/i.test(id)) return sendJson(response, 400, { error: '快捷方式标识无效' })
    const record = shortcuts.find(item => item.id === id)
    if (!record) return sendJson(response, 404, { error: '找不到该快捷方式' })
    const filePath = path.join(SHORTCUT_DIR, `${record.id}${record.extension}`)

    if (request.method === 'POST' && parts[3] === 'launch' && parts.length === 4) {
      await fs.access(filePath)
      await launchShortcut(filePath)
      return sendJson(response, 202, { message: '启动指令已发送' })
    }

    if (request.method === 'DELETE' && parts.length === 3) {
      await fs.unlink(filePath).catch(() => {})
      await writeShortcuts(shortcuts.filter(item => item.id !== id))
      return sendJson(response, 200, { message: '快捷方式已删除' })
    }

    return sendJson(response, 405, { error: '不支持的请求方法' })
  } catch (error) {
    const message = error instanceof Error ? error.message : '本地快捷方式服务发生错误'
    return sendJson(response, 500, { error: message })
  }
}

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'local-shortcut-launcher',
      configureServer(server) { server.middlewares.use(shortcutMiddleware()) },
      configurePreviewServer(server) { server.middlewares.use(shortcutMiddleware()) }
    }
  ]
})
