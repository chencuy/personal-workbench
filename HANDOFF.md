# 个人工作台交接文档

本文写给没有本会话上下文的后续开发者。项目目录是 `E:\vibe_coding\cc_workbench`，当前对话使用中文。

## 我们在做什么

正在开发一个本地运行的个人工作台。用户通过 `http://127.0.0.1:<端口>/` 访问前端，目标是把高频个人资源集中在一个简约的左侧菜单、右侧内容控制台中。

用户明确的范围是：

- 只启动本机软件。
- 提示词需要标题、内容、标签、搜索、复制、编辑、删除。
- 网址收藏需要标题、内容/备注、标签，并支持分页。
- API Key 需要名称、服务商、API Key、请求地址；只有 API Key 加密。
- 数据只保存在本机，工作台进入前需要密码，第一次打开设置密码。
- 先完成骨架，再逐步加入功能。
- 当前修改不要上传 Git；只有用户明确要求时才提交或推送。

## 已完成什么

### 前端和导航

- 技术栈是 React + Vite + JavaScript + `lucide-react`。
- `src/main.jsx` 负责页面状态、路由式模块切换、表单、数据持久化和加密逻辑。
- `src/styles.css` 负责简约控制台布局、侧边栏、分页、模态框、响应式样式和状态提示。
- 默认打开“概述”；左侧分组包括概述、提示词库、网址收藏、API Keys、应用启动器、个人书库；设置按钮固定在侧边栏底部并复用导航选中样式。
- 设置页目前仍由 `Placeholder` 占位组件显示，不能把它描述成已完成功能。

### 提示词库

- 数据字段：`title`、`content`、`tags`、`updatedAt`、`id`。
- 支持创建、编辑、删除、复制、关键词搜索和标签筛选。
- 卡片右上角三点菜单按垂直顺序显示复制、编辑、删除。
- 每页 6 条；过滤条件变化会回到第 1 页，删除最后一页数据会自动回退页码。
- `seedPrompts` 提供 24 条示例数据；`getInitialPrompts()` 会读取 `localStorage` 后按标题补齐缺失种子。

### 网址收藏

- 数据字段：`title`、`url`、`content`、`tags`、`id`。
- 支持创建、编辑、删除和新标签页打开。
- 保存时只允许 `http:` 和 `https:` URL。
- `seedLinks` 包含 4 条基础示例和 20 条分页测试网址；`getInitialLinks()` 按标题合并已有浏览器数据。
- 每页 6 条，组件内部维护分页状态。

### API Key

- 数据字段：明文 `name`、`provider`、`requestUrl`，以及 `encrypted: { iv, ciphertext }`。
- 只有 API Key 值加密；名称、服务商和请求地址不加密。
- 请求地址只允许 `http:` 和 `https:`。
- 列表默认掩码；当前解锁会话点击眼睛按钮后解密并显示，刷新后内存状态清空。
- 支持创建、编辑、删除、显示/隐藏和每页 6 条分页。

### 个人书库

- 书库不是阅读状态记录模块，而是本机电子书导入和阅读模块。
- 支持导入 `.pdf`、`.epub`、`.txt`、`.md`、`.markdown`、`.html`、`.htm`。
- `localStorage` 的 `workbench-books` 只保存元数据：`id`、`fileId`、`fileName`、`fileType`、`title`、`author`、`category`、`size`、EPUB 的 `location`、文本文件的 `textOffset` 和 `updatedAt`。旧的 `progress`、`progressVersion` 字段会在加载时移除。
- 文件本体保存在浏览器 IndexedDB 数据库 `workbench-books-files` 的 `files` object store 中；不经过网络，也不写入项目目录。
- 支持导入、搜索书名/作者/分类/文件名、按文件类型筛选、编辑元数据、删除和每页 6 条分页。
- 点击“阅读”在右侧主内容区打开 `BookReader`，左上角“返回书库”关闭阅读页；PDF 使用 iframe，HTML 使用 sandbox iframe，TXT/Markdown 使用文本视图，EPUB 通过按需加载的 `epubjs` 分页渲染。
- EPUB 阅读页底部的“上一页”和“下一页”调用 `rendition.prev()` / `rendition.next()`；不要只渲染第一章而不保存 rendition 实例。
- `package.json` 的 `overrides` 将 `@xmldom/xmldom` 锁定到 `0.9.12`，避免 `epubjs@0.3.93` 默认带入有漏洞的旧 XML 解析器。修改 EPUB 依赖时必须重新运行 `npm audit --omit=dev`。
- 由于书籍文件在 IndexedDB 中，清除站点数据会一并删除已导入的书籍文件。`.mobi`、`.azw` 暂不支持。

### 密码和加密

- 首次没有 `workbench-password` 时显示设置页，密码至少 8 位。
- 后续显示解锁页，输入错误密码不会进入工作台。
- 使用 16 字节随机盐值、PBKDF2 SHA-256 250,000 次迭代派生材料。
- 使用 AES-256-GCM；每个 API Key 使用独立 12 字节随机 IV。
- `localStorage` 只保存验证材料、盐值、API Key 密文和非敏感元数据，不保存密码明文。
- 没有密码找回机制。清除站点数据会丢失浏览器中保存的所有本地资源。

