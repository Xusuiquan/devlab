import { beforeEach, describe, expect, it } from '@jest/globals';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { NotesService } from './notes.service.js';

describe('NotesService', () => {
  let service: NotesService;

  beforeEach(() => {
    service = new NotesService();
  });

  it('returns both initial notes', () => {
    expect(service.findAll()).toEqual([
      { id: 1, title: 'Event Loop 事件循环', category: 'Node.js', content: '同步代码、Promise 微任务与定时器回调的执行顺序。' },
      { id: 2, title: 'NestJS 依赖注入', category: 'NestJS', content: '通过 Module 注册 Provider，由 Nest 容器创建并注入依赖。' },
    ]);
  });

  it('filters notes by category', () => {
    expect(service.findAll('Node.js')).toEqual([
      expect.objectContaining({ id: 1, category: 'Node.js' }),
    ]);
  });

  it('creates a note with a generated ID and trimmed strings', () => {
    const note = service.create({ title: ' DTO ', category: ' NestJS ', content: ' 校验 ' });
    expect(note).toEqual({ id: 3, title: 'DTO', category: 'NestJS', content: '校验' });
    expect(service.findOne(3)).toEqual(note);
    expect(service.findAll()).toHaveLength(3);
  });

  it('updates only the provided fields', () => {
    expect(service.update(1, { title: ' 新标题 ' })).toEqual({
      id: 1, title: '新标题', category: 'Node.js',
      content: '同步代码、Promise 微任务与定时器回调的执行顺序。',
    });
    expect(service.findOne(1).title).toBe('新标题');
  });

  it('throws when a requested note does not exist', () => {
    expect(() => service.findOne(999)).toThrow(NotFoundException);
  });

  it('rejects an empty update without changing the note', () => {
    expect(() => service.update(1, {})).toThrow(BadRequestException);
    expect(service.findOne(1).title).toBe('Event Loop 事件循环');
  });

  it('removes an existing note', () => {
    service.remove(1);
    expect(service.findAll()).toEqual([expect.objectContaining({ id: 2 })]);
    expect(() => service.findOne(1)).toThrow(NotFoundException);
  });
});
