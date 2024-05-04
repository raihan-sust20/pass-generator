import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsBoolean, IsNumber, Max, Min } from "class-validator";

export class GeneratePasswordDto {
  @ApiPropertyOptional({
    description: 'Avoid numbers and special characters',
    default: false,
  })
  @IsBoolean()
  easyToSay?: boolean;

  @ApiPropertyOptional({
    description: 'Avoid ambigious characters like O, 0, l, 1, |',
    default: false,
  })
  @IsBoolean()
  easyToRead?: boolean;

  @ApiPropertyOptional({
    description: 'Any character combination like 1,5, a, B, ~, #, &',
    default: true,
  })
  @IsBoolean()
  allCharacters?: boolean;

  @ApiPropertyOptional({
    default: true,
  })
  @IsBoolean()
  upperCase?: boolean;

  @ApiPropertyOptional({
    default: true,
  })
  @IsBoolean()
  lowerCase?: boolean;

  @ApiPropertyOptional({
    default: true,
  })
  @IsBoolean()
  numbers?: boolean;

  @ApiPropertyOptional({
    default: true,
  })
  @IsBoolean()
  symbols?: boolean;

  @ApiPropertyOptional({
    default: 8,
  })
  @IsNumber()
  @Min(4)
  @Max(256)
  passwordLength?: number;
}