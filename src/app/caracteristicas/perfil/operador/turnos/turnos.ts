import { Component, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ActivatedRoute, Router } from "@angular/router";
import { FormControl, ReactiveFormsModule } from "@angular/forms";
import { PageEvent, MatPaginatorModule } from "@angular/material/paginator";
import { MatTableModule } from "@angular/material/table";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { MatButtonModule } from "@angular/material/button";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { MatInputModule } from "@angular/material/input";
import { MatCardModule } from "@angular/material/card";
import { MatIconModule } from "@angular/material/icon";


import { TurnosStore } from "./turnos.store";
import { DatosMedico } from "../shared/datos-medico/datos-medico";
import { MatTooltip } from "@angular/material/tooltip";

@Component({
  selector: 'app-turnos',
  standalone: true,
  templateUrl: './turnos.html',
  styleUrl: './turnos.scss',

  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatPaginatorModule,
    MatTableModule,
    MatProgressSpinnerModule,
    MatButtonModule,
    MatDatepickerModule,
    MatInputModule,
    MatIconModule,
    MatCardModule,
    DatosMedico,
    MatTooltip
]
})

export class Turnos{

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  store = inject(TurnosStore);


  fechaControl = new FormControl(new Date());

  columnas = [
    'prestacion',
    'fecha_inicio',
    'fecha_final',
    'hora_inicio',
    'hora_final',
    'dias',
    'acciones'
  ];

  constructor(){
    const id = Number(this.route.snapshot.paramMap.get('id_empleado'));
    if (id) {
      this.store.setMedico(id);
    }

    this.fechaControl.valueChanges.subscribe(fecha => {
      if (fecha) {
        this.store.setFecha(fecha);
      }
    });
  }

  cambiarPagina(event: PageEvent){
    this.store.setPagina(event.pageIndex + 1);
    this.store.setTamanio(event.pageSize);
  }

  eliminar(id: number){
    this.store.eliminar(id);
  }

  nuevoTurno(){
    this.router.navigate([
      'operador/turnos/nuevo/'+this.store.idMedico()?.toString()
    ]);

  }

}
