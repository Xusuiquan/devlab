# DevLab 学习进度

## 第一阶段：Node.js + NestJS 基础

学习目标：

- 理解 Node.js 的同步执行、事件循环与异步调度。
- 逐步掌握模块、异步 I/O 和 HTTP 请求处理。
- 理解 NestJS 的 Module、Controller、Provider、依赖注入与请求生命周期。
- 能结合实验和 DevLab 源码解释实现原理，并记录自己的理解。

当前阶段：Node.js + NestJS 基础。当前进入第 2 课原生 Node.js HTTP 服务；事件循环课的实验和待办保留在下方，尚未记录学习者验收结果。

## 每课流程

原理 → 最小实验 → DevLab 实际应用 → 技术笔记 → 测试验证。

事件循环课联系现有健康检查接口思考请求响应；HTTP 课在独立实验中实现健康检查与内存笔记列表。笔记中的个人理解与总结由学习者填写。

## 当前课程：第 2 课 · 原生 Node.js HTTP 服务

- 实验：[playground/nodejs/http-server.mjs](../../playground/nodejs/http-server.mjs)。
- 笔记：[04 · 原生 Node.js HTTP 服务](../01-nodejs/04-http.md)。
- 下一课程：NestJS Module、Controller、Service。
- 学习目标：解释请求方法、URL 路径与查询参数、JSON 响应、状态码，以及 `createServer` 的请求处理过程。
- 范围：仅使用 `node:http`，监听 `127.0.0.1:3001`；不修改应用、不安装依赖、不实现笔记 CRUD。
- 当前状态：实验已通过助手验证，学习者理解待独立验证。

本课实施步骤：

- [x] 检查项目约定、现有实验、文档与工作区差异。
- [x] 编写内存笔记数组、JSON 响应辅助函数和三个 GET 查询场景，其他请求返回 404。
- [x] 编写客观知识、实验说明与验证步骤，保留个人总结空白。
- [x] 启动服务，实际检查健康接口、完整列表、分类筛选与 404，随后停止进程。

学习者待办：

- [ ] 独立运行并解释四项验证结果。
- [ ] 自行实现按 ID 查询笔记的练习，处理不存在的 ID。
- [ ] 回答本课三道面试题并填写个人理解与总结。

### 第 2 课验证记录

2026-11-05，由助手使用 Node.js v24.15.0 实际运行：

| 检查 | 实际结果 |
| --- | --- |
| `node --check playground/nodejs/http-server.mjs` | 通过 |
| `GET /api/health` | 200，`{"status":"ok"}` |
| `GET /api/notes` | 200，返回两条示例笔记 |
| `GET /api/notes?category=Node.js` | 200，仅返回 Node.js 分类的一条笔记 |
| `GET /api/unknown` | 404，`{"error":"Not Found"}` |
| `GET /api/notes?category=Unknown` | 200，`[]` |
| `GET /api/notes/1` | 404，按 ID 查询仍留作学习者练习 |

上述 HTTP 响应均验证了 JSON 响应头与实际响应体。验证完成后已停止本次启动的实验进程；未安装依赖、未执行全量构建、未提交 Git。实验通过不代表学习者已掌握。

## 第 1 课：事件循环环境准备记录

- [x] 检查现有架构、依赖与 Git 差异，保留已有配置。
- [x] 创建 `playground/nodejs/event-loop.mjs`，观察同步代码、Promise 微任务与定时器回调顺序。
- [x] 创建 `docs/01-nodejs/02-event-loop.md`，提供实验说明与空白笔记模板。
- [x] 同步项目阶段、文档目录约定和后续学习流程。
- [x] 使用 `.nvmrc` 指定的 Node.js 运行实验与语法检查，检查本次 Diff。

### 课程资料

- 实验：[event-loop.mjs](../../playground/nodejs/event-loop.mjs)。
- 笔记：[02 · 事件循环](../01-nodejs/02-event-loop.md)。
- 准备状态：已就绪（2026-11-05）。
- 学习状态：待学习者预测、独立运行、填写笔记与回答问题；环境就绪不代表知识点已掌握。

### 事件循环学习者待办

- [ ] 阅读原理资料，写下首次运行前的输出预测。
- [ ] 独立运行实验，记录输出并解释与预测的差异。
- [ ] 联系 DevLab 的健康检查接口思考同步耗时操作的影响。
- [ ] 填写个人理解、三个问题的回答与总结。

## 文档目录

- `docs/00-roadmap/`：阶段目标与进度。
- `docs/01-nodejs/`：Node.js 基础课程笔记。
- `docs/notes/`：保留已有初始化笔记；后续课程按主题目录组织。
- `docs/PROJECT.md` 与 `docs/LEARNING.md`：继续维护项目背景与长期路线。

## 第 1 课验证记录

2026-11-05，由助手使用 Node.js v24.15.0 执行：

- `node --check playground/nodejs/event-loop.mjs`：通过。
- `node playground/nodejs/event-loop.mjs`：正常退出，输出顺序如下。

```text
sync: start
sync: end
promise: microtask
timeout: callback
```

本次仅运行实验及相关语法、文档链接与 Diff 检查；未执行前后端完整构建，未提交 Git。学习者独立实验和个人总结仍待完成。
