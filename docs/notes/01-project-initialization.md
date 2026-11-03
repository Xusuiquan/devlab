# 01 · 项目初始化

## 学习目标与真实场景

为 DevLab 建立独立运行的 React 前端与 NestJS 后端，用统一工作区管理依赖和命令，为之后的知识库功能提供开发入口。

## 核心原理

- **Monorepo**：多个应用在一个 Git 仓库内协作。pnpm 根据 `pnpm-workspace.yaml` 识别成员，各应用声明自己的依赖，根锁文件记录确定的依赖解析结果。
- **前端与后端的模块解析不同**：前端 TypeScript 交给 Vite 打包，采用 Bundler 解析；后端编译后由 Node.js 运行，采用 NodeNext 与 ESM。后端相对导入使用 `.js`，对应编译产物的实际路径。
- **NestJS 请求路径**：Node.js 启动入口 → `NestFactory` 创建 `AppModule` → 注册控制器路由 → HTTP 适配器接收请求 → 控制器返回对象 → JSON 响应。
- **装饰器元数据**：NestJS 使用装饰器标记模块和路由，通过 TypeScript 元数据及 `reflect-metadata` 支持运行时反射和依赖注入；本阶段尚未添加业务 Provider。
- **开发代理**：浏览器访问 Vite 的 `/api/health`，Vite 在服务端转发到 NestJS 的 3000 端口。对浏览器而言请求同源，无需放宽后端 CORS。
- **类型检查与构建**：TypeScript 检查类型；Vite 输出浏览器资源，Nest CLI 输出 Node.js JavaScript。静态类型通过不等于运行时行为正确，仍需 HTTP 检查。

## 实现与取舍

- 工作区与统一脚本：[根 package.json](../../package.json)、[workspace 配置](../../pnpm-workspace.yaml)。
- 前端入口：[main.tsx](../../apps/web/src/main.tsx)，只挂载欢迎页和 Ant Design 主题；[Vite 配置](../../apps/web/vite.config.ts) 定义开发端口和代理。
- 后端入口：[main.ts](../../apps/api/src/main.ts)，设置 `/api` 前缀；[AppModule](../../apps/api/src/app.module.ts) 注册 [AppController](../../apps/api/src/app.controller.ts)。
- 健康检查契约：`GET /api/health` 返回 HTTP 200 和 `{"status":"ok","service":"devlab-api"}`。它只证明进程响应，不表示数据库或其他外部依赖可用。
- 应用使用独立 TypeScript 配置，避免为少量共同配置提前设计共享包。
- 当前没有用户输入和数据写入，不引入数据库、鉴权、缓存、队列或 AI SDK。
- 使用与 NestJS 12 CLI 兼容的 TypeScript 6，前后端保持相同版本范围，由根锁文件固定实际版本。
- 后端默认监听 3000，可通过 shell 环境变量 `PORT` 修改；前端开发代理读取同一变量。当前不加载 `.env` 文件。

## 测试与实验

前置条件：使用根 `.nvmrc` 中的 Node.js 与 `packageManager` 中的 pnpm，安装依赖。

```bash
pnpm install --frozen-lockfile
pnpm typecheck
pnpm build
pnpm dev
```

在另一个终端执行：

```bash
curl --fail http://localhost:3000/api/health
curl --fail http://localhost:5173/api/health
```

两个请求都应返回相同健康检查 JSON；第二个请求同时验证 Vite 代理。访问 `http://localhost:5173` 查看欢迎页，点击健康检查按钮应打开 JSON 响应。

验证构建后的后端时，先停止开发服务，再执行：

```bash
pnpm --filter @devlab/api start
curl --fail http://localhost:3000/api/health
```

前端构建产物可通过 `pnpm --filter @devlab/web preview` 查看。开发代理只属于开发服务器，预览和生产部署需要另外配置 `/api` 转发，当前不提供部署配置。

如果本机 3000 被占用，使用 `PORT=3100 pnpm dev`，并将直连 API 的请求改为 3100；Vite 地址仍为 5173。验证构建后的 API 时同样设置 `PORT=3100`。

2026-11-03 实际验证结果（Node.js 24.15.0、pnpm 11.25.0）：

