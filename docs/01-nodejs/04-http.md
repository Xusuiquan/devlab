# 04 · 原生 Node.js HTTP 服务

## 1. 一句话理解 HTTP

HTTP 是客户端与服务端交换请求和响应的应用层协议；客户端表达要操作的资源，服务端返回状态、响应头及可选的响应体。

HTTP 的无状态语义不妨碍服务端保存数据：本实验的笔记保存在进程内存中，重启后重新初始化。[HTTP 语义规范](https://www.rfc-editor.org/rfc/rfc9110.html#section-3.3)

## 2. HTTP Request 与 Response

以本实验的 HTTP/1.1 请求为例：

```http
GET /api/notes?category=Node.js HTTP/1.1
Host: 127.0.0.1:3001

```

响应由状态行、响应头、空行和响应体组成，下面省略了 Node.js 自动生成的部分响应头：

```http
HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8

[{"id":1,"title":"Event Loop 事件循环","category":"Node.js"}]
```

| Node.js 对象/API | 本实验中的作用 |
| --- | --- |
| `req` | `IncomingMessage`，读取收到的请求信息 |
| `req.method` | HTTP 方法，例如 `GET` |
| `req.url` | 请求目标，例如 `/api/notes?category=Node.js` |
| `res` | `ServerResponse`，构造本次请求的响应 |
| `res.writeHead(statusCode, headers)` | 写入状态码与响应头，须在响应体发送前调用 |
| `res.end(body)` | 可写入最后一段响应体，并标记本次响应结束 |

JSON 响应需要两步：用 `Content-Type` 声明数据格式，再用 `JSON.stringify()` 将 JavaScript 值序列化为响应文本。声明响应头不会自动把对象转换成 JSON。[Node.js HTTP API](https://nodejs.org/docs/latest-v24.x/api/http.html#class-httpserverresponse)

`res.end()` 结束的是本次 HTTP 响应，不等同于立刻关闭 TCP 连接；连接可以继续复用。

## 3. GET、URL 路径与查询参数

- `GET` 用于获取资源。本实验读取数组，不修改笔记。
- `pathname` 标识路径：`/api/notes`。
- 查询串从 `?` 开始，`category=Node.js` 是本例的筛选条件。
- 原生 `req.url` 通常不是完整 URL，因此使用固定 base 解析；base 仅辅助解析，不会发起网络请求。

```js
const url = new URL(req.url, 'http://127.0.0.1:3001');
const category = url.searchParams.get('category');
```

`searchParams.get()` 会解码参数；没有该参数时返回 `null`，传入 `?category=` 时返回空字符串。本实验按分类名称精确匹配，未传参返回全部，空值或不存在的分类返回空数组。

只比较 `req.url === '/api/notes'` 会漏掉带查询串的请求；路由应匹配方法和 `pathname`。[Node.js URL API](https://nodejs.org/api/url.html#urlsearchparamsgetname)

## 4. HTTP 状态码

| 状态码 | 含义 | 本实验中的情况 |
| --- | --- | --- |
| 200 | 请求成功 | 健康检查、全部笔记、分类筛选 |
| 404 | 找不到目标资源 | 未匹配到路由 |

分类筛选得到空数组仍返回 200：列表接口存在，只是没有符合条件的数据。

本实验仅实现 GET，其他方法和未匹配路径统一走 404 兜底。HTTP 规范还定义了 405，表示资源不支持该请求方法，并要求携带 `Allow` 响应头；本课不扩展该分支。[HTTP 状态码规范](https://www.rfc-editor.org/rfc/rfc9110.html#section-15)

## 5. Node.js createServer 原理

1. `createServer(requestListener)` 创建 HTTP Server，并注册请求事件的处理函数。
2. `server.listen(3001, '127.0.0.1')` 绑定本机回环地址与端口，开始接收连接；调用 `createServer` 本身不会开始监听。
3. Node.js 接收并解析 HTTP 请求，为每次请求调用处理函数，传入对应的 `req` 和 `res`。
4. 实验自行判断方法和路径，计算要返回的数据，通过辅助函数完成 JSON 响应。

一次连接可以承载多个请求；请求处理函数不是每个连接只执行一次。事件循环驱动请求事件，回调中的长时间同步计算会占用当前 JavaScript 执行线程，拖延其他请求处理。[Node.js createServer](https://nodejs.org/docs/latest-v24.x/api/http.html#httpcreateserveroptions-requestlistener)

## 6. 最小代码示例

完整可执行实验：[http-server.mjs](../../playground/nodejs/http-server.mjs)。下面只展示健康检查所需的核心代码：

```js
import { createServer } from 'node:http';

function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(data));
}

const server = createServer((req, res) => {
  const url = new URL(req.url, 'http://127.0.0.1:3001');
  if (req.method === 'GET' && url.pathname === '/api/health') {
    return sendJson(res, 200, { status: 'ok' });
  }
  sendJson(res, 404, { error: 'Not Found' });
});

server.listen(3001, '127.0.0.1');
```

在项目根目录运行完整实验，无需安装依赖：

```bash
nvm use
node --check playground/nodejs/http-server.mjs
node playground/nodejs/http-server.mjs
```

在另一终端验证；`-i` 同时显示响应状态、响应头与响应体：

```bash
curl -i 'http://127.0.0.1:3001/api/health'
curl -i 'http://127.0.0.1:3001/api/notes'
curl -i 'http://127.0.0.1:3001/api/notes?category=Node.js'
curl -i 'http://127.0.0.1:3001/api/unknown'
```

预期契约：

| 请求 | 状态码 | JSON 响应体 |
| --- | --- | --- |
| `GET /api/health` | 200 | `{"status":"ok"}` |
| `GET /api/notes` | 200 | 两条笔记组成的数组，每条含 `id`、`title`、`category` |
| `GET /api/notes?category=Node.js` | 200 | 仅包含 `id: 1` 的 Node.js 笔记 |
| `GET /api/unknown` | 404 | `{"error":"Not Found"}` |

验证结束后，在启动服务的终端按 Ctrl+C，释放端口。助手实际运行结果见 [学习进度](../00-roadmap/progress.md#第-2-课验证记录)。

## 7. DevLab 中的实际应用

- 健康接口用于观察进程是否能接收并响应请求，不代表外部依赖或业务链路正常。
- 笔记列表提供知识库的数据查询入口，分类筛选把 URL 参数映射为内存数组的过滤条件。
- 这里手写的请求分发、参数读取与 JSON 输出，可作为下一课理解 NestJS Controller 和 Service 职责的基础。
- 实验独立运行在 3001 端口，现有前后端应用保持原样，数据仅为进程内的示例数据。

独立练习需求：自行实现 `GET /api/notes/:id`。解析路径参数，按笔记 ID 查找；找到时返回 200 和单条笔记，不存在时返回 404 JSON。路径参数是字符串，需自行考虑如何与数组中的 ID 匹配。本课源码不包含该路由，也不在此提供实现代码。

## 8. 易错点

- 漏掉 `res.end()`，响应可能一直不结束，客户端持续等待。
- 响应后继续执行其他分支，可能重复写入响应；本实验用 `return` 结束已命中的分支。
- 在发送响应体后修改响应头，可能触发 `ERR_HTTP_HEADERS_SENT`。
- 将对象直接传给 `res.end()`；本实验应先调用 `JSON.stringify()`。
- 混淆列表为空和路由不存在：前者返回 200 与 `[]`，后者返回 404。
- 将不存在的查询参数 `null` 与传入的空字符串混为一谈。
- 同时启动多个实验实例占用 3001 端口，报 `EADDRINUSE`；停止自己先前启动的实例后再运行。
- 认为原生 HTTP 服务会自动匹配路由或解析 JSON 请求体；这些能力需要应用或框架另行处理。

## 9. 面试问题

1. 收到 `GET /api/notes?category=Node.js` 时，`req.method`、`req.url`、`url.pathname` 和 `url.searchParams.get('category')` 分别是什么？为什么不能只比较原始 `req.url`？
2. `res.writeHead()` 与 `res.end()` 各负责什么？只设置 JSON 的 `Content-Type`，客户端就能收到 JSON 吗？
3. `GET /api/notes?category=Unknown` 与 `GET /api/unknown` 应返回相同的状态码吗？分别代表什么语义？

## 10. 我的理解与总结
