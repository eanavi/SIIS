import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { ServicioApi } from './base-api.service';
import { ListaOpciones } from '../modelos/consulta.model';


@Injectable({
  providedIn: 'root'
})
export class ListasApiService {
  private api = inject(ServicioApi);

  /**
   * Obtener lista por grupo
   * GET /listas/grupo/{grupo}
   */
  obtenerLista(grupo: string): Observable<ListaOpciones[]> {
    return this.api.get<ListaOpciones[]>(`listas/grupo/${grupo}`, 'json');
  }

  /**
   * Listas específicas disponibles:
   * - se_estado_civil
   * - tipo_sangre
   * - se_profesion
   * - se_nivel_estudio
   * - se_idioma
   * - se_idiomamaterno
   * - se_autopertenencia
   */
}
