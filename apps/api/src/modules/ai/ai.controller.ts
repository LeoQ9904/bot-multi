import { Controller, Post, Body, UseGuards, Req } from '@nestjs/common';
import { AIService } from './services/ai.service';
import { FirebaseGuard } from '../../common/guards/firebase.guard';
@Controller('ai')
export class AIController {
    constructor(private readonly aiService: AIService) { }

    @UseGuards(FirebaseGuard)
    @Post('chat')
    async chat(
        @Req() req: any,
        @Body('prompt') prompt: string,
        @Body('conversationId') conversationId: string = 'main'
    ): Promise<{ response: string }> {
        const userId = req.user.id;
        const response = await this.aiService.generateResponse(userId, conversationId, prompt);
        return { response };
    }
}
