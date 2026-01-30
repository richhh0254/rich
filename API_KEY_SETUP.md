# API Key 配置指南

## 问题说明

如果遇到以下错误：
```
ERROR AI生成失败: [Error: [GoogleGenerativeAI Error]: Error fetching from https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent: [403 ] Method doesn't allow unregistered callers (callers without established identity). Please use API Key or other form of API consumer identity to call this API.]
```

这表示 Gemini API Key 未正确配置。

## 解决方案

### 方法1：使用 .env 文件（推荐）

1. **创建 `.env` 文件**（在项目根目录）：
```bash
# Windows PowerShell
New-Item -Path .env -ItemType File

# Linux/Mac
touch .env
```

2. **添加 API Key**：
```env
EXPO_PUBLIC_GEMINI_API_KEY=你的API密钥
```

3. **获取 Gemini API Key**：
   - 访问 [Google AI Studio](https://makersuite.google.com/app/apikey)
   - 登录你的 Google 账号
   - 点击 "Create API Key" 创建新密钥
   - 复制生成的 API Key

4. **重启开发服务器**：
```bash
# 停止当前服务器（Ctrl+C）
npm start
```

⚠️ **重要**：修改 `.env` 文件后，必须重启 Expo 开发服务器才能生效！

### 方法2：使用 app.json 配置

如果 `.env` 文件不工作，可以在 `app.json` 中添加：

```json
{
  "expo": {
    "extra": {
      "geminiApiKey": "你的API密钥"
    }
  }
}
```

### 验证配置

配置完成后，检查控制台输出：
- ✅ 如果看到警告 `⚠️ Gemini API Key未配置`，说明配置未生效
- ✅ 如果没有警告，说明配置成功

## 当前行为

即使没有配置 API Key，应用也会正常工作：
- ✅ 使用智能生成的默认描述（基于物价数据）
- ✅ 所有功能正常，只是不使用 AI 生成内容
- ⚠️ 控制台会显示警告信息

## 模型说明

代码已更新为使用稳定的模型：
- **之前**：`gemini-2.0-flash-exp`（实验版本，可能不稳定）
- **现在**：`gemini-1.5-flash`（稳定版本，推荐使用）

## 故障排除

### 问题1：API Key 配置了但还是报错

**检查清单**：
1. ✅ `.env` 文件在项目根目录（不是 `app/` 目录）
2. ✅ 变量名正确：`EXPO_PUBLIC_GEMINI_API_KEY`（注意大小写）
3. ✅ 没有多余的空格或引号
4. ✅ 已重启开发服务器

### 问题2：API Key 无效

**可能原因**：
- API Key 已过期或被撤销
- API Key 没有访问 Gemini API 的权限
- 达到了 API 使用限额

**解决方法**：
- 在 [Google AI Studio](https://makersuite.google.com/app/apikey) 创建新的 API Key
- 检查 API 使用配额

### 问题3：环境变量读取不到

**解决方法**：
1. 确保使用 `EXPO_PUBLIC_` 前缀（Expo 要求）
2. 检查 `babel.config.js` 是否正确配置
3. 尝试使用 `app.json` 的 `extra` 字段

## 测试 API Key

配置完成后，可以测试 API Key 是否有效：

```bash
# 在项目根目录创建测试文件 test-api.js
node -e "const { GoogleGenerativeAI } = require('@google/generative-ai'); const ai = new GoogleGenerativeAI(process.env.EXPO_PUBLIC_GEMINI_API_KEY || ''); const model = ai.getGenerativeModel({ model: 'gemini-1.5-flash' }); model.generateContent('Hello').then(r => console.log('✅ API Key 有效')).catch(e => console.error('❌ API Key 无效:', e.message));"
```

## 更多帮助

- [Expo 环境变量文档](https://docs.expo.dev/guides/environment-variables/)
- [Google Gemini API 文档](https://ai.google.dev/docs)
- [Google AI Studio](https://makersuite.google.com/)

