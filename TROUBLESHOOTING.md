# 故障排除指南

## 错误：Element type is invalid

如果遇到以下错误：
```
ERROR [Error: Element type is invalid: expected a string (for built-in components) or a class/function (for composite components) but got: object.
Check the render method of `Route(entry)`.]
```

### 解决方案

1. **清除缓存并重新启动**：
```bash
# 清除 Expo 缓存
npx expo start -c

# 或者清除所有缓存
rm -rf node_modules
rm -rf .expo
npm install
npx expo start -c
```

2. **检查文件结构**：
确保 `app/` 目录结构正确：
```
app/
  ├── _layout.tsx    # 根布局（必须）
  ├── index.tsx      # 首页
  ├── discovery.tsx  # 探索页
  └── calculator.tsx # 计算器页
```

3. **确保所有页面正确导出**：
每个页面文件必须使用 `export default function`：
```typescript
export default function PageName() {
  return <View>...</View>;
}
```

4. **检查 package.json**：
确保 `main` 字段正确：
```json
{
  "main": "expo-router/entry"
}
```

5. **验证依赖版本**：
确保 Expo Router 和相关依赖版本兼容：
```bash
npm list expo-router
npm list expo
```

6. **重启 Metro bundler**：
```bash
# 停止当前服务器（Ctrl+C）
# 然后重新启动
npm start
```

### 常见原因

- **缓存问题**：旧的缓存文件导致问题
- **导入错误**：组件导入/导出不正确
- **版本不兼容**：React 19 和某些包的兼容性问题
- **文件缺失**：缺少必要的布局文件

### 如果问题仍然存在

1. 检查控制台完整错误信息
2. 查看是否有其他导入错误
3. 尝试创建一个最简单的 `_layout.tsx` 测试：
```typescript
import { Stack } from 'expo-router';

export default function RootLayout() {
  return <Stack />;
}
```

如果这个简单版本可以工作，再逐步添加功能。

