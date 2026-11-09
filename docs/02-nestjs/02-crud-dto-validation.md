# 02 · NestJS CRUD、DTO 与参数校验

## 1. CRUD 与 HTTP 方法

| 操作 | 接口 | 成功状态 |
| --- | --- | --- |
| 查询列表/分类筛选 | `GET /api/notes?category=Node.js` | 200 |
| 查询单条 | `GET /api/notes/:id` | 200 |
| 创建 | `POST /api/notes` | 201 |
| 局部修改 | `PATCH /api/notes/:id` | 200 |
| 删除 | `DELETE /api/notes/:id` | 204，无响应体 |

沿用入口的全局 `api` 前缀。Controller 处理 HTTP 参数和状态码，Service 操作内存数据。数据在服务重启后重新初始化，没有持久化。

## 2. DTO 的概念及作用

DTO（Data Transfer Object）描述接口接收的数据。本课使用类承载字段定义和校验装饰器，创建 DTO 的三个字段必填，更新 DTO 允许逐字段省略。

| 字段 | 创建 | 更新 | 约束 |
| --- | --- | --- | --- |
| title | 必填 | 可省略，拒绝 null | 字符串、含非空白字符、最长 100 字符 |
| category | 必填 | 可省略，拒绝 null | 字符串、含非空白字符、最长 50 字符 |
| content | 必填 | 可省略，拒绝 null | 字符串、含非空白字符 |

`id` 由 Service 生成，不属于任何请求 DTO；客户端提交它会被拒绝。创建和更新成功时，Service 对实际提交的字符串执行 `trim()`。长度校验发生在清理前，因此请求中的首尾空白也参与长度校验。

## 3. TypeScript 类型检查与运行时校验区别

TypeScript 的类型注解在编译后通常被擦除，无法阻止 HTTP 客户端发送 `{ "title": 123 }`。DTO 类及其装饰器提供运行时可读取的信息，ValidationPipe 在进入业务方法前检查请求数据。

Controller 用普通 `import` 导入 DTO 类，保留运行时引用；Service 仅在类型位置使用 DTO，可以使用 `import type`。DTO 不是数据库模型，也不负责生成 ID 或操作数组。

## 4. class-validator 常见装饰器

| 装饰器 | 本课用途 |
| --- | --- |
| `@IsString()` | 拒绝数字、对象、null 等非字符串 |
| `@Matches(/\S/)` | 要求至少有一个非空白字符；空串、空格、制表符或换行组成的文本不能通过 |
| `@MaxLength(100)` / `@MaxLength(50)` | 限制 title/category 长度 |
| `@ValidateIf((_object, value) => value !== undefined)` | 更新时只跳过省略的字段；显式 null 继续进入其他校验 |

