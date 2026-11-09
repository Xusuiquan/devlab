# 03 · NestJS 单元测试、Mock 与 E2E

## 1. 单元测试、集成测试、E2E 的区别

| 层次 | 测试范围 | 本课应用 |
| --- | --- | --- |
| 单元测试 | 隔离验证一个单元的公开行为 | 直接调用 NotesService，断言数据与异常 |
| 集成测试 | 验证多个真实组件的协作 | 可用于模块装配、组件与真实依赖协作；本课未单独建立集成测试套件 |
| E2E | 从外部入口验证完整应用链路 | HTTP → 路由 → Pipe → Controller → Service → 响应 |

本课 Controller Mock 测试通过 Nest 容器装配，但将 Service 替换为模拟对象，主要验证 Controller 的隔离行为，不能证明真实查询逻辑或 HTTP 参数校验正确。E2E 是后端 HTTP 边界测试，不包含浏览器或前端。[NestJS 测试说明](https://docs.nestjs.com/fundamentals/testing)

## 2. Jest 基础 API

| API | 用途 |
| --- | --- |
| `describe` / `it` | 分组和描述可验证的行为 |
| `beforeEach` / `afterEach` | 每例重建数据、依赖，以及释放应用资源 |
| `expect(...).toEqual(...)` | 比较数据结构与字段值 |
| `toHaveLength` / `toBe` | 检查集合长度或单个值 |
| `expect(() => ...).toThrow(...)` | 验证同步调用抛出的异常 |
| `jest.fn()` | 创建可配置返回值并记录调用的 Mock 函数 |
| `mockReturnValue` | 指定 Mock 返回的数据 |
| `toHaveBeenCalledWith` | 检查传给 Mock 的参数 |

抛异常的同步方法要放在函数中传给 expect；异步 HTTP 请求需要 await 或返回 Promise，否则断言可能尚未执行，测试就已结束。

项目原来没有 Jest 或 Vitest，本课新增 Jest 30。测试显式从 `@jest/globals` 导入 API。当前使用 ESM，Jest 的启动命令含 `--experimental-vm-modules`；Node.js 会输出 VM Modules 实验性警告，本次运行该警告不影响测试通过。[Jest ESM 文档](https://jestjs.io/docs/ecmascript-modules)

## 3. Mock 的概念和应用

Mock 是由测试控制的替代实现，可以记录调用，并返回约定的值。本课采用：

```ts
const findAll = jest.fn<NotesService['findAll']>();
findAll.mockReturnValue([]);

const module = await Test.createTestingModule({
  controllers: [NotesController],
  providers: [{ provide: NotesService, useValue: { findAll } }],
}).compile();

const controller = module.get(NotesController);
expect(controller.findAll('Node.js')).toEqual([]);
expect(findAll).toHaveBeenCalledWith('Node.js');
await module.close();
```

`provide: NotesService` 指定依赖 token，`useValue` 指定容器在注入该 token 时交付的对象，因此 Controller 收到模拟对象。这里只模拟了被测试的 findAll；Controller 其他方法不属于这个 Mock 套件的覆盖范围。

Mock 测试能够发现参数转发或返回值处理错误，无法检验真实 Service 的筛选实现。直接调用 Controller 也不会经过 HTTP 路由、ValidationPipe 或 ParseIntPipe。[NestJS 自定义 Provider](https://docs.nestjs.com/fundamentals/custom-providers)

## 4. NestJS TestingModule

`Test.createTestingModule` 声明本次测试需要的模块、控制器和 Provider，`compile()` 完成依赖解析并创建测试容器。

- Mock 测试仅注册 NotesController 和模拟 NotesService，再通过 `module.get()` 获取真实 Controller。
- E2E 导入真实 AppModule，调用 `createNestApplication()` 创建应用。
- 每个容器或应用结束后关闭，释放生命周期资源。

测试没有通过读取私有数组来重置 Service，也没有修改正确的业务逻辑来迎合断言。[NestJS TestingModule](https://docs.nestjs.com/fundamentals/testing#unit-testing)

## 5. Supertest 如何测试接口

E2E 中的核心步骤：

```ts
const module = await Test.createTestingModule({ imports: [AppModule] }).compile();
const app = module.createNestApplication();
configureApp(app);
await app.init();

const response = await request(app.getHttpServer())
  .post('/api/notes')
  .send({ title: ' DTO ', category: ' NestJS ', content: ' 校验 ' })
  .expect(201);

expect(response.body).toEqual({ id: 3, title: 'DTO', category: 'NestJS', content: '校验' });
await app.close();
```

Supertest 对真实 HTTP Server 发请求，检查状态码和响应体。传入的 Server 尚未监听时，Supertest 会绑定临时端口，因此无需启动固定端口的开发服务器。[Supertest 官方说明](https://github.com/forwardemail/supertest)

`createNestApplication()` 不会自动执行 main.ts，所以不能假设入口中的前缀与 Pipe 已生效。本课把这部分原有配置提取为 `configureApp()`，正式入口和 E2E 调用同一函数。SIGINT/SIGTERM 的关闭钩子仍留在正式入口；测试用 afterEach 主动关闭应用。

## 6. 测试隔离

- Service：每个 beforeEach 执行 `new NotesService()`，重新生成两条种子数据和 ID 计数器。
- Controller：每例重新创建 jest.fn 和 TestingModule，避免返回值与调用记录串例。
- E2E：每例新建 AppModule 应用上下文，真实 Service 的状态随上下文隔离；afterEach 关闭应用。
- 创建测试始终可断言首个新 ID 为 3；修改和删除测试操作自己的种子数据，不依赖其他测试先执行。

一次测试内部的“删除后查询”是同一业务场景中的因果步骤，测试之间没有执行顺序依赖。清除 Mock 调用记录不会重置真实 Service 的内存数据。

## 7. DevLab 代码示例与运行命令

| 文件 | 用途 |
| --- | --- |
| [notes.service.spec.ts](../../apps/api/src/notes/notes.service.spec.ts) | 7 项 Service 公开行为测试 |
| [notes.controller.spec.ts](../../apps/api/src/notes/notes.controller.spec.ts) | 3 项 Controller Mock 测试 |
| [notes.e2e-spec.ts](../../apps/api/test/notes.e2e-spec.ts) | 9 项真实 HTTP 测试 |
| [app.setup.ts](../../apps/api/src/app.setup.ts) | 正式应用与 E2E 共用的前缀和 ValidationPipe |
| [jest.config.cjs](../../apps/api/jest.config.cjs) | Node 环境、反射初始化及编译后测试文件匹配 |
| [tsconfig.test.json](../../apps/api/tsconfig.test.json) | 编译应用及测试，保留装饰器和构造函数类型元数据 |

本课复用 tsc，将测试和被测源码编译到 `.test-dist`，然后让 Jest 执行生成的 ESM JavaScript，未引入额外 TS 转换器。业务 tsconfig 排除 spec，测试 tsconfig 则包含它们；测试产物通过 .gitignore 排除，不进入正式 dist。

在根目录运行：

```bash
nvm use
pnpm --filter @devlab/api test:unit
pnpm --filter @devlab/api test:e2e
# 同时运行全部已实现的测试：
pnpm --filter @devlab/api test
```

所有测试命令都会先编译测试代码。业务代码仅做必要的共享 HTTP 配置提取，NotesService、Controller、DTO 和路由契约保持原样。

## 8. 实际测试结果

2026-11-09，使用 Node.js v24.15.0、Jest 30.5.2、NestJS 12.3.2：

| 命令 | 实际结果 |
| --- | --- |
| 首轮 test:unit | 测试编译失败，未执行用例：缺少直接依赖 @jest/globals |
| 修复后的 test:unit | 2 个套件、10 个用例通过，0 个失败 |
| test:e2e | 1 个套件、9 个用例通过，0 个失败 |
| API typecheck | 通过 |
| API build | 通过，仅构建后端 |

已执行测试合计 19 个：Service 覆盖全部查询、分类、创建、部分更新、查找不存在资源、空修改、删除；Mock 覆盖无分类调用、分类传递和返回数据；E2E 覆盖创建、列表与单条查询、部分修改、删除后 404、非法 ID、DTO 类型错误、空 PATCH，以及 POST/PATCH 额外字段。

用例正常结束，未使用 forceExit，也没有留下固定端口服务器。三项独立练习没有编写测试或添加占位跳过用例；因此 19 个通过不表示它们已覆盖。

## 9. 常见错误与本课发现

- pnpm 的依赖隔离：仅安装 jest 不代表源码可以导入它的间接依赖。本课首轮编译暴露该问题，显式添加 @jest/globals 后修复，同时移除了不需要的 @types/jest。
- 装饰器元数据：测试转换流程若丢失构造函数类型元数据，会导致依赖注入失效。本课复用现有 tsc 配置保留元数据。
- 漏掉应用配置：测试自行创建的应用需要显式调用 configureApp，否则路由前缀和运行时校验可能与正式入口不一致。
- Mock 假阳性：模拟返回正确数据，不能证明真实查询或 DTO 校验正确，因此需要配合 Service 测试与真实 HTTP E2E。
- 资源未关闭：应用或容器应在 afterEach 关闭，而不是通过强制退出掩盖泄漏。
- 安装过程：pnpm 阻止 @parcel/watcher 的安装脚本；检查脚本后，为该包显式配置 `allowBuilds: false`，使用已发布的预编译依赖完成安装，无需本地源码构建。本次冻结锁文件离线安装已成功。

本次没有发现需要修改的 Notes 业务 Bug。测试针对既有功能补充，因此成功运行的用例直接验证现有契约；没有人为破坏业务代码制造失败。

## 10. 面试问题

1. Controller Mock 测试通过后，为什么仍不能证明分类筛选和 ValidationPipe 正确？应分别在哪一层验证？
2. useValue 如何替换构造函数中的 NotesService？jest.fn 的返回值与调用记录分别解决什么问题？
3. 为什么每例清理 Mock 还不足以隔离内存 CRUD 测试？E2E 应如何创建和关闭应用以避免顺序依赖？

独立练习（本课未实现）：自行编写 GET /api/notes/count 对应测试、PATCH title=null 返回 400 的测试、DELETE 不存在的笔记返回 404 的测试。

## 11. 我的理解与总结
