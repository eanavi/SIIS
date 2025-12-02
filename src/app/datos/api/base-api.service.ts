// src/app/datos/api/base-api.service.ts

import { Injectable, inject } from "@angular/core";
import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from "@angular/common/http";
import { Observable, throwError } from "rxjs";
import { catchError } from "rxjs/operators";

import { EntornoService } from "../../nucleo/config/entorno.service";

type TipoEncabezado = 'json' | 'formulario';

@Injectable({ providedIn: 'root'})
export class ServicioApi {
  private readonly DEFAULT_HEADER_TYPE: TipoEncabezado = 'json';

  constructor(
    private http: HttpClient,
    private entornoService: EntornoService
  ){}

  post<T>(
    ruta: string,
    datos: any,
    tipoEncabezado: TipoEncabezado = this.DEFAULT_HEADER_TYPE
  ): Observable<T> {
    const url = `${this.entornoService.obtenerApiUrl()}/${this.construirRuta(ruta)}`;
    const encabezado = this.obtenerTipoEncabezado(tipoEncabezado);

    console.log('🌐 POST Request:', { url, datos, headers: encabezado });

    return this.http.post<T>(url, datos, { headers: encabezado })
      .pipe(catchError(error => this.manejaErrores(error, 'POST', url)));
  }

  get<T>(
    ruta: string,
    tipoEncabezado: TipoEncabezado = this.DEFAULT_HEADER_TYPE,
    id?: string | number | null,
    parametros?: HttpParams
  ): Observable<T> {
    const url = `${this.entornoService.obtenerApiUrl()}/${this.construirRuta(ruta, id)}`;
    const encabezados = this.obtenerTipoEncabezado(tipoEncabezado);

    console.log('🌐 GET Request:', { url, headers: encabezados, params: parametros });

    return this.http.get<T>(url, { headers: encabezados, params: parametros })
      .pipe(catchError(error => this.manejaErrores(error, 'GET', url)));
  }

  put<T>(
    ruta: string,
    datos: any,
    tipoEncabezado: TipoEncabezado = this.DEFAULT_HEADER_TYPE,
    id?: string | number | null
  ): Observable<T> {
    const url = `${this.entornoService.obtenerApiUrl()}/${this.construirRuta(ruta, id)}`;
    const encabezado = this.obtenerTipoEncabezado(tipoEncabezado);

    console.log('🌐 PUT Request:', { url, datos, headers: encabezado });

    return this.http.put<T>(url, datos, { headers: encabezado })
      .pipe(catchError(error => this.manejaErrores(error, 'PUT', url)));
  }

  delete<T>(
    ruta: string,
    tipoEncabezado: TipoEncabezado = this.DEFAULT_HEADER_TYPE,
    id?: string | number | null
  ): Observable<T> {
    const url = `${this.entornoService.obtenerApiUrl()}/${this.construirRuta(ruta, id)}`;
    const encabezados = this.obtenerTipoEncabezado(tipoEncabezado);

    console.log('🌐 DELETE Request:', { url, headers: encabezados });

    return this.http.delete<T>(url, { headers: encabezados })
      .pipe(catchError(error => this.manejaErrores(error, 'DELETE', url)));
  }

  private obtenerTipoEncabezado(tipo: TipoEncabezado): HttpHeaders {
    switch(tipo) {
      case 'formulario':
        return this.obtenerEncabezadosFormulario();
      case 'json':
      default:
        return this.obtenerEncabezadosJson();
    }
  }

  private construirRuta(ruta: string, id?: string | number | null | undefined): string {
    if (id === undefined || id === null) {
      return ruta;
    }

    return ruta.includes(':id') ? ruta.replace(':id', String(id)) : `${ruta}/${id}`;
  }

  private manejaErrores(error: HttpErrorResponse, metodo: string, url: string): Observable<never> {
    console.group(`❌ Error en ${metodo} ${url}`);
    console.error('Error completo:', error);
    console.error('Status:', error.status);
    console.error('Status Text:', error.statusText);
    console.error('Error Message:', error.message);
    console.error('Error Body:', error.error);
    console.groupEnd();

    let mensajeError = 'Error en la comunicación con la API.';

    if (error.error instanceof ErrorEvent) {
      // Error del lado del cliente o de red
      mensajeError = `Error de red: ${error.error.message}`;
    } else {
      // Error del lado del servidor
      switch (error.status) {
        case 0:
          mensajeError = 'No se puede conectar con el servidor. Verifica que la API esté corriendo.';
          break;
        case 400:
          mensajeError = `Solicitud incorrecta: ${error.error?.detail || error.message}`;
          break;
        case 401:
          mensajeError = 'No autorizado. Credenciales inválidas.';
          break;
        case 403:
          mensajeError = 'Acceso prohibido.';
          break;
        case 404:
          mensajeError = `Recurso no encontrado: ${url}`;
          break;
        case 422:
          mensajeError = `Error de validación: ${JSON.stringify(error.error?.detail)}`;
          break;
        case 500:
          mensajeError = 'Error interno del servidor.';
          break;
        default:
          mensajeError = `Error ${error.status}: ${error.message}`;
      }
    }

    return throwError(() => ({
      mensaje: mensajeError,
      status: error.status,
      statusText: error.statusText,
      error: error.error,
      url: url
    }));
  }

  private obtenerEncabezadosJson(): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });
  }

  private obtenerEncabezadosFormulario(): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded',
      'Accept': 'application/json'
    });
  }
}
