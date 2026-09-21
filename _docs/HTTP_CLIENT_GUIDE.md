# HTTP 客户端使用指南

## 功能概述

HTTP 客户端是一个轻量级的 API 测试工具，支持常用的 HTTP 请求方法、自定义请求头、请求体配置，并与 API Keys 模块无缝集成。

---

## 快速开始

### 测试示例 1：GET 请求 - 获取随机用户数据

**接口信息：**
- URL: `https://jsonplaceholder.typicode.com/users/1`
- 方法: `GET`
- 说明: 获取 ID 为 1 的用户信息（公共测试 API）

**操作步骤：**
1. 在"请求方法"下拉框选择 `GET`
2. 在"请求地址"输入：`https://jsonplaceholder.typicode.com/users/1`
3. 点击"发送请求"
4. 查看响应结果

**预期响应：**
```json
{
  "id": 1,
  "name": "Leanne Graham",
  "username": "Bret",
  "email": "Sincere@april.biz",
  ...
}
```

---

### 测试示例 2：POST 请求 - 创建新资源

**接口信息：**
- URL: `https://jsonplaceholder.typicode.com/posts`
- 方法: `POST`
- 说明: 创建一篇新文章

**操作步骤：**
1. 选择方法：`POST`
2. 输入 URL：`https://jsonplaceholder.typicode.com/posts`
3. 在"请求体"中输入：
```json
{
  "title": "测试文章",
  "body": "这是一篇测试文章的内容",
  "userId": 1
}
```
4. 点击"发送请求"
5. 查看状态码（应该是 201 Created）

**预期响应：**
```json
{
  "title": "测试文章",
  "body": "这是一篇测试文章的内容",
  "userId": 1,
  "id": 101
}
```

---

### 测试示例 3：带自定义 Headers 的请求

**接口信息：**
- URL: `https://httpbin.org/headers`
- 方法: `GET`
- 说明: 回显所有请求头

**操作步骤：**
1. 选择方法：`GET`
2. 输入 URL：`https://httpbin.org/headers`
3. 在"请求头"部分点击"添加 Header"
4. 添加以下 Headers：
   - `X-Custom-Header`: `MyValue`
   - `User-Agent`: `MyApp/1.0`
5. 确保复选框都勾选（启用状态）
6. 点击"发送请求"

**预期响应：**
服务器会返回你发送的所有 Headers，包括自定义的。

---

### 测试示例 4：使用 API Key

**前提条件：**
先在"API Keys"模块添加一个测试 API Key（或使用你自己的真实 API Key）

**操作步骤：**
1. 在"使用 API Key"下拉框中选择已保存的 API Key
2. 点击"使用 API Key"按钮
3. 系统会自动在 Headers 中添加 `Authorization: Bearer <your-token>`
4. 发送请求测试

---

## 核心功能

### 1. 请求配置

#### 支持的 HTTP 方法
- `GET` - 获取资源
- `POST` - 创建资源
- `PUT` - 完整更新资源
- `PATCH` - 部分更新资源
- `DELETE` - 删除资源
- `HEAD` - 获取响应头
- `OPTIONS` - 获取支持的方法

#### 请求头管理
- **添加 Header**：点击"添加 Header"按钮
- **启用/禁用**：通过复选框控制
- **删除**：点击行末的 ❌ 按钮
- **常用 Headers**：
  - `Content-Type`: `application/json`（POST/PUT 自动添加）
  - `Authorization`: `Bearer <token>`
  - `Accept`: `application/json`
  - `User-Agent`: 自定义客户端标识

#### 请求体（Body）
- 仅 POST、PUT、PATCH 方法显示
- 支持格式：
  - JSON（自动检测并添加 Content-Type）
  - 纯文本
  - 表单数据

### 2. API Key 集成

**与 API Keys 模块联动：**
1. 从下拉框选择已保存的 API Key
2. 点击"使用 API Key"按钮
3. 自动添加到 Authorization Header
4. 密钥解密后填充，不在界面明文显示

**安全特性：**
- API Key 加密存储（AES-256-GCM）
- 仅在使用时解密
- 不在请求历史中保存明文

### 3. 响应查看

#### 响应元数据
- **状态码**：带颜色标识
  - 🟢 2xx - 成功（绿色）
  - 🔵 3xx - 重定向（蓝色）
  - 🟡 4xx - 客户端错误（黄色）
  - 🔴 5xx - 服务器错误（红色）
- **耗时**：请求完成时间（毫秒）
- **大小**：响应体大小

#### 响应体
- 自动格式化 JSON
- 支持纯文本显示
- 可复制完整内容

### 4. 请求历史

**保存请求：**
1. 配置好请求后，点击"保存请求"
2. 输入请求名称（如"获取用户信息"）
3. 请求保存到工作区

