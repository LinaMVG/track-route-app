import { inject } from "@angular/core";
import { CanActivateFn, Router } from "@angular/router";
import { AuthService } from "./auth.service";
import { UserRole } from "../../shared/models/auth.model";

/**
 * Protege las rutas que requieren autenticación y roles específicos. Si el usuario no está autenticado o no tiene el rol requerido, redirige a la página de login.
 * @param allowedRoles Roles permitidos para acceder a la ruta
 */

export function roleGuard(...allowedRoles: UserRole[]): CanActivateFn {
  return () => {
    const authService = inject(AuthService);
    const router = inject(Router);
    const  user = authService.user();

    if(!user) {
      return router.createUrlTree(['/login']);
    }
    if(allowedRoles.includes(user.role)) {
      return true;
    }
    return router.createUrlTree(['/unauthorized']);
  };
}
