import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { NotesModule } from './notes/notes.module.js';

@Module({
  imports: [NotesModule],
  controllers: [AppController],
})
export class AppModule {}