**加载历史：**
1. 点击"请求历史"按钮
2. 从右侧列表选择已保存的请求
3. 点击播放按钮 ▶ 加载请求
4. 点击删除按钮 🗑️ 删除请求

**历史记录包含：**
- 请求名称
- 请求方法
- 完整 URL
- Headers 配置
- 请求体内容

---

## 使用场景

### 开发调试
- 测试自己开发的 API 接口
- 验证接口返回格式
- 调试请求参数

### 接口联调
- 与后端联调接口
- 快速验证接口可用性
- 排查接口问题

### API 探索
- 探索第三方 API
- 学习 RESTful API 设计
- 测试公共 API

### 性能测试
- 观察接口响应时间
- 对比不同请求的性能
- 优化请求参数

---

## 推荐公共测试 API

### 1. JSONPlaceholder
- **URL**: `https://jsonplaceholder.typicode.com`
- **说明**: 免费的假数据 REST API
- **端点示例**:
  - `GET /posts` - 获取所有文章
  - `GET /posts/1` - 获取指定文章
  - `POST /posts` - 创建文章
  - `PUT /posts/1` - 更新文章
  - `DELETE /posts/1` - 删除文章

### 2. HTTPBin
- **URL**: `https://httpbin.org`
- **说明**: HTTP 请求测试服务
- **端点示例**:
  - `GET /get` - 测试 GET 请求
  - `POST /post` - 测试 POST 请求
  - `GET /headers` - 查看请求头
  - `GET /status/200` - 返回指定状态码
  - `GET /delay/3` - 延迟 3 秒响应

### 3. ReqRes
- **URL**: `https://reqres.in/api`
- **说明**: 模拟用户 API
- **端点示例**:
  - `GET /users?page=2` - 获取用户列表
  - `GET /users/2` - 获取单个用户
  - `POST /users` - 创建用户
  - `PUT /users/2` - 更新用户

---

## 技巧与最佳实践

### 1. 使用 Headers
```
Content-Type: application/json
Accept: application/json
Authorization: Bearer your-token-here
```

### 2. 格式化 JSON
在请求体中输入 JSON 时，确保格式正确：
```json
{
  "key": "value",
  "nested": {
    "field": "data"
  }
}
```

### 3. 调试技巧
- 先用 GET 请求测试连接性
- 使用 HTTPBin 验证请求是否正确发送
- 查看响应状态码判断问题类型
- 保存常用请求方便重复测试

### 4. 安全建议
- 不要在 URL 或 Headers 中硬编码敏感信息
- 使用 API Keys 模块管理密钥
- 测试完成后清除敏感数据
- 生产环境密钥不要保存在浏览器

---

## 多语言支持

HTTP 客户端支持三种语言界面：
- 🇨🇳 中文（简体）
- 🇺🇸 English
- 🇯🇵 日本語

在"设置"中切换语言后，所有标签和提示会自动更新。

---

## 常见问题

### Q1: 为什么请求失败显示 CORS 错误？
**A**: 这是浏览器的跨域限制。解决方案：
- 后端配置 CORS 允许跨域
- 使用代理服务器
- 使用浏览器扩展禁用 CORS（仅开发环境）

### Q2: API Key 解密失败？
**A**: 可能原因：
- 工作区密码已修改
- API Key 数据损坏
- 建议重新添加 API Key

### Q3: 如何保存请求历史？
**A**: 点击"保存请求"按钮，输入名称即可保存到当前工作区。历史记录会自动持久化。

### Q4: 能否导出请求配置？
**A**: 请求历史存储在工作区中，使用"设置 > 数据管理 > 导出工作区配置"可以导出所有数据（包括请求历史）。

---

## 功能对比

| 功能 | HTTP Client | Postman | Thunder Client |
|------|-------------|---------|----------------|
| 基础请求 | ✅ | ✅ | ✅ |
| Headers 管理 | ✅ | ✅ | ✅ |
| API Key 集成 | ✅ 加密存储 | ✅ | ✅ |
| 请求历史 | ✅ | ✅ | ✅ |
| 本地存储 | ✅ 100% 本地 | ❌ 云同步 | ✅ |
| 隐私保护 | ✅ 不联网 | ❌ 需登录 | ✅ |
| 轻量级 | ✅ 内置工具 | ❌ 独立应用 | ✅ |

---

## 更新日志

### v1.3.0 (2024-12-20)
- ✨ 新增 HTTP 客户端工具
- 🔐 集成 API Keys 加密管理
- 💾 支持请求历史保存
- 🌍 完整的多语言支持
- 📱 响应式设计，支持移动端

---

## 反馈与建议

如有问题或建议，欢迎通过工作台反馈功能提出。

**计划中的功能：**
- [ ] 环境变量支持
- [ ] 批量请求
- [ ] 响应断言
- [ ] 导出为 cURL 命令
- [ ] WebSocket 支持
