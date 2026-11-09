import { afterEach, beforeEach, describe, expect, it } from '@jest/globals';
import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module.js';
import { configureApp } from '../src/app.setup.js';

describe('Notes HTTP E2E', () => {
  let app: INestApplication;

  beforeEach(async () => {
    // 每个用例都创建独立容器，内存数组和 ID 计数器不会跨用例共享。
    const module = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = module.createNestApplication();
    configureApp(app);
    await app.init();
  });

  afterEach(async () => {
    await app?.close();
  });

  it('creates a note and returns 201', async () => {
    const response = await request(app.getHttpServer()).post('/api/notes')
      .send({ title: ' DTO ', category: ' NestJS ', content: ' 校验 ' }).expect(201);
    expect(response.body).toEqual({ id: 3, title: 'DTO', category: 'NestJS', content: '校验' });
  });

  it('queries notes and returns 200', async () => {
    const response = await request(app.getHttpServer()).get('/api/notes').expect(200);
    expect(response.body).toHaveLength(2);
    const note = await request(app.getHttpServer()).get('/api/notes/1').expect(200);
    expect(note.body).toEqual({
      id: 1, title: 'Event Loop 事件循环', category: 'Node.js',
      content: '同步代码、Promise 微任务与定时器回调的执行顺序。',
    });
  });

  it('partially updates a note and returns 200', async () => {
    const response = await request(app.getHttpServer()).patch('/api/notes/1')
      .send({ title: '更新标题' }).expect(200);
    expect(response.body).toEqual({
      id: 1, title: '更新标题', category: 'Node.js',
      content: '同步代码、Promise 微任务与定时器回调的执行顺序。',
    });
  });

  it('deletes a note with an empty 204 response, then returns 404 on query', async () => {
    const response = await request(app.getHttpServer()).delete('/api/notes/1').expect(204);
    expect(response.text).toBe('');
    const missing = await request(app.getHttpServer()).get('/api/notes/1').expect(404);
    expect(missing.body).toMatchObject({ statusCode: 404, error: 'Not Found' });
  });

  it('rejects a nonnumeric ID with 400', async () => {
    const response = await request(app.getHttpServer()).get('/api/notes/abc').expect(400);
    expect(response.body.statusCode).toBe(400);
  });

  it('rejects an incorrect DTO field type with 400', async () => {
    const response = await request(app.getHttpServer()).post('/api/notes')
      .send({ title: 123, category: 'Node.js', content: '正文' }).expect(400);
    expect(response.body.message).toContain('title must be a string');
  });

  it('rejects an empty PATCH with 400', async () => {
    const response = await request(app.getHttpServer()).patch('/api/notes/1').send({}).expect(400);
    expect(response.body).toMatchObject({ statusCode: 400, error: 'Bad Request' });
  });

  it.each(['post', 'patch'] as const)('rejects extra fields on %s with 400', async (method) => {
    const path = method === 'post' ? '/api/notes' : '/api/notes/1';
    const response = await request(app.getHttpServer())[method](path)
      .send({ title: '标题', category: 'Node.js', content: '正文', extra: true }).expect(400);
    expect(response.body.message).toContain('property extra should not exist');
  });
});
