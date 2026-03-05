import { Component, Inject, OnInit, signal } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';

import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';

import { ConfirmOptions, ConfirmTipo } from '../../../datos/modelos/confimacion.modelo';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatIconModule,
    MatDialogModule,
    MatFormFieldModule,
    MatButtonModule
  ],
  templateUrl: './confirmacion.html',
  styleUrl: './confirmacion.scss'
})
export class Confirmacion implements OnInit {

  textoIngresado = signal('');
  segundaConfirmacion = signal(false);

  config: any;

  private configuracionPorTipo = {
    danger: {
      icono: 'delete',
      color: 'warn',
      textoConfirmar: 'Eliminar'
    },
    warning: {
      icono: 'warning',
      color: 'accent',
      textoConfirmar: 'Confirmar'
    },
    info: {
      icono: 'info',
      color: 'primary',
      textoConfirmar: 'Aceptar'
    },
    success: {
      icono: 'check_circle',
      color: 'primary',
      textoConfirmar: 'Aceptar'
    }
  };

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: ConfirmOptions,
    private dialogRef: MatDialogRef<Confirmacion>,
    private fb: FormBuilder
  ) {}

  ngOnInit() {
    const tipo = this.data.tipo || 'warning';
    this.config = this.configuracionPorTipo[tipo];
  }

  confirmar() {
    if (this.data.requiereTexto) {
      if (this.textoIngresado() !== this.data.textoValidacion) {
        return;
      }
    }

    if (this.data.confirmacionDoble && !this.segundaConfirmacion()) {
      this.segundaConfirmacion.set(true);
      return;
    }

    this.dialogRef.close(true);
  }

  cancelar() {
    this.dialogRef.close(false);
  }
}
