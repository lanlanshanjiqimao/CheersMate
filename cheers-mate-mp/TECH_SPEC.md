# Cheers Mate 微信小程序 — 技术方案

## 一、整体架构

```
┌─────────────────────────────────────────────────┐
│                  微信小程序 (前端)                 │
│         Taro 4 + React + TypeScript              │
│         NutUI React + 自定义组件                   │
└──────────────────────┬──────────────────────────┘
                       │ HTTPS
                       ▼
┌─────────────────────────────────────────────────┐
│                 API Gateway (Nginx)               │
│            SSL 终止 / 限流 / 日志                   │
└──────────────────────┬──────────────────────────┘
                       │
          ┌────────────┼────────────┐
          ▼            ▼            ▼
   ┌────────────┐ ┌─────────┐ ┌──────────┐
   │  业务服务   │ │  IM 服务  │ │ 定时任务  │
   │  (Node.js) │ │(WebSocket│ │ (Node.js)│
   │            │ │ + Redis) │ │          │
   └─────┬──────┘ └────┬─────┘ └─────┬────┘
         │              │             │
         ▼              ▼             ▼
   ┌──────────┐  ┌──────────┐  ┌──────────┐
   │ PostgreSQL│  │  Redis   │  │ 腾讯云 OSS│
   │  + Prisma │  │ (缓存/   │  │ (图片/   │
   │          │  │  会话状态)│  │  头像)   │
   └──────────┘  └──────────┘  └──────────┘
         │
         ▼
   ┌──────────┐
   │ 微信开放  │
   │ 能力对接  │
   │ 登录/支付 │
   │ 消息/安全 │
   └──────────┘
```

---

## 二、前端：小程序

### 2.1 技术栈

| 项 | 选择 | 理由 |
|----|------|------|
| 框架 | Taro 4 | React 语法，多端编译，社区活跃 |
| 语言 | TypeScript strict | 与 MVP 代码一致 |
| 状态管理 | Zustand | 轻量，支持持久化中间件 |
| UI 库 | NutUI React (Taro版) | 京东出品，Taro 适配好，组件丰富 |
| 样式 | SCSS | 比 RN StyleSheet 表达力强 |
| 请求 | Taro.request + 封装 | 统一鉴权/错误处理/token 刷新 |
| 地图 | 微信原生 `<Map>` | 无需额外引入 |

### 2.2 目录结构

```
cheers-mate-mp/
├── src/
│   ├── app.config.ts          # 小程序全局配置(页面/TabBar/权限)
│   ├── app.tsx                # 入口，登录态初始化
│   ├── app.scss               # 全局样式
│   ├── pages/
│   │   ├── home/              # 首页
│   │   ├── discover/          # 发现/发布入口
│   │   ├── messages/          # 私信列表
│   │   ├── profile/           # 个人页
│   │   ├── activity/
│   │   │   ├── detail/        # 活动详情
│   │   │   └── create/        # 发布活动
│   │   ├── chat/
│   │   │   └── index/         # 聊天详情
│   │   └── user/
│   │       └── index/         # 他人主页
│   ├── components/
│   │   ├── ui/                # 基础组件(复用 MVP 设计)
│   │   ├── activity/          # 活动组件
│   │   ├── messaging/         # 私信组件
│   │   └── profile/           # 个人页组件
│   ├── constants/             # 直接从 MVP 搬(零改动)
│   ├── types/                 # 直接从 MVP 搬(微调)
│   ├── utils/                 # 直接从 MVP 搬(零改动)
│   ├── services/              # API 请求层(新增)
│   │   ├── request.ts         # Taro.request 封装
│   │   ├── auth.ts            # 登录/token
│   │   ├── activity.ts        # 活动 CRUD
│   │   ├── chat.ts            # 消息收发
│   │   └── user.ts            # 用户信息
│   ├── stores/                # Zustand stores
│   │   ├── authStore.ts
│   │   ├── activityStore.ts
│   │   └── chatStore.ts
│   └── assets/                # 图标/图片
├── project.config.json        # 微信开发者工具配置
├── project.private.config.json
└── package.json
```

### 2.3 小程序 TabBar 配置

`app.config.ts`:

