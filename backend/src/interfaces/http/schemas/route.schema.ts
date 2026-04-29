import { z } from 'zod';
import { ROUTE_STATUSES, VECHICLE_TYPES } from '../../../domain/objects/RouteStatus';

// Schema base sin refine — permite usar .partial() en Zod v4
const RouteBaseSchema = z.object({
  originCity: z
    .string()
    .min(1, { message: 'La ciudad de origen es requerida' })
    .min(2).max(150).trim(),

  destinationCity: z
    .string()
    .min(1, { message: 'La ciudad de destino es requerida' })
    .min(2).max(150).trim(),

  vehicleType: z.enum(VECHICLE_TYPES),

  status: z.enum(ROUTE_STATUSES),

  carrier: z.string()
    .min(1, { message: 'El transportista es requerido' })
    .min(2).max(200).trim(),

  cost: z
    .number()
    .positive({ message: 'El costo debe ser positivo' })
    .max(999_999_999),

  distanceKm: z.number().positive().max(99999).optional(),

  region: z.string().max(100).trim().optional(),

  scheduledAt: z.string().datetime({ offset: true }).optional(),

  estimatedAt: z.string().datetime({ offset: true }).optional(),
});


// 🔹 CREATE
export const CreateRouteSchema = RouteBaseSchema.refine(
  (data) => data.originCity.toLowerCase() !== data.destinationCity.toLowerCase(),
  {
    message: 'La ciudad de origen y destino no pueden ser iguales',
    path: ['destinationCity'],
  }
);


// 🔹 UPDATE
export const UpdateRouteSchema = RouteBaseSchema.partial().refine(
  (data) => {
    if (data.originCity && data.destinationCity) {
      return data.originCity.toLowerCase() !== data.destinationCity.toLowerCase();
    }
    return true;
  },
  {
    message: 'La ciudad de origen y destino no pueden ser iguales',
    path: ['destinationCity'],
  }
);


// 🔹 FILTERS
export const RouteFiltersSchema = z.object({
  originCity: z.string().optional(),
  destinationCity: z.string().optional(),
  vehicleType: z.enum(VECHICLE_TYPES).optional(),
  status: z.enum(ROUTE_STATUSES).optional(),
  carrier: z.string().optional(),
  dateFrom: z.string().datetime({ offset: true }).optional(),
  dateTo: z.string().datetime({ offset: true }).optional(),
  cursor: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});


// 🔹 TYPES
export type CreateRouteInput = z.infer<typeof CreateRouteSchema>;
export type UpdateRouteInput = z.infer<typeof UpdateRouteSchema>;
export type RouteFiltersInput = z.infer<typeof RouteFiltersSchema>;