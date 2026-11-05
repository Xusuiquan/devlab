import { createServer } from 'node:http';

// 数据仅保存在当前进程内存中，服务重启后重新初始化。
const notes = [
  { id: 1, title: 'Event Loop 事件循环', category: 'Node.js' },
  { id: 2, title: 'NestJS 依赖注入', category: 'NestJS' },
];

function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(data));
}

const server = createServer((req, res) => {
  // req.url 包含查询串，解析后用 pathname 匹配路由、searchParams 读取参数。
  const url = new URL(req.url, 'http://127.0.0.1:3001');

  if (req.method === 'GET' && url.pathname === '/api/health') {
    return sendJson(res, 200, { status: 'ok' });
  }

  if (req.method === 'GET' && url.pathname === '/api/notes') {
    const category = url.searchParams.get('category');
    // 未传 category 时返回全部笔记；传入时按分类名称精确筛选。
    const matchingNotes = category === null
      ? notes
      : notes.filter((note) => note.category === category);

    return sendJson(res, 200, matchingNotes);
  }

  sendJson(res, 404, { error: 'Not Found' });
});

server.listen(3001, '127.0.0.1', () => {
  console.log('HTTP playground listening at http://127.0.0.1:3001');
});
