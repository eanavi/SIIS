// src/app/datos/api/turnos-api.service.ts

import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpParams } from '@angular/common/http';

import { ServicioApi } from './base-api.service';
import {TurnosResponse, TurnoBase, TurnoBaseLectura } from '../modelos/turno.model';




@Injectable({ providedIn: 'root' })
export class TurnosApiService {
  private api = inject(ServicioApi);

  crearTurno(turno: TurnoBase): Observable<any> {
    return this.api.post('turnos/', turno)
  }


  obtenerTurnosMedico(
    id_empleado: string,
    fecha: string,
    pagina: number = 1,
    tamanio: number = 10
  ): Observable<TurnosResponse> {
      return this.api.get<TurnosResponse>(
      `turnos/empleado/${id_empleado}/fecha/${fecha}?pagina=${pagina}&tamanio=${tamanio}`,
      'json', null);
  }

  obtenerTurnoFecha(fecha: string): Observable<TurnoBaseLectura[]> {
    return this.api.get<TurnoBaseLectura[]>(`turnos/fecha/${fecha}`, 'json');
  }

  eliminarTurno(id_turno: number): Observable<any> {
    return this.api.delete(`turnos/${id_turno}`);
  }

  crearTurnos(turnos: TurnoBase[]): Observable<any> {
    return this.api.post('turnos/', turnos);
  }


  obtenerTurnosPorPrestacion(idPrestacion: number): Observable<any[]> {
    return this.api.get<any[]>(`turnos/prestacion/${idPrestacion}`, 'json');
  }

  actualizarTurno(id_turno: number, datos: Partial<TurnoBase>): Observable<any> {
    return this.api.put(`turnos/${id_turno}`, datos);
  }


}
