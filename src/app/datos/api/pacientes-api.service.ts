import { Injectable, inject } from "@angular/core";
import { Observable } from "rxjs";
import { HttpParams } from "@angular/common/http";

import { ServicioApi } from "./base-api.service";
import { PacienteAsignado } from "../modelos/paciente.model";

@Injectable({ providedIn: 'root' })
export class PacientesApiService{
  private api = inject(ServicioApi);


  buscarPacientesAsignados(criterio?:string): Observable<PacienteAsignado[]> {
    let params = new HttpParams();
    if (criterio && criterio.trim()){
      params = params.set('criterio', criterio.trim());
    }

    return this.api.get<PacienteAsignado[]>('pacientes/buscar_asignados', 'json', null, params);
  }

  obtenerPaciente(idPaciente: number): Observable<any> {
    return this.api.get<any>(`/pacientes/${idPaciente}`, 'json');
  }

  obtenerHistorial(idPaciente: number): Observable<any> {
    return this.api.get<any>(`/pacientes/${idPaciente}/historial`);
  }

}
