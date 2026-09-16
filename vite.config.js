import { createReadStream, createWriteStream, promises as fs, readFileSync } from 'node:fs'
import path from 'node:path'
import os from 'node:os'
import net from 'node:net'
import { randomUUID } from 'node:crypto'
import { spawn } from 'node:child_process'
import { Transform } from 'node:stream'
import { pipeline } from 'node:stream/promises'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const DATA_DIR = path.resolve(process.cwd(), '.workbench-data')
const SHORTCUT_DIR = path.join(DATA_DIR, 'shortcuts')
const SHORTCUT_INDEX = path.join(DATA_DIR, 'shortcuts.json')
const STARTUP_STATE = path.join(DATA_DIR, 'startup.json')
const STARTUP_SCRIPT = path.join(DATA_DIR, 'start-workbench.vbs')
const SERVER_STATE = path.join(DATA_DIR, 'server.json')
const RESTART_LAUNCHER = path.join(process.cwd(), 'restart-workbench.vbs')
const WORKBENCH_STATE = path.join(DATA_DIR, 'workbench.json')
const WORKSPACE_DIR = path.join(DATA_DIR, 'workspaces')
const STARTUP_LINK = process.env.APPDATA
  ? path.join(process.env.APPDATA, 'Microsoft', 'Windows', 'Start Menu', 'Programs', 'Startup', 'PersonalWorkbench.lnk')
  : ''
const DEFAULT_PORT = 5180
const validPort = value => Number.isInteger(Number(value)) && Number(value) >= 1024 && Number(value) <= 65535
const readConfiguredPort = () => {
  try {
    const stored = JSON.parse(readFileSync(SERVER_STATE, 'utf8'))
    return validPort(stored.port) ? Number(stored.port) : DEFAULT_PORT
  } catch { return DEFAULT_PORT }
}
let configuredPort = readConfiguredPort()
const ALLOWED_EXTENSIONS = new Set(['.lnk', '.url'])
const MAX_BODY_SIZE = 8 * 1024 * 1024
const MAX_BOOK_SIZE = 512 * 1024 * 1024
const STORAGE_KEYS = ['prompts', 'links', 'books', 'api-keys', 'dashboard', 'pomodoro']
const BOOK_CONTENT_TYPES = {
  '.pdf': 'application/pdf',
  '.epub': 'application/epub+zip',
  '.txt': 'text/plain; charset=utf-8',
  '.md': 'text/markdown; charset=utf-8',
  '.markdown': 'text/markdown; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.htm': 'text/html; charset=utf-8'
}

const workspaceName = value => {
  const workspace = String(value || 'personal')
  return /^[a-zA-Z0-9-]{1,64}$/.test(workspace) ? workspace : 'personal'
}
const validWorkspaceName = value => /^[a-zA-Z0-9-]{1,64}$/.test(String(value || ''))
const validFileId = value => /^[0-9a-f-]{36}$/i.test(String(value || ''))
const shortcutPaths = workspace => {
  if (workspace === 'personal') return { directory: SHORTCUT_DIR, index: SHORTCUT_INDEX }
  const directory = path.join(DATA_DIR, 'workspaces', workspace, 'shortcuts')
  return { directory, index: path.join(DATA_DIR, 'workspaces', workspace, 'shortcuts.json') }
}

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

const normalizeWorkbenchState = value => {
  const workspaces = Array.isArray(value?.workspaces)
    ? value.workspaces.filter(item => item && validWorkspaceName(item.id))
    : []
  const data = {}
  for (const workspace of workspaces) {
    const source = value?.data?.[workspace.id]
    if (!source || typeof source !== 'object') continue
    data[workspace.id] = {}
    for (const key of STORAGE_KEYS) if (Array.isArray(source[key])) data[workspace.id][key] = source[key]
  }
  return { version: 1, workspaces, data }
}

const readWorkbenchState = async () => {
  try {
    return normalizeWorkbenchState(JSON.parse(await fs.readFile(WORKBENCH_STATE, 'utf8')))
  } catch (error) {
    if (error?.code === 'ENOENT') return { version: 1, workspaces: [], data: {} }
    throw error
  }
}

