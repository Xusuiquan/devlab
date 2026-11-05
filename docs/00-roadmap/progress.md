# DevLab 学习进度

## 第一阶段：Node.js + NestJS 基础

学习目标：

- 理解 Node.js 的同步执行、事件循环与异步调度。
- 逐步掌握模块、异步 I/O 和 HTTP 请求处理。
- 理解 NestJS 的 Module、Controller、Provider、依赖注入与请求生命周期。
- 能结合实验和 DevLab 源码解释实现原理，并记录自己的理解。

当前进入第一阶段学习环境准备，只开展事件循环最小实验。其他目标尚未开始，本课不实现业务功能或引入基础设施。

## 每课流程

原理 → 最小实验 → DevLab 实际应用 → 技术笔记 → 测试验证。

当前课的 DevLab 实际应用仅联系现有健康检查接口思考请求响应，不修改应用代码。笔记中的个人理解与总结由学习者填写。

## 本次准备步骤与进度

- [x] 检查现有架构、依赖与 Git 差异，保留已有配置。
- [x] 创建 `playground/nodejs/event-loop.mjs`，观察同步代码、Promise 微任务与定时器回调顺序。
- [x] 创建 `docs/01-nodejs/02-event-loop.md`，提供实验说明与空白笔记模板。
- [x] 同步项目阶段、文档目录约定和后续学习流程。
- [x] 使用 `.nvmrc` 指定的 Node.js 运行实验与语法检查，检查本次 Diff。

## 当前课

- 实验：[event-loop.mjs](../../playground/nodejs/event-loop.mjs)。
- 笔记：[02 · 事件循环](../01-nodejs/02-event-loop.md)。
- 准备状态：已就绪（2026-11-05）。
- 学习状态：待学习者预测、独立运行、填写笔记与回答问题；环境就绪不代表知识点已掌握。

## 学习者待办

- [ ] 阅读原理资料，写下首次运行前的输出预测。
- [ ] 独立运行实验，记录输出并解释与预测的差异。
- [ ] 联系 DevLab 的健康检查接口思考同步耗时操作的影响。
- [ ] 填写个人理解、三个问题的回答与总结。

## 文档目录

- `docs/00-roadmap/`：阶段目标与进度。
- `docs/01-nodejs/`：Node.js 基础课程笔记。
- `docs/notes/`：保留已有初始化笔记；后续课程按主题目录组织。
- `docs/PROJECT.md` 与 `docs/LEARNING.md`：继续维护项目背景与长期路线。

## 验证记录

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
