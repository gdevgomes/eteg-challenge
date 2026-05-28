import { IsString, Matches } from 'class-validator';

export class CreateColorDto {
  @IsString()
  name: string;

  @Matches(/^#[0-9A-Fa-f]{6}$/, {
    message: 'hex must be a valid color (e.g. #FF0000)',
  })
  hex: string;
}
