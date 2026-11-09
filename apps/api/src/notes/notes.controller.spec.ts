import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { Test } from '@nestjs/testing';
import type { TestingModule } from '@nestjs/testing';
import { NotesController } from './notes.controller.js';
import { NotesService } from './notes.service.js';

describe('NotesController with a mock service', () => {
  let module: TestingModule;
  let controller: NotesController;
  let findAll: jest.MockedFunction<NotesService['findAll']>;

  beforeEach(async () => {
    findAll = jest.fn<NotesService['findAll']>();
    module = await Test.createTestingModule({
      controllers: [NotesController],
      providers: [{ provide: NotesService, useValue: { findAll } }],
    }).compile();
    controller = module.get(NotesController);
  });

  afterEach(async () => {
    await module?.close();
  });

  it('calls the service without a category when none is provided', () => {
    findAll.mockReturnValue([]);
    controller.findAll();
    expect(findAll).toHaveBeenCalledTimes(1);
    expect(findAll).toHaveBeenCalledWith(undefined);
  });

  it('passes the category to the service', () => {
    findAll.mockReturnValue([]);
    controller.findAll('Node.js');
    expect(findAll).toHaveBeenCalledTimes(1);
    expect(findAll).toHaveBeenCalledWith('Node.js');
  });

  it('returns the data supplied by the service', () => {
    const notes = [{ id: 10, title: 'Mock 笔记', category: 'Testing', content: '模拟返回值' }];
    findAll.mockReturnValue(notes);
    expect(controller.findAll()).toEqual(notes);
  });
});
