import { Controller, Get, Post, Body, UseGuards, Req } from '@nestjs/common';
import { IdentityService, type BotIdentity } from './services/identity.service';
import { FirebaseGuard } from '../../common/guards/firebase.guard';

@Controller('ai/identity')
@UseGuards(FirebaseGuard)
export class IdentityController {
    constructor(private readonly identityService: IdentityService) { }

    @Get()
    async getIdentity(@Req() req: any) {
        return this.identityService.getIdentity(req.user.id);
    }

    @Post()
    async saveIdentity(@Req() req: any, @Body() identity: BotIdentity) {
        console.log('IdentityController: POST request received for user:', req.user.id);
        console.log('IdentityController: Body:', JSON.stringify(identity, null, 2));
        await this.identityService.saveIdentity(req.user.id, identity);
        return { message: 'Identity saved successfully' };
    }
}