### 应用启动器

- 组件在 `src/main.jsx` 的 `AppLauncher`。
- 选择 `.lnk` 或 `.url` 文件后通过 `POST /api/shortcuts` 上传到本地 Vite 接口。
- 页面支持单个“启动”、左侧的“全部启动”、刷新和删除。
- 快捷方式索引写入 `.workbench-data/shortcuts.json`，文件副本写入 `.workbench-data/shortcuts/`；目录已被 `.gitignore` 忽略。
- `vite.config.js` 注册本地 middleware：`GET /api/shortcuts`、`POST /api/shortcuts`、`POST /api/shortcuts/:id/launch`、`DELETE /api/shortcuts/:id`。
- 启动接口只在 Windows 执行 PowerShell `Start-Process -FilePath`，并等待 PowerShell 子进程退出后返回。当前不支持 macOS/Linux。

## 当前状态和可能的卡点

目前没有已知的代码阻塞；最近一次 `npm run build` 已通过，Vite 服务曾运行在 `http://127.0.0.1:5173/`。服务进程不是永久保证的，后续会话应先检查端口，必要时重新运行启动命令。

仍需要注意的未完成事项：

- 设置页只是占位页，概述中的“主题、默认打开页面和快捷键”文案尚未对应真实设置能力。
- 没有自动化测试套件；目前主要依赖 `npm run build` 和手动浏览器验证。
- 书籍导入目前依赖浏览器 IndexedDB，尚未实现书籍导出/备份；阅读器的章节导航和字体设置还未实现。阅读百分比功能已移除：EPUB 只在 `relocated` 事件中保存最后 CFI，并在下次打开时传给 `rendition.display(savedCfi)`；TXT/Markdown 保存并恢复 `scrollTop`。保存位置时不得让 `BookReader` 因书籍对象更新而重新初始化。
- 浏览器自动化无法代替用户输入工作台密码，也不应自动点击真实 FinalShell、VS Code 等快捷方式。
- 目前没有数据导入/导出，浏览器 `localStorage` 与项目 `.workbench-data` 需要分别备份。

如果用户反馈“启动指令已发送但软件没有启动”，先检查：服务是否仍在运行、是否为 Windows、快捷方式文件是否存在、快捷方式是否能在资源管理器中手动启动，以及 PowerShell 是否能执行 `Start-Process -FilePath`。不要改回 `-LiteralPath`：Windows PowerShell 的 `Start-Process` 不兼容此前使用的该参数，现有实现必须保留 `-FilePath`。

## 下一步计划

建议按以下顺序继续：

1. 先启动服务并手动回归当前功能：首次密码设置、刷新解锁、提示词搜索/分页、网址分页、API Key 加密显示/编辑、无害快捷方式启动。
2. 完善阅读体验：目录、字体大小和更精确的章节导航。
3. 实现设置页：默认打开页面、主题、快捷键等真实配置，并同步更新概述页文案。
4. 增加书籍与本地数据导出/导入方案，明确 API Key 密文迁移时的密码处理和安全提示。
5. 增加针对数据校验、分页边界、本地接口错误和加密/解密失败的测试。
6. 如用户明确要求发布版本，再由用户确认后创建 commit/tag；在此之前只保留本地修改，不要 `git push`。

## 绝对不要再踩的坑

- 不要把 API Key 明文写入 `localStorage`、日志、README、截图或 Git。只有 `encrypted.ciphertext` 和 `iv` 应持久化。
- 不要把名称、服务商、请求地址误加密；用户明确要求只有 API Key 加密。
- 不要删除或覆盖用户已有的 `.workbench-data`、浏览器 `localStorage` 或未提交修改来“清理环境”。
- 不要使用 `git reset --hard`、`git checkout --` 等破坏性命令，也不要在用户未要求时提交、打 tag 或推送。
- 不要把应用启动器实现成浏览器直接执行本地路径；必须经 Vite 本地接口和 Windows PowerShell 桥接。
- 不要使用 `Start-Process -LiteralPath`；当前 Windows PowerShell 兼容实现是 `Start-Process -FilePath`，并通过环境变量传递路径避免命令注入式拼接。
- 不要只返回“启动指令已发送”而不等待子进程结果；接口现在必须等待 PowerShell 退出并在失败时返回错误。
- 不要自动启动用户真实软件来做测试。使用无害快捷方式、接口检查或手动确认。
- 不要忘记三个资源模块都需要分页：提示词库、网址收藏、API Keys，当前统一每页 6 条。
- 不要把示例数据当成用户数据覆盖写入；种子数据只能按标题补齐，必须保留用户记录。
- 不要假设浏览器数据跨端口、跨浏览器存在；`localStorage` 按来源隔离。
- 修改文件使用 `apply_patch`；先读代码和现有状态，再进行小范围修改，并在交付前运行 `npm run build` 和 `git diff --check`。

## 关键命令和检查

```powershell
Set-Location E:\vibe_coding\cc_workbench
npm install
npm run dev -- --host 127.0.0.1
npm run build
git status --short
git diff --check
```

当前 Git 仓库已初始化但没有 commit；本次文档修改也不要自动暂存。`.gitignore` 已忽略 `node_modules/`、`dist/` 和 `.workbench-data/`。
