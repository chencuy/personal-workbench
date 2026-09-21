# 个人工作台交接文档

本文写给完全没有上下文的新会话。项目目录是 `E:\vibe_coding\cc_workbench`，用户使用中文。

## 首要协作规则

> 后续不要自行验证。完成代码修改后交给用户手动验证。

- 除非用户明确要求，否则不要运行 `npm run build`、测试命令、浏览器自动化或截图检查。
- 不要自行启动额外开发服务、创建测试工作区、填写测试密码或插入测试数据。
- 不要自行修改绑定端口、切换开机自启动、创建/删除 Windows 启动项或启动真实软件。
- 未执行验证时必须如实说明“未验证，等待用户检查”，不能假装通过。
- 用户未明确要求时，不要执行 Git 提交、打标签或推送。

## 我们在做什么

正在开发一个只在本机运行的个人工作台。它使用 React、Vite 和 JavaScript，通过 `http://127.0.0.1:<端口>/` 在浏览器中访问，不提供账户、云同步或远程数据库。

当前版本为 `v1.3.0`，在设置页和本地服务基础上补充了番茄钟、概述实时电脑时间/用户名、中文/English/日本語界面切换、服务停止入口和静默启动/停止脚本：

- 把并排卡片改成标准设置页排版。
- 设置页采用左侧分类、右侧内容的结构。
- 支持修改工作区名称。
- 支持修改工作区密码，并保证已有 API Key 仍可解密。
- 支持设置本地服务绑定端口，默认端口为 `5180`。
- 保留配置导入导出和 Windows 开机自启动。
- 设置页支持中文、English、日本語三种界面语言；偏好保存在当前浏览器本机。
- 概述页显示当前电脑用户名、动态问候语、实时电脑时间和日期，并提供全部工具快捷入口。
- 番茄钟支持 15/25/45/60 分钟预设、自定义整数时长、分钟/小时单位、暂停、继续和重置；完整结束时弹窗并响铃。
- 番茄钟统计按当前工作区隔离：只有完整结束的轮次才计入永久累计专注时间；暂停、重置或中断不计入。页面展示最近 30 个自然日的每日统计，过期明细会清理但累计总时长保留。
- 概述页提供关闭当前本地服务的操作。
- 收起侧边栏时隐藏工作区切换卡片，折叠控制与导航按钮保持一致尺寸并居中。
- 新增 `start.cmd` 和 `end.cmd`，分别用于无窗口启动和停止当前工作台服务。

## 已经完成什么

### 运行架构

- 项目只保留本地 Vite 服务，不维护其他运行形态。
- Electron 源码、依赖、打包脚本和构建产物已经删除。
- 服务只监听 `127.0.0.1`，不允许监听 `0.0.0.0`。
- `npm run dev` 和 `npm run preview` 从 `vite.config.js` 读取绑定端口。
- 默认端口是 `5180`；端口配置保存在 `.workbench-data/server.json`。
- 工作区注册表和业务配置统一保存在 `.workbench-data/workbench.json`，不再随浏览器端口变化。
- 书籍文件保存在 `.workbench-data/workspaces/{workspaceId}/books/`，换端口后仍可阅读。
- 全新安装只读取自身 `.workbench-data`，不会自动读取浏览器 `localStorage`；旧版本升级通过加密配置导出/导入完成。

### 设置页

- 设置页已改成单一设置容器，不再显示两块并排功能卡片。
- 内部分类为“工作区”“密码与安全”“数据管理”“启动设置”“语言”。
- 桌面端为左侧分类导航、右侧开放式设置内容。
- 窄屏下分类导航改为两列网格，避免横向滚动条和分类被截断。
- 工作区名称修改会检查空值和重名，并同步更新侧边栏名称与头像首字。
- 密码修改需要当前密码、新密码和确认密码。
- 新密码至少 8 位，不能与当前密码相同，也不能与其他工作区密码重复。
- 修改密码时会先解密当前工作区所有 API Key，再使用新密码派生的新 AES-256-GCM 密钥重新加密；全部成功后才更新密码校验材料。
- 数据管理保留加密配置导出和导入。
- 启动设置保留开机自启动，并新增端口输入与保存按钮。
- 语言设置支持中文、English、日本語三种界面语言；用户输入的数据内容不自动翻译。
- 工作区图标保持原有默认图标逻辑，本版本未加入头像上传功能。

### 端口绑定

- 新增 `GET /api/server`：返回 `host`、配置端口、当前活动端口和是否需要重启。
- 新增 `POST /api/server`：保存端口，范围为 `1024-65535`。
- 新增 `POST /api/server/stop`：响应后关闭当前 Vite 服务进程。
- 保存前会检查目标端口是否已被其他程序占用。
- 运行中的 Vite 服务不会原地换端口；保存成功后会通过 `restart-workbench.vbs` 静默重启，当前浏览器标签页随后跳转到新地址。
- 如果开机自启动已开启，修改端口会同步重写 `.workbench-data/start-workbench.vbs`。
- Windows 启动快捷方式仍位于 `%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup\PersonalWorkbench.lnk`。
- 服务未启动时可双击 `restart-workbench.vbs` 静默启动；没有端口配置时默认使用 `5180`，否则使用已保存端口。VBS 隐藏调用 `restart-workbench.cmd`，Vite 由独立 Node 进程承载。
- `start.cmd` 调用无窗口重启入口并读取已保存端口；`end.cmd` 调用 `end-workbench.vbs` 停止当前项目的 Vite 进程。

