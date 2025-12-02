// src/app/nucleo/guardias/rol-redirect.guard.ts

import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../servicios/auth.service';

export const rolRedirectGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const usuario = authService.usuarioActual();
  const rol = usuario?.informacion?.nombre_rol || usuario?.rol;

  console.log('🔀 RolRedirectGuard - Verificando rol...');
  console.log('   Rol del usuario:', rol);
  console.log('   URL solicitada:', state.url);

  // Mapeo de roles a rutas de perfil
  const rolRoutes: Record<string, string> = {
    'Medico': '/medico',
    'Enfermera': '/enfermera',
    'Odontologo': '/odontologo',
    'Operador': '/operador',
    'Administrador': '/administrador'
  };

  const rutaPerfil = rolRoutes[rol || ''];

  // Si no tiene rol o no hay ruta para ese rol
  if (!rutaPerfil) {
    console.error('❌ RolRedirectGuard - Rol no reconocido:', rol);
    authService.logout();
    return false;
  }

  // Si estamos en la raíz '/', redirigir al perfil correspondiente
  if (state.url === '/' || state.url === '') {
    console.log('🎯 RolRedirectGuard - Redirigiendo a:', rutaPerfil);
    router.navigate([rutaPerfil]);
    return false;
  }

  console.log('✅ RolRedirectGuard - Acceso permitido');
  return true;
};

// Guard específico para verificar que el usuario tenga el rol correcto
export const verificarRolGuard = (rolesPermitidos: string[]): CanActivateFn => {
  return (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    const usuario = authService.usuarioActual();
    const rol = usuario?.informacion?.nombre_rol || usuario?.rol;

    console.log('🔐 VerificarRolGuard - Verificando permisos...');
    console.log('   Rol del usuario:', rol);
    console.log('   Roles permitidos:', rolesPermitidos);
    console.log('   URL solicitada:', state.url);

    if (!rol) {
      console.error('❌ VerificarRolGuard - Usuario sin rol');
      authService.logout();
      return false;
    }

    if (!rolesPermitidos.includes(rol)) {
      console.error('❌ VerificarRolGuard - Acceso denegado. Rol no permitido.');

      // Redirigir al perfil correcto del usuario
      const rolRoutes: Record<string, string> = {
        'Medico': '/medico',
        'Enfermera': '/enfermera',
        'Odontologo': '/odontologo',
        'Operador': '/operador',
        'Administrador': '/administrador'
      };

      const rutaCorrecta = rolRoutes[rol];
      if (rutaCorrecta) {
        console.log('🎯 VerificarRolGuard - Redirigiendo a perfil correcto:', rutaCorrecta);
        router.navigate([rutaCorrecta]);
      } else {
        authService.logout();
      }

      return false;
    }

    console.log('✅ VerificarRolGuard - Acceso permitido');
    return true;
  };
};