const writeWorkbenchState = async state => {
  await fs.mkdir(DATA_DIR, { recursive: true })
  const temporaryPath = `${WORKBENCH_STATE}.${randomUUID()}.tmp`
  await fs.writeFile(temporaryPath, JSON.stringify(normalizeWorkbenchState(state), null, 2), 'utf8')
  await fs.rename(temporaryPath, WORKBENCH_STATE).catch(async error => {
    await fs.unlink(temporaryPath).catch(() => {})
    throw error
  })
}

let storageMutationQueue = Promise.resolve()
const mutateWorkbenchState = mutation => {
  const operation = storageMutationQueue.then(async () => {
    const next = await mutation(await readWorkbenchState())
    await writeWorkbenchState(next)
    return normalizeWorkbenchState(next)
  })
  storageMutationQueue = operation.catch(() => {})
  return operation
}

const storageMiddleware = () => async (request, response, next) => {
  const requestUrl = new URL(request.url || '/', 'http://127.0.0.1')
  const parts = requestUrl.pathname.split('/').filter(Boolean)
  if (parts[0] !== 'api' || parts[1] !== 'storage') return next()

  try {
    if (request.method === 'GET' && parts.length === 2) return sendJson(response, 200, await readWorkbenchState())

    if (request.method === 'PUT' && parts[2] === 'import' && parts.length === 3) {
      const body = await readJsonBody(request)
      const workspaces = normalizeWorkbenchState({ workspaces: body.workspaces, data: {} }).workspaces
      const workspaceId = String(body.workspaceId || '')
      if (!validWorkspaceName(workspaceId) || !workspaces.some(item => item.id === workspaceId)) return sendJson(response, 400, { error: '导入的工作区标识无效' })
      const bundle = normalizeWorkbenchState({ workspaces: [{ id: workspaceId }], data: { [workspaceId]: body.data } }).data[workspaceId] || {}
      const state = await mutateWorkbenchState(current => ({
        ...current,
        workspaces,
        data: { ...current.data, [workspaceId]: bundle }
      }))
      return sendJson(response, 200, state)
    }

    if (request.method === 'PUT' && parts[2] === 'security' && parts.length === 3) {
      const body = await readJsonBody(request)
      const workspaces = normalizeWorkbenchState({ workspaces: body.workspaces, data: {} }).workspaces
      const workspaceId = String(body.workspaceId || '')
      if (!validWorkspaceName(workspaceId) || !workspaces.some(item => item.id === workspaceId) || !Array.isArray(body.apiKeys)) return sendJson(response, 400, { error: '密码更新数据无效' })
      const state = await mutateWorkbenchState(current => ({
        ...current,
        workspaces,
        data: {
          ...current.data,
          [workspaceId]: { ...(current.data[workspaceId] || {}), 'api-keys': body.apiKeys }
        }
      }))
      return sendJson(response, 200, state)
    }

    if (request.method === 'PUT' && parts[2] === 'registry' && parts.length === 3) {
      const body = await readJsonBody(request)
      const workspaces = normalizeWorkbenchState({ workspaces: body.workspaces, data: {} }).workspaces
      const state = await mutateWorkbenchState(current => ({ ...current, workspaces }))
      return sendJson(response, 200, state)
    }

    const workspace = parts[2] === 'workspaces' ? parts[3] : ''
    if (workspace && !validWorkspaceName(workspace)) return sendJson(response, 400, { error: '工作区标识无效' })

    const key = parts[4]
    if (request.method === 'PUT' && workspace && parts.length === 5 && STORAGE_KEYS.includes(key)) {
      const body = await readJsonBody(request)
      if (!Array.isArray(body.value)) return sendJson(response, 400, { error: '配置内容必须是数组' })
      const state = await mutateWorkbenchState(current => ({
        ...current,
        data: {
          ...current.data,
          [workspace]: { ...(current.data[workspace] || {}), [key]: body.value }
        }
      }))
      return sendJson(response, 200, { value: state.data[workspace][key] })
    }

    return sendJson(response, 405, { error: '不支持的请求方法' })
  } catch (error) {
    const message = error instanceof Error ? error.message : '本地配置存储失败'
    return sendJson(response, 500, { error: message })
  }
}

