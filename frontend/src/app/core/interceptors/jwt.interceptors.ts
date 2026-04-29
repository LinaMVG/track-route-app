import { HttpInterceptorFn, HttpRequest, HttpHandlerFn } from "@angular/common/http";
import { inject, Inject } from "@angular/core";
import { AuthService } from "../auth/auth.service";

/** Interceptor para agregar el token JWT a las solicitudes HTTP
 * Excluye el endpoint de login para evitar ciclos
*/

export const jwtInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn) => {
  const auth = inject(AuthService);
  const token = auth.getToken();

  const isAuthEndpoint = req.url.endsWith('/auth/login');
  if(!token || isAuthEndpoint) {
    return next(req);
  }

  const cloned = req.clone({
    headers: req.headers.set('Authorization', `Bearer ${token}`)
  });
  return next(cloned);
}
