import { Injectable, inject } from "@angular/core";
import { Observable } from "rxjs";
import { HttpParams } from "@angular/common/http";

import { ServicioApi } from "./base-api.service";
import { Empleado, EmpleadoListadoPaginado } from "../modelos/empleado.model";

@Injectable({ providedIn: 'root' })
export class EmpleadoApiService{
  private api = inject(ServicioApi);

  listarEmpleados( pagina: number = 1,tamanio: number = 10,criterio: string = ''): Observable<EmpleadoListadoPaginado> {
    let params = new HttpParams()
    .set('pagina', pagina.toString())
    .set('tamanio', tamanio.toString());

    if(criterio && criterio.trim() !== ''){
      params = params.set('criterio', criterio.trim());
    }
    return this.api.get<EmpleadoListadoPaginado>(`empleados/`, 'json', null, params);
  }

  datosEmpleado(idEmpleado:number): Observable<Empleado>{
    return this.api.get<Empleado>(`empleados/${idEmpleado}`, 'json')
  }

}
