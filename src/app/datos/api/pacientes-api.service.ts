import { Injectable, inject } from "@angular/core";
import { Observable } from "rxjs";
import { HttpParams } from "@angular/common/http";

import { ServicioApi } from "./base-api.service";
import { PacienteAsignado, PacienteAsignadoEnf, PacienteDetalle, PacienteListado, RespuestaPaginada } from "../modelos/paciente.model";

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

  buscarPacientesAsignadosEnfermeria(criterio?:string): Observable<PacienteAsignadoEnf[]>{
    let params = new HttpParams();
    if (criterio && criterio.trim()){
      params = params.set('criterio', criterio.trim());
    }

    return this.api.get<PacienteAsignadoEnf[]>('pacientes/enfermeria/buscar_asig', 'json', null, params);
  }

  obtenerPaciente(idPaciente: number): Observable<any> {
    return this.api.get<any>(`pacientes/${idPaciente}`, 'json');
  }

  obtenerHistorial(idPaciente: number): Observable<any> {
    return this.api.get<any>(`/pacientes/${idPaciente}/historial`);
  }

  crearPaciente(datos: any): Observable<any> {
    return this.api.post('pacientes', datos);
  }

  actualizarPaciente(id: number, datos: any): Observable<any> {
    return this.api.put(`pacientes/${id}`, datos);
  }

  eliminarPaciente(id: number): Observable<any> {
    return this.api.delete(`pacientes/${id}`);
  }


  listarPacientes(
    pagina: number = 1,
    tamanio: number = 10,
    criterio: string = ''
  ): Observable<RespuestaPaginada>{
    let params = new HttpParams()
    .set('pagina', pagina.toString())
    .set('tamanio', tamanio.toString());

    if (criterio && criterio.trim() !== ''){
      params = params.set('criterio', criterio.trim());
    }

    return this.api.get<RespuestaPaginada>(`pacientes/`, 'json', null, params);
  }



}
