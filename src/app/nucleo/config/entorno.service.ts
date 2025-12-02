// src/app/nucleo/config/entorno.service.ts
import { Injectable } from '@angular/core';
import {
  configuracionEntorno,
  ConfiguracionEntorno,
  API_URL,
  ENTORNO,
  CLAVE,
  ES_DESARROLLO
} from './entorno.config';

@Injectable({ providedIn: 'root' })
export class EntornoService {
  private readonly config: ConfiguracionEntorno = configuracionEntorno;

  obtenerApiUrl(): string {
    return this.config.apiUrl;
  }

  obtenerEntorno(): string {
    return this.config.entorno;
  }

  obtenerClave(): string {
    return this.config.clave;
  }

  esDesarrollo(): boolean {
    return this.config.esDesarrollo;
  }

  esTesteo(): boolean {
    return this.config.esTesteo;
  }

  esProduccion(): boolean {
    return this.config.esProduccion;
  }

  obtenerConfiguracionCompleta(): ConfiguracionEntorno {
    return { ...this.config };
  }

  mostrarConfiguracion(): void {
    if (this.esDesarrollo()) {
      console.group('🔧 Configuración de Entorno');
      console.log('Entorno:', this.config.entorno);
      console.log('API URL:', this.config.apiUrl);
      console.log('Es Desarrollo:', this.config.esDesarrollo);
      console.log('Es Testeo:', this.config.esTesteo);
      console.log('Es Producción:', this.config.esProduccion);
      console.groupEnd();
    }
  }
}
