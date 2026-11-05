# 02 · Node.js 事件循环

## 本课目标

观察同步代码、Promise 的 `then` 回调和 `setTimeout` 回调的执行顺序，并尝试联系后端接口响应理解其影响。

## 原理阅读与个人理解

参考 [Node.js 官方事件循环说明](https://nodejs.org/en/learn/asynchronous-work/event-loop-timers-and-nexttick) 与 [官方异步调度顺序示例](https://nodejs.org/en/learn/asynchronous-work/understanding-setimmediate)。本课只关注同步代码、Promise 微任务和定时器回调，其他机制留待后续学习。

### 同步代码与调用栈

### Promise 微任务

### 定时器回调与事件循环

## 最小实验说明

源码：[playground/nodejs/event-loop.mjs](../../playground/nodejs/event-loop.mjs)。

实验先输出一条同步日志，注册一个 0ms 定时器，再注册已兑现 Promise 的 `then` 回调，最后输出另一条同步日志。先阅读源码并填写预测，再运行观察；此实验不测量精确延时，也不代表事件循环的全部机制。

在项目根目录运行：

```bash
nvm use
node --version
node --check playground/nodejs/event-loop.mjs
node playground/nodejs/event-loop.mjs
```

使用根 `.nvmrc` 指定的 Node.js 版本。`.mjs` 文件可由 Node.js 直接作为 ES Module 执行，无需安装依赖、编译或启动前后端。

### 运行前的输出预测

```text

```

### 我实际运行的版本与输出

```text

```

### 预测与结果的差异及原因

## DevLab 实际应用：联系现有接口思考

阅读 [健康检查控制器](../../apps/api/src/app.controller.ts)，思考请求处理代码中出现耗时同步计算时的影响。本课仅做分析，不改动接口。

### 我的应用场景分析

## 独立思考

### 1. `setTimeout(..., 0)` 注册得更早，为什么它的回调仍晚于 Promise 的 `then` 回调执行？

### 2. 如果交换注册定时器和 Promise 回调的两段代码，输出顺序会改变吗？先预测，再运行验证。

### 3. 如果 NestJS 的一个请求处理中执行很长时间的同步计算，其他请求和定时器回调会受到什么影响？

## 测试验证记录

- [ ] 语法检查通过。
- [ ] 独立运行并记录输出。
- [ ] 完成交换注册顺序的对比实验。
- [ ] 能解释结果，并回答三个问题。

### 我的验证过程与结论

## 个人总结

## 仍不理解的问题
