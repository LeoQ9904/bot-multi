/**
 * Shared Interfaces between API and Web
 */

/**
 * API Response Wrapper
 */
export interface ApiResponse<T = any> {
    data: T;
    message?: string;
    status: number;
    success: boolean;
}

/**
 * User Interfaces
 */
export interface User {
    id: string;
    email: string;
    firebaseUid: string;
    name: string | null;
    createdAt: string;
    updatedAt: string;
}

/**
 * AI Interfaces
 */
export interface ChatRequest {
    prompt: string;
    conversationId?: string;
}

export interface ChatResponse {
    response: string;
}

export interface BotIdentity {
    name: string;
    greeting: string;
    personality: string;
}

export interface IdentitySaveResponse {
    message: string;
}

/**
 * Integration Interfaces
 */
export interface Integration {
    id: string;
    userId: string;
    type: string; // 'TELEGRAM' | 'GOOGLE' | 'NOTION'
    name: string | null;
    config: any;
    isActive: boolean;
}

export interface IntegrationCreateRequest {
    type: string;
    config: any;
    name?: string;
}

export interface IntegrationCreateResponse extends Integration {
    warning?: string;
}

/**
 * Conversation Interfaces
 */
export interface Conversation {
    id: string;
    userId: string;
    platform: string; // 'TELEGRAM' | 'WEB'
    createdAt: string;
}

export interface Message {
    id: string;
    conversationId: string;
    role: string; // 'USER' | 'ASSISTANT'
    content: string;
    createdAt: string;
}

export interface Interests {
    type: string;
    tag: string;
    title: string;
    description: string;
    icon: string;
    colorClass: string;
    link?: string;
    footer?: string;
    createdAt?: string | null;
}

export interface InterestsResponse {
    interests: Interests[];
}

