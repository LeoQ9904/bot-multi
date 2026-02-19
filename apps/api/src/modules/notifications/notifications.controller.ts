import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { NotificationsService } from './notifications.service';

@Controller('notifications')
export class NotificationsController {
    constructor(private readonly notificationsService: NotificationsService) { }

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
