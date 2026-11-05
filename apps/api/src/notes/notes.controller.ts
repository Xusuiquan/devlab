import { Controller, Get, Query } from '@nestjs/common';
import { NotesService } from './notes.service.js';

@Controller('notes')
export class NotesController {
  // 实例由 Nest 容器提供，Controller 不负责创建与管理依赖。
  constructor(private readonly notesService: NotesService) {}

  @Get()
  findAll(@Query('category') category?: string) {
    return this.notesService.findAll(category);
  }
}