```typescript
export default defineAppConfig({
  pages: [
    'pages/home/index',
    'pages/discover/index',
    'pages/messages/index',
    'pages/profile/index',
  ],
  tabBar: {
    color: '#B2BEC3',
    selectedColor: '#6C5CE7',
    backgroundColor: '#FFFFFF',
    borderStyle: 'white',
    list: [
      { pagePath: 'pages/home/index', text: '首页', iconPath: 'assets/tab-home.png', selectedIconPath: 'assets/tab-home-active.png' },
      { pagePath: 'pages/discover/index', text: '发现', iconPath: 'assets/tab-discover.png', selectedIconPath: 'assets/tab-discover-active.png' },
      { pagePath: 'pages/messages/index', text: '私信', iconPath: 'assets/tab-messages.png', selectedIconPath: 'assets/tab-messages-active.png' },
      { pagePath: 'pages/profile/index', text: '我的', iconPath: 'assets/tab-profile.png', selectedIconPath: 'assets/tab-profile-active.png' },
    ],
  },
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#FFFFFF',
    navigationBarTitleText: 'Cheers Mate',
    navigationBarTextStyle: 'black',
  },
  permission: {
    'scope.userLocation': { desc: '用于显示附近活动和位置分享' },
  },
});
```

### 2.4 可从 MVP 直接复用的代码

| 文件/目录 | 复用方式 | 改动量 |
|-----------|---------|--------|
| `constants/*` | 直接复制 | 零 |
| `types/*` | 直接复制，去掉 `emojiBg`/`online` 等小程序不需要的字段 | 小 |
| `utils/formatters.ts` | 直接复制 | 零 |
| `utils/helpers.ts` | 直接复制 | 零 |
| `data/mock*` | 开发阶段复用，上线后删除 | 零 → 删 |
| `contexts/*` reducer 逻辑 | 搬到 Zustand stores，AsyncStorage → Taro.setStorageSync | 小 |
| `components/*` JSX 结构 | 参考结构重写样式(RN StyleSheet → SCSS) | 中 |

### 2.5 微信特有功能适配

| 功能 | 实现方式 |
|------|---------|
| 登录 | `Taro.login()` → code → 后端换 openid/session |
| 用户头像昵称 | `<button open-type="chooseAvatar">` + `<input type="nickname">` |
| 分享 | `onShareAppMessage` + `onShareTimeline` |
| 订阅消息 | `Taro.requestSubscribeMessage` → 活动提醒/报名通知 |
| 地图/定位 | `<Map>` + `Taro.getLocation` |
| 图片上传 | `Taro.chooseImage` → 上传 OSS |
| 支付(AA) | `Taro.requestPayment` → 后端统一下单 |
| 内容安全 | 发帖/评论前调后端，后端调微信 `msgSecCheck` + `imgSecCheck` |
| 客服 | `<button open-type="contact">` 接入微信客服 |

---

## 三、后端

### 3.1 技术栈

| 项 | 选择 | 理由 |
|----|------|------|
| 运行时 | Node.js 20 LTS | 前后端统一语言 |
| 框架 | NestJS | 模块化、装饰器、TypeScript 优先、生态好 |
| ORM | Prisma | 类型安全、migration 好用、与 TS 契合 |
| 实时通信 | Socket.IO (WebSocket) | 聊天消息推送 |
| 缓存 | Redis 7 | 会话状态、未读数、限流 |
| 文件存储 | 腾讯云 COS | 与微信生态打通、同地域免流量费 |
| 鉴权 | JWT + 微信 session_key | 双层验证 |
| API 文档 | Swagger (NestJS 内置) | 自动生成 |

### 3.2 项目结构

```
cheers-mate-server/
├── src/
│   ├── main.ts
│   ├── app.module.ts
│   ├── modules/
│   │   ├── auth/               # 微信登录 + JWT
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── jwt.strategy.ts
│   │   │   └── dto/
│   │   ├── user/               # 用户 CRUD
│   │   ├── activity/           # 活动 CRUD + 业务逻辑
│   │   ├── comment/            # 评论
│   │   ├── chat/               # 会话 + 消息
│   │   ├── payment/            # 微信支付 + AA 分账
│   │   ├── upload/             # 图片上传 → COS
│   │   ├── notification/       # 订阅消息推送
│   │   └── security/           # 内容安全检测
│   ├── common/
│   │   ├── guards/             # JWT 守卫
│   │   ├── filters/            # 异常过滤器
│   │   ├── interceptors/       # 响应格式化
│   │   └── decorators/         # 自定义装饰器
│   └── prisma/
│       ├── schema.prisma
│       └── migrations/
├── prisma/
│   └── seed.ts                 # 种子数据
├── Dockerfile
├── docker-compose.yml
└── package.json
```