const bookMiddleware = () => async (request, response, next) => {
  const requestUrl = new URL(request.url || '/', 'http://127.0.0.1')
  const parts = requestUrl.pathname.split('/').filter(Boolean)
  if (parts[0] !== 'api' || parts[1] !== 'books') return next()
  const workspace = parts[2]
  const fileId = parts[3]
  if (parts.length !== 4 || !validWorkspaceName(workspace) || !validFileId(fileId)) return sendJson(response, 400, { error: '书籍文件标识无效' })

  const directory = path.join(WORKSPACE_DIR, workspace, 'books')
  const filePath = path.join(directory, fileId)
  try {
    if (request.method === 'HEAD') {
      await fs.access(filePath)
      response.statusCode = 204
      return response.end()
    }
    if (request.method === 'GET') {
      const stats = await fs.stat(filePath)
      const type = BOOK_CONTENT_TYPES[requestUrl.searchParams.get('type')] || 'application/octet-stream'
      response.statusCode = 200
      response.setHeader('Content-Type', type)
      response.setHeader('Content-Length', stats.size)
      return createReadStream(filePath).pipe(response)
    }
    if (request.method === 'PUT') {
      await fs.mkdir(directory, { recursive: true })
      const temporaryPath = `${filePath}.${randomUUID()}.tmp`
      let size = 0
      const limiter = new Transform({
        transform(chunk, encoding, callback) {
          size += chunk.length
          callback(size > MAX_BOOK_SIZE ? new Error('书籍文件不能超过 512 MB') : null, chunk)
        }
      })
      try {
        await pipeline(request, limiter, createWriteStream(temporaryPath, { flags: 'wx' }))
        if (!size) throw new Error('书籍文件内容为空')
        await fs.rename(temporaryPath, filePath)
      } catch (error) {
        await fs.unlink(temporaryPath).catch(() => {})
        throw error
      }
      return sendJson(response, 201, { id: fileId, size })
    }
    if (request.method === 'DELETE') {
      await fs.unlink(filePath).catch(error => { if (error?.code !== 'ENOENT') throw error })
      return sendJson(response, 200, { message: '书籍文件已删除' })
    }
    return sendJson(response, 405, { error: '不支持的请求方法' })
  } catch (error) {
    if (error?.code === 'ENOENT') return sendJson(response, 404, { error: '找不到书籍文件' })
    const message = error instanceof Error ? error.message : '本地书籍存储失败'
    return sendJson(response, 500, { error: message })
  }
}

const readShortcuts = async indexPath => {
  try {
    const value = JSON.parse(await fs.readFile(indexPath, 'utf8'))
    return Array.isArray(value) ? value : []
  } catch {
    return []
  }
}

const writeShortcuts = (indexPath, shortcuts) => fs.writeFile(indexPath, JSON.stringify(shortcuts, null, 2), 'utf8')

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

const runPowerShell = (script, extraEnv = {}) => new Promise((resolve, reject) => {
  if (process.platform !== 'win32') return reject(new Error('开机自启动当前仅支持 Windows'))
  const child = spawn('powershell.exe', ['-NoLogo', '-NoProfile', '-NonInteractive', '-ExecutionPolicy', 'Bypass', '-Command', script], {
    windowsHide: true,
    stdio: ['ignore', 'ignore', 'pipe'],
    env: { ...process.env, ...extraEnv }
  })
  let errorOutput = ''
  child.stderr.on('data', chunk => { errorOutput += chunk.toString() })
  child.once('error', reject)
  child.once('close', code => code === 0 ? resolve() : reject(new Error(errorOutput.trim() || `Windows 启动项操作失败（退出码 ${code ?? '未知'}）`)))
})

const readStartupState = async () => {
  if (process.platform !== 'win32' || !STARTUP_LINK) return { enabled: false, port: configuredPort }
  try {
    const stored = JSON.parse(await fs.readFile(STARTUP_STATE, 'utf8'))
    if (!stored?.enabled) return { enabled: false, port: configuredPort }
    await fs.access(STARTUP_LINK)
    return { enabled: true, port: configuredPort }
  } catch {
    return { enabled: false, port: configuredPort }
  }
}

