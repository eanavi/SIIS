// src/app/nucleo/guardias/auth.guard.ts

import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../servicios/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  console.log('🔒 AuthGuard - Verificando autenticación...');
  console.log('   Usuario autenticado:', authService.estaAutenticado());
  console.log('   Token válido:', authService.esTokenValido());
  console.log('   URL solicitada:', state.url);

  // Verificar si está autenticado Y el token es válido
  if (authService.estaAutenticado() && authService.esTokenValido()) {
    console.log('✅ AuthGuard - Acceso permitido');
    return true;
  }

  console.warn('❌ AuthGuard - Acceso denegado, redirigiendo a login');

  // Guardar la URL intentada para redirigir después del login
  router.navigate(['/login'], {
    queryParams: { returnUrl: state.url }
  });

  return false;
};
