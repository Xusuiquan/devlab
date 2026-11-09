import { IsString, Matches, MaxLength } from 'class-validator';

export class CreateNoteDto {
  @IsString()
  @Matches(/\S/, { message: 'title must contain non-whitespace characters' })
  @MaxLength(100)
  title!: string;

  @IsString()
  @Matches(/\S/, { message: 'category must contain non-whitespace characters' })
  @MaxLength(50)
  category!: string;

  @IsString()
  @Matches(/\S/, { message: 'content must contain non-whitespace characters' })
  content!: string;
}