const writeStartupScript = async (port = configuredPort) => {
  const escapeVbs = value => String(value).replace(/"/g, '""')
  const nodePath = process.execPath
  const vitePath = path.resolve(process.cwd(), 'node_modules', 'vite', 'bin', 'vite.js')
  const script = [
    'Set shell = CreateObject("WScript.Shell")',
    `shell.CurrentDirectory = "${escapeVbs(process.cwd())}"`,
    `shell.Run """${escapeVbs(nodePath)}"" ""${escapeVbs(vitePath)}"" --host 127.0.0.1 --port ${port} --strictPort", 0, False`
  ].join('\r\n') + '\r\n'
  await fs.writeFile(STARTUP_SCRIPT, script, 'utf8')
}

const setStartupState = async enabled => {
  if (process.platform !== 'win32' || !STARTUP_LINK) throw new Error('开机自启动当前仅支持 Windows')
  await fs.mkdir(DATA_DIR, { recursive: true })
  if (enabled) {
    await writeStartupScript()
    const createShortcut = [
      "$ErrorActionPreference = 'Stop'",
      "$shell = New-Object -ComObject WScript.Shell",
      "$link = $shell.CreateShortcut([Environment]::GetEnvironmentVariable('WORKBENCH_STARTUP_LINK'))",
      "$link.TargetPath = [Environment]::GetEnvironmentVariable('WORKBENCH_STARTUP_TARGET')",
      "$link.Arguments = [Environment]::GetEnvironmentVariable('WORKBENCH_STARTUP_ARGS')",
      "$link.WorkingDirectory = [Environment]::GetEnvironmentVariable('WORKBENCH_STARTUP_CWD')",
      "$link.WindowStyle = 7",
      "$link.Description = '个人工作台本地服务'",
      '$link.Save()'
    ].join('; ')
    await runPowerShell(createShortcut, {
      WORKBENCH_STARTUP_LINK: STARTUP_LINK,
      WORKBENCH_STARTUP_TARGET: path.join(process.env.WINDIR || 'C:\\Windows', 'System32', 'wscript.exe'),
      WORKBENCH_STARTUP_ARGS: `"${STARTUP_SCRIPT}"`,
      WORKBENCH_STARTUP_CWD: process.cwd()
    })
    await fs.writeFile(STARTUP_STATE, JSON.stringify({ enabled: true, port: configuredPort, updatedAt: new Date().toISOString() }, null, 2), 'utf8')
    return { enabled: true, port: configuredPort }
  }
  await fs.unlink(STARTUP_LINK).catch(() => {})
  await fs.unlink(STARTUP_SCRIPT).catch(() => {})
  await fs.writeFile(STARTUP_STATE, JSON.stringify({ enabled: false, port: configuredPort, updatedAt: new Date().toISOString() }, null, 2), 'utf8')
  return { enabled: false, port: configuredPort }
}

const shortcutMiddleware = () => async (request, response, next) => {
  const requestUrl = new URL(request.url || '/', 'http://127.0.0.1')
  const parts = requestUrl.pathname.split('/').filter(Boolean)
  if (parts[0] !== 'api' || parts[1] !== 'shortcuts') return next()

  try {
    const workspace = workspaceName(requestUrl.searchParams.get('workspace'))
    const paths = shortcutPaths(workspace)
    await fs.mkdir(paths.directory, { recursive: true })
    const shortcuts = await readShortcuts(paths.index)
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
      await fs.writeFile(path.join(paths.directory, `${shortcutId}${extension}`), content)
      const record = { id: shortcutId, name: normalizeName(body.name || body.fileName), fileName: String(body.fileName || `${shortcutId}${extension}`).slice(0, 160), extension, createdAt: new Date().toISOString() }
      await writeShortcuts(paths.index, [...shortcuts, record])
      return sendJson(response, 201, { shortcut: record })
    }

    if (!id || !/^[0-9a-f-]{36}$/i.test(id)) return sendJson(response, 400, { error: '快捷方式标识无效' })
    const record = shortcuts.find(item => item.id === id)
    if (!record) return sendJson(response, 404, { error: '找不到该快捷方式' })
    const filePath = path.join(paths.directory, `${record.id}${record.extension}`)

    if (request.method === 'POST' && parts[3] === 'launch' && parts.length === 4) {
      await fs.access(filePath)
      await launchShortcut(filePath)
      return sendJson(response, 202, { message: '启动指令已发送' })
    }

    if (request.method === 'DELETE' && parts.length === 3) {
      await fs.unlink(filePath).catch(() => {})
      await writeShortcuts(paths.index, shortcuts.filter(item => item.id !== id))
      return sendJson(response, 200, { message: '快捷方式已删除' })
    }

    return sendJson(response, 405, { error: '不支持的请求方法' })
  } catch (error) {
    const message = error instanceof Error ? error.message : '本地快捷方式服务发生错误'
    return sendJson(response, 500, { error: message })
  }
}

