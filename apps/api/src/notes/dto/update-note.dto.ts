import { IsString, Matches, MaxLength, ValidateIf } from 'class-validator';

export class UpdateNoteDto {
  // 仅跳过未提交的字段；显式 null 必须继续接受字符串校验。
  @ValidateIf((_object, value) => value !== undefined)
  @IsString()
  @Matches(/\S/, { message: 'title must contain non-whitespace characters' })
  @MaxLength(100)
  title?: string;

  @ValidateIf((_object, value) => value !== undefined)
  @IsString()
  @Matches(/\S/, { message: 'category must contain non-whitespace characters' })
  @MaxLength(50)
  category?: string;

  @ValidateIf((_object, value) => value !== undefined)
  @IsString()
  @Matches(/\S/, { message: 'content must contain non-whitespace characters' })
  content?: string;
}
