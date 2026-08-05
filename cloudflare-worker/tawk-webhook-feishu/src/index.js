/**
 * Tawk.to Webhook → Feishu (Lark) App API Notification Worker
 *
 * Uses Feishu Open API to send interactive card messages to a group chat.
 * More powerful than custom bot webhook: supports interactive cards, rich content.
 *
 * Events supported:
 *   - chat:start              (聊天开始)
 *   - chat:end                (聊天结束)
 *   - chat:transcript_created (聊天记录生成)
 *   - ticket:create           (工单创建)
 *
 * Environment Variables (set in Cloudflare Dashboard or wrangler secret):
 *   FEISHU_APP_ID       - Feishu App ID (cli_xxx)
 *   FEISHU_APP_SECRET   - Feishu App Secret
 *   FEISHU_CHAT_ID      - Target group chat ID (oc_xxx)
 *   TAWK_WEBHOOK_SECRET - Tawk.to webhook secret key (for HMAC verification)
 *   NOTIFICATION_LANG   - "zh" (default) or "en"
 */

// ============================================================
//  Event type labels & colors
// ============================================================
const EVENT_LABELS = {
  'chat:start': { zh: '💬 客户开始聊天', en: '💬 Chat Started', color: 'green' },
  'chat:end': { zh: '🔚 聊天已结束', en: '🔚 Chat Ended', color: 'orange' },
  'chat:transcript_created': { zh: '📝 聊天记录', en: '📝 Chat Transcript', color: 'blue' },
  'ticket:create': { zh: '🎫 新工单创建', en: '🎫 New Ticket', color: 'red' },
};

const COLOR_MAP = {
  green: 'green',
  orange: 'orange',
  blue: 'blue',
  red: 'red',
  grey: 'grey',
};

// ============================================================
//  HMAC-SHA1 signature verification (Tawk.to webhook)
// ============================================================
async function verifySignature(body, signature, secret) {
  if (!secret || !signature) return true; // Skip if no secret configured
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-1' },
    false,
    ['sign']
  );
  const expected = await crypto.subtle.sign('HMAC', key, encoder.encode(body));
  const expectedHex = [...new Uint8Array(expected)]
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
  return expectedHex === signature;
}

// ============================================================
//  Get Feishu tenant_access_token
// ============================================================
async function getTenantAccessToken(appId, appSecret) {
  const resp = await fetch('https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      app_id: appId,
      app_secret: appSecret,
    }),
  });
  const data = await resp.json();
  if (data.code !== 0) {
    throw new Error(`Failed to get tenant_access_token: ${data.msg || JSON.stringify(data)}`);
  }
  return data.tenant_access_token;
}

// ============================================================
//  Send message to Feishu group chat via Open API
// ============================================================
async function sendFeishuMessage(token, chatId, msgType, content) {
  const resp = await fetch('https://open.feishu.cn/open-apis/im/v1/messages?receive_id_type=chat_id', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({
      receive_id: chatId,
      msg_type: msgType,
      content: JSON.stringify(content),
    }),
  });
  return resp.json();
}