const startupMiddleware = () => async (request, response, next) => {
  const requestUrl = new URL(request.url || '/', 'http://127.0.0.1')
  if (requestUrl.pathname !== '/api/startup') return next()
  try {
    if (request.method === 'GET') return sendJson(response, 200, await readStartupState())
    if (request.method === 'POST') {
      const body = await readJsonBody(request)
      if (typeof body.enabled !== 'boolean') return sendJson(response, 400, { error: 'enabled 必须是布尔值' })
      return sendJson(response, 200, await setStartupState(body.enabled))
    }
    return sendJson(response, 405, { error: '不支持的请求方法' })
  } catch (error) {
    const message = error instanceof Error ? error.message : '开机自启动设置失败'
    return sendJson(response, process.platform === 'win32' ? 500 : 501, { error: message })
  }
}

const systemMiddleware = () => (request, response, next) => {
  const requestUrl = new URL(request.url || '/', 'http://127.0.0.1')
  if (requestUrl.pathname !== '/api/system') return next()
  if (request.method !== 'GET') return sendJson(response, 405, { error: '不支持的请求方法' })
  let username = process.env.USERNAME || process.env.USER || ''
  try { username = os.userInfo().username || username } catch { /* system username is optional */ }
  return sendJson(response, 200, { username })
}

const portAvailable = port => new Promise(resolve => {
  const probe = net.createServer()
  probe.unref()
  probe.once('error', () => resolve(false))
  probe.listen(port, '127.0.0.1', () => probe.close(() => resolve(true)))
})

const scheduleWorkbenchRestart = port => {
  const child = spawn(path.join(process.env.WINDIR || 'C:\\Windows', 'System32', 'wscript.exe'), [RESTART_LAUNCHER, String(port), '--no-browser'], {
    cwd: process.cwd(),
    detached: true,
    windowsHide: true,
    stdio: 'ignore',
    env: process.env
  })
  child.once('error', () => {})
  child.unref()
}

const readServiceLog = async fileName => {
  try {
    const value = await fs.readFile(path.join(DATA_DIR, fileName), 'utf8')
    return value.slice(-24000)
  } catch (error) {
    if (error?.code === 'ENOENT') return ''
    throw error
  }
}

const resetWorkbenchData = async () => {
  await fs.unlink(STARTUP_LINK).catch(() => {})
  await fs.rm(DATA_DIR, { recursive: true, force: true })
  await fs.mkdir(DATA_DIR, { recursive: true })
  configuredPort = DEFAULT_PORT
  const updatedAt = new Date().toISOString()
  await Promise.all([
    fs.writeFile(SERVER_STATE, JSON.stringify({ host: '127.0.0.1', port: DEFAULT_PORT, updatedAt }, null, 2), 'utf8'),
    fs.writeFile(STARTUP_STATE, JSON.stringify({ enabled: false, port: DEFAULT_PORT, updatedAt }, null, 2), 'utf8')
  ])
}

