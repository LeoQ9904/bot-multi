import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { FirebaseGuard } from '../../common/guards/firebase.guard';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @UseGuards(FirebaseGuard)
    @Get('profile')
    async getProfile(@Req() req: any) {
        return req.user;
    }

    @UseGuards(FirebaseGuard)
    @Post('fcm-token')
    async registerFcmToken(@Req() req: any, @Body('token') token: string) {
        console.log(`[UsersController] Registering FCM token for user ${req.user.email} (${req.user.id}): ${token.substring(0, 10)}...`);
        return this.usersService.addFcmToken(req.user.id, token);
    }
}
