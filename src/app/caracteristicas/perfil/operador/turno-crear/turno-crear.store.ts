import { Injectable, inject, signal, effect } from "@angular/core";
import { PrestacionesApiService } from "../../../../datos/api/prestaciones.api.service";
import { TurnosApiService } from "../../../../datos/api/turno-api.service";
import { PrestacionLista } from "../../../../datos/modelos/prestacion.model";
import { tap } from "rxjs";
import { Empleado } from "../../../../datos/modelos/empleado.model";
import { EmpleadoApiService } from "../../../../datos/api/empleado-api.service";

@Injectable()
export class TurnoCrearStore{

  private prestacionApi = inject(PrestacionesApiService);
  private turnoApi = inject(TurnosApiService);
  private empleadoApi = inject(EmpleadoApiService);
  private _empleado = signal<Empleado | null>(null);
  private _error = signal<string | null>(null);

  idMedico = signal<number | null>(null);
  prestaciones = signal<PrestacionLista[]>([]);
  loading = signal<boolean>(false);
  error = this._error.asReadonly();
  success = signal<boolean>(false);
  empleado = this._empleado.asReadonly();
  diasSemana = ['L', 'M', 'I', 'J', 'V', 'S', 'D'];

  constructor(){
    effect(() => {
      const id = this.idMedico();

      if (!id) return;

      this.cargarEmpleado(id);
    });
  }


  private cargarEmpleado(id: number){
    this.empleadoApi.datosEmpleado(id).subscribe({
      next: (emp) => this._empleado.set(emp),
      error: (err) => this._error.set('Error al cargar datos del medico:' + err.message)
    })
  }

  cargarPrestaciones(idMedico: number){
    this.loading.set(true);

    this.prestacionApi
    .obtenerPrestacionesPorPerfil(idMedico)
    .pipe(
      tap(() => this.loading.set(false))
    )
    .subscribe({
      next: data => this.prestaciones.set(data),
      error:() => {
        this._error.set('Error al cargar prestaciones');
        this.loading.set(false);
      }
    });
  }

  crearTurno(payload: any){
    this.loading.set(true);

    this.turnoApi.crearTurno(payload)
    .subscribe({
      next: () => {
        this.success.set(true);
        this.loading.set(false);
      },
      error: (err) => {
        this._error.set(err.error?.detail ?? 'Error al crear turno');
        this.loading.set(false);
      }
    });
  }

  setMedico(id: number) {
    this.idMedico.set(id);
  }


}