const serverSettingsMiddleware = () => async (request, response, next) => {
  const requestUrl = new URL(request.url || '/', 'http://127.0.0.1')
  const activePort = Number(request.socket.localPort) || configuredPort
  if (requestUrl.pathname === '/api/server/status') {
    if (request.method !== 'GET') return sendJson(response, 405, { error: '不支持的请求方法' })
    return sendJson(response, 200, { running: true, host: '127.0.0.1', port: activePort, configuredPort, pid: process.pid, uptimeSeconds: Math.floor(process.uptime()) })
  }
  if (requestUrl.pathname === '/api/server/logs') {
    if (request.method !== 'GET') return sendJson(response, 405, { error: '不支持的请求方法' })
    try {
      const [stdout, stderr] = await Promise.all([readServiceLog('service.stdout.log'), readServiceLog('service.stderr.log')])
      return sendJson(response, 200, { stdout, stderr })
    } catch (error) {
      return sendJson(response, 500, { error: error instanceof Error ? error.message : '无法读取服务日志' })
    }
  }
  if (requestUrl.pathname === '/api/server/restart') {
    if (request.method !== 'POST') return sendJson(response, 405, { error: '不支持的请求方法' })
    try {
      sendJson(response, 202, { restarting: true, port: activePort })
      setTimeout(() => scheduleWorkbenchRestart(activePort), 350)
    } catch (error) {
      return sendJson(response, 500, { error: error instanceof Error ? error.message : '无法启动重启操作' })
    }
    return
  }
  if (requestUrl.pathname === '/api/server/reset') {
    if (request.method !== 'POST') return sendJson(response, 405, { error: '不支持的请求方法' })
    try {
      await resetWorkbenchData()
      sendJson(response, 202, { resetting: true, port: DEFAULT_PORT })
      setTimeout(() => scheduleWorkbenchRestart(DEFAULT_PORT), 350)
    } catch (error) {
      return sendJson(response, 500, { error: error instanceof Error ? error.message : '恢复初始状态失败' })
    }
    return
  }
  if (requestUrl.pathname === '/api/server/stop') {
    if (request.method !== 'POST') return sendJson(response, 405, { error: '不支持的请求方法' })
    response.once('finish', () => setTimeout(() => process.exit(0), 150))
    sendJson(response, 200, { stopping: true, message: '本地服务正在关闭' })
    return
  }
  if (requestUrl.pathname !== '/api/server') return next()
  try {
    if (request.method === 'GET') return sendJson(response, 200, { host: '127.0.0.1', port: configuredPort, activePort, restartRequired: configuredPort !== activePort })
    if (request.method === 'POST') {
      const body = await readJsonBody(request)
      const port = Number(body.port)
      if (!validPort(port)) return sendJson(response, 400, { error: '端口必须是 1024 到 65535 之间的整数' })
      if (port !== activePort && !(await portAvailable(port))) return sendJson(response, 409, { error: `端口 ${port} 已被其他程序占用` })
      await fs.mkdir(DATA_DIR, { recursive: true })
      configuredPort = port
      await fs.writeFile(SERVER_STATE, JSON.stringify({ host: '127.0.0.1', port, updatedAt: new Date().toISOString() }, null, 2), 'utf8')
      const startup = await readStartupState()
      if (startup.enabled) {
        await writeStartupScript(port)
        await fs.writeFile(STARTUP_STATE, JSON.stringify({ enabled: true, port, updatedAt: new Date().toISOString() }, null, 2), 'utf8')
      }
      const restartRequired = port !== activePort
      sendJson(response, 200, { host: '127.0.0.1', port, activePort, restartRequired, restarting: restartRequired })
      if (restartRequired) setTimeout(() => {
        try { scheduleWorkbenchRestart(port) } catch { /* the old service is still usable if restart dispatch fails */ }
      }, 750)
      return
    }
    return sendJson(response, 405, { error: '不支持的请求方法' })
  } catch (error) {
    const message = error instanceof Error ? error.message : '本地服务设置失败'
    return sendJson(response, 500, { error: message })
  }
}

export default defineConfig({
  server: { host: '127.0.0.1', port: configuredPort, strictPort: true },
  preview: { host: '127.0.0.1', port: configuredPort, strictPort: true },
  plugins: [
    react(),
    {
      name: 'local-workbench-services',
      configureServer(server) {
        server.middlewares.use(storageMiddleware())
        server.middlewares.use(bookMiddleware())
        server.middlewares.use(serverSettingsMiddleware())
        server.middlewares.use(startupMiddleware())
        server.middlewares.use(systemMiddleware())
        server.middlewares.use(shortcutMiddleware())
      },
      configurePreviewServer(server) {
        server.middlewares.use(storageMiddleware())
        server.middlewares.use(bookMiddleware())
        server.middlewares.use(serverSettingsMiddleware())
        server.middlewares.use(startupMiddleware())
        server.middlewares.use(systemMiddleware())
        server.middlewares.use(shortcutMiddleware())
      }
    }
  ]
})