### 已有模块

- 多工作区创建、密码解锁、切换和本地数据隔离。
- 提示词标题、内容、标签、搜索、复制、编辑、删除和自适应分页。
- 网址收藏标题、网址、备注、标签、打开、编辑、删除和分页。
- API Key 名称、服务商、请求地址明文保存，只有 Key 值使用 AES-256-GCM 加密。
- 应用快捷方式导入、单个启动、全部启动和删除；只支持 Windows `.lnk` / `.url`。
- 本地书库导入和阅读 PDF、EPUB、TXT、Markdown、HTML。
- EPUB 保存 CFI，TXT/Markdown 保存滚动位置；不显示阅读百分比。
- 工作区配置加密导出和导入，同名配置可确认覆盖，覆盖包含工作区密码。
- 侧边栏收起/展开、全局搜索、概述页和响应式布局。
- 概述页实时显示本机用户名、问候语、当前时间和工具快捷入口。
- 番茄钟支持预设、自定义时长、分钟/小时单位、暂停、继续和重置。
- 概述页支持关闭本地服务；收起侧边栏时工作区卡片隐藏，折叠按钮与导航按钮对齐。

## 当前卡在哪里

没有代码层面的硬阻塞，当前停在用户手动验收阶段。

本会话在用户提出”以后不要自行验证”之前完成过以下检查，仅作为历史记录：

- 设置页改造和端口功能加入后，`npm run build` 曾通过。
- `/api/server` 曾确认：保存 `5180` 成功，端口 `80` 返回 400，已占用的 `5181` 返回 409。
- 桌面设置布局、分类切换和工作区改名曾在隔离的 `5181` 来源中操作成功。

尚未由用户确认的内容：

- 修改密码的完整流程，以及修改后刷新页面能否使用新密码登录。
- 有现存 API Key 时，修改密码后显示、编辑和再次保存是否正常。
- 新增端口输入区域的最终视觉效果。
- 窄屏两列设置分类的最终视觉效果。
- 修改到其他空闲端口后，重启服务是否从该端口打开。
- 换端口后工作区、配置和书籍能否完整打开。
- 开机自启动已开启时，修改端口后重新登录 Windows 是否使用新端口。

已发现但本次没有处理的旧问题：概述页底部”去设置”按钮没有绑定点击事件。进入设置页应使用侧边栏设置按钮。

## 最近完成的工作（2026-09-21）

### 工具箱整合

用户要求将侧边栏中过多的独立工具项整合到统一的”工具箱”页面，并在该页面实现分页展示。

**完成内容：**

1. **侧边栏精简**：将原本分散的 8 个工具项（应用启动器、番茄钟、HTTP测试、开发工具、文件对比、网络诊断、二维码生成、系统监控）合并为 1 个”工具箱”入口
2. **工具箱页面**：创建 `ToolsHub` 组件，使用网格布局展示所有工具卡片
3. **分页功能**：每页显示 6 个工具，使用现有的分页组件样式
4. **多语言支持**：工具箱标题和工具描述支持中文、英文、日文三种语言
5. **导航功能**：点击工具卡片可跳转到对应的工具页面

**涉及文件：**

- `src/main.jsx` (line 273-283)：修改 `navGroups` 导航结构，移除独立工具项，保留单一”工具箱”入口
- `src/main.jsx` (line 292-294)：在 `LANGUAGE_LABELS` 添加 `tools` 翻译
- `src/main.jsx` (line 616)：添加 `ToolsHub` 组件路由逻辑
- `src/main.jsx` (line 1963-2047)：新增 `ToolsHub` 组件实现

**遇到的问题及解决：**

在实现过程中遇到 Vite 解析错误：`[PARSE_ERROR] Expected ',' or ')' but found '/'`

**问题原因：** 在 line 616 的条件渲染中，`<Pomodoro>` 组件的 `onComplete` 属性包含嵌套箭头函数，其中一个箭头函数缺少闭合的花括号 `}`，导致解析器将后续的 JSX 关闭标签 `/>` 中的 `/` 误认为除法运算符。

**具体位置：**
```javascript
onComplete={seconds => { 
  const date = pomodoroDateKey(new Date()); 
  setPomodoroStats(prev => { 
    const normalized = typeof prev === 'object' && prev !== null ? prev : { totalSeconds: 0, daily: {} }; 
    return normalizePomodoroStats({ 
      totalSeconds: normalized.totalSeconds + seconds, 
      daily: { ...normalized.daily, [date]: (normalized.daily[date] || 0) + seconds } 
    })
  // ❌ 此处缺少闭合的 }
})} />
```

