import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { FirebaseGuard } from '../../common/guards/firebase.guard';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @UseGuards(FirebaseGuard)
    @Get('profile')
    async getProfile(@Req() req: any) {
        // The FirebaseGuard already synced the user and attached the internal record to req.user
        // We just return it.
        return req.user;
    }
}
