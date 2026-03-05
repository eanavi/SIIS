import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';

import { ListaOpciones } from '../../../../../../datos/modelos/consulta.model';
import { MatIcon } from "@angular/material/icon";
import { A11yModule } from "@angular/cdk/a11y";


@Component({
  selector: 'app-datos-adicionales',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatCardModule,
    MatIconModule,
    A11yModule
],
  templateUrl: './datos-adicionales.html',
  styleUrl: './datos-adicionales.scss',
})
export class DatosAdicionales {
  @Input({ required: true }) formAdicional!: FormGroup;
  @Input() ocupaciones: ListaOpciones[] = [];
  @Input() nivelesEstudio: ListaOpciones[] = [];
  @Input() idiomas: ListaOpciones[] = [];
  @Input() idiomasMaternos: ListaOpciones[] = [];
  @Input() autopertenencias: ListaOpciones[] = [];
  @Input() guardando = false;

  @Output() guardar = new EventEmitter<void>();
}
