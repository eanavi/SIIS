// src/app/dominio/servicios/menu.service.ts

import { Injectable, inject, signal } from '@angular/core';
import { Observable, tap, catchError, throwError } from 'rxjs';
import { map } from 'rxjs/operators';

import { ServicioApi } from '../../datos/api/base-api.service';
import { Menu, MenuItem } from '../../datos/modelos/menu.model';

@Injectable({ providedIn: 'root' })
export class MenuService {
  private api = inject(ServicioApi);

  // Señal para los menús del usuario
  private menusSignal = signal<MenuItem[]>([]);
  readonly menus = this.menusSignal.asReadonly();

  // Señal para indicar si está cargando
  private cargandoSignal = signal(false);
  readonly cargando = this.cargandoSignal.asReadonly();

  /**
   * Cargar menús según el rol del usuario
   */
  cargarMenusPorRol(rol: string): Observable<MenuItem[]> {
    this.cargandoSignal.set(true);

    return this.api.get<Menu[]>(`menus/rol/${rol}`).pipe(
      map(menus => this.transformarMenus(menus, rol)), // ✅ Pasar el rol para agregar prefijo
      tap(menus => {
        this.menusSignal.set(menus);
        this.cargandoSignal.set(false);
        console.log('✅ Menús cargados y transformados:', menus);
      }),
      catchError(error => {
        console.error('❌ Error al cargar menús:', error);
        this.cargandoSignal.set(false);
        this.menusSignal.set([]);
        return throwError(() => new Error('Error al cargar menús del usuario'));
      })
    );
  }

  /**
   * Transformar menús de la API al formato interno
   * Agrega el prefijo del rol a las rutas
   */
  private transformarMenus(menus: Menu[], rol: string): MenuItem[] {
    // Mapeo de roles a prefijos de ruta
    const rolPrefixes: Record<string, string> = {
      'Medico': '/medico',
      'Enfermera': '/enfermera',
      'Odontologo': '/odontologo',
      'Operador': '/operador',
      'Administrador': '/administrador'
    };

    const prefijo = rolPrefixes[rol] || '';

    return menus
      .map(menu => {
        // ✅ Agregar prefijo del rol a la ruta si no lo tiene
        let rutaCompleta = menu.ruta;

        // Si la ruta ya tiene el prefijo, no agregarlo de nuevo
        if (!rutaCompleta.startsWith(prefijo)) {
          rutaCompleta = `${prefijo}${menu.ruta}`;
        }

        return {
          label: menu.nombre_menu,
          route: rutaCompleta,
          icon: menu.icono,
          orden: menu.orden,
          metodos: menu.metodo
        };
      })
      .sort((a, b) => a.orden - b.orden);
  }

  /**
   * Limpiar menús (al cerrar sesión)
   */
  limpiarMenus(): void {
    this.menusSignal.set([]);
  }

  /**
   * Verificar si el usuario tiene permiso para un método en una ruta
   */
  tienePermiso(ruta: string, metodo: string): boolean {
    const menu = this.menusSignal().find(m => m.route === ruta);
    if (!menu) return false;

    return menu.metodos.some(m =>
      m.toUpperCase().includes(metodo.toUpperCase())
    );
  }
}