### 3.3 核心数据模型 (Prisma Schema)

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id            String    @id @default(cuid())
  openId        String    @unique                   // 微信 openid
  unionId       String?   @unique                   // 微信 unionid
  avatarUrl     String    @default("")
  nickname      String    @default("")
  rating        Float     @default(5.0)
  activityCount Int       @default(0)
  tags          Tag[]     // 兴趣标签
  createdAt     DateTime  @default(now())

  organized     Activity[]  @relation("Organizer")
  joined        Activity[]  @relation("Participants")
  comments      Comment[]
  sentMessages  Message[]   @relation("Sender")
  favorites     Favorite[]
  conversations ConversationParticipant[]
}

model Activity {
  id             String          @id @default(cuid())
  title          String
  emoji          String          @default("🎯")
  status         ActivityStatus  @default(ENROLLING)
  category       String
  tags           String[]        // PostgreSQL 数组
  date           DateTime
  timeStart      String          // "14:00"
  timeEnd        String          // "16:00"
  location       String
  locationDetail String?
  latitude       Float?          // 经纬度，用于附近活动
  longitude      Float?
  maxPeople      Int
  cost           String
  requirements   String          @default("不限")
  description    String
  images         String[]        // 图片 URL 数组
  organizerId    String
  organizer      User            @relation("Organizer", fields: [organizerId], references: [id])
  participants   User[]          @relation("Participants")   // 多对多
  comments       Comment[]
  favorites      Favorite[]
  conversations  Conversation[]
  createdAt      DateTime        @default(now())

  @@index([category])
  @@index([status])
  @@index([date])
  @@index([latitude, longitude])  // 附近查询
}

model Comment {
  id        String   @id @default(cuid())
  content   String
  likes     Int      @default(0)
  pinned    Boolean  @default(false)
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  activityId String
  activity  Activity @relation(fields: [activityId], references: [id], onDelete: Cascade)
  createdAt DateTime @default(now())

  @@index([activityId, pinned])  // 置顶优先
}

model Conversation {
  id           String    @id @default(cuid())
  type         ConvType  @default(DIRECT)
  name         String
  avatarUrl    String    @default("")
  activityId   String?
  activity     Activity? @relation(fields: [activityId], references: [id])
  dissolved    Boolean   @default(false)
  participants ConversationParticipant[]
  messages     Message[]
  createdAt    DateTime  @default(now())
  updatedAt    DateTime  @updatedAt
}

model ConversationParticipant {
  id             String       @id @default(cuid())
  conversationId String
  conversation   Conversation @relation(fields: [conversationId], references: [id])
  userId         String
  user           User         @relation(fields: [userId], references: [id])
  lastReadAt     DateTime?
  unread         Int          @default(0)

  @@unique([conversationId, userId])
}

model Message {
  id             String       @id @default(cuid())
  type           MsgType      @default(TEXT)
  content        String
  senderId       String
  sender         User         @relation("Sender", fields: [senderId], references: [id])
  conversationId String
  conversation   Conversation @relation(fields: [conversationId], references: [id])
  activityId     String?
  locationName   String?
  locationAddr   String?
  createdAt      DateTime     @default(now())

  @@index([conversationId, createdAt])
}

model Favorite {
  id         String  @id @default(cuid())
  userId     String
  user       User    @relation(fields: [userId], references: [id])
  activityId String
  activity   Activity @relation(fields: [activityId], references: [id])
  createdAt  DateTime @default(now())

  @@unique([userId, activityId])
}

enum ActivityStatus {
  ENROLLING
  FULL
  ONGOING
  ENDED
  CANCELLED
  DRAFT
}

enum ConvType {
  DIRECT
  GROUP
  SYSTEM
}

enum MsgType {
  TEXT
  ACTIVITY_CARD
  LOCATION
  SYSTEM
}
```

### 3.4 核心接口设计

```
POST   /auth/login                 # 微信 code 换 token
GET    /auth/profile               # 获取当前用户信息
PUT    /auth/profile               # 更新头像/昵称/标签