// ============================================================
//  Build Feishu interactive card
// ============================================================
function buildCard(payload, lang) {
  const event = payload.event || 'unknown';
  const label = EVENT_LABELS[event] || { zh: '📋 事件通知', en: '📋 Event Notification', color: 'grey' };
  const color = COLOR_MAP[label.color] || 'grey';
  const isZh = lang !== 'en';

  const elements = [];

  // Common fields
  const visitor = payload.visitor || (payload.chat && payload.chat.visitor) || {};
  const requester = payload.requester || {};

  const visitorName = visitor.name || requester.name || (isZh ? '未知' : 'Unknown');
  const visitorEmail = visitor.email || requester.email || '';
  const visitorCity = visitor.city || '';
  const visitorCountry = visitor.country || '';

  // --- Visitor info row ---
  const fields = [];
  fields.push({
    is_short: true,
    text: { tag: 'lark_md', content: `**${isZh ? '访客' : 'Visitor'}**\n${visitorName}` },
  });

  if (visitorEmail) {
    fields.push({
      is_short: true,
      text: { tag: 'lark_md', content: `**${isZh ? '邮箱' : 'Email'}**\n${visitorEmail}` },
    });
  }

  if (visitorCity || visitorCountry) {
    const location = [visitorCity, visitorCountry].filter(Boolean).join(', ');
    fields.push({
      is_short: true,
      text: { tag: 'lark_md', content: `**${isZh ? '地区' : 'Location'}**\n${location}` },
    });
  }

  // Time
  const time = payload.time || new Date().toISOString();
  const timeStr = new Date(time).toLocaleString(isZh ? 'zh-CN' : 'en-US', {
    timeZone: isZh ? 'Asia/Shanghai' : 'UTC',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
  fields.push({
    is_short: true,
    text: { tag: 'lark_md', content: `**${isZh ? '时间' : 'Time'}**\n${timeStr}` },
  });

  // Referrer / source page
  if (payload.referrer) {
    fields.push({
      is_short: false,
      text: { tag: 'lark_md', content: `**${isZh ? '来源页面' : 'Source Page'}**\n${payload.referrer}` },
    });
  }

  // Chat ID
  const chatId = payload.chatId || (payload.chat && payload.chat.id) || '';
  if (chatId) {
    fields.push({
      is_short: true,
      text: { tag: 'lark_md', content: `**Chat ID**\n${chatId}` },
    });
  }

  if (fields.length > 0) {
    elements.push({
      tag: 'div',
      fields: fields,
    });
  }

  // --- Event-specific content ---
  if (event === 'chat:start' && payload.message) {
    const msgText = payload.message.text || '';
    const senderType = payload.message.sender ? payload.message.sender.type : '';
    const senderLabel = senderType === 'visitor'
      ? (isZh ? '访客' : 'Visitor')
      : (isZh ? '客服' : 'Agent');
    elements.push({
      tag: 'div',
      text: {
        tag: 'lark_md',
        content: `**${isZh ? '首条消息' : 'First Message'} (${senderLabel}):**\n${msgText}`,
      },
    });
  }

  if (event === 'chat:transcript_created' && payload.chat && payload.chat.messages) {
    const messages = payload.chat.messages;
    const maxMessages = 20;
    const displayMessages = messages.slice(0, maxMessages);
    let transcriptText = '';

    for (const msg of displayMessages) {
      const sender = msg.sender || {};
      const senderName = sender.t === 'v'
        ? (isZh ? '访客' : 'Visitor')
        : (sender.n || (isZh ? '客服' : 'Agent'));
      const msgContent = msg.msg || '';
      const msgTime = msg.time
        ? new Date(msg.time).toLocaleTimeString(isZh ? 'zh-CN' : 'en-US', {
            hour: '2-digit', minute: '2-digit',
          })
        : '';
      transcriptText += `[${msgTime}] **${senderName}**: ${msgContent}\n`;
    }

    if (messages.length > maxMessages) {
      transcriptText += `\n... ${isZh ? `还有 ${messages.length - maxMessages} 条消息` : `${messages.length - maxMessages} more messages`}`;
    }

    elements.push({
      tag: 'div',
      text: {
        tag: 'lark_md',
        content: `**${isZh ? '聊天记录' : 'Transcript'}:**\n${transcriptText}`,
      },
    });
  }

  if (event === 'ticket:create' && payload.ticket) {
    const ticket = payload.ticket;
    elements.push({
      tag: 'div',
      fields: [
        {
          is_short: true,
          text: { tag: 'lark_md', content: `**${isZh ? '工单号' : 'Ticket #'}**\n${ticket.humanId || ticket.id || ''}` },
        },
        {
          is_short: true,
          text: { tag: 'lark_md', content: `**${isZh ? '主题' : 'Subject'}**\n${ticket.subject || ''}` },
        },
      ],
    });
    if (ticket.message) {
      elements.push({
        tag: 'div',
        text: {
          tag: 'lark_md',
          content: `**${isZh ? '内容' : 'Message'}:**\n${ticket.message}`,
        },
      });
    }
  }

  // --- Action button (link to Tawk.to dashboard) ---
  elements.push({
    tag: 'action',
    actions: [
      {
        tag: 'button',
        text: { tag: 'plain_text', content: isZh ? '前往 Tawk.to 后台回复' : 'Open Tawk.to Dashboard' },
        type: 'primary',
        url: 'https://dashboard.tawk.to',
      },
    ],
  });

  // --- Footer note ---
  elements.push({
    tag: 'note',
    elements: [
      {
        tag: 'plain_text',
        content: isZh
          ? 'Shanghai Wonder Tours · Tawk.to Webhook 通知'
          : 'Shanghai Wonder Tours · Tawk.to Webhook Notification',
      },
    ],
  });

  // Build the card object
  return {
    config: { wide_screen_mode: true },
    header: {
      template: color,
      title: {
        tag: 'plain_text',
        content: label[isZh ? 'zh' : 'en'],
      },
    },
    elements: elements,
  };
}

// ============================================================
//  Main handler
// ============================================================
export default {
  async fetch(request, env, ctx) {
    // Only accept POST
    if (request.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Only allow GET for health check
    if (request.method === 'GET') {
      return new Response(JSON.stringify({ status: 'ok', service: 'tawk-to-feishu-worker' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Get raw body for signature verification
    const rawBody = await request.text();
    const signature = request.headers.get('X-Tawk-Signature') || '';
    const eventId = request.headers.get('X-Hook-Event-Id') || '';

    const secret = env.TAWK_WEBHOOK_SECRET || '';
    const appId = env.FEISHU_APP_ID || '';
    const appSecret = env.FEISHU_APP_SECRET || '';
    const chatId = env.FEISHU_CHAT_ID || '';
    const lang = env.NOTIFICATION_LANG || 'zh';

    // Verify Tawk.to signature
    const isValid = await verifySignature(rawBody, signature, secret);
    if (!isValid) {
      console.log('Signature verification failed');
      return new Response(JSON.stringify({ error: 'Invalid signature' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Parse payload
    let payload;
    try {
      payload = JSON.parse(rawBody);
    } catch (e) {
      console.log('Invalid JSON payload');
      return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Check required env vars
    if (!appId || !appSecret || !chatId) {
      console.error('Missing required environment variables: FEISHU_APP_ID, FEISHU_APP_SECRET, FEISHU_CHAT_ID');
      return new Response(JSON.stringify({ error: 'Server not configured' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Send notification to Feishu
    try {
      // Step 1: Get tenant_access_token
      const token = await getTenantAccessToken(appId, appSecret);
      console.log('Got tenant_access_token successfully');

      // Step 2: Build and send card message
      const card = buildCard(payload, lang);
      const result = await sendFeishuMessage(token, chatId, 'interactive', card);

      if (result.code !== 0) {
        console.error(`Feishu API error: ${JSON.stringify(result)}`);
      } else {
        console.log(`Message sent successfully for event: ${payload.event}`);
      }
    } catch (e) {
      console.error(`Failed to send notification: ${e.message}`);
    }

    // Always return 200 to acknowledge receipt
    return new Response(JSON.stringify({ ok: true, eventId }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  },
};
