import { ApiService } from './api.service';
import { AUTH_ENDPOINTS } from '../constants/api-endpoints';
import type { User } from '../interfaces';

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface RegisterData {
    email: string;
    password: string;
    name: string;
}

export interface AuthResponse {
    token: string;
    refreshToken?: string;
    user: User;
}

export class AuthService {
    static async login(credentials: LoginCredentials) {
        return ApiService.post<AuthResponse>(AUTH_ENDPOINTS.LOGIN, credentials);
    }

    static async register(data: RegisterData) {
        return ApiService.post<AuthResponse>(AUTH_ENDPOINTS.REGISTER, data);
    }

    static async logout() {
        return ApiService.post(AUTH_ENDPOINTS.LOGOUT);
    }

    static async refreshToken(refreshToken: string) {
        return ApiService.post<{ token: string }>(AUTH_ENDPOINTS.REFRESH_TOKEN, { refreshToken });
    }

    static async getProfile() {
        return ApiService.get<User>(AUTH_ENDPOINTS.PROFILE);
    }
}
