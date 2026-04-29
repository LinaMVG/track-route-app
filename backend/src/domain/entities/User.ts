export const USER_ROLES = ['ADMIN', 'OPERADOR'] as const;
export type UserRole = typeof USER_ROLES[number];

export interface User {
    id: string;
    email: string;
    username: string;
    password: string;
    role: UserRole;
    createdAt: Date;
    isActive: boolean;
}