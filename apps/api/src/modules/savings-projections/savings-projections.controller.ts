import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { SavingsProjectionsService } from './savings-projections.service';
import { CreateSavingsProjectionDto } from './dto/create-savings-projection.dto';
import { UpdateSavingsProjectionDto } from './dto/update-savings-projection.dto';
import { FirebaseGuard } from '../../common/guards/firebase.guard';

@Controller('savings-projections')
@UseGuards(FirebaseGuard)
export class SavingsProjectionsController {
  constructor(private readonly savingsProjectionsService: SavingsProjectionsService) { }

  @Post()
  create(@Req() req: any, @Body() createSavingsProjectionDto: CreateSavingsProjectionDto) {
    return this.savingsProjectionsService.create(req.user.id, createSavingsProjectionDto);
  }

  @Get()
  findAll(@Req() req: any) {
    return this.savingsProjectionsService.findAll(req.user.id);
  }

  @Get(':id')
  findOne(@Req() req: any, @Param('id') id: string) {
    return this.savingsProjectionsService.findOne(req.user.id, id);
  }

  @Patch(':id')
  update(
    @Req() req: any,
    @Param('id') id: string,
    @Body() updateSavingsProjectionDto: UpdateSavingsProjectionDto,
  ) {
    return this.savingsProjectionsService.update(req.user.id, id, updateSavingsProjectionDto);
  }

  @Delete(':id')
  remove(@Req() req: any, @Param('id') id: string) {
    return this.savingsProjectionsService.remove(req.user.id, id);
  }
}
