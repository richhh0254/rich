# 消费套利 APP (Arbitrage App)

版本：v1.2

## 产品定位

全球/全中国购买力平价 (PPP) 实时监测与迁移决策工具。通过量化不同城市间的物价与汇率差异，帮助用户利用"地缘套利"实现资产增值。

## 功能特性

### 📊 页面A：情报页 (Pulse/Home)
- **套利脉冲流**：实时显示用户所在地和目标城市的物价波动
- **AI预警系统**：根据两地套利倍数的动态变化发送推送提醒
- **金融看板风格**：使用红/绿色彩暗示成本上升或机会窗口

### 🌍 页面B：探索页 (Discovery)
- **瀑布流布局**：展示目的地美景和生活场景
- **购买力标签**：每张卡片标注购买力倍数（如：1万块等于上海的4万块）
- **AI生成描述**：结合真实物价数据生成感性的生活场景描述

### 💰 页面C：计算器与资产页 (Calculator)
- **生存时长模拟**：计算在不同城市的资产生存时间
- **月预算滑块**：动态调节预期月支出
- **AI生活质量对标**：实时生成不同预算下的生活画面描述
- **套利进度条**：视觉化展示购买力跨度的提升比例

## 技术栈

- **框架**：Expo + React Native
- **语言**：TypeScript
- **导航**：Expo Router
- **AI服务**：Google Gemini 2.0 Flash
- **数据源**：
  - Numbeo API（全球物价数据）
  - Fixer.io API（实时汇率）
  - 机票/酒店API（待集成）

## 安装与运行

### 前置要求

- Node.js 18+
- npm 或 yarn
- Expo CLI（全局安装）：`npm install -g expo-cli`

### 安装步骤

1. 安装依赖：
```bash
npm install
```

2. 配置环境变量：
创建 `.env` 文件，添加以下配置：
```
EXPO_PUBLIC_GEMINI_API_KEY=your_gemini_api_key
EXPO_PUBLIC_FIXER_API_KEY=your_fixer_api_key
```

3. 启动开发服务器：
```bash
npm start
```

4. 运行在设备上：
- iOS：按 `i` 键或扫描二维码
- Android：按 `a` 键或扫描二维码
- Web：按 `w` 键

## 项目结构

```
.
├── app/                    # 页面文件（Expo Router）
│   ├── _layout.tsx        # 根布局（导航配置）
│   ├── index.tsx          # 情报页
│   ├── discovery.tsx      # 探索页
│   └── calculator.tsx     # 计算器页
├── services/              # 业务逻辑服务
│   ├── api.ts            # API调用（物价、汇率等）
│   ├── arbitrage.ts      # 套利指数计算
│   ├── calculator.ts     # 生存时长计算
│   ├── ai.ts             # AI服务（Gemini）
│   └── storage.ts        # 本地存储
├── types/                 # TypeScript类型定义
│   └── index.ts
└── assets/               # 静态资源
```

## 核心算法

### 套利指数公式

```
Arbitrage_Index = (Cost_Base / Cost_Target) × Exchange_Rate_Factor
```

- 当指数 > 1.0 时，存在正向套利空间
- 当指数 > 3.0 时，定义为"跨维度生活提升"

### 动态监控逻辑

系统每24小时更新一次核心数据点（房租、汇率、基本餐饮成本）。若两地差距由于外部因素（如通胀或汇率）扩大超过10%，则自动生成一条"套利情报"。

## 开发计划

- [ ] 集成真实的Numbeo API
- [ ] 集成真实的汇率API（Fixer.io）
- [ ] 集成机票/酒店价格API
- [ ] 实现推送通知功能
- [ ] 添加用户设置页面
- [ ] 优化AI生成内容的质量
- [ ] 添加更多城市数据
- [ ] 实现数据缓存机制

## 许可证

MIT

## 联系方式

如有问题或建议，请提交Issue。