GET    /activities                 # 活动列表(分页/筛选/搜索)
GET    /activities/:id             # 活动详情
POST   /activities                 # 创建活动
PUT    /activities/:id             # 编辑活动
POST   /activities/:id/join        # 加入活动
POST   /activities/:id/leave       # 退出活动
POST   /activities/:id/cancel      # 取消活动
POST   /activities/:id/end-enroll  # 提前结束报名
DELETE /activities/:id/members/:uid # 移除成员
POST   /activities/:id/favorite    # 收藏
DELETE /activities/:id/favorite    # 取消收藏

POST   /activities/:id/comments    # 发评论
PUT    /comments/:id/pin           # 置顶/取消置顶
DELETE /comments/:id               # 删除评论

GET    /conversations              # 会话列表
GET    /conversations/:id          # 会话详情+消息
POST   /conversations/:id/messages # 发消息

POST   /upload/image               # 上传图片 → COS

POST   /payment/create             # 创建支付订单
POST   /payment/callback           # 微信支付回调

POST   /security/check-text        # 文字内容安全检测
POST   /security/check-image       # 图片内容安全检测
```

### 3.5 微信登录流程

```
小程序                   后端                     微信
  │                       │                       │
  │  Taro.login()         │                       │
  │──────────────────────►│                       │
  │       code            │                       │
  │                       │  jscode2session       │
  │                       │──────────────────────►│
  │                       │  openid + session_key │
  │                       │◄──────────────────────│
  │                       │                       │
  │  创建/查找用户          │                       │
  │  生成 JWT              │                       │
  │◄──────────────────────│                       │
  │  { token, userInfo }  │                       │
  │                       │                       │
  │  后续请求带 Authorization: Bearer <token>       │
```

### 3.6 聊天实时通信

```
小程序 A                  后端                  小程序 B
  │                        │                       │
  │  socket.connect()      │                       │
  │───────────────────────►│                       │
  │                        │  socket.connect()     │
  │                        │◄──────────────────────│
  │                        │                       │
  │  send_message          │                       │
  │───────────────────────►│                       │
  │                        │  ① 存 DB              │
  │                        │  ② 推给 B             │
  │                        │──────────────────────►│
  │                        │  ③ 如 B 离线           │
  │                        │     存未读数到 Redis    │
  │                        │  ④ 下次 B 上线推送      │
  │                        │                       │
```

小程序 WebSocket 限制：
- 同时只能有 1 个 WebSocket 连接
- 小程序切后台 5s 后连接断开
- 需要做**断线重连**（指数退避：1s → 2s → 4s → 8s → 16s → 30s cap）
- 离线期间的未读消息，上线后通过 HTTP API 拉取补齐

---

## 四、数据库

### 4.1 选型：PostgreSQL

| 考量 | 选择理由 |
|------|---------|
| 数据类型 | 数组标签 `String[]`、经纬度 `Float` 原生支持 |
| 查询 | 附近活动用 `PostGIS` 扩展，地理查询性能好 |
| 可靠性 | ACID 事务，活动加入/支付不能丢数据 |
| 生态 | Prisma 对 PG 支持最好 |

### 4.2 索引策略

```sql
-- 活动列表查询优化
CREATE INDEX idx_activity_category_status ON "Activity"(category, status);
CREATE INDEX idx_activity_date ON "Activity"(date) WHERE status IN ('ENROLLING', 'FULL');
CREATE INDEX idx_activity_location ON "Activity"(latitude, longitude);

-- 会话消息查询
CREATE INDEX idx_message_conv_time ON "Message"(conversation_id, created_at DESC);

