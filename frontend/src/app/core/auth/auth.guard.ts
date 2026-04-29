import { Inject } from "@angular/core";
import { CanActivateFn, Router } from "@angular/router";
import { AuthService } from "./auth.service";

/**
 * Protege las rutas que requieren autenticación. Si el usuario no está autenticado, redirige a la página de login.
 */
export const authGuard: CanActivateFn = () => {
  const authService = Inject(AuthService);
  const router = Inject(Router);

  if (authService.isAuthenticated()) {
    return true;
  }

  if (authService.getToken()) {
    authService.logout();
  }

  return router.createUrlTree(['/login'], {
    queryParams: { returnUrl: router.url },
  });
}
