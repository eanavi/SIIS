// src/app/nucleo/interceptores/auth.interceptor.ts

import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../servicios/auth.service';
import { ErrorHandlerService } from '../servicios/error-handler.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const errorHandler = inject(ErrorHandlerService);
  const token = authService.obtenerToken();

  // Lista de rutas que NO necesitan token
  const rutasSinToken = [
    '/auth/login',
    '/auth/register',
    '/auth/recuperar-password'
  ];

  // Verificar si la ruta necesita token
  const necesitaToken = !rutasSinToken.some(ruta => req.url.includes(ruta));

  // Si la ruta necesita token y hay token válido, agregarlo
  if (necesitaToken && token && authService.esTokenValido()) {
    const clonedRequest = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });

    return next(clonedRequest).pipe(
      catchError((error: HttpErrorResponse) => {
        // Si el token expiró (401), cerrar sesión
        if (error.status === 401) {
          console.error('❌ Token inválido o expirado');
          authService.logout();

          errorHandler.manejarError(error);
          return throwError(() => error);
        }

        if (error.status === 403) {
          console.error('❌ Acceso denegado - 403');
          return throwError(() => new Error('No tienes permisos para acceder a este recurso.'));
        }

        if (error.status === 0){
          console.error('❌ Error de conexión - Servidor no disponible');
          return throwError(() => new Error('No se pudo conectar con el servidor. Por favor, intenta más tarde.'));
        }

        return throwError(() => error);
      })
    );
  }

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      errorHandler.manejarError(error);
      return throwError(() => error);
    })
  );
};
