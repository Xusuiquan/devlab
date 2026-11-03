import { Button, Divider, Tag, Typography } from 'antd';

export default function App() {
  return (
    <main className="workspace">
      <header className="masthead">
        <span>DEVLAB / 开发者实验室</span>
        <Tag color="green">阶段 01 · 项目初始化</Tag>
      </header>
      <section aria-labelledby="welcome-title">
        <p className="eyebrow">LEARN. BUILD. UNDERSTAND.</p>
        <Typography.Title id="welcome-title" className="project-title">
          DevLab
        </Typography.Title>
        <Typography.Title level={2}>每一次学习，都留下一个真实功能。</Typography.Title>
        <Typography.Paragraph className="intro">
          开发者知识库与技术实验平台。从 React 到 NestJS，通过实践理解后端原理，
          逐步积累自己的全栈工程经验。
        </Typography.Paragraph>
        <Button type="primary" size="large" href="/api/health" target="_blank" rel="noopener noreferrer">
          查看 API 健康检查
        </Button>
        <Divider />
        <Typography.Paragraph type="secondary">
          当前已搭建前后端基础骨架。接下来从 Node.js 请求处理与 NestJS 模块开始学习。
        </Typography.Paragraph>
      </section>
      <footer>React + TypeScript + Ant Design / NestJS</footer>
    </main>
  );
}
