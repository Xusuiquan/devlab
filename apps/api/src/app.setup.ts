import { ValidationPipe } from '@nestjs/common';
import type { INestApplication } from '@nestjs/common';

// 正式入口与 E2E 使用相同的 HTTP 配置，避免测试漏掉前缀或参数校验。
export function configureApp(app: INestApplication) {
  app.setGlobalPrefix('api');
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));
}
