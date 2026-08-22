# 个人工作台 v1.1.0

本版本让本地工作台数据不再依赖浏览器端口来源，并补齐 Windows 静默启动和端口自动切换流程。

## 主要更新

- 工作区配置统一保存到 `.workbench-data/workbench.json`，不再随 localhost 端口变化。
- 导入的书籍文件保存到 `.workbench-data/workspaces/{workspaceId}/books/`。
- 全新安装只读取自身 `.workbench-data`，不会自动带入浏览器里其他安装留下的配置。
- 在设置页修改端口后静默重启服务，并由当前浏览器标签页跳转到新端口。
- 通过 `restart-workbench.vbs` 启动或重启，不显示或保留 CMD 窗口。
- 支持修改工作区名称和密码；密码更新时原子化重新加密已有 API Key。
- 修改端口时同步更新 Windows 开机启动脚本。

## 安装方法

1. 下载并解压 `personal-workbench-v1.1.0-windows.zip` 到有写入权限的目录。
2. 安装 Node.js 20.19+ 或 22.12+。
3. 首次运行 `install-workbench.cmd`。
4. 后续双击 `restart-workbench.vbs` 即可静默启动。

## 升级与数据安全

- Release 压缩包不包含 `.workbench-data`、个人书籍、快捷方式、日志、密码或 API Key 密文。
- 覆盖程序文件前，先备份原安装目录中的 `.workbench-data`。
- 升级时保留原 `.workbench-data`，不要用空目录覆盖或删除它。
- 从旧版本升级时，先导出加密工作区配置，再通过 v1.1.0 的“导入已有配置”恢复。
