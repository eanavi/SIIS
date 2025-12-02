// src/app/caracteristicas/test/test-auth.component.ts

import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../nucleo/servicios/auth.service';
import { ServicioApi } from '../../datos/api/base-api.service';

@Component({
  selector: 'app-test-auth',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div style="padding: 20px; max-width: 800px; margin: 0 auto;">
      <h2>🧪 Prueba de Autenticación y API</h2>

      <!-- SECCIÓN 1: TEST DE LOGIN -->
      <div style="border: 2px solid #007bff; padding: 15px; margin: 20px 0; border-radius: 8px;">
        <h3>1. Test de Login</h3>
        <div style="margin: 10px 0;">
          <input
            type="text"
            [(ngModel)]="username"
            placeholder="Usuario (ej: eanavi)"
            style="padding: 8px; margin-right: 10px; width: 200px;"
          >
          <input
            type="password"
            [(ngModel)]="password"
            placeholder="Contraseña"
            style="padding: 8px; margin-right: 10px; width: 200px;"
          >
          <button
            (click)="probarLogin()"
            [disabled]="cargando()"
            style="padding: 8px 20px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer;"
          >
            {{ cargando() ? '⏳ Procesando...' : '🔐 Login' }}
          </button>
        </div>

        @if (resultadoLogin()) {
          <div style="margin-top: 10px; padding: 10px; background: #d4edda; border-radius: 4px;">
            <strong>✅ Login exitoso</strong>
            <pre style="margin: 10px 0; background: white; padding: 10px; border-radius: 4px; overflow-x: auto;">{{ resultadoLogin() }}</pre>
          </div>
        }

        @if (errorLogin()) {
          <div style="margin-top: 10px; padding: 10px; background: #f8d7da; border-radius: 4px; color: #721c24;">
            <strong>❌ Error:</strong> {{ errorLogin() }}
          </div>
        }
      </div>

      <!-- SECCIÓN 2: ESTADO DE AUTENTICACIÓN -->
      <div style="border: 2px solid #28a745; padding: 15px; margin: 20px 0; border-radius: 8px;">
        <h3>2. Estado de Autenticación</h3>
        <div style="background: #f8f9fa; padding: 10px; border-radius: 4px;">
          <p><strong>¿Autenticado?</strong> {{ authService.estaAutenticado() ? '✅ Sí' : '❌ No' }}</p>
          <p><strong>Token válido?</strong> {{ authService.esTokenValido() ? '✅ Sí' : '❌ No' }}</p>

          @if (authService.usuarioActual()) {
            <div style="margin-top: 10px;">
              <p><strong>Usuario:</strong> {{ authService.usuarioActual()?.username }}</p>
              <p><strong>Rol:</strong> {{ authService.usuarioActual()?.rol }}</p>
              @if (authService.usuarioActual()?.informacion) {
                <p><strong>Nombre completo:</strong> {{ authService.usuarioActual()?.informacion?.nombre_completo }}</p>
                <p><strong>Centro:</strong> {{ authService.usuarioActual()?.informacion?.nombre_centro }}</p>
                <p><strong>Rol detallado:</strong> {{ authService.usuarioActual()?.informacion?.nombre_rol }}</p>
              }
            </div>
          }
        </div>

        @if (authService.estaAutenticado()) {
          <button
            (click)="authService.logout()"
            style="margin-top: 10px; padding: 8px 20px; background: #dc3545; color: white; border: none; border-radius: 4px; cursor: pointer;"
          >
            🚪 Cerrar Sesión
          </button>
        }
      </div>

      <!-- SECCIÓN 3: TEST DE API CON TOKEN -->
      @if (authService.estaAutenticado()) {
        <div style="border: 2px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 8px;">
          <h3>3. Test de Petición con Token</h3>
          <p>Prueba que el interceptor agregue el token automáticamente</p>

          <button
            (click)="probarPeticionConToken()"
            [disabled]="cargandoPeticion()"
            style="padding: 8px 20px; background: #ffc107; color: #000; border: none; border-radius: 4px; cursor: pointer; margin-right: 10px;"
          >
            {{ cargandoPeticion() ? '⏳ Cargando...' : '📡 Cargar Info Usuario' }}
          </button>

          <button
            (click)="refrescarInfoUsuario()"
            [disabled]="cargandoPeticion()"
            style="padding: 8px 20px; background: #17a2b8; color: white; border: none; border-radius: 4px; cursor: pointer;"
          >
            🔄 Refrescar Info
          </button>

          @if (resultadoPeticion()) {
            <div style="margin-top: 10px; padding: 10px; background: #d4edda; border-radius: 4px;">
              <strong>✅ Petición exitosa</strong>
              <pre style="margin: 10px 0; background: white; padding: 10px; border-radius: 4px; overflow-x: auto;">{{ resultadoPeticion() }}</pre>
            </div>
          }

          @if (errorPeticion()) {
            <div style="margin-top: 10px; padding: 10px; background: #f8d7da; border-radius: 4px; color: #721c24;">
              <strong>❌ Error:</strong> {{ errorPeticion() }}
            </div>
          }
        </div>
      }

      <!-- SECCIÓN 4: INSPECCIONAR TOKEN -->
      @if (authService.obtenerToken()) {
        <div style="border: 2px solid #6c757d; padding: 15px; margin: 20px 0; border-radius: 8px;">
          <h3>4. Inspeccionar Token</h3>
          <div style="background: #f8f9fa; padding: 10px; border-radius: 4px;">
            <p><strong>Token JWT:</strong></p>
            <textarea
              readonly
              style="width: 100%; height: 100px; font-family: monospace; font-size: 12px; padding: 10px; border: 1px solid #ddd; border-radius: 4px;"
            >{{ authService.obtenerToken() }}</textarea>

            <div style="margin-top: 10px;">
              <button
                (click)="decodificarToken()"
                style="padding: 8px 20px; background: #6c757d; color: white; border: none; border-radius: 4px; cursor: pointer;"
              >
                🔍 Decodificar Token
              </button>
            </div>

            @if (tokenDecodificado()) {
              <pre style="margin-top: 10px; background: white; padding: 10px; border-radius: 4px; overflow-x: auto;">{{ tokenDecodificado() }}</pre>
            }
          </div>
        </div>
      }

      <!-- SECCIÓN 5: VERIFICAR HEADERS -->
      <div style="border: 2px solid #17a2b8; padding: 15px; margin: 20px 0; border-radius: 8px;">
        <h3>5. Verificar Headers en Consola</h3>
        <p>Abre la consola del navegador (F12) y ve a la pestaña "Network" para ver los headers de las peticiones.</p>
        <p style="background: #d1ecf1; padding: 10px; border-radius: 4px; margin-top: 10px;">
          <strong>💡 Tip:</strong> Después de hacer login, las peticiones deberían incluir automáticamente el header:<br>
          <code style="background: white; padding: 2px 5px; border-radius: 3px;">Authorization: Bearer [tu-token]</code>
        </p>
      </div>
    </div>
  `
})
export class TestAuthComponent {
  authService = inject(AuthService);
  private api = inject(ServicioApi);

  // Credenciales de prueba
  username = 'eanavi';
  password = 'vicho.1368';

  // Señales para estado
  cargando = signal(false);
  resultadoLogin = signal('');
  errorLogin = signal('');

  cargandoPeticion = signal(false);
  resultadoPeticion = signal('');
  errorPeticion = signal('');

  tokenDecodificado = signal('');

  probarLogin() {
    if (!this.username || !this.password) {
      this.errorLogin.set('Por favor ingresa usuario y contraseña');
      return;
    }

    this.cargando.set(true);
    this.resultadoLogin.set('');
    this.errorLogin.set('');

    this.authService.login(this.username, this.password).subscribe({
      next: (respuesta) => {
        this.cargando.set(false);
        this.resultadoLogin.set(JSON.stringify(respuesta, null, 2));
        console.log('✅ Login exitoso:', respuesta);
      },
      error: (error) => {
        this.cargando.set(false);
        this.errorLogin.set(error.message);
        console.error('❌ Error en login:', error);
      }
    });
  }

  probarPeticionConToken() {
    const username = this.authService.usuarioActual()?.username;

    if (!username) {
      this.errorPeticion.set('No hay usuario autenticado');
      return;
    }

    this.cargandoPeticion.set(true);
    this.resultadoPeticion.set('');
    this.errorPeticion.set('');

    // Hacer petición directa con el ServicioApi
    // El interceptor debería agregar el token automáticamente
    this.api.get<any>(`usuarios/informacion/${username}`).subscribe({
      next: (respuesta) => {
        this.cargandoPeticion.set(false);
        this.resultadoPeticion.set(JSON.stringify(respuesta, null, 2));
        console.log('✅ Petición exitosa:', respuesta);
        console.log('🔍 Revisa la pestaña Network para ver el header Authorization');
      },
      error: (error) => {
        this.cargandoPeticion.set(false);
        this.errorPeticion.set(error.message);
        console.error('❌ Error en petición:', error);
      }
    });
  }

  refrescarInfoUsuario() {
    this.cargandoPeticion.set(true);
    this.resultadoPeticion.set('');
    this.errorPeticion.set('');

    this.authService.refrescarInformacionUsuario().subscribe({
      next: (info) => {
        this.cargandoPeticion.set(false);
        this.resultadoPeticion.set(JSON.stringify(info, null, 2));
        console.log('✅ Información actualizada:', info);
      },
      error: (error) => {
        this.cargandoPeticion.set(false);
        this.errorPeticion.set(error.message);
        console.error('❌ Error al refrescar:', error);
      }
    });
  }

  decodificarToken() {
    const token = this.authService.obtenerToken();
    if (!token) {
      this.tokenDecodificado.set('No hay token');
      return;
    }

    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );

      const payload = JSON.parse(jsonPayload);
      this.tokenDecodificado.set(JSON.stringify(payload, null, 2));
    } catch (error) {
      this.tokenDecodificado.set('Error al decodificar: ' + error);
    }
  }
}
