import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { FirebaseAdminModule } from './common/firebase-admin/firebase-admin.module';
import { AIModule } from './modules/ai/ai.module';
import { IntegrationsModule } from './modules/integrations/integrations.module';
import { UsersModule } from './modules/users/users.module';
import { TasksModule } from './modules/tasks/tasks.module';
import { NotesModule } from './modules/notes/notes.module';
import { NotificationsModule } from './modules/notifications/notifications.module';

import { ScheduleModule } from '@nestjs/schedule';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { SchedulerModule } from './modules/scheduler/scheduler.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    EventEmitterModule.forRoot(),
    ScheduleModule.forRoot(),
    FirebaseAdminModule,
    AIModule,
    IntegrationsModule,
    UsersModule,
    TasksModule,
    NotesModule,
    NotificationsModule,
    SchedulerModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
