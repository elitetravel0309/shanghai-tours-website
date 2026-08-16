/**
 * www → non-www 301 重定向中间件
 * 确保所有 www.shanghaiwondertours.com 请求统一重定向到 shanghaiwondertours.com
 * 消除 Google 重复内容风险，统一 canonical
 */
export async function onRequest(context) {
    const host = context.request.headers.get('host') || '';
    const url = new URL(context.request.url);

    if (host.startsWith('www.')) {
        url.host = url.host.replace(/^www\./, '');
        return Response.redirect(url.toString(), 301);
    }

    return context.next();
}
