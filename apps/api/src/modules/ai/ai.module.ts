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
import { TasksModule } from '../tasks/tasks.module';

@Module({
    imports: [TasksModule],
    providers: [AIService, MarkdownMemoryService, InMemCacheService, DynamicMemoryService, IdentityService, SearchService, TasksDataService],
    controllers: [AIController, IdentityController],
    exports: [AIService, IdentityService],
})
export class AIModule { }
