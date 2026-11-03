# DevLab

开发者知识库 + 技术实验平台。通过真实功能学习 Node.js 全栈工程，将技术原理、实现与面试问题持续沉淀为 Markdown 笔记。

当前仅完成项目初始化，包含 React 欢迎页与 NestJS 健康检查。PostgreSQL、Prisma、JWT、RBAC、Redis、BullMQ、Docker 和 AI 按学习阶段逐步引入。

## 目录

```text
DevLab/
├── apps/
│   ├── web/        # React + TypeScript + Vite + Ant Design
│   └── api/        # NestJS + TypeScript
├── docs/
│   ├── PROJECT.md  # 项目背景、架构与当前范围
│   ├── LEARNING.md # 学习路线与笔记规范
│   └── notes/      # 技术模块笔记
├── AGENTS.md       # Codex 后续开发约定
├── package.json
└── pnpm-workspace.yaml
```

## 环境与启动

使用 Node.js 24.15.0（见 `.nvmrc`）和 pnpm 11.25.0。已安装 nvm 时：

```bash
nvm install
nvm use
```

在当前 Node.js 环境安装项目指定的 pnpm：

```bash
npm install --global pnpm@11.25.0
pnpm --version
pnpm install --frozen-lockfile
pnpm dev
```

`pnpm --version` 应输出 `11.25.0`。安装时保留版本号：pnpm 12 自动切换到项目指定的 11 时，可能选择不提供 Intel Mac 二进制的 `@pnpm/exe`，报 `PNPM_ENGINE_NO_NATIVE_BINARY`。通过 npm 直接安装 `pnpm@11.25.0` 使用 JavaScript 版，可避免该问题。

- 前端：[http://localhost:5173](http://localhost:5173)
- 后端健康检查：[http://localhost:3000/api/health](http://localhost:3000/api/health)
- 前端开发代理：[http://localhost:5173/api/health](http://localhost:5173/api/health)

健康检查返回 `{"status":"ok","service":"devlab-api"}`。开发服务分别使用 5173 和 3000 端口，请确保它们空闲。按 Ctrl+C 停止服务。

若 3000 已被占用，可用 `PORT=3100 pnpm dev` 同时调整后端端口和前端代理目标。单独启动前后端时，为两条启动命令设置相同的 `PORT`。前端端口可通过 `pnpm dev:web --port 5174` 调整。

## 常用命令

| 命令 | 用途 |
| --- | --- |
| `pnpm dev` | 同时启动前后端开发服务 |
| `pnpm dev:web` | 仅启动前端 |
| `pnpm dev:api` | 仅启动后端，监听源码变更 |
| `pnpm typecheck` | 检查两个应用的 TypeScript 类型 |
| `pnpm build` | 构建两个应用，产物位于各自 `dist` 目录 |
| `pnpm --filter @devlab/api start` | 运行已构建的后端 |
| `pnpm --filter @devlab/web preview` | 本地预览前端构建产物 |

Vite 的 `/api` 代理仅用于开发。前端预览与生产部署的 API 转发需单独配置，当前不包含部署方案。

## 项目文档

- [开发约定](AGENTS.md)：新对话开始开发前遵循的工作流程。
- [项目背景](docs/PROJECT.md)：开发者背景、长期目标、架构和阶段边界。
- [学习路线](docs/LEARNING.md)：七阶段规划、功能映射和模块笔记规范。
- [初始化笔记](docs/notes/01-project-initialization.md)：原理、实现、验证和面试问题。
