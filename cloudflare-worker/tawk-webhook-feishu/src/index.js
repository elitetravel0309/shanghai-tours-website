/**
 * Tawk.to Webhook → Feishu (Lark) Notification Worker
 * 
 * Receives Tawk.to webhook events and forwards them as Feishu message cards.
 * 
 * Events supported:
 *   - chat:start              (聊天开始)
 *   - chat:end                (聊天结束)
 *   - chat:transcript_created (聊天记录生成)
 *   - ticket:create           (工单创建)
 * 
 * Environment Variables (set in Cloudflare Dashboard or wrangler.toml):
 *   FEISHU_WEBHOOK_URL  - Feishu custom bot webhook URL
 *   TAWK_WEBHOOK_SECRET  - Tawk.to webhook secret key (for signature verification)
 *   NOTIFICATION_LANG    - "zh" (default) or "en"
 */

// ============================================================
//  Event type labels
// ============================================================
const EVENT_LABELS = {
  'chat:start': { zh: '💬 聊天开始', en: '💬 Chat Started', color: 'green' },
  'chat:end': { zh: '🔚 聊天结束', en: '🔚 Chat Ended', color: 'orange' },
  'chat:transcript_created': { zh: '📝 聊天记录', en: '📝 Chat Transcript', color: 'blue' },
  'ticket:create': { zh: '🎫 新工单', en: '🎫 New Ticket', color: 'red' },
};

const COLOR_MAP = {
  green: 'green',
  orange: 'orange',
  blue: 'blue',
  red: 'red',
};

// ============================================================
//  HMAC-SHA1 signature verification
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
//  Build Feishu interactive card message
// ============================================================
function buildFeishuCard(payload, lang) {
  const event = payload.event || 'unknown';
  const label = EVENT_LABELS[event] || { zh: '📋 事件通知', en: '📋 Event Notification', color: 'grey' };
  const color = COLOR_MAP[label.color] || 'grey';
  const isZh = lang !== 'en';

  const elements = [];

  // Header
  elements.push({
    tag: 'div',
    text: {
      tag: 'lark_md',
      content: `**${label[isZh ? 'zh' : 'en']}**`,
    },
  });

  // Separator
  elements.push({ tag: 'hr' });

  // Common fields
  const fields = [];

  // Visitor info
  const visitor = payload.visitor || (payload.chat && payload.chat.visitor) || {};
  const requester = payload.requester || {};

  const visitorName = visitor.name || requester.name || (isZh ? '未知' : 'Unknown');
  const visitorEmail = visitor.email || requester.email || '';
  const visitorCity = visitor.city || '';
  const visitorCountry = visitor.country || '';

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

  // Referrer
  if (payload.referrer) {
    fields.push({
      is_short: false,
      text: { tag: 'lark_md', content: `**${isZh ? '来源' : 'Referrer'}**\n${payload.referrer}` },
    });
  }

  // Domain
  if (payload.domain) {
    fields.push({
      is_short: true,
      text: { tag: 'lark_md', content: `**${isZh ? '域名' : 'Domain'}**\n${payload.domain}` },
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

  // Event-specific content
  if (event === 'chat:start' && payload.message) {
    const msgText = payload.message.text || '';
    const senderType = payload.message.sender ? payload.message.sender.type : '';
    const senderLabel = senderType === 'visitor' ? (isZh ? '访客' : 'Visitor') : (isZh ? '客服' : 'Agent');
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
    const maxMessages = 20; // Limit to avoid message too long
    const displayMessages = messages.slice(0, maxMessages);
    let transcriptText = '';
    
    for (const msg of displayMessages) {
      const sender = msg.sender || {};
      const senderName = sender.t === 'v' 
        ? (isZh ? '访客' : 'Visitor')
        : (sender.n || (isZh ? '客服' : 'Agent'));
      const msgContent = msg.msg || '';
      const msgTime = msg.time ? new Date(msg.time).toLocaleTimeString(isZh ? 'zh-CN' : 'en-US', {
        hour: '2-digit', minute: '2-digit'
      }) : '';
      
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

  // Footer note
  elements.push({ tag: 'hr' });
  elements.push({
    tag: 'note',
    elements: [
      {
        tag: 'plain_text',
        content: isZh ? 'Shanghai Wonder Tours · Tawk.to Webhook 通知' : 'Shanghai Wonder Tours · Tawk.to Webhook Notification',
      },
    ],
  });

  // Build card
  const card = {
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

  return {
    msg_type: 'interactive',
    card: card,
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

    // Get raw body for signature verification
    const rawBody = await request.text();
    const signature = request.headers.get('X-Tawk-Signature') || '';
    const eventId = request.headers.get('X-Hook-Event-Id') || '';
    const secret = env.TAWK_WEBHOOK_SECRET || '';
    const feishuUrl = env.FEISHU_WEBHOOK_URL || '';
    const lang = env.NOTIFICATION_LANG || 'zh';

    // Verify signature
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

    // Forward to Feishu
    if (feishuUrl) {
      try {
        const feishuMessage = buildFeishuCard(payload, lang);
        const feishuResponse = await fetch(feishuUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(feishuMessage),
        });

        const feishuResult = await feishuResponse.json();
        console.log(`Feishu response: ${JSON.stringify(feishuResult)}`);

        if (feishuResult.code !== 0 && feishuResult.StatusCode !== 0) {
          console.error(`Feishu error: ${JSON.stringify(feishuResult)}`);
        }
      } catch (e) {
        console.error(`Failed to forward to Feishu: ${e.message}`);
      }
    } else {
      console.log('FEISHU_WEBHOOK_URL not configured, skipping notification');
    }

    // Always return 200 to acknowledge receipt
    return new Response(JSON.stringify({ ok: true, eventId }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  },
};