| 检查 | 结果 |
| --- | --- |
| `pnpm install --frozen-lockfile --offline` | 通过，锁文件与依赖声明一致，已缓存依赖可复用 |
| `pnpm typecheck` | 前后端均通过 |
| `pnpm build` | 前后端均通过，生成各自 `dist` |
| `PORT=3100 pnpm dev` | 前后端均成功启动；3000 已有其他本地服务，验证使用空闲端口 |
| API 直连与 Vite 代理 | 均返回 HTTP 200 和约定 JSON |
| 未定义 API 路由 | 返回 HTTP 404 |
| 前端入口与 TSX 模块 | HTTP 200，Vite 转换正常 |
| 浏览器检查 | 欢迎页、阶段标识和健康检查链接正常显示 |
| 后端构建产物启动 | 独立启动并返回健康检查 JSON |

验证结束后停止本次启动的服务，保留其他已有进程。以上为初始化冒烟检查，当前未引入自动化测试框架。

## 面试问题与回答要点

1. **Monorepo 和单体服务是什么关系？** 仓库组织方式与运行架构不同；同仓库中的 web 和 api 仍是独立进程。
2. **为什么 pnpm 下应用应声明自己使用的依赖？** 依赖属于具体包的契约，显式声明可避免依赖意外提升带来的隐式耦合。
3. **NestJS 的 Module、Controller、Provider 分别负责什么？** Module 组织依赖关系，Controller 处理路由边界，Provider 承载可注入的业务能力；当前静态健康检查无需业务 Service。
4. **为什么开发代理能解决本地跨域访问问题？** 浏览器请求同源 Vite 地址，跨端口转发发生在服务端；代理并没有修改浏览器的同源策略。
5. **为什么后端 TypeScript 导入写 `.js`？** Node.js ESM 运行实际生成的 JavaScript，显式扩展名与输出文件对应，TypeScript 在编译时解析源文件。
6. **健康检查 200 能否证明业务可用？** 只能说明已检查的内容；当前没有数据库连接、队列或完整业务链路检查。

## 复盘与后续问题

### Intel Mac 上的 pnpm 版本切换错误

- 现象：`npm run dev:api` 在启动 NestJS 前报 `ERR_PNPM_PNPM_ENGINE_NO_NATIVE_BINARY`，提示 `@pnpm/exe@11.25.0` 没有 `darwin-x64` 原生程序。
- 复现：使用 pnpm 12.16.1 在本项目执行 `pnpm exec node --version`，同样失败，因此错误位于包管理器切换环节，与后端业务无关。
- 原因：当前终端安装的 pnpm 12 与项目 `packageManager` 指定的 11.25.0 不同，自动切换选择了独立可执行版本；pnpm 11 的该发行形式不支持 Intel Mac，npm 发布的 JavaScript 版可使用系统 Node.js 运行。
- 修复：`nvm use` 后执行 `npm install --global pnpm@11.25.0`，以 `pnpm --version` 确认版本，再启动应用。保持项目版本约束与锁文件，不通过跳过版本检查处理。
- 修复验证：使用用户 Node.js 24 环境中的 pnpm 11.25.0，`pnpm exec node --version` 正常输出 `v24.15.0`，`pnpm typecheck` 通过；`PORT=3100 npm run dev:api` 成功启动，健康检查返回 HTTP 200 与约定 JSON。验证服务随后停止。
- 初始化验证曾使用 Codex 自带的 JavaScript 版 pnpm，未覆盖用户终端中 pnpm 12 自动切换的路径；后续环境问题应使用终端实际命令与安装方式复现。
- 参考：[pnpm 官方安装文档](https://pnpm.io/installation)、[官方包管理器版本校验实现](https://github.com/pnpm/pnpm/blob/main/pnpm11/engine/pm/commands/src/self-updater/verifyPnpmEngineIdentity.ts)。

下一阶段通过真实笔记接口学习请求生命周期、依赖注入、异步处理与异常。生产代理、环境配置和自动化测试设施随具体需求推进。

官方参考：[pnpm workspace](https://pnpm.io/workspaces)、[Vite 入门](https://vite.dev/guide/)、[NestJS 入门](https://docs.nestjs.com/first-steps)、[NestJS 12 迁移说明](https://github.com/nestjs/docs.nestjs.com/blob/master/content/migration.md)。
