import { Module, Global } from '@nestjs/common';
import * as admin from 'firebase-admin';

@Global()
@Module({
    providers: [
        {
            provide: 'FIREBASE_ADMIN',
            useFactory: () => {
                if (admin.apps.length === 0) {
                    admin.initializeApp({
                        credential: admin.credential.applicationDefault(),
                        // Alternatively, use service account file or JSON from env
                    });
                }
                return admin;
            },
        },
    ],
    exports: ['FIREBASE_ADMIN'],
})
export class FirebaseAdminModule { }