-- 用户收藏
CREATE INDEX idx_favorite_user ON "Favorite"(user_id);
```

### 4.3 种子数据

从 MVP 的 `mockUsers` / `mockActivities` / `mockMessages` 转为 Prisma seed，开发/测试环境自动灌入。

---

## 五、基础设施与部署

### 5.1 推荐云服务：腾讯云

微信小程序 + 腾讯云是同一生态，打通最顺：
- 域名备案走腾讯云更快（和微信后台数据互通）
- COS 图片存储与微信 CDN 联通
- 同地域内网通信免流量费

### 5.2 服务清单

| 服务 | 规格 | 用途 | 月费(预估) |
|------|------|------|-----------|
| CVM (云服务器) | 2C4G | API 服务 + WebSocket | ¥120 |
| PostgreSQL | 1C2G 基础版 | 主数据库 | ¥70 |
| Redis | 256MB 标准版 | 缓存/会话/未读 | ¥40 |
| COS 对象存储 | 标准存储 | 图片/头像 | ¥10-50 |
| SSL 证书 | 免费版(DV) | HTTPS | ¥0 |
| 域名 | .com | — | ¥60/年 |
| CDN | 按流量 | 静态资源加速 | ¥10-30 |
| **合计** | | | **¥250-350/月** |

### 5.3 部署架构

```
                    ┌─────────────┐
                    │   微信客户端  │
                    └──────┬──────┘
                           │ HTTPS
                           ▼
                    ┌─────────────┐
                    │    CDN       │  ← 静态资源(COS)
                    └──────┬──────┘
                           │
                    ┌─────────────┐
                    │    Nginx     │  ← SSL终止 / 反向代理 / 限流
                    │  (同台CVM)   │
                    └──┬───────┬──┘
                       │       │
              ┌────────▼┐  ┌──▼─────────┐
              │ NestJS   │  │ Socket.IO  │
              │ :3000    │  │ :3001      │
              │ (API)    │  │ (WS)       │
              └────┬─────┘  └────┬───────┘
                   │             │
          ┌────────┼─────────────┘
          ▼        ▼
    ┌──────────┐  ┌──────────┐
    │ PostgreSQL│  │  Redis   │
    │ (云数据库)│  │(云Redis) │
    └──────────┘  └──────────┘
```

### 5.4 CI/CD

```
GitHub Push → GitHub Actions → 构建 Docker 镜像 → 推送镜像仓库 → SSH 部署到 CVM
```

```yaml
# .github/workflows/deploy.yml
name: Deploy
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20 }
      - run: npm ci && npx prisma generate && npm run build
      - run: docker build -t cheers-mate-server .
      - run: docker push $REGISTRY/cheers-mate-server:latest
      - run: ssh user@server "docker pull ... && docker-compose up -d"
```

小程序前端发布走微信开发者工具 CLI：

```bash
# 构建小程序
taro build --type weapp

# 用 miniprogram-ci 上传
npx miniprogram-ci upload \
  --pp ./dist \
  --pkp ./private.key \
  --appid wx1234567890 \
  --uv "1.0.0" \
  -r 1 \
  --desc "v1.0.0"
```

---

## 六、开发节奏

### Phase 0: 基础设施 (第1-2周)

| 任务 | 产出 |
|------|------|
| 注册小程序 + ICP 备案 | AppID + 备案号 |
| 购买云服务器 + 域名 + SSL | 可用的 HTTPS 域名 |
| 搭建后端脚手架 | NestJS + Prisma + Docker |
| 部署 PostgreSQL + Redis | 数据库可连接 |
| 实现微信登录 | `/auth/login` 接口跑通 |

### Phase 1: 核心功能 (第3-5周)

| 任务 | 产出 |
|------|------|
| 小程序 Taro 项目搭建 | TabBar + 页面骨架 |
| 迁移 types/constants/utils | 基础代码就位 |
| 活动 CRUD 接口 + 前后端联调 | 首页列表 + 详情 + 发布 |
| 用户体系 (头像/昵称/标签) | 个人页 + 他人页 |
| 图片上传 (COS) | 发布页图片选择 |
| 内容安全检测 | 发帖/评论过审 |

### Phase 2: 社交功能 (第6-8周)

| 任务 | 产出 |
|------|------|
| 聊天 WebSocket | 1:1 私信 + 群聊 |
| 会话列表 + 未读数 | 私信页完整功能 |
| 加入/退出/收藏/评论 | 活动详情全功能 |
| 订阅消息 | 活动提醒推送 |

### Phase 3: 支付 + 上线 (第9-11周)

| 任务 | 产出 |
|------|------|
| 微信支付接入 | AA 分账 |
| 体验版内测 | 全流程走通 |
| 隐私协议 + 用户协议 | 合规文件 |
| 提交审核 | 微信审核 |
| 正式发布 | 上线 |

**总计约 11 周，与备案/支付商户号审批并行可压缩到 8-9 周。**
