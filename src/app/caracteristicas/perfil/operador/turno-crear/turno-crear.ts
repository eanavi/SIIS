import { Component, inject, signal, computed } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, Validator, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { TurnoCrearStore } from './turno-crear.store';
import { DatosMedico } from '../shared/datos-medico/datos-medico';

@Component({
  selector: 'app-turno-crear',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatCardModule,
    MatSelectModule,
    MatDatepickerModule,
    MatInputModule,
    MatButtonModule,
    MatCheckboxModule,
    MatIconModule,
    DatosMedico
],
  providers: [TurnoCrearStore],
  templateUrl: './turno-crear.html',
  styleUrl: './turno-crear.scss',
})
export class TurnoCrear {
  private route = inject(ActivatedRoute);
  private fb = inject(FormBuilder);
  store = inject(TurnoCrearStore);

  idMedico = Number(this.route.snapshot.paramMap.get('id_empleado'));

  form = this.fb.group({
    id_prestacion: [null, Validators.required],
    fecha_inicio: [null, Validators.required],
    fecha_final: [null, Validators.required],
    hora_inicio:[null, Validators.required],
    hora_final: [null, Validators.required],
    dias:this.fb.group({
      L:[false],
      M: [false],
      I: [false],
      J: [false],
      V: [false],
      S: [false],
      D: [false]
    })
  })

  constructor(){
    this.store.cargarPrestaciones(this.idMedico);

    if(this.idMedico){
      this.store.setMedico(this.idMedico);
    }
  }

  guardar(){
    if(this.form.invalid) return;

    this.store.crearTurno({
      id_medico: this.idMedico,
      id_prestacion: this.form.value.id_prestacion!,
      fecha_inicio: this.form.value.fecha_inicio!,
      fecha_final: this.form.value.fecha_final!,
      hora_inicio: this.form.value.hora_inicio!,
      hora_final: this.form.value.hora_final!,
      dia_semana: this.form.value.dias!
    });
  }


}
