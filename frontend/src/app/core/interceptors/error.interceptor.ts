import { HttpInterceptorFn, HttpErrorResponse } from "@angular/common/http";
import { Inject } from "@angular/core";
import { catchError, throwError  } from "rxjs";
import { Router } from "@angular/router";
import { AuthService } from "../auth/auth.service";

/** Interceptor para manejar errores HTTP globalmente.
 * Si se recibe un error 401, se redirige al login.
 * si se recibe 403, se muestra un mensaje de acceso denegado.
 * si se recibe 5xx, se muestra un mensaje de error general.
 */

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = Inject(AuthService);
  const router = Inject(Router);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        authService.logout();
        router.navigate(['/login']);
        alert('Sesión expirada: por favor inicia sesión nuevamente.');
      }
      else if (error.status === 403) {
        alert('Acceso denegado: no tienes permisos para realizar esta acción.');
      }
      else if (error.status >= 500) {
        alert('Error del servidor: por favor intenta nuevamente.');
      }
      return throwError(() => error);
    })
  );
}
