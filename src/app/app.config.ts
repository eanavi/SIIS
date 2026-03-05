import { ApplicationConfig, provideAppInitializer, inject } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideNativeDateAdapter } from '@angular/material/core';

import { routes } from './app.routes';
import { authInterceptor } from './nucleo/interceptores/auth.interceptor';
import { EntornoService } from './nucleo/config/entorno.service';

function inicializarAplicacion() {
  const entornoService = inject(EntornoService);

  entornoService.mostrarConfiguracion();

  if (!entornoService.obtenerApiUrl()) {
    throw new Error('API_URL no está configurada');
  }

  console.log('✅ Aplicación inicializada correctamente');
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(
      withInterceptors([authInterceptor])
    ),
    provideNativeDateAdapter(),
    provideAppInitializer(inicializarAplicacion)
  ]
};
