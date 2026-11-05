# 01 · NestJS 核心架构与依赖注入

## 1. Module、Controller、Service 的职责

| 角色 | 本课职责 | DevLab 实现 |
| --- | --- | --- |
| Module | 组织控制器和 Provider，声明依赖的可见范围 | NotesModule 注册 NotesController 与 NotesService，AppModule 导入 NotesModule |
| Controller | 定义路由、读取请求参数并调用 Service | 接收 `GET /api/notes`，用 `@Query('category')` 读取分类 |
| Service | 实现笔记查询与筛选规则 | NotesService 保存两条内存笔记，提供 `findAll(category?)` |

Service 是一种常见的 Provider。Provider 的实例由 Nest 容器管理。本课仅在 NotesModule 内使用 NotesService，因此无需添加 `exports`；以后需要跨模块注入时，再通过模块导出和导入建立可见性。[NestJS Modules](https://docs.nestjs.com/modules)

## 2. NestJS 请求处理流程

本课请求链路：

```text
GET /api/notes?category=Node.js
  → HTTP 适配器与 Nest 路由
  → NotesController.findAll(category)
  → NotesService.findAll(category)
  → 返回符合条件的笔记数组
  → Nest 输出 HTTP 200 与 JSON 响应
```

最终路径由入口中的全局前缀 `api`、`@Controller('notes')` 和空路径 `@Get()` 组合而成。分类属于查询参数，不属于路由路径。

本课使用标准返回值方式：Controller 返回数组，Nest 负责生成 JSON 响应；不再像原生 HTTP 实验一样手写 `writeHead()` 和 `end()`。[NestJS Controllers](https://docs.nestjs.com/controllers)

## 3. 依赖注入的基本原理

通俗理解：Controller 声明“我需要 NotesService”，模块提供“这里有 NotesService 的注册信息”，Nest 容器负责创建并交付实例。

本课启动过程：

1. `NestFactory.create(AppModule)` 从根模块读取模块依赖图。
2. Nest 扫描到导入的 NotesModule，读取其中的 `controllers` 和 `providers`。
3. 构造函数参数的运行时元数据表明 NotesController 依赖 NotesService。
4. 容器以 NotesService 类作为依赖标识（token），找到注册信息，创建相应实例并传给 Controller 的构造函数。
5. 后续请求通过 Controller 中的 `this.notesService` 调用同一注册所提供的实例。

```ts
constructor(private readonly notesService: NotesService) {}
```

这行代码中的 `private readonly` 是 TypeScript 参数属性语法，声明并保存成员；`NotesService` 类引用参与运行时依赖解析。当前 [tsconfig.json](../../apps/api/tsconfig.json) 已开启 `experimentalDecorators` 与 `emitDecoratorMetadata`，入口已加载 `reflect-metadata`。

默认作用域下，同一应用上下文中的同一 Provider 注册共享实例。不同应用上下文或重复注册不是“整个进程永远只有一个对象”。本课只在 NotesModule 注册一次 NotesService。[NestJS Providers](https://docs.nestjs.com/providers)

## 4. @Module、@Controller、@Injectable 的作用

| 装饰器 | 含义 |
| --- | --- |
| `@Module({...})` | 提供模块元数据：本模块有哪些 Controller、Provider，以及导入哪些模块 |
| `@Controller('notes')` | 将类标记为控制器，并声明路由前缀 |
| `@Injectable()` | 提供 Nest 管理依赖所需的类元数据；仍需把 Provider 注册到可见模块 |

模块中的 `imports` 放模块类，`controllers` 放控制器类，`providers` 放 Provider。仅写 `@Injectable()` 不会自动完成模块注册。

本课通过构造函数类型元数据注入具体类，因此使用普通 `import { NotesService } ...`，保留运行时类引用；不能只把它作为会被擦除的类型导入。[NestJS 依赖解析常见错误](https://docs.nestjs.com/faq/common-errors)

## 5. 为什么 Controller 不直接 new Service

直接 `new NotesService()` 会把创建依赖的责任放进 Controller，绕过模块中的 Provider 配置。以后 Service 增加依赖、更改生命周期或在测试中替换实现时，Controller 也要了解并处理这些细节。

构造函数注入让 Controller 专注于请求边界，创建对象、解析依赖与管理实例交给容器。Service 保存查询逻辑，也可以由其他合适的调用方复用。

## 6. DevLab 实际代码位置

| 文件 | 本课作用 |
| --- | --- |
| [main.ts](../../apps/api/src/main.ts) | 沿用原有应用启动流程及全局 `/api` 前缀，本课未改动 |
| [app.module.ts](../../apps/api/src/app.module.ts) | 导入 NotesModule，保留原有 AppController |
| [notes.module.ts](../../apps/api/src/notes/notes.module.ts) | 注册 Controller 和 Service |
| [notes.controller.ts](../../apps/api/src/notes/notes.controller.ts) | 用 `@Get()` 与 `@Query('category')` 接收查询 |
| [notes.service.ts](../../apps/api/src/notes/notes.service.ts) | 内存数组和分类筛选逻辑 |

每条笔记包含 `id`、`title`、`category`、`content`。两条示例笔记沿用上一课主题，并补充内容字段；内存数据在应用重启后重新初始化。

未传 `category` 时返回全部笔记；传入时按分类名精确匹配，未知分类或空字符串得到空数组。本课未增加 DTO、数据库或完整 CRUD。

在根目录启动和验证，仅构建 API：

```bash
nvm use
pnpm --filter @devlab/api typecheck
pnpm --filter @devlab/api build
PORT=3100 pnpm --filter @devlab/api start
```

3100 是本次验证端口；入口原有的默认端口仍为 3000，`PORT` 配置沿用现有实现。在另一终端检查：

```bash
curl -i 'http://127.0.0.1:3100/api/notes'
curl -i 'http://127.0.0.1:3100/api/notes?category=Node.js'
curl -i 'http://127.0.0.1:3100/api/unknown'
curl -i 'http://127.0.0.1:3100/api/health'
```

本次实际结果：全部笔记返回 200 和两条包含四个字段的记录；分类查询返回 200 和一条 Node.js 笔记；未知路由返回默认 404 JSON；既有健康接口仍返回 200。助手启动的验证进程已停止，详细结果见 [第 3 课验证记录](../00-roadmap/progress.md#第-3-课验证记录)。手动实验结束后在启动服务的终端按 Ctrl+C。

独立练习：自行实现 `GET /api/notes/:id`，提示仅包括：

- 用 `@Get(':id')` 声明带路径参数的路由。
- 用 `@Param()` 读取路径参数。
- 用 `ParseIntPipe` 处理整数 ID 转换，观察非法 ID 的 400 响应。
- 在查询不到有效 ID 对应的资源时使用 `NotFoundException`，返回 404。

请自行完成查找与错误处理，不把非法 ID 和资源不存在混成同一种情况。本课未实现按 ID 查询，也未替学习者验证其练习成果。

## 7. 依赖注入故障实验说明

故障目标：观察 NotesController 依赖 NotesService，但 NotesModule 没有注册该 Provider 时的启动行为。

本次实际采用隔离方式：API 构建后，在一个独立 Node.js 进程中把已加载 NotesModule 的 `providers` 元数据临时设为空，再创建应用上下文。该实验不监听端口、不修改 TypeScript 源码，进程结束后临时元数据随之消失。

在根目录完成上面的 API 构建后运行：

```bash
cd apps/api
node --input-type=module <<'NODE'
import 'reflect-metadata';
import assert from 'node:assert/strict';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './dist/app.module.js';
import { NotesModule } from './dist/notes/notes.module.js';

Reflect.defineMetadata('providers', [], NotesModule);
let app;
try {
  app = await NestFactory.createApplicationContext(AppModule, {
    logger: false,
    abortOnError: false,
  });
  assert.fail('Expected missing NotesService to prevent startup');
} catch (error) {
  assert.equal(error.constructor.name, 'UnknownDependenciesException');
  assert.match(error.message, /NotesController/);
  assert.match(error.message, /NotesService/);
  assert.match(error.message, /index \[0\]/);
  console.log(error.constructor.name);
  console.log(error.message.split('\n')[0]);
} finally {
  await app?.close();
}
NODE
cd ../..
```

Node.js 24.15.0、NestJS 12.3.2 下的实际结果：创建应用上下文失败，异常构造器为 `UnknownDependenciesException`，错误指出 NotesController 的第 0 个构造函数参数 NotesService 在 NotesModule 中不可用。

错误的首句是：

```text
Nest can't resolve dependencies of the NotesController (?).
```

本版本异常的 `error.name` 为 `Error`；实验通过异常构造器名称和错误内容确认故障。排查时关注消费方、缺失 token、参数位置和模块，而不是只看错误名称。[NestJS 常见依赖错误](https://docs.nestjs.com/faq/common-errors)

正常源码保留 `providers: [NotesService]`。另一个独立进程从真实入口成功启动，并通过查询接口验证了正常注入；故障实验未污染正常应用。

## 8. 三道面试题

1. `@Injectable()` 已加上，为什么从 `providers` 中移除 NotesService 后应用仍无法启动？Module 的可见性起什么作用？
2. Nest 如何知道 NotesController 的构造函数需要 NotesService？构造函数参数名、TypeScript 类型注解与运行时元数据分别起什么作用？
3. 与 Controller 内直接 `new NotesService()` 相比，构造函数注入把哪些责任交给了容器？这会如何影响实例复用和测试替换？

## 9. 我的理解与总结
