import { ApiService } from './api.service';
import { USER_ENDPOINTS } from '../constants/api-endpoints';
import type { User } from '../interfaces';

export class UserService {
    static async getProfile(token: string) {
        return ApiService.get<User>(USER_ENDPOINTS.PROFILE, { headers: { Authorization: `Bearer ${token}` } });
    }

    static async getById(userId: string) {
        return ApiService.get<User>(USER_ENDPOINTS.BY_ID(userId));
    }

    static async updateProfile(userId: string, data: Partial<User>) {
        return ApiService.put<User>(USER_ENDPOINTS.UPDATE_PROFILE(userId), data);
    }

    static async updateAvatar(userId: string, file: File) {
        return ApiService.uploadFile<User>(USER_ENDPOINTS.UPDATE_AVATAR(userId), file, 'avatar');
    }

    static async getPreferences(userId: string) {
        return ApiService.get(USER_ENDPOINTS.PREFERENCES(userId));
    }

    static async updatePreferences(userId: string, preferences: any) {
        return ApiService.put(USER_ENDPOINTS.PREFERENCES(userId), preferences);
    }

    static async delete(userId: string) {
        return ApiService.delete(USER_ENDPOINTS.DELETE(userId));
    }
}

export const useUserService = () => {
    return {
        getProfile: UserService.getProfile,
        getById: UserService.getById,
        updateProfile: UserService.updateProfile,
        updateAvatar: UserService.updateAvatar,
        getPreferences: UserService.getPreferences,
        updatePreferences: UserService.updatePreferences,
        delete: UserService.delete,
    };
};
