import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { SlicePipe } from '@angular/common';


import { MatCardModule } from "@angular/material/card";
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';

import { PacientesApiService } from '../../../../datos/api/pacientes-api.service';
import { PacienteAsignado } from '../../../../../app/datos/modelos/paciente.model';
import { AuthService } from '../../../../nucleo/servicios/auth.service';


@Component({
  selector: 'app-turno-detalle',
  standalone: true,
  imports: [
    MatCardModule,
    MatIconModule,
    MatTableModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatChipsModule,
    SlicePipe,
    CommonModule
  ],
  templateUrl: './turno-detalle.html',
  styleUrl: './turno-detalle.scss',
})
export class TurnoDetalle implements OnInit {
  private pacientesApi = inject(PacientesApiService);
  private authService = inject(AuthService);
  private router = inject(Router);

  fechaActual = new Date();
  pacientes = signal<PacienteAsignado[]>([]);
  cargando = signal<boolean>(false);
  mensajeError = signal<string | null>(null);
  sinResultados = signal<boolean>(false);

  displayedColumns: string[] = [
    'ci',
    'nombreCompleto',
    'edad',
    'sexo',
    'fecha_reserva',
    'hora_reserva'
  ];

  ngOnInit(): void {
    this.buscarPacientes();
  }

  get nombreMedico(): string {
    const nombreCompleto = this.authService.usuarioActual()?.informacion?.nombre_completo;
    if(nombreCompleto){
      const partes = nombreCompleto.split(',');
      return partes.length > 1 ? partes[1].trim() : nombreCompleto;
    }
    return 'Doctor';
  }

  get fechaActualFormateada(): string {
    const opciones : Intl.DateTimeFormatOptions = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    };
    return this.fechaActual.toLocaleDateString('es-BO', opciones);
  }

  buscarPacientes(): void {
    this.cargando.set(true);
    this.mensajeError.set(null);
    this.sinResultados.set(false);

    console.log('Buscando pacientes');

    this.pacientesApi.buscarPacientesAsignados().subscribe({
      next: (pacientes) => {
        this.cargando.set(false);
        this.pacientes.set(pacientes);
        this.sinResultados.set(pacientes.length === 0);

        console.log(`✅ Encontrados ${pacientes.length} pacientes.`);
      },
      error: (error) => {
        this.cargando.set(false);
        this.mensajeError.set('Error al buscar pacientes.');
        console.error('❌ Error al buscar pacientes:', error);
      }
    });
  }

  obtenerNombreCompleto(paciente: PacienteAsignado): string {
    return `${paciente.paterno} ${paciente.materno}, ${paciente.nombres}`;
  }

  formatearFecha(fecha: string): string {
    const [year, month, day] = fecha.split('-').map(Number);
    const fechaFormateada = `${day.toString().padStart(2, '0')}/${month.toString().padStart(2, '0')}/${year}`;
    return fechaFormateada;
  }

  obtenerSexoTexto(sexo: string): string{
    return sexo === 'M' ? 'Masculino' : sexo === 'F' ? 'Femenino' : 'No Especificado';
  }

  obtenerSexoIcono(sexo: string): string{
    return sexo === 'M' ? 'male' : sexo === 'F' ? 'female' : 'help';
  }

}


