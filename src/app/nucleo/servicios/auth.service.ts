// src/app/nucleo/servicios/auth.service.ts

import { Injectable, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, tap, catchError, throwError, firstValueFrom, switchMap  } from 'rxjs'; // ✅ Agregar firstValueFrom aquí

import { ServicioApi } from '../../datos/api/base-api.service';
import { MenuService } from '../../dominio/servicios/menu.service';
import {
  CredencialesLogin,
  RespuestaAuth,
  UsuarioAutenticado,
  UsuarioCompleto,
  PayloadToken,
  InformacionUsuario
} from '../../datos/modelos/auth.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private api = inject(ServicioApi);
  private router = inject(Router);
  private menuService = inject(MenuService);

  // Señales para el estado de autenticación
  private usuarioActualSignal = signal<UsuarioCompleto | null>(null);
  private estaAutenticadoSignal = signal<boolean>(false);
  private cargandoInfoSignal = signal<boolean>(false);

  // Exponer señales como readonly
  readonly usuarioActual = this.usuarioActualSignal.asReadonly();
  readonly estaAutenticado = this.estaAutenticadoSignal.asReadonly();
  readonly cargandoInfo = this.cargandoInfoSignal.asReadonly();

  // Claves para localStorage
  private readonly TOKEN_KEY = 'access_token';
  private readonly USER_KEY = 'usuario_actual';
  private readonly USER_INFO_KEY = 'informacion_usuario';

  constructor() {
    this.verificarSesionExistenteSincrona();
  }

  /**
   * Iniciar sesión con redirección dinámica según rol
   */
  login(username: string, password: string): Observable<RespuestaAuth> {
  const credenciales: CredencialesLogin = {
    username,
    password,
    grant_type: 'password',
    scope: '',
    client_id: 'string',
    client_secret: 'string'
  };

  const body = this.convertirAFormUrlEncoded(credenciales);

  console.log('🔐 Intentando login con:', { username, url: 'auth/login' });

  return this.api.post<RespuestaAuth>('auth/login', body, 'formulario').pipe(
    // ✅ Cambiar de tap a switchMap para manejar mejor el flujo asíncrono
    switchMap(async (respuesta) => {
      console.log('✅ Login exitoso:', respuesta);
      this.guardarSesion(respuesta);

      try {
        // 1. Cargar información del usuario
        const infoUsuario = await firstValueFrom(this.cargarInformacionUsuario(username));
        console.log('✅ Información del usuario cargada:', infoUsuario);

        // 2. Obtener el rol
        const rol = this.usuarioActualSignal()?.informacion?.nombre_rol ||
                    this.usuarioActualSignal()?.rol;

        console.log('👤 Rol del usuario:', rol);

        if (rol) {
          // 3. Cargar menús del rol
          const menus = await firstValueFrom(this.menuService.cargarMenusPorRol(rol));
          console.log('✅ Menús cargados:', menus);

          // 4. Mapeo de roles a rutas de perfil
          const rolRoutes: Record<string, string> = {
            'Medico': '/medico',
            'Enfermera': '/enfermera',
            'Odontologo': '/odontologo',
            'Operador': '/operador',
            'Administrador': '/administrador'
          };

          const rutaDestino = rolRoutes[rol];

          if (rutaDestino) {
            console.log(`🎯 Redirigiendo a perfil: ${rutaDestino}`);

            // ✅ Usar timeout para asegurar que Angular procese las señales
            setTimeout(() => {
              this.router.navigate([rutaDestino]);
            }, 100);
          } else {
            console.warn('⚠️ Rol no reconocido, cerrando sesión');
            this.logout();
          }
        } else {
          console.error('❌ No se pudo obtener el rol del usuario');
          this.logout();
        }
      } catch (error) {
        console.error('❌ Error al cargar información post-login:', error);
        this.logout();
      }

      return respuesta;
    }),
    catchError(error => {
      console.error('❌ Error en login:', error);

      let mensajeUsuario = 'Error al iniciar sesión';

      if (error.status === 0) {
        mensajeUsuario = 'No se puede conectar con el servidor';
      } else if (error.status === 401 || error.status === 400) {
        mensajeUsuario = 'Usuario o contraseña incorrectos';
      } else if (error.mensaje) {
        mensajeUsuario = error.mensaje;
      }

      return throwError(() => new Error(mensajeUsuario));
    })
  );
}


  /**
   * Cargar información completa del usuario
   */
  cargarInformacionUsuario(username?: string): Observable<InformacionUsuario> {
    const nombreUsuario = username || this.usuarioActualSignal()?.username;

    if (!nombreUsuario) {
      return throwError(() => new Error('No hay usuario autenticado'));
    }

    this.cargandoInfoSignal.set(true);

    return this.api.get<InformacionUsuario>(
      `usuarios/informacion/${nombreUsuario}`
    ).pipe(
      tap(info => {
        const usuarioActual = this.usuarioActualSignal();
        if (usuarioActual) {
          const usuarioCompleto: UsuarioCompleto = {
            ...usuarioActual,
            informacion: info
          };
          this.usuarioActualSignal.set(usuarioCompleto);
          localStorage.setItem(this.USER_INFO_KEY, JSON.stringify(info));
        }
        this.cargandoInfoSignal.set(false);
      }),
      catchError(error => {
        console.error('Error al cargar información del usuario:', error);
        this.cargandoInfoSignal.set(false);
        return throwError(() => new Error('Error al cargar información del usuario'));
      })
    );
  }

  /**
   * Refrescar información del usuario
   */
  refrescarInformacionUsuario(): Observable<InformacionUsuario> {
    return this.cargarInformacionUsuario();
  }

  /**
 * Verificación síncrona inicial (solo con localStorage)
 */
  private verificarSesionExistenteSincrona(): void {
    const token = this.obtenerToken();

    if (token && this.esTokenValido()) {
      const usuario = this.obtenerInfoUsuario();
      if (usuario) {
        const infoGuardada = localStorage.getItem(this.USER_INFO_KEY);
        let usuarioCompleto: UsuarioCompleto = usuario;

        if (infoGuardada) {
          try {
            usuarioCompleto = {
              ...usuario,
              informacion: JSON.parse(infoGuardada)
            };
          } catch (error) {
            console.error('Error al parsear información guardada:', error);
          }
        }

        // ✅ Actualizar señales de forma síncrona
        this.usuarioActualSignal.set(usuarioCompleto);
        this.estaAutenticadoSignal.set(true);

        console.log('✅ Sesión restaurada:', {
          username: usuarioCompleto.username,
          rol: usuarioCompleto.informacion?.nombre_rol || usuarioCompleto.rol,
          autenticado: true
        });

        // Cargar menús de forma asíncrona (sin await)
        const rol = usuarioCompleto.informacion?.nombre_rol || usuario.rol;
        if (rol) {
          this.menuService.cargarMenusPorRol(rol).subscribe({
            next: () => console.log('✅ Menús cargados después de restaurar sesión'),
            error: (error) => console.error('Error al cargar menús:', error)
          });
        }
      }
    } else {
      console.warn('⚠️ No hay sesión válida');
      this.estaAutenticadoSignal.set(false);
    }
  }

  /**
   * Obtener información del usuario desde la señal o localStorage
   */
  obtenerInformacionUsuario(): InformacionUsuario | null {
    const usuario = this.usuarioActualSignal();
    if (usuario?.informacion) {
      return usuario.informacion;
    }

    const infoGuardada = localStorage.getItem(this.USER_INFO_KEY);
    if (infoGuardada) {
      try {
        return JSON.parse(infoGuardada);
      } catch {
        return null;
      }
    }

    return null;
  }

  /**
   * Cerrar sesión
   */
  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    localStorage.removeItem(this.USER_INFO_KEY);

    this.usuarioActualSignal.set(null);
    this.estaAutenticadoSignal.set(false);
    this.cargandoInfoSignal.set(false);

    this.menuService.limpiarMenus();

    this.router.navigate(['/login']);
  }

  /**
   * Obtener token actual
   */
  obtenerToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  /**
   * Verificar si el token es válido
   */
  esTokenValido(): boolean {
    const token = this.obtenerToken();
    if (!token) return false;

    try {
      const payload = this.decodificarToken(token);
      const ahora = Math.floor(Date.now() / 1000);
      return payload.exp > ahora;
    } catch {
      return false;
    }
  }

  /**
   * Obtener información del usuario desde el token
   */
  obtenerInfoUsuario(): UsuarioAutenticado | null {
    const token = this.obtenerToken();
    if (!token) return null;

    try {
      const payload = this.decodificarToken(token);
      return {
        username: payload.sub,
        rol: payload.rol,
        token: token,
        exp: payload.exp
      };
    } catch {
      return null;
    }
  }

  /**
   * Verificar si el usuario tiene un rol específico
   */
  tieneRol(rol: string): boolean {
    const usuario = this.usuarioActualSignal();
    return usuario?.rol === rol;
  }

  /**
   * Verificar si es administrador
   */
  esAdministrador(): boolean {
    return this.tieneRol('Administrador');
  }

  /**
   * Verificar si es médico
   */
  esMedico(): boolean {
    return this.tieneRol('Medico');
  }



  /**
   * MÉTODOS PRIVADOS
   */

  private async verificarSesionExistente(): Promise<void> {
    const token = this.obtenerToken();

    if (token && this.esTokenValido()) {
      const usuario = this.obtenerInfoUsuario();
      if (usuario) {
        const infoGuardada = localStorage.getItem(this.USER_INFO_KEY);
        let usuarioCompleto: UsuarioCompleto = usuario;

        if (infoGuardada) {
          try {
            usuarioCompleto = {
              ...usuario,
              informacion: JSON.parse(infoGuardada)
            };

            // Cargar menús si hay información del rol
            const rol = usuarioCompleto.informacion?.nombre_rol || usuario.rol;
            if (rol) {
              await firstValueFrom(this.menuService.cargarMenusPorRol(rol));
            }
          } catch {
            this.cargarInformacionUsuario(usuario.username).subscribe();
          }
        } else {
          this.cargarInformacionUsuario(usuario.username).subscribe();
        }

        this.usuarioActualSignal.set(usuarioCompleto);
        this.estaAutenticadoSignal.set(true);
      }
    } else {
      this.logout();
    }
  }

  private guardarSesion(respuesta: RespuestaAuth): void {
    localStorage.setItem(this.TOKEN_KEY, respuesta.access_token);

    const usuario = this.obtenerInfoUsuario();
    if (usuario) {
      localStorage.setItem(this.USER_KEY, JSON.stringify(usuario));
      this.usuarioActualSignal.set(usuario);
      this.estaAutenticadoSignal.set(true);
    }
  }

  private decodificarToken(token: string): PayloadToken {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('Error al decodificar token:', error);
      throw new Error('Token inválido');
    }
  }

  private convertirAFormUrlEncoded(datos: CredencialesLogin): string {
    return Object.entries(datos)
      .map(([key, value]) =>
        `${encodeURIComponent(key)}=${encodeURIComponent(value || '')}`
      )
      .join('&');
  }
}
