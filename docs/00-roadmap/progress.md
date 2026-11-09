# DevLab 学习进度

## 第一阶段：Node.js + NestJS 基础

学习目标：

- 理解 Node.js 的同步执行、事件循环与异步调度。
- 逐步掌握模块、异步 I/O 和 HTTP 请求处理。
- 理解 NestJS 的 Module、Controller、Provider、依赖注入与请求生命周期。
- 能结合实验和 DevLab 源码解释实现原理，并记录自己的理解。

当前阶段：Node.js + NestJS 基础。当前进入第 5 课单元测试、Mock 与 E2E；前四课实验、验证与学习者待办保留，尚未记录学习者独立验收结果。

## 每课流程

原理 → 最小实验 → DevLab 业务应用 → 自动化测试 → 技术笔记 → 自主复盘。

事件循环课联系健康接口思考请求响应，HTTP 课用原生服务查询内存笔记，第 3 课将查询迁移到 NestJS 的模块、控制器和服务中。笔记中的个人理解与总结由学习者填写。

## 当前课程：第 5 课 · NestJS 单元测试、Mock 与 E2E

- Service 测试：[notes.service.spec.ts](../../apps/api/src/notes/notes.service.spec.ts)，只调用公开方法。
- Controller Mock：[notes.controller.spec.ts](../../apps/api/src/notes/notes.controller.spec.ts)，通过 TestingModule 和 useValue 注入模拟服务。
- HTTP E2E：[notes.e2e-spec.ts](../../apps/api/test/notes.e2e-spec.ts)，使用真实 AppModule、真实 Service 与 Supertest。
- 共享 HTTP 配置：[app.setup.ts](../../apps/api/src/app.setup.ts)，正式入口和 E2E 共用。
- 笔记：[单元测试、Mock 与 E2E](../02-nestjs/03-unit-testing-mock-e2e.md)。
- 测试体系：原项目无测试框架，本课新增 Jest 30，复用 TypeScript 编译器保留装饰器元数据。
- 当前状态：19 个已实现测试通过，三项独立练习保留；学习者理解待独立验收。

本课步骤：

- [x] 检查现有测试配置和业务契约，确认三个测试边界。
- [x] 新增 Service、Controller Mock、HTTP E2E 测试，保持业务规则原样。
- [x] 实际运行测试及必要检查，记录通过/失败结果。
- [x] 完成技术笔记，保留个人总结空白。

学习者待办（本次不补齐对应测试）：

- [ ] 自行编写 `GET /api/notes/count` 对应测试。
- [ ] 自行编写 PATCH title=null 返回 400 的测试。
- [ ] 自行编写 DELETE 不存在的笔记返回 404 的测试。
- [ ] 独立解释 Mock 和真实 HTTP 测试的边界，回答面试题并填写总结。

### 第 5 课验证记录

2026-11-09，Node.js v24.15.0、Jest 30.5.2、NestJS 12.3.2 下实际执行：

| 检查 | 实际结果 |
| --- | --- |
| 安装测试依赖 | 首次被 watcher 构建脚本策略阻止；显式禁用该脚本后冻结锁文件离线安装成功 |
| 首轮 test:unit | 编译失败，缺少 @jest/globals 直接依赖，尚未执行用例 |
| 修复后 `pnpm --filter @devlab/api test:unit` | 2 个套件、10 个用例通过，0 失败 |
| `pnpm --filter @devlab/api test:e2e` | 1 个套件、9 个用例通过，0 失败 |
| API typecheck / build | 均通过，仅检查和构建后端 |

Service 7 例、Controller Mock 3 例、HTTP E2E 9 例，共 19 例。所有测试逐例重建状态并关闭资源，未使用 forceExit。三项自主练习未补齐，自动化测试通过不代表学习者已掌握。未修改前端或业务规则、未升级既有依赖、未提交 Git。

## 第 4 课 · NestJS CRUD + DTO + ValidationPipe（保留记录）

- 代码：[NotesController](../../apps/api/src/notes/notes.controller.ts)、[NotesService](../../apps/api/src/notes/notes.service.ts)、[CreateNoteDto](../../apps/api/src/notes/dto/create-note.dto.ts)、[UpdateNoteDto](../../apps/api/src/notes/dto/update-note.dto.ts)、[全局 ValidationPipe](../../apps/api/src/main.ts)。
- 笔记：[CRUD、DTO 与参数校验](../02-nestjs/02-crud-dto-validation.md)。
- 学习目标：理解运行时 DTO 校验、部分更新、服务端 ID、HTTP 状态码与异常。
- 下一课程：NestJS 单元测试与 Mock。
- 当前状态：CRUD、DTO 与异常请求已通过助手验证；学习者理解尚待独立验收。

本课步骤：

- [x] 检查已有代码、依赖和全局校验配置。
- [x] 实现内存 CRUD、DTO 和单一全局 ValidationPipe。
- [x] 验证正常与异常请求，并停止验证进程。
- [x] 完成技术笔记并记录实际结果。

学习者待办：

