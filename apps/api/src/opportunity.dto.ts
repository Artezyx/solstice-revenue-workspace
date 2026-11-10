import { IsIn, IsInt, IsString, Max, MaxLength, Min, MinLength } from 'class-validator';
import { Type } from 'class-transformer';
import type { Stage } from './opportunity.entity';
export class CreateOpportunityDto {
 @IsString() @MinLength(2) @MaxLength(150) company!: string;
 @IsInt() @Min(1) @Max(2_000_000_000) valueCents!: number;
 @IsInt() @Min(0) @Max(100) probability!: number;
}
export class ChangeStageDto {
 @IsIn(['lead','qualified','proposal','won','lost']) stage!: Stage;
 @IsInt() @Min(1) version!: number;
}
export class PageQueryDto {
 @Type(() => Number) @IsInt() @Min(1) page: number = 1;
 @Type(() => Number) @IsInt() @Min(1) @Max(100) size: number = 20;
}
