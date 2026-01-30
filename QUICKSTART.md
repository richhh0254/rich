# 快速启动指南

## 第一步：安装依赖

```bash
npm install
```

## 第二步：配置环境变量

创建 `.env` 文件（复制 `.env.example`）：

```bash
# 如果使用 Windows PowerShell
Copy-Item .env.example .env

# 如果使用 Linux/Mac
cp .env.example .env
```

然后编辑 `.env` 文件，填入你的API密钥：

```
EXPO_PUBLIC_GEMINI_API_KEY=你的Gemini_API密钥
EXPO_PUBLIC_FIXER_API_KEY=你的Fixer_API密钥（可选）
```

### 获取API密钥

1. **Gemini API Key**:
   - 访问 [Google AI Studio](https://makersuite.google.com/app/apikey)
   - 创建新的API密钥
   - 复制到 `.env` 文件

2. **Fixer.io API Key** (可选，目前使用模拟数据):
   - 访问 [Fixer.io](https://fixer.io/)
   - 注册账号并获取API密钥

## 第三步：启动开发服务器

```bash
npm start
```

## 第四步：运行在设备上

启动后，你会看到一个二维码和选项菜单：

- 按 `i` - 在iOS模拟器中打开
- 按 `a` - 在Android模拟器中打开
- 按 `w` - 在Web浏览器中打开
- 扫描二维码 - 在真实设备上打开（需要安装Expo Go应用）

## 功能测试

### 1. 情报页（首页）
- 查看套利信号卡片
- 下拉刷新更新数据
- 查看套利指数和变化百分比

### 2. 探索页
- 浏览不同城市的卡片
- 查看购买力倍数
- 阅读AI生成的生活场景描述

### 3. 计算器页
- 输入总存款金额
- 调整月预算滑块
- 选择基础城市和目标城市
- 查看生存时长计算结果

## 常见问题

### Q: 提示找不到模块
A: 运行 `npm install` 重新安装依赖

### Q: API调用失败
A: 检查 `.env` 文件中的API密钥是否正确配置

### Q: 图片不显示
A: 当前使用Unsplash的图片URL，需要网络连接。实际部署时应使用CDN或本地资源

### Q: 数据是模拟的
A: 是的，当前版本使用模拟数据。要使用真实数据，需要：
1. 集成Numbeo API
2. 集成Fixer.io API
3. 集成机票/酒店API

## 下一步开发

1. 替换模拟数据为真实API调用
2. 添加用户设置页面
3. 实现推送通知
4. 优化UI/UX
5. 添加更多城市数据
6. 实现数据缓存

## 技术支持

如有问题，请查看：
- [Expo文档](https://docs.expo.dev/)
- [React Native文档](https://reactnative.dev/)
- [项目README](./README.md)