- [ ] 独立解释字段缺失、null、空字符串和空 PATCH 的区别。
- [ ] 独立运行正常与异常请求，解释 201、200、204、400、404。
- [ ] 自行实现 `GET /api/notes/count`，处理静态路径与 `/:id` 的匹配顺序。
- [ ] 回答面试题并填写个人理解与总结。

### 第 4 课验证记录

2026-11-09，使用 Node.js v24.15.0 实际执行 API 类型检查、API 定向构建及 39 项 HTTP 检查，全部通过：

| 场景 | 实际结果 |
| --- | --- |
| 查询列表、分类与单条笔记 | 200，数据符合契约 |
| POST 创建 | 201，三个字符串已 trim，服务端生成 ID 3 |
| PATCH 局部更新 | 200，未提交字段保持原样 |
| DELETE 删除 | 204，响应体为空；再次查询返回 404 |
| 删除后再创建 | ID 为 4，不复用已删除的 3 |
| GET/PATCH/DELETE 不存在的 ID | 404 |
| GET/PATCH/DELETE 非数字 ID | 400 |
| title 为数字、null 或纯空白 | 400 |
| title 超过 100、category 超过 50 字符 | 400 |
| 创建缺字段，category/content 全空白 | 400 |
| POST/PATCH 包含 id 或其他额外字段 | 400 |
| PATCH 空对象、任一字段为 null | 400 |
| 失败 PATCH 后查询 | 数据和 ID 均未被修改 |
| `/api/health` 与未匹配路径 | 分别为 200、404 |
| `/api/notes/count` | 400，当前仍由动态 ID 路由处理，计数功能未实现 |

验证完成后已关闭本次服务进程。仅新增 class-validator、class-transformer 及其必要依赖，未升级原有依赖；未修改前端、未执行全量构建、未提交 Git。检查通过不代表学习者已掌握。

## 第 3 课 · NestJS 核心架构与依赖注入（保留记录）

- 代码：[NotesModule](../../apps/api/src/notes/notes.module.ts)、[NotesController](../../apps/api/src/notes/notes.controller.ts)、[NotesService](../../apps/api/src/notes/notes.service.ts)、[AppModule](../../apps/api/src/app.module.ts)。
- 笔记：[Module、Controller、Service 与依赖注入](../02-nestjs/01-module-controller-service.md)。
- 学习目标：解释三个角色的职责、请求处理过程及构造函数依赖如何由 Nest 容器提供。
- 下一课程：请求参数校验与异常处理（Pipe 与 HTTP 异常），仍属于第一阶段。
- 当前状态：实现、接口与依赖注入故障实验已通过助手验证，学习者理解待独立验证。

本课实施步骤：

- [x] 检查现有路由、全局前缀、依赖和工作区差异。
- [x] 实现内存笔记查询与分类筛选，注册 NotesModule，保留既有健康接口。
- [x] 编写客观笔记、依赖注入故障实验和独立练习提示，保留个人总结空白。
- [x] 仅检查并构建 API，运行接口及依赖注入故障验证，停止本次服务。

学习者待办：

- [ ] 独立解释请求如何经 Controller 调用 Service，以及 Module 的作用。
- [ ] 独立复现并解释 Provider 缺失导致的依赖注入错误。
- [ ] 自行完成按 ID 查询，区分非法 ID 和不存在的笔记。
- [ ] 回答三道面试题并填写个人理解与总结。

### 第 3 课验证记录

2026-11-05，由助手使用 Node.js v24.15.0 与现有 NestJS 12.3.2 实际执行：

| 检查 | 实际结果 |
| --- | --- |
| `pnpm --filter @devlab/api typecheck` | 通过 |
| `pnpm --filter @devlab/api build` | 通过，仅构建后端 |
| 从真实 `main.js` 入口启动 | 使用 `PORT=3100` 成功启动，模块依赖正常 |
| `GET /api/notes` | 200，两条笔记均含 `id`、`title`、`category`、`content` |
| `GET /api/notes?category=Node.js` | 200，一条 Node.js 笔记 |
| `GET /api/notes?category=Unknown` | 200，`[]` |
| `GET /api/unknown` | 404，默认响应包含 `message`、`error: "Not Found"`、`statusCode: 404` |
| `GET /api/notes/1` | 404，按 ID 查询尚未实现 |
| `GET /api/health` | 200，既有响应 `{"status":"ok","service":"devlab-api"}` 保持原样 |
| 独立进程清空 NotesModule 的 Provider 元数据 | 创建应用上下文失败，异常构造器为 `UnknownDependenciesException`，指出无法解析 NotesService |

接口响应均检查了状态码、JSON 响应头与实际响应体。故障实验仅修改独立进程内的元数据，未改动正常模块源码。验证服务进程已停止；未修改前端、未安装依赖、未执行全量构建、未提交 Git。助手验证不代表学习者已掌握。

## 第 2 课 · 原生 Node.js HTTP 服务（保留记录）

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
- `docs/02-nestjs/`：NestJS 架构与框架基础课程笔记。
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
