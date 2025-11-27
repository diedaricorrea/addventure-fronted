import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const token = authService.getToken();

  // Verificar si el token está expirado antes de enviarlo
  if (token && !authService.isAuthenticated()) {
    // Token expirado, limpiar y redirigir
    authService.logout();
    return throwError(() => new Error('Token expirado'));
  }

  // Solo agregar token a peticiones a nuestra API
  if (token && req.url.includes('/api/')) {
    const clonedRequest = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });

    return next(clonedRequest).pipe(
      catchError((error: HttpErrorResponse) => {
        // Si recibimos 401, el token es inválido
        if (error.status === 401) {
          authService.logout();
          router.navigate(['/login']);
        }
        return throwError(() => error);
      })
    );
  }

  return next(req);
};
