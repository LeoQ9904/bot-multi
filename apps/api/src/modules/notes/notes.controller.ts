import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { NotesService } from './notes.service';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';
import { FirebaseGuard } from '../../common/guards/firebase.guard';

@Controller('notes')
@UseGuards(FirebaseGuard)
export class NotesController {
    constructor(private readonly notesService: NotesService) { }

    @Post()
    create(@Req() req: any, @Body() createNoteDto: CreateNoteDto) {
        console.log('Entra a crear notas');
        return this.notesService.create(req.user.id, createNoteDto);
    }

    @Get()
    findAll(@Req() req: any) {
        return this.notesService.findAll(req.user.id);
    }

    @Get(':id')
    findOne(@Req() req: any, @Param('id') id: string) {
        return this.notesService.findOne(req.user.id, id);
    }

    @Patch(':id')
    update(@Req() req: any, @Param('id') id: string, @Body() updateNoteDto: UpdateNoteDto) {
        return this.notesService.update(req.user.id, id, updateNoteDto);
    }

    @Delete(':id')
    remove(@Req() req: any, @Param('id') id: string) {
        return this.notesService.remove(req.user.id, id);
    }
}
