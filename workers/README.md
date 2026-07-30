# Shanghai Tours - Cloudflare Workers

## 部署说明

### 前置条件
1. Cloudflare 账号（免费）：https://dash.cloudflare.com/signup
2. Node.js 安装（用于 Wrangler CLI）
3. 你的域名托管在 Cloudflare 上（推荐），或使用 workers.dev 子域名

---

### 第一步：安装 Wrangler CLI
```bash
npm install -g wrangler
```

### 第二步：登录 Cloudflare
```bash
wrangler login
```

### 第三步：配置飞书 Webhook
打开 `src/index.js`，找到这一行：
```js
const FEISHU_WEBHOOK = 'YOUR_WEBHOOK_URL_HERE';
```
替换成你的飞书机器人 Webhook 地址。

### 第四步：部署
```bash
cd workers
wrangler deploy
```

### 第五步：更新网站表单 action
部署后会得到一个 URL，例如：
- `https://shanghai-tours-form.xxx.workers.dev`
- 或 `https://form.yourdomain.com`（如果你绑定了自定义域名）

然后将 `contact.html` 中的表单 action 改为这个 URL。

---

## Webhook 地址获取

1. 打开飞书 → 进入群聊 → 点击右上角"设置"
2. 选择"群机器人" → "添加机器人"
3. 选择"自定义机器人" → 填写名称
4. 复制 Webhook 地址
5. 安全设置建议：勾选"IP 白名单"，添加 Cloudflare Workers 的 IP 范围
