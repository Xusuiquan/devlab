import { Injectable } from '@nestjs/common';

@Injectable()
export class NotesService {
  // 数据只属于当前服务实例的内存，应用重启后重新初始化。
  private readonly notes = [
    {
      id: 1,
      title: 'Event Loop 事件循环',
      category: 'Node.js',
      content: '同步代码、Promise 微任务与定时器回调的执行顺序。',
    },
    {
      id: 2,
      title: 'NestJS 依赖注入',
      category: 'NestJS',
      content: '通过 Module 注册 Provider，由 Nest 容器创建并注入依赖。',
    },
  ];

  findAll(category?: string) {
    return category === undefined
      ? this.notes
      : this.notes.filter((note) => note.category === category);
  }
}
