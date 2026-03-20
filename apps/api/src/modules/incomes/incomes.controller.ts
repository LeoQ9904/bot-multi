import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { IncomesService } from './incomes.service';
import { CreateIncomeDto } from './dto/create-income.dto';
import { UpdateIncomeDto } from './dto/update-income.dto';
import { FirebaseGuard } from '../../common/guards/firebase.guard';

@Controller('incomes')
@UseGuards(FirebaseGuard)
export class IncomesController {
  constructor(private readonly incomesService: IncomesService) { }

  @Post()
  create(@Req() req: any, @Body() createIncomeDto: CreateIncomeDto) {
    return this.incomesService.create(req.user.id, createIncomeDto);
  }

  @Get()
  findAll(@Req() req: any) {
    return this.incomesService.findAll(req.user.id);
  }

  @Get(':id')
  findOne(@Req() req: any, @Param('id') id: string) {
    return this.incomesService.findOne(req.user.id, id);
  }

  @Patch(':id')
  update(
    @Req() req: any,
    @Param('id') id: string,
    @Body() updateIncomeDto: UpdateIncomeDto,
  ) {
    return this.incomesService.update(req.user.id, id, updateIncomeDto);
  }

  @Delete(':id')
  remove(@Req() req: any, @Param('id') id: string) {
    return this.incomesService.remove(req.user.id, id);
  }
}
