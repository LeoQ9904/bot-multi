import { PartialType } from '@nestjs/mapped-types';
import { CreateSavingsProjectionDto } from './create-savings-projection.dto';

export class UpdateSavingsProjectionDto extends PartialType(CreateSavingsProjectionDto) { }
