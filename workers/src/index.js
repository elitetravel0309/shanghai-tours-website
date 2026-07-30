/**
 * Shanghai Tours - Contact Form Worker
 *
 * 接收网站联系表单提交，转发到飞书群机器人 Webhook
 *
 * 部署方式：
 *   1. 在 wrangler.toml 或 Cloudflare Dashboard 中设置环境变量：
 *       FEISHU_WEBHOOK = "https://open.feishu.cn/open-apis/bot/v2/hook/你的Webhook地址"
 *   2. wrangler deploy
 */

// 允许跨域请求的来源
const ALLOWED_ORIGINS = [
  'https://shanghaitours.com',
  'https://www.shanghaitours.com',
  'http://localhost:3000',
  'http://localhost:5500',
  'http://127.0.0.1:5500',
  'http://localhost:8000',
];

// 飞书 Webhook 地址 - 通过环境变量配置
// 在 wrangler.toml 中设置 [vars] FEISHU_WEBHOOK
// 或在 Cloudflare Dashboard → Workers → Settings → Variables 中设置
const FEISHU_WEBHOOK = typeof FEISHU_WEBHOOK !== 'undefined'
  ? FEISHU_WEBHOOK
  : ''; // 部署前必须设置！

export default {
  async fetch(request, env, ctx) {
    // 仅接受 POST 请求
    if (request.method !== 'POST') {
      return new Response('Method Not Allowed', { status: 405 });
    }

    // CORS 处理
    const origin = request.headers.get('Origin') || '';
    const corsHeaders = {
      'Access-Control-Allow-Origin': ALLOWED_ORIGINS.includes(origin) ? origin : 'https://shanghaitours.com',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    // 预检请求
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // 从环境变量获取 Webhook（优先）或全局变量
    const webhookUrl = env.FEISHU_WEBHOOK || FEISHU_WEBHOOK;
    if (!webhookUrl) {
      return new Response(JSON.stringify({
        success: false,
        message: 'Server configuration error: Webhook not set'
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    try {
      // 解析表单数据（支持 FormData 和 JSON 两种格式）
      const contentType = request.headers.get('Content-Type') || '';
      let formData = {};

      if (contentType.includes('application/json')) {
        formData = await request.json();
      } else {
        // FormData 解析
        const form = await request.formData();
        for (const [key, value] of form.entries()) {
          formData[key] = value;
        }
      }

      // 验证必填字段
      const name = formData.name || '';
      const email = formData.email || '';
      const message = formData.message || '';

      if (!name || !email || !message) {
        return new Response(JSON.stringify({
          success: false,
          message: '请填写所有必填字段（姓名、邮箱、留言）'
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        });
      }

      // 简单的频率限制：每个 IP 每 5 分钟最多 3 次
      const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
      const rateLimitKey = `rate:${ip}`;
      const currentCount = parseInt(await env.KV.get(rateLimitKey) || '0');

      if (currentCount >= 3) {
        return new Response(JSON.stringify({
          success: false,
          message: '提交太频繁，请 5 分钟后再试'
        }), {
          status: 429,
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        });
      }

      // 更新频率计数
      if (currentCount === 0) {
        await env.KV.put(rateLimitKey, '1', { expirationTtl: 300 });
      } else {
        await env.KV.put(rateLimitKey, String(currentCount + 1), { expirationTtl: 300 });
      }

      // 构造飞书卡片消息
      const feishuMessage = buildFeishuMessage(formData);

      // 发送到飞书 Webhook
      const feishuResponse = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(feishuMessage),
      });

      if (!feishuResponse.ok) {
        const errorText = await feishuResponse.text();
        console.error('Feishu webhook error:', feishuResponse.status, errorText);
        throw new Error(`Feishu webhook returned ${feishuResponse.status}`);
      }

      // 成功响应
      return new Response(JSON.stringify({
        success: true,
        message: '提交成功！我们会尽快回复您。'
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });

    } catch (error) {
      console.error('Worker error:', error);

      return new Response(JSON.stringify({
        success: false,
        message: '服务器繁忙，请稍后再试或直接发送邮件到 elite@foxmail.com'
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }
  }
};

/**
 * 构建飞书卡片消息
 */
function buildFeishuMessage(data) {
  const tourMap = {
    'not-sure': '🤔 还没确定 — 求推荐',
    'classic': '🏛️ 上海经典一日游 ($89)',
    'food': '🍜 上海街头美食夜市游 ($65)',
    'watertown': '🚣 朱家角水乡茶道体验 ($75)',
    'night': '🌃 上海夜景天际线夜游 ($55)',
    'cultural': '🏯 上海文化深度游 ($79)',
    'custom': '🎨 定制私人路线',
  };

  const tourName = tourMap[data.tour] || `未知 (${data.tour})`;
  const dateStr = data.date ? data.date : '未指定';
  const peopleStr = data.people ? `${data.people} 人` : '未指定';
  const countryStr = data.country ? data.country : '未填写';
  const wantsWhatsapp = data.whatsapp === 'yes' ? '✅ 是，希望 WhatsApp 联系' : '❌ 未勾选';

  // 格式化时间
  const now = new Date();
  const submitTime = now.toLocaleString('zh-CN', {
    timeZone: 'Asia/Shanghai',
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit'
  });

  return {
    msg_type: 'interactive',
    card: {
      header: {
        title: { tag: 'plain_text', content: '📩 新的旅游咨询' },
        template: 'red',
      },
      elements: [
        {
          tag: 'div',
          text: {
            tag: 'lark_md',
            content: `**👤 姓名：** ${data.name}\n**📧 邮箱：** ${data.email}\n**🌍 国家：** ${countryStr}\n**🎯 路线：** ${tourName}\n**📅 日期：** ${dateStr}\n**👥 人数：** ${peopleStr}\n**💬 期望 WhatsApp：** ${wantsWhatsapp}`
          }
        },
        { tag: 'hr' },
        {
          tag: 'div',
          text: {
            tag: 'lark_md',
            content: `**📝 留言：**\n${data.message || '无'}`
          }
        },
        { tag: 'hr' },
        {
          tag: 'note',
          elements: [
            {
              tag: 'plain_text',
              content: `🕐 提交时间：${submitTime} | 来源：上海旅游网站`
            }
          ]
        },
        {
          tag: 'action',
          actions: [
            {
              tag: 'button',
              text: { tag: 'plain_text', content: '📧 回复邮件' },
              type: 'primary',
              multi_url: {
                url: `mailto:${data.email}?subject=Re: 上海旅游咨询 - ${data.name}&body=Hi ${data.name}，%0A%0A感谢您通过上海旅游网提交咨询！%0A%0A`,
                pc_url: '',
                ios_url: '',
                android_url: ''
              }
            }
          ]
        }
      ]
    }
  };
}
