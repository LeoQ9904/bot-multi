import { Controller, Post, Body, UseGuards, Get, Req, Patch, Param } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { FirebaseGuard } from '../../common/guards/firebase.guard';

@Controller('notifications')
export class NotificationsController {
    constructor(private readonly notificationsService: NotificationsService) { }

    @UseGuards(FirebaseGuard)
    @Get()
    async getNotifications(@Req() req: any) {
        return this.notificationsService.getNotifications(req.user.id);
    }

    @UseGuards(FirebaseGuard)
    @Patch(':id/read')
    async markAsRead(@Req() req: any, @Param('id') id: string) {
        return this.notificationsService.markAsRead(id, req.user.id);
    }

    @UseGuards(FirebaseGuard)
    @Post('read-all')
    async markAllAsRead(@Req() req: any) {
        return this.notificationsService.markAllAsRead(req.user.id);
    }

    @Post('broadcast-test')
    async broadcastTest(
        @Body('title') title: string,
        @Body('body') body: string,
        @Body('data') data?: any
    ) {
        return this.notificationsService.broadcastToAll(
            title || 'Test Notification',
            body || 'This is a broadcast message from Aether.',
            data
        );
    }
}
