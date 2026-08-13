# SEO 每周报表 Worker — 部署指南

一个 Cloudflare Worker，每周自动从 **Google Search Console** 拉取网站 SEO 数据，统计点击/展示/CTR/平均排名，并推送**富文本周报卡片到飞书群聊**。

---

## 一、前置准备（需要 2 个平台的账号）

### 1. 飞书（推送目的地）
在[飞书开放平台](https://open.feishu.cn/app)创建应用（或用现有应用）：
1. 应用能力 → 添加「机器人」
2. 权限管理 → 开通 `im:message`（发送消息）
3. 发布版本 → 申请权限并发布
4. 把机器人拉进目标群聊
5. 记下 **App ID** 和 **App Secret**（凭证与基础信息）

### 2. Google（数据源）— 需要 Service Account
1. 打开 [Google Cloud Console](https://console.cloud.google.com/) → 选择你的项目
2. **启用 API**：Search Console API
3. **创建服务账号**：
   - IAM → 服务账号 → 创建
   - 创建密钥 → JSON → 下载（拿到 `client_email` 和 `private_key`）
4. **把服务账号邮箱加入 Search Console**：
   - 打开 [Search Console](https://search.google.com/search-console/)
   - 你的网站属性 → 设置 → 用户和权限 → 添加用户
   - 填入服务账号邮箱（`xxx@xxx.iam.gserviceaccount.com`），权限选「完整」

---

## 二、配置 Cloudflare Worker 密钥

在 `seo-weekly-report` 目录下执行（需已安装 wrangler 并登录）：

```bash
cd cloudflare-worker/seo-weekly-report
npx wrangler login

# 设置敏感环境变量（secret，不可见）
npx wrangler secret put FEISHU_APP_ID        # 飞书 App ID
npx wrangler secret put FEISHU_APP_SECRET    # 飞书 App Secret
npx wrangler secret put FEISHU_CHAT_ID       # 飞书群聊 ID (oc_xxx)
npx wrangler secret put GSC_CLIENT_EMAIL     # 服务账号邮箱
npx wrangler secret put GSC_PRIVATE_KEY      # 服务账号私钥（PEM）
npx wrangler secret put GSC_SITE_URL         # 如 sc-domain:shanghaiwondertours.com
```

> ⚠️ **GSC_PRIVATE_KEY 注意换行**：PEAM 私钥含 `\n`。wrangler secret 交互输入时可粘贴原样（含换行），或用：
> `echo "$(cat key.json的private_key)" | npx wrangler secret put GSC_PRIVATE_KEY`

---

## 三、部署

```bash
cd cloudflare-worker/seo-weekly-report
npx wrangler deploy
```

部署完成后，Cron（每周一 08:00 北京时间）会自动触发。

---

## 四、手动测试

```bash
# 手动触发一次（部署后得到的 URL）
curl "https://seo-weekly-report.<your-subdomain>.workers.dev/run"
```

返回 JSON 含本周/上周数据、Top 页面、Top 关键词；同时会向飞书群推送一张周报卡片。

---

## 五、环境变量速查表

| 变量 | 必需 | 说明 |
|---|---|---|
| `FEISHU_APP_ID` | ✅ | 飞书应用 App ID |
| `FEISHU_APP_SECRET` | ✅ | 飞书应用 App Secret |
| `FEISHU_CHAT_ID` | ✅ | 飞书目标群聊 ID |
| `GSC_CLIENT_EMAIL` | ✅ | Google 服务账号邮箱 |
| `GSC_PRIVATE_KEY` | ✅ | Google 服务账号私钥 PEM |
| `GSC_SITE_URL` | ✅ | Search Console 属性（`sc-domain:xxx` 或 `https://xxx`） |
| `GSC_DAYS` | 可选 | 报表周期天数，默认 7 |
| `DEBUG` | 可选 | `true` 输出调试信息 |

---

## 六、数据结构（周报卡片内容）

- **总览**：点击、展示、CTR、平均排名（含与上周环比 📈/📉）
- **Top 10 页面**：点击量 + 平均排名
- **Top 10 关键词**：点击量 + 平均排名

<sub>开发：2026-08-14 · 配合 shanghaiwondertours.com 站点 SEO 监控</sub>
