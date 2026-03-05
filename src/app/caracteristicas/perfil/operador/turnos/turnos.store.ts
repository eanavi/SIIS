import { Injectable, inject, signal, effect } from "@angular/core";
import { TurnosApiService } from "../../../../datos/api/turno-api.service";
import { TurnoBaseLectura, TurnosResponse } from "../../../../datos/modelos/turno.model";
import { Empleado } from "../../../../datos/modelos/empleado.model";
import { EmpleadoApiService } from "../../../../datos/api/empleado-api.service";

@Injectable({ providedIn: 'root' })
export class TurnosStore {
  private api = inject(TurnosApiService);
  private empleadoApi = inject(EmpleadoApiService);

  // --- Estado ---
  private fecha = signal<string>(this.hoy());
  private pagina = signal(1);
  private tamanio = signal(10);

  private _turnos = signal<TurnoBaseLectura[]>([]);
  private _total = signal(0);
  private _empleado = signal<Empleado | null>(null);


  private _loading = signal(false);
  private _error = signal<string | null>(null);

  // --- Selectores ---
  idMedico = signal<number | null>(null);
  turnos = this._turnos.asReadonly();
  total = this._total.asReadonly();
  empleado = this._empleado.asReadonly();
  loading = this._loading.asReadonly();
  error = this._error.asReadonly();
  paginaActual = this.pagina.asReadonly();
  tamanioActual = this.tamanio.asReadonly();

  constructor() {
    effect(() => {
      const id = this.idMedico();
      const fecha = this.fecha();
      const pagina = this.pagina();
      const tamanio = this.tamanio();

      if (!id) return;

      this.cargarEmpleado(id);
      this.fetch(id, fecha, pagina, tamanio);
    });
  }

  // --- Acciones ---

  setMedico(id: number) {
    this.idMedico.set(id);
  }

  setFecha(fecha: Date) {
    this.fecha.set(fecha.toISOString().split('T')[0]);
    this.pagina.set(1); // Reiniciar a página 1 al cambiar fecha
  }

  setPagina(p: number) {
    this.pagina.set(p);
  }

  setTamanio(t: number){
    this.tamanio.set(t);
  }

  eliminar(id: number) {
    this._loading.set(true);

    this.api.eliminarTurno(id).subscribe(() => {
      const actuales = this._turnos();
      this._turnos.set(actuales.filter(t => t.id_turno !== id));
      this._total.update(v => v - 1);
      this._loading.set(false);
    });
  }

  private cargarEmpleado(id: number) {
    this.empleadoApi.datosEmpleado(id).subscribe({
      next: (emp) => this._empleado.set(emp),
      error: (err) => this._error.set('Error al cargar datos del médico:' + err.message)
    });
  }

  private fetch(id: number, fecha: string, pagina: number, tamanio: number) {
    this._loading.set(true);
    this._error.set(null);

    this.api.obtenerTurnosMedico(id.toString(), fecha, pagina, tamanio)
    .subscribe({
      next: (res: TurnosResponse) => {
        this._turnos.set(res.items);
        this._total.set(res.total);
        this._loading.set(false);
      },
      error: (err) => {
        this._error.set('Error al cargar turnos:' + err.message);
        this._loading.set(false);
      }
    });
  }

  private hoy(): string {
    return new Date().toISOString().split('T')[0];
  }
}
