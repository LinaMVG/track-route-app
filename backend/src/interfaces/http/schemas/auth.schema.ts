import {z} from "zod";

export const LoginRequestSchema = z.object({
    username: z
        .string()
        .min(3, "El nombre de usuario es requerido y debe tener al menos 3 caracteres")
        .max(50)
        .regex(/^[a-zA-Z0-9_]+$/, "El nombre de usuario solo puede contener letras, números y guiones bajos"),
    password: z
        .string()
        .min(6, "La contraseña es requerida y debe tener al menos 6 caracteres")
        .max(100),
}); 

export type LoginRequest = z.infer<typeof LoginRequestSchema>;