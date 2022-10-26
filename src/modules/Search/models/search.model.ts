import { IsString, IsOptional } from 'class-validator';

export class SearchModel {
  @IsOptional()
  @IsString()
  q?: string;

  @IsOptional()
  @IsString()
  id?: string;

  @IsOptional()
  @IsString()
  type?: string;

  @IsOptional()
  @IsString()
  relation_id?: string;

  @IsOptional()
  @IsString()
  mp_openid?: string;
}
