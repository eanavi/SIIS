import { Component, inject } from '@angular/core';
import { ListaSaludStore } from './lista-salud.store';
import { Router } from '@angular/router';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatPaginatorModule } from '@angular/material/paginator';
import { debounceTime } from 'rxjs';
import { SaludService } from '../../../../nucleo/servicios/salud.service';
import { EmpleadoViewModel } from '../../../../datos/modelos/empleado.model';

@Component({
  selector: 'app-lista-salud',
  standalone: true,
  imports: [
    MatTableModule,
    ReactiveFormsModule,
    MatIconModule,
    MatCardModule,
    MatFormFieldModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatPaginatorModule,
    MatInputModule
  ],
  providers: [ListaSaludStore],
  templateUrl: './lista-salud.html',
  styleUrl: './lista-salud.scss'
})
export class ListaSalud {

  store = inject(ListaSaludStore);
  router = inject(Router);
  saludService = inject(SaludService);

  criterioControl = new FormControl('');

  columnasTabla = [
    'ci',
    'nombre_completo',
    'fecha_nacimiento',
    'cargo',
    'acciones'
  ];

  constructor() {
    this.criterioControl.valueChanges
      .pipe(debounceTime(300))
      .subscribe(value => {
        this.store.setCriterio(value ?? '');
      });
  }

  cambiarPagina(event: any) {
    this.store.setPagina(event.pageIndex + 1);
    this.store.setTamanio(event.pageSize);
  }

  editar(empleado: EmpleadoViewModel) {
    this.router.navigate(['/operador/turnos/editar', empleado.id_empleado]);
  }
}
