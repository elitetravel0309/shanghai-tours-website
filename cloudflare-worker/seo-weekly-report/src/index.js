/**
 * Google Search Console 每周 SEO 报表 → 飞书即时通讯 Worker
 *
 * 功能：
 *   - 每周定时（Cron）从 Google Search Console API 拉取本周 SEO 数据
 *   - 计算查询量、点击、展示、CTR、平均排名
 *   - 汇总 Top 表现页面 与 Top 关键词
 *   - 通过飞书 Open API 发送富文本交互卡片到群聊
 *
 * 部署（每次部署后）：
 *   wrangler secret put FEISHU_APP_ID
 *   wrangler secret put FEISHU_APP_SECRET
 *   wrangler secret put FEISHU_CHAT_ID
 *   wrangler secret put GSC_CLIENT_EMAIL
 *   wrangler secret put GSC_PRIVATE_KEY
 *   wrangler secret put GSC_SITE_URL
 *   wrangler deploy
 *
 * 手动触发：GET/POST https://seo-weekly-report.<your-sub>.workers.dev/
 * 定时触发：wrangler.toml 中 crons = ["0 0 * * 1"]（每周一 08:00 北京时间）
 */

let DEBUG = false;

export default {
  async scheduled(event, env, ctx) {
    DEBUG = (env.DEBUG === 'true') || false;
    ctx.waitUntil(run(env));
  },

  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === '/' || url.pathname === '/run') {
      return handleManual(env);
    }
    return new Response('SEO Weekly Report Worker.\nUse GET / or /run to trigger.', { status: 200 });
  },
};

