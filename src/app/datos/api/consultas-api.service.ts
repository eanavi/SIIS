// src/app/datos/api/consultas-api.service.ts

import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { ServicioApi } from './base-api.service';
import { Consulta, ActualizarConsultaDto } from '../modelos/consulta.model';

@Injectable({ providedIn: 'root' })
export class ConsultasApiService {
  private api = inject(ServicioApi);

  /**
   * Obtener consulta por ID de reserva
   */
  obtenerConsultaPorReserva(idReserva: number): Observable<Consulta> {
    return this.api.get<Consulta>(`consultas/reserva/${idReserva}`);
  }

  /**
   * Actualizar consulta médica
   */
  actualizarConsulta(idConsulta: number, datos: ActualizarConsultaDto): Observable<Consulta> {
    return this.api.put<Consulta>(`consultas/${idConsulta}`, datos);
  }

  actualizarReserva(idReserva: number, estado: string): Observable<any> {
    return this.api.put(`reservas/estado/${idReserva}?estado=${estado}`, null);
  }

  crearConsultaEnfermeria(
    idReserva: number,
    idPaciente: number,
    datos: any
  ): Observable<any> {
    return this.api.post(`consultas/reserva/${idReserva}/paciente/${idPaciente}`, datos);
  }

}
