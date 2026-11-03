# DevLab 初始化实施计划

**Goal:** 建立可启动、可构建的前后端 Monorepo，持久化项目背景与学习约束。

**Architecture:** 使用 pnpm workspace 管理两个独立应用。前端展示初始化欢迎页，后端提供无外部依赖的健康检查；本阶段不建立共享包和基础设施。

**Tech Stack:** Node.js 24、pnpm、React、TypeScript、Vite、Ant Design、NestJS。

## 文件职责

- 根目录 `package.json`、`pnpm-workspace.yaml`、`pnpm-lock.yaml`：工作区、统一命令、依赖锁定。
- 根目录 `.nvmrc`、`.gitignore`：运行环境约定与生成文件排除。
- `apps/web/package.json`、`index.html`、`tsconfig.json`、`vite.config.ts`：前端开发与构建配置。
- `apps/web/src/main.tsx`、`App.tsx`、`styles.css`：最小 React + Ant Design 页面。
- `apps/api/package.json`、`tsconfig.json`、`nest-cli.json`：后端开发、编译与启动配置。
- `apps/api/src/main.ts`、`app.module.ts`、`app.controller.ts`：NestJS 启动、模块与健康检查。
- `AGENTS.md`：后续代理的工作流程、阶段边界和代码偏好。
- `docs/PROJECT.md`：项目定位、开发者背景、架构和当前范围。
- `docs/LEARNING.md`：七阶段路线、功能映射和模块笔记规范。
- `docs/notes/01-project-initialization.md`：本阶段原理、实现、验证和面试问题。
- `README.md`：安装、启动、构建与文档入口。

## 实施步骤

- [x] 确认工作区干净、现有文件和本地 Node.js 环境。
- [x] 创建根工作区配置，设置 `dev`、`dev:web`、`dev:api`、`build`、`typecheck` 命令。
- [x] 创建前端最小欢迎页，默认监听 5173，开发代理将 `/api` 转发到 3000。
- [x] 创建 NestJS 应用，监听 3000，`GET /api/health` 返回 `{"status":"ok","service":"devlab-api"}`。
- [x] 创建三个项目约束文档与初始化学习笔记，更新 README。
- [x] 使用 Node.js 24 执行 `pnpm install`，生成根锁文件，并通过冻结锁文件的离线安装验证。
- [x] 执行 `pnpm typecheck`、`pnpm build`，两个应用均成功。
- [x] 启动应用，以 HTTP 请求检查 API、前端入口和 Vite 代理，并验证后端构建产物；验证使用 `PORT=3100` 避开已有服务。
- [x] 执行 `git diff --check` 并逐项自审全部新增文件；校验 JSON、文档链接、生成文件排除和当前阶段依赖范围。验证进程均已停止。

## 完成标准

两个应用能独立及共同启动，类型检查与构建通过，HTTP 检查结果符合契约；文档能让新对话明确当前阶段、约束及下一步学习方向。若环境阻止验证，记录确切阻塞与未完成项。
