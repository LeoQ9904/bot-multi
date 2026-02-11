import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { FirebaseGuard } from '../../common/guards/firebase.guard';

@Controller('tasks')
@UseGuards(FirebaseGuard)
export class TasksController {
    constructor(private readonly tasksService: TasksService) { }

    @Post()
    create(@Req() req: any, @Body() createTaskDto: CreateTaskDto) {
        return this.tasksService.create(req.user.id, createTaskDto);
    }

    @Get()
    findAll(@Req() req: any) {
        return this.tasksService.findAll(req.user.id);
    }

    @Get(':id')
    findOne(@Req() req: any, @Param('id') id: string) {
        return this.tasksService.findOne(req.user.id, id);
    }

    @Patch(':id')
    update(@Req() req: any, @Param('id') id: string, @Body() updateTaskDto: UpdateTaskDto) {
        return this.tasksService.update(req.user.id, id, updateTaskDto);
    }

    @Delete(':id')
    remove(@Req() req: any, @Param('id') id: string) {
        return this.tasksService.remove(req.user.id, id);
    }
}