**解决方案：** 在 `setPomodoroStats` 回调函数的 `return` 语句后添加缺失的闭合花括号：
```javascript
onComplete={seconds => { 
  const date = pomodoroDateKey(new Date()); 
  setPomodoroStats(prev => { 
    const normalized = typeof prev === 'object' && prev !== null ? prev : { totalSeconds: 0, daily: {} }; 
    return normalizePomodoroStats({ 
      totalSeconds: normalized.totalSeconds + seconds, 
      daily: { ...normalized.daily, [date]: (normalized.daily[date] || 0) + seconds } 
    }) // ✅ 添加闭合的 }
  }) 
}} />
```

**关键经验：**

1. Vite/oxc 解析器报告的错误位置（position 49127）是转换后代码的位置，不是源文件的实际行号
2. 当看到 “Expected ',' or ')' but found '/'” 且涉及 JSX 时，优先检查：
   - 内联箭头函数的花括号是否完整配对
   - JSX 属性中的嵌套函数是否正确闭合
   - 正则表达式字面量是否被误判为除法运算符
3. 长链条件渲染（多个三元运算符串联）容易隐藏此类错误，建议分段检查或拆分成多个独立条件块

## 下一步计划

1. 等待用户手动检查设置页桌面与窄屏排版。
2. 根据用户反馈修正设置布局，不要自行打开浏览器复查。
3. 由用户手动验证工作区改名和密码修改。
4. 由用户手动验证端口修改、服务重启和开机自启动。
5. 用户确认后更新 README 中任何与实际体验不一致的细节。
6. 只有用户明确要求时再提交 Git 或创建版本。

## 关键实现位置

- `src/main.jsx`：工作区名称修改、密码重加密、设置页组件和端口设置调用。
- `src/styles.css`：设置页左右布局、设置行、表单及窄屏两列导航。
- `vite.config.js`：`/api/storage`、`/api/books`、`/api/server`、`/api/startup`、`/api/shortcuts`、`/api/system` 和端口加载逻辑。
- `package.json`：纯 Vite 启动命令。
- `restart-workbench.vbs`：Windows 零弹窗启动入口，也是前端修改端口后的重启入口。
- `restart-workbench.cmd`：由 VBS 隐藏调用的内部重启实现。
- `start.cmd`：用户使用的无窗口启动入口。
- `end.cmd` / `end-workbench.vbs`：用户使用的无窗口停止入口及辅助脚本。
- `.workbench-data/server.json`：当前绑定端口。
- `.workbench-data/startup.json`：开机自启动状态。

## 数据位置

- 工作区注册表和业务数据保存在 `.workbench-data/workbench.json`。
- 书籍文件保存在 `.workbench-data/workspaces/{workspaceId}/books/`。
- 浏览器 `localStorage` 不再作为配置来源；书籍文件缺失时仅保留 IndexedDB 兼容读取逻辑。
- 快捷方式、端口配置和开机启动状态保存在项目 `.workbench-data/`。
- `.workbench-data/` 已被 Git 忽略，不要删除或提交。
- 改造前备份位于 `E:\vibe_coding\cc_workbench-backup-20260822-180659.zip`。

## 绝对不要再踩的坑

- 不要自行验证；这条是用户最新明确要求。只有用户再次明确授权时才能运行验证。
- 不要修改或清空用户的 `localStorage`、IndexedDB、`.workbench-data`。
- 旧版浏览器配置不会自动迁移；需要先用旧版本导出加密配置，再导入新版本。
- 不要把端口配置重新硬编码到 `package.json`，否则设置页保存的端口不会生效。
- 不要让服务监听公网地址，只允许 `127.0.0.1`。
- 不要只修改密码校验材料而不重新加密现有 API Key，否则旧 Key 会永久无法解密。
- 不要把 API Key 明文写入 `localStorage`、日志、文档、截图或 Git。
- 不要加密 API Key 的名称、服务商和请求地址；用户明确要求只有 Key 值加密。
- 不要使用 `Start-Process -LiteralPath`；Windows PowerShell 兼容实现必须使用 `-FilePath`。
- 不要自动启动用户真实软件做测试。
- 不要恢复或重新引入已删除的 Electron 相关内容。
- 不要使用破坏性 Git 命令，也不要在用户未要求时提交或推送。
- **JSX 嵌套箭头函数必须完整闭合**：在 JSX 属性中使用嵌套箭头函数时，必须确保每层函数都有对应的闭合花括号。Vite/oxc 解析器遇到缺失的 `}` 时会将后续 JSX 的 `/>` 中的 `/` 误判为除法运算符，报错 `Expected ',' or ')' but found '/'`。错误位置指向转换后代码，不是源文件实际行号。长链条件渲染（多个三元运算符）容易隐藏此类错误。