`@IsOptional()` 会跳过 undefined 和 null，因此不能直接用于本课“允许省略但拒绝 null”的要求。[class-validator 官方说明](https://github.com/typestack/class-validator#validation-decorators)

更新 DTO 保留三个字段各自的校验规则，不额外引入映射类型依赖。空 DTO 的“至少修改一个字段”规则放在 Service：不能依赖 DTO 对象的键数量，因为类实例中可能存在值为 undefined 的字段。

## 5. ValidationPipe 的三个关键配置

入口仅注册一次：

```ts
app.useGlobalPipes(new ValidationPipe({
  whitelist: true,
  forbidNonWhitelisted: true,
  transform: true,
}));
```

- `whitelist`：以校验装饰器声明的属性为白名单。
- `forbidNonWhitelisted`：遇到额外字段直接返回 400，而非仅静默剔除。
- `transform`：利用 class-transformer 将普通请求对象转换为 DTO 实例。它不是完整的业务校验，也不代表任意错误类型都应被自动转换。

本课没有启用隐式字段类型转换，数字 title 仍被字符串校验拒绝。ID 通过 `ParseIntPipe` 做整数解析，业务层收到 number。[NestJS ValidationPipe](https://docs.nestjs.com/techniques/validation)

## 6. HTTP 状态码及异常处理

- GET/PATCH 正常返回 200，POST 默认返回 201。
- DELETE 使用 `@HttpCode(HttpStatus.NO_CONTENT)` 返回 204，不返回被删除对象。
- ValidationPipe、ParseIntPipe 的参数错误返回 400。
- Service 对空 PATCH 抛 `BadRequestException`；只检查实际有值的字段，不能把“没有修改”当成功。
- Service 的 `findOne` 查询不到资源时抛 `NotFoundException`，update/remove 复用它，返回 404。

框架默认异常处理把这些 HTTP 异常转换为 JSON 响应。本课无需自行编写异常过滤器。对于同时有多种错误的请求，不约定哪个错误必须优先返回。

## 7. DevLab 对应代码

| 文件 | 作用 |
| --- | --- |
| [CreateNoteDto](../../apps/api/src/notes/dto/create-note.dto.ts) | 必填字段及字符串规则 |
| [UpdateNoteDto](../../apps/api/src/notes/dto/update-note.dto.ts) | 可省略字段、拒绝显式 null |
| [NotesController](../../apps/api/src/notes/notes.controller.ts) | 路由、Body、ParseIntPipe 和删除状态码 |
| [NotesService](../../apps/api/src/notes/notes.service.ts) | 内存 CRUD、trim、空更新检查、404 |
| [main.ts](../../apps/api/src/main.ts) | 复用全局前缀，注册唯一全局 ValidationPipe |

ID 使用独立递增计数器，初始为 3，不用数组长度作为 ID。删除后继续递增，避免删掉记录后复用 ID。PATCH 逐个判断字段是否为 undefined，仅修改提交字段，不通过无差别对象展开覆盖已有值或 ID。

## 8. 正常与异常请求示例

在根目录运行；只构建 API：

```bash
nvm use
pnpm --filter @devlab/api typecheck
pnpm --filter @devlab/api build
PORT=3100 pnpm --filter @devlab/api start
```

在另一终端执行。全新启动时两条种子数据的 ID 为 1、2，首次创建为 3：

```bash
curl -i 'http://127.0.0.1:3100/api/notes/1'
curl -i -X POST 'http://127.0.0.1:3100/api/notes' \
  -H 'Content-Type: application/json' \
  -d '{"title":"  DTO 学习  ","category":" NestJS ","content":" 运行时校验 "}'
curl -i -X PATCH 'http://127.0.0.1:3100/api/notes/3' \
  -H 'Content-Type: application/json' -d '{"title":"局部更新"}'
curl -i -X DELETE 'http://127.0.0.1:3100/api/notes/3'
curl -i 'http://127.0.0.1:3100/api/notes/999'
curl -i 'http://127.0.0.1:3100/api/notes/abc'
curl -i -X PATCH 'http://127.0.0.1:3100/api/notes/1' \
  -H 'Content-Type: application/json' -d '{}'
curl -i -X PATCH 'http://127.0.0.1:3100/api/notes/1' \
  -H 'Content-Type: application/json' -d '{"title":null}'
curl -i -X POST 'http://127.0.0.1:3100/api/notes' \
  -H 'Content-Type: application/json' \
  -d '{"title":123,"category":"Node.js","content":"正文"}'
curl -i -X POST 'http://127.0.0.1:3100/api/notes' \
  -H 'Content-Type: application/json' \
  -d '{"title":"   ","category":"Node.js","content":"正文"}'
curl -i -X POST 'http://127.0.0.1:3100/api/notes' \
  -H 'Content-Type: application/json' \
  -d '{"title":"笔记","category":"Node.js","content":"正文","id":99}'
```

2026-11-09 实际验证（Node.js 24.15.0）：API 类型检查与构建通过，39 项 HTTP 检查通过。包括 GET 200、POST 201、PATCH 200、DELETE 204 且空响应体、缺失资源 404、非法 ID 400、错误类型/纯空白/超长/缺字段/额外字段/null/空 PATCH 400；并断言了 trim、未提交字段保留、ID 不复用、拒绝修改 ID 后数据不变。健康接口及未知路由回归检查通过。

详细分类记录见 [第 4 课验证记录](../00-roadmap/progress.md#第-4-课验证记录)。验证进程已停止。独立运行时请在服务终端按 Ctrl+C 关闭。

独立练习：自行实现 `GET /api/notes/count`，返回当前笔记数量。注意静态 `/count` 与动态 `/:id` 的匹配顺序，避免 `count` 被当成 ID 并进入 ParseIntPipe；同时保留正常的按 ID 查询。本课没有实现计数接口，当前请求 `/api/notes/count` 实测返回 400。

## 9. 面试问题

1. 为什么 TypeScript 中把 title 声明为 string，仍需运行时校验？DTO 为什么采用类而不是仅用 interface？
2. `whitelist`、`forbidNonWhitelisted`、`transform` 各负责什么？为什么 transform 不等同于校验？
3. PATCH 中省略 title、提交 null、提交纯空格、提交空对象分别应如何处理？为什么不能直接用 `@IsOptional()` 满足本课全部规则？

## 10. 我的理解与总结
