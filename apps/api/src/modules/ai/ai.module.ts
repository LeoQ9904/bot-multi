import { Module } from '@nestjs/common';
import { AIService } from './services/ai.service';
import { AIController } from './ai.controller';
import { MarkdownMemoryService } from './memory/markdown-memory.service';
import { InMemCacheService } from './memory/in-mem-cache.service';
import { IdentityService } from './services/identity.service';
import { IdentityController } from './identity.controller';
import { SearchService } from './services/search.service';

@Module({
    providers: [AIService, MarkdownMemoryService, InMemCacheService, IdentityService, SearchService],
    controllers: [AIController, IdentityController],
    exports: [AIService, IdentityService],
})
export class AIModule { }
