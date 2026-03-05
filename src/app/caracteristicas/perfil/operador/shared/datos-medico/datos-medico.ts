import { Component, input, computed } from '@angular/core';

import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';


import { Empleado } from '../../../../../datos/modelos/empleado.model'

@Component({
  selector: 'app-datos-medico',
  imports: [
    MatCardModule,
    MatIconModule,
    MatChipsModule

  ],
  templateUrl: './datos-medico.html',
  styleUrl: './datos-medico.scss',
})
export class DatosMedico {

  empleado = input<Empleado | null>();

  titulo = computed(() => {
    const emp = this.empleado();
    if (!emp) return '';

    return emp.sexo === 'F' ? 'Dra.' : 'Dr.';
  })

}
