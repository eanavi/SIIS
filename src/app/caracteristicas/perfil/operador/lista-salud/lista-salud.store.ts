import { Injectable, inject, signal, computed, DestroyRef } from '@angular/core';
import { toObservable, takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { EmpleadoApiService } from '../../../../datos/api/empleado-api.service';
import { EmpleadoListado, EmpleadoListadoPaginado } from '../../../../datos/modelos/empleado.model';
import { mapEmpleadoToView } from '../../../../datos/api/empleado.mapper';
import { catchError, of, tap, switchMap } from 'rxjs';
import { SaludService } from '../../../../nucleo/servicios/salud.service';
interface State {
  empleados: EmpleadoListado[];
  total: number;
  pagina: number;
  tamanio: number;
  criterio: string;
  loading: boolean;
  error: string | null;
}

@Injectable()
export class ListaSaludStore {

  private api = inject(EmpleadoApiService);

  private servSalud = inject(SaludService)

  private destroyRef = inject(DestroyRef);

  // 🔹 STATE
  private state = signal<State>({
    empleados: [],
    total: 0,
    pagina: 1,
    tamanio: 10,
    criterio: '',
    loading: false,
    error: null
  });



  // 🔹 SELECTORS (computed)
  empleados = computed(() => this.state().empleados.map(mapEmpleadoToView));
  total = computed(() => this.state().total);
  pagina = computed(() => this.state().pagina);
  tamanio = computed(() => this.state().tamanio);
  criterio = computed(() => this.state().criterio);
  loading = computed(() => this.state().loading);
  error = computed(() => this.state().error);

private filtro = computed(() => {
  return [this.pagina(), this.tamanio(), this.criterio()] as const;
});


  setEmpleados(data: any[]){
    this.state.update(s => ({
      ...s,
      empleados: data
    }));
  }

  // 🔹 CACHE SIMPLE EN MEMORIA
  private cache = new Map<string, EmpleadoListadoPaginado>();

  constructor() {
    toObservable(this.filtro)
      .pipe(
        switchMap(([pagina, tamanio, criterio]) => {
          const cacheKey = `${pagina}-${tamanio}-${criterio}`;

          if (this.cache.has(cacheKey)) {
            const data = this.cache.get(cacheKey)!;

            this.patch({
              empleados: data.items,
              total: data.total,
              loading: false
            });

            return of(null); // No necesitamos hacer la llamada
          }
          this.patch({ loading: true, error: null });

          return this.api.listarEmpleados(pagina, tamanio, criterio)
            .pipe(
              tap(respuesta => {
                this.cache.set(cacheKey, respuesta);
              }),
              catchError(err => {
                this.patch({
                  error: 'Error al cargar empleados',
                  loading: false
                });
                return of(null);
                })
            );
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(respuesta => {
        if (!respuesta) return;

        this.patch({
          empleados: respuesta.items,
          total: respuesta.total,
          loading: false
        });
      });
  }

  // 🔹 MUTATIONS
  setPagina(pagina: number) {
    this.patch({ pagina });
  }

  setTamanio(tamanio: number) {
    this.patch({ tamanio });
  }

  setCriterio(criterio: string) {
    this.patch({ criterio, pagina: 1 });
  }


  private patch(partial: Partial<State>) {
    this.state.update(s => ({ ...s, ...partial }));
  }
}
