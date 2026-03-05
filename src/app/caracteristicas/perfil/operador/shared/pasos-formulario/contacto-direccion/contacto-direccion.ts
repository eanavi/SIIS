import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormGroup, ReactiveFormsModule, FormBuilder } from '@angular/forms';

// Material
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';

@Component({
  selector: 'app-contacto-direccion',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
    MatButtonModule,
    MatDividerModule
  ],
  templateUrl: './contacto-direccion.html',
  styleUrl: './contacto-direccion.scss',
})
export class ContactoDireccion {

  @Input({ required: true }) contactoForm!: FormGroup;

  private fb = inject(FormBuilder);

  get direcciones(): FormArray {
    return this.contactoForm.get('direcciones') as FormArray;
  }

  agregarDireccion(): void {
    if (this.direcciones.length < 3) {
      const direccionGroup = this.fb.group({
        calle: [''],
        numero: [''],
        zona: [''],
        tipo: ['personal']
      });
      this.direcciones.push(direccionGroup);
    }
  }

  eliminarDireccion(index: number): void {
    if (this.direcciones.length > 1) {
      this.direcciones.removeAt(index);
    }
  }

/*
  private crearDireccion(): FormGroup {
    return new FormGroup({
      calle: new FormGroup({}).parent?.controls['calle'],
    }) as any;
  }
    */

}
