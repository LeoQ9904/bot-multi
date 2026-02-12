import { Module } from '@nestjs/common';
import { AIService } from './services/ai.service';
import { AIController } from './ai.controller';
import { MarkdownMemoryService } from './memory/markdown-memory.service';
import { InMemCacheService } from './memory/in-mem-cache.service';
import { DynamicMemoryService } from './memory/dynamic-memory.service';
import { IdentityService } from './services/identity.service';
import { IdentityController } from './identity.controller';
import { SearchService } from './services/search.service';
import { TasksDataService } from './services/tasks-data.service';
import { NotesDataService } from './services/notes-data.service';
import { TasksModule } from '../tasks/tasks.module';
import { NotesModule } from '../notes/notes.module';

@Module({
    imports: [TasksModule, NotesModule],
    providers: [AIService, MarkdownMemoryService, InMemCacheService, DynamicMemoryService, IdentityService, SearchService, TasksDataService, NotesDataService],
    controllers: [AIController, IdentityController],
    exports: [AIService, IdentityService],
})
export class AIModule { }