async function handleManual(env) {
  try {
    const result = await run(env);
    return new Response(JSON.stringify(result, null, 2), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: e.message }, null, 2), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

/* ============================================================
 *  Main pipeline
 * ============================================================ */
async function run(env) {
  const days = parseInt(env.GSC_DAYS || '7', 10);
  const [start, end] = dateRange(days);

  // 1. 认证 Google Search Console
  const gscToken = await getGscAccessToken(env);

  // 2. 拉取总览数据
  const overview = await fetchOverview(env, gscToken, start, end);

  // 3. 拉取 Top 页面 与 Top 关键词
  const topPages = await fetchTop(env, gscToken, start, end, 'page');
  const topQueries = await fetchTop(env, gscToken, start, end, 'query');

  // 4. 组合成前/本周对比（本周 vs 上周）
  const [prevStart, prevEnd] = dateOffsetRange(days);
  const prevOverview = await fetchOverview(env, gscToken, prevStart, prevEnd);

  // 5. 推送飞书卡片
  const feishu = await buildCardAndSend(env, overview, prevOverview, topPages, topQueries, start, end);

  return {
    ok: true,
    period: { start, end },
    overview,
    prevOverview,
    topPages: topPages.length,
    topQueries: topQueries.length,
    feishuSent: feishu,
  };
}

/* ============================================================
 *  Google Search Console (OAuth2 JWT, Service Account)
 * ============================================================ */
async function getGscAccessToken(env) {
  const { GSC_CLIENT_EMAIL, GSC_PRIVATE_KEY } = env;
  if (!GSC_CLIENT_EMAIL || !GSC_PRIVATE_KEY) {
    throw new Error('缺少 GSC_CLIENT_EMAIL 或 GSC_PRIVATE_KEY 环境变量');
  }
  const now = Math.floor(Date.now() / 1000);
  const header = b64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const claim = b64url(JSON.stringify({
    iss: GSC_CLIENT_EMAIL,
    scope: 'https://www.googleapis.com/auth/webmasters.readonly',
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600,
  }));
  const signingInput = `${header}.${claim}`;
  const signature = await signJwt(signingInput, GSC_PRIVATE_KEY);
  const jwt = `${signingInput}.${signature}`;

  const resp = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${encodeURIComponent(jwt)}`,
  });
  const data = await resp.json();
  if (data.access_token) {
    return data.access_token;
  }
  throw new Error('GSC token 获取失败: ' + JSON.stringify(data));
}

async function signJwt(input, privateKeyPem) {
  // 解析 PEM 私钥为 JWK，用 Web Crypto 做 RSA-SHA256 签名
  const pem = privateKeyPem
    .replace(/-----BEGIN PRIVATE KEY-----/g, '')
    .replace(/-----END PRIVATE KEY-----/g, '')
    .replace(/\s+/g, '');
  const binary = base64ToBytes(pem);
  const key = await crypto.subtle.importKey(
    'pkcs8',
    binary,
    { name: 'RSASSA-PKCS1-v1_5', hash: { name: 'SHA-256' } },
    false,
    ['sign']
  );
  const sig = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5',
    key,
    new TextEncoder().encode(input)
  );
  return bytesToBase64(new Uint8Array(sig));
}

async function fetchOverview(env, token, start, end) {
  const body = {
    startDate: start,
    endDate: end,
    dimensions: [],
    type: 'web',
  };
  const resp = await fetch(
    `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(env.GSC_SITE_URL)}/searchAnalytics/query`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    }
  );
  if (!resp.ok) {
    throw new Error('GSC 总览请求失败 ' + resp.status + ': ' + (await resp.text()).slice(0, 300));
  }
  const data = await resp.json();
  const row = (data.rows && data.rows[0]) || { clicks: 0, impressions: 0, ctr: 0, position: 0 };
  return {
    clicks: row.clicks || 0,
    impressions: row.impressions || 0,
    ctr: row.ctr ? (row.ctr * 100).toFixed(1) : '0.0',
    position: row.position ? Number(row.position).toFixed(1) : '0.0',
  };
}

async function fetchTop(env, token, start, end, dimension) {
  const body = {
    startDate: start,
    endDate: end,
    dimensions: [dimension],
    type: 'web',
    rowLimit: 10,
  };
  const resp = await fetch(
    `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(env.GSC_SITE_URL)}/searchAnalytics/query`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    }
  );
  if (!resp.ok) {
    return [];
  }
  const data = await resp.json();
  return (data.rows || [])
    .map((r) => ({
      key: r.keys[0],
      clicks: r.clicks || 0,
      impressions: r.impressions || 0,
      position: r.position ? Number(r.position).toFixed(1) : '0.0',
    }))
    .slice(0, 10);
}

/* ============================================================
 *  Feishu Open API (interactive card)
 * ============================================================ */
async function getTenantAccessToken(env) {
  const resp = await fetch('https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      app_id: env.FEISHU_APP_ID,
      app_secret: env.FEISHU_APP_SECRET,
    }),
  });
  const data = await resp.json();
  if (data.code !== 0) {
    throw new Error('飞书 token 获取失败: ' + (data.msg || JSON.stringify(data)));
  }
  return data.tenant_access_token;
}

async function buildCardAndSend(env, cur, prev, topPages, topQueries, start, end) {
  const token = await getTenantAccessToken(env);

  // 环比变化
  const clickDelta = pctChange(cur.clicks, prev.clicks);
  const impDelta = pctChange(cur.impressions, prev.impressions);

  // 标点美化成 k（千）
  const fmt = (n) => (n >= 1000 ? (n / 1000).toFixed(1) + 'k' : String(n));

  const card = {
    msg_type: 'interactive',
    card: {
      header: {
        title: { tag: 'plain_text', content: '📊 每周 SEO 报表' },
        template: 'turquoise',
      },
      elements: [
        {
          tag: 'div',
          text: {
            tag: 'lark_md',
            content:
              `**统计周期**：${start} 至 ${end}\n` +
              `**站点**：${env.GSC_SITE_URL}`,
          },
        },
        { tag: 'hr' },
        {
          tag: 'div',
          text: {
            tag: 'lark_md',
            content:
              `🖱 **点击**：**${fmt(cur.clicks)}**  ${clickDelta}\n` +
              `👁 **展示**：**${fmt(cur.impressions)}**  ${impDelta}\n` +
              `📈 **CTR**：${cur.ctr}%\n` +
              `📍 **平均排名**：${cur.position}`,
          },
        },
        { tag: 'hr' },
        {
          tag: 'div',
          text: {
            tag: 'lark_md',
            content: '**🏆 Top 10 页面**\n' + topPages.map((p, i) => `${i + 1}. ${p.clicks}点击 ${p.position}位 ${shorten(p.key, 40)}`).join('\n'),
          },
        },
        { tag: 'hr' },
        {
          tag: 'div',
          text: {
            tag: 'lark_md',
            content: '**🔍 Top 10 关键词**\n' + topQueries.map((q, i) => `${i + 1}. ${q.clicks}点击 ${q.position}位 ${shorten(q.key, 40)}`).join('\n'),
          },
        },
      ],
    },
  };

  const resp = await fetch(`https://open.feishu.cn/open-apis/im/v1/messages?receive_id_type=chat_id`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json; charset=utf-8',
    },
    body: JSON.stringify({
      receive_id: env.FEISHU_CHAT_ID,
      msg_type: 'interactive',
      content: JSON.stringify(card.card),
    }),
  });
  const data = await resp.json();
  if (data.code !== 0) {
    throw new Error('飞书发送失败: ' + (data.msg || JSON.stringify(data)));
  }
  return data;
}

/* ============================================================
 *  Helpers
 * ============================================================ */
function dateRange(days) {
  const end = new Date();
  const start = new Date(end.getTime() - (days - 1) * 86400000);
  return [iso(start), iso(end)];
}

function dateOffsetRange(days) {
  const end = new Date(Date.now() - days * 86400000);
  const start = new Date(end.getTime() - (days - 1) * 86400000);
  return [iso(start), iso(end)];
}

function iso(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function pctChange(cur, prev) {
  if (!prev) return '⚠️ 上周无数据';
  const p = ((cur - prev) / prev) * 100;
  const sign = p >= 0 ? '📈 +' : '📉 ';
  return `${sign}${p.toFixed(1)}%`;
}

function shorten(s, n) {
  if (!s) return '';
  return s.length > n ? s.slice(0, n - 1) + '…' : s;
}

function b64url(s) {
  return bytesToBase64(new TextEncoder().encode(s))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

function bytesToBase64(bytes) {
  let bin = '';
  for (let i = 0; i < bytes.length; i++) {
    bin += String.fromCharCode(bytes[i]);
  }
  return btoa(bin);
}

function base64ToBytes(b64) {
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) {
    bytes[i] = bin.charCodeAt(i);
  }
  return bytes;
}
