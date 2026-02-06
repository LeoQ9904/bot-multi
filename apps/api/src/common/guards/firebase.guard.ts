import {
    Injectable,
    CanActivate,
    ExecutionContext,
    UnauthorizedException,
    Inject,
} from '@nestjs/common';
import * as admin from 'firebase-admin';
import { UsersService } from '../../modules/users/users.service';

@Injectable()
export class FirebaseGuard implements CanActivate {
    constructor(
        @Inject('FIREBASE_ADMIN') private readonly firebaseAdmin: admin.app.App,
        private readonly usersService: UsersService,
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const authHeader = request.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new UnauthorizedException('No token provided');
        }

        const idToken = authHeader.split('Bearer ')[1];

        try {
            console.log('FirebaseGuard: Verifying token...');
            const decodedToken = await this.firebaseAdmin.auth().verifyIdToken(idToken);
            console.log('FirebaseGuard: Token verified for email:', decodedToken.email);

            // Synchronize user with Prisma
            console.log('FirebaseGuard: Synchronizing user in database...');
            const user = await this.usersService.getOrCreateUser(decodedToken);
            console.log('FirebaseGuard: User synchronized successfully with ID:', user.id);

            // Attach both Firebase and Prisma user info to request
            // We use the Prisma UUID as the main 'id' for relations
            request.user = {
                ...decodedToken,
                id: user.id,
            };

            return true;
        } catch (error) {
            console.error('FirebaseGuard: Token verification or sync failed:', error);
            throw new UnauthorizedException('Invalid token');
        }
    }
}
