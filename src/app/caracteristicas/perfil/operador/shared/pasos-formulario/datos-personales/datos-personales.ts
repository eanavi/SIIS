import { Component, input, inject, Input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatCardModule } from '@angular/material/card';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatIconModule } from '@angular/material/icon';
import { MatNativeDateModule } from '@angular/material/core';


import { ListaOpciones } from '../../../../../../datos/modelos/consulta.model';
import { SaludService } from '../../../../../../nucleo/servicios/salud.service';

@Component({
  selector: 'app-datos-personales',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatCardModule,
    MatIconModule
  ],
  templateUrl: './datos-personales.html',
  styleUrl: './datos-personales.scss',
})
export class DatosPersonales {
  @Input({ required: true }) form!: FormGroup;
  @Input({ required: true}) estadosCiviles: ListaOpciones[] = [];
  @Input({ required: true}) tiposSangre: ListaOpciones[] = [];

  private saludService = inject(SaludService);
  fechaMaxima = new Date();

  get edadPaciente(): string {
    const fechaNac = this.form.get('fecha_nacimiento')?.value;
    if (!fechaNac) return '';
    return this.saludService.edad(fechaNac);
  }

  edad = computed(() => {
    const fecha = this.form.get('fecha_nacimiento')?.value;
    return fecha ? this.saludService.edad(fecha) : '';
  })

}
