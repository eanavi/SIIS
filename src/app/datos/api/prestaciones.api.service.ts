import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { ServicioApi } from './base-api.service';
import { PrestacionLista } from '../modelos/prestacion.model';

@Injectable({ providedIn: 'root' })
export class PrestacionesApiService {
  private api = inject(ServicioApi);


  obtenerPrestacionesPorPerfil(idEmpleado: number): Observable<PrestacionLista[]> {
    return this.api.get<PrestacionLista[]>(`prestaciones/perfil/${idEmpleado}`, 'json');
  }

  listarPrestaciones(): Observable<PrestacionLista[]> {
    return this.api.get<PrestacionLista[]>('/', 'json');
  }

  obtenerPrestacion(idPrestacion: number): Observable<PrestacionLista> {
    return this.api.get<PrestacionLista>(`/${idPrestacion}`, 'json');
  }

}
