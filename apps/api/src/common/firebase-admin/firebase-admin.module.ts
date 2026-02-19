import { Module, Global } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as admin from 'firebase-admin';

@Global()
@Module({
    providers: [
        {
            provide: 'FIREBASE_ADMIN',
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => {
                if (admin.apps.length === 0) {
                    const projectId = configService.get<string>('FIREBASE_PROJECT_ID');
                    const clientEmail = configService.get<string>('FIREBASE_CLIENT_EMAIL');
                    const privateKey = configService.get<string>('FIREBASE_PRIVATE_KEY')?.replace(/\\n/g, '\n');

                    if (projectId && clientEmail && privateKey) {
                        admin.initializeApp({
                            credential: admin.credential.cert({
                                projectId,
                                clientEmail,
                                privateKey,
                            }),
                        });
                        console.log('[FirebaseAdmin] Initialized with manual credentials');
                    } else {
                        console.warn('[FirebaseAdmin] Missing credentials, falling back to applicationDefault()');
                        admin.initializeApp({
                            credential: admin.credential.applicationDefault(),
                        });
                    }
                }
                return admin;
            },
        },
    ],
    exports: ['FIREBASE_ADMIN'],
})
export class FirebaseAdminModule { }
