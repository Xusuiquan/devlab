import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import type { CreateNoteDto } from './dto/create-note.dto.js';
import type { UpdateNoteDto } from './dto/update-note.dto.js';

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
  // 递增 ID，删除笔记后也不复用；重启时随内存数据一起重置。
  private nextId = 3;

  findAll(category?: string) {
    return category === undefined
      ? this.notes
      : this.notes.filter((note) => note.category === category);
  }

  findOne(id: number) {
    const note = this.notes.find((note) => note.id === id);
    if (!note) {
      throw new NotFoundException(`Note ${id} not found`);
    }
    return note;
  }

  create(dto: CreateNoteDto) {
    const note = {
      id: this.nextId++,
      title: dto.title.trim(),
      category: dto.category.trim(),
      content: dto.content.trim(),
    };
    this.notes.push(note);
    return note;
  }

  update(id: number, dto: UpdateNoteDto) {
    if (dto.title === undefined && dto.category === undefined && dto.content === undefined) {
      throw new BadRequestException('At least one note field must be provided');
    }
    const note = this.findOne(id);
    if (dto.title !== undefined) note.title = dto.title.trim();
    if (dto.category !== undefined) note.category = dto.category.trim();
    if (dto.content !== undefined) note.content = dto.content.trim();
    return note;
  }

  remove(id: number) {
    const note = this.findOne(id);
    this.notes.splice(this.notes.indexOf(note), 1);
  }
}
