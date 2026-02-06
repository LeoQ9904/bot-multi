import { ApiService } from './api.service';
import { INTEGRATION_ENDPOINTS } from '../constants/api-endpoints';
import type { Integration, IntegrationCreateResponse } from '../interfaces';

export class IntegrationService {
    static async list() {
        return ApiService.get<Integration[]>(INTEGRATION_ENDPOINTS.LIST);
    }

    static async getById(id: string) {
        return ApiService.get<Integration>(INTEGRATION_ENDPOINTS.BY_ID(id));
    }

    static async create(type: string, config: any) {
        return ApiService.post<IntegrationCreateResponse>(INTEGRATION_ENDPOINTS.LIST, { type, config });
    }

    static async delete(id: string) {
        return ApiService.delete(INTEGRATION_ENDPOINTS.BY_ID(id));
    }
}

export const useIntegrationService = () => {
    return {
        list: IntegrationService.list,
        getById: IntegrationService.getById,
        create: IntegrationService.create,
        delete: IntegrationService.delete,
    };
};