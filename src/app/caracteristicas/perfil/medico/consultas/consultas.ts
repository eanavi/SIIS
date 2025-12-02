import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';

// Importaciones Material

import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';

// Importaciones Servicios y Modelos

import { PacientesApiService } from '../../../../datos/api/pacientes-api.service';
import { PacienteAsignado } from '../../../../../app/datos/modelos/paciente.model';
import { AuthService } from '../../../../nucleo/servicios/auth.service';



@Component({
  selector: 'app-consultas',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatChipsModule,
  ],
  templateUrl: './consultas.html',
  styleUrl: './consultas.scss',
})
export class Consultas implements OnInit{
  private pacientesApi = inject(PacientesApiService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  fechaActual = new Date();

  busquedaForm: FormGroup = this.fb.group({
    criterio: ['']
  });

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
    'hora_reserva',
    'acciones'
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
    const opciones: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    };

    return this.fechaActual.toLocaleDateString('es-BO', opciones);
  }

  buscarPacientes(): void {
    const criterio = this.busquedaForm.get('criterio')?.value || '';
    this.cargando.set(true);
    this.mensajeError.set(null);
    this.sinResultados.set(false);

    console.log('🔍 Buscando pacientes con criterio:', criterio || '(todos)');

    this.pacientesApi.buscarPacientesAsignados(criterio).subscribe({
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

  limpiarBusqueda(): void {
    this.busquedaForm.reset();
    this.buscarPacientes();
  }

  obtenerNombreCompleto(paciente: PacienteAsignado): string {
    return `${paciente.paterno} ${paciente.materno}, ${paciente.nombres}`;
  }

  irAConsulta(paciente: PacienteAsignado): void {
    console.log('📝 Ir a consulta:', {
      id_paciente: paciente.id_paciente,
      id_reserva: paciente.id_reserva
    });

    // Navegar pasando ambos IDs
    this.router.navigate(['/medico/consultas/nueva'], {
      queryParams: {
        idPaciente: paciente.id_paciente,
        idReserva: paciente.id_reserva
      }
    });
  }

  verHistorial(paciente: PacienteAsignado): void {
    console.log('📄 Ver historial del paciente:', paciente.id_paciente);
    this.router.navigate(['/medico/consultas/historial', paciente.id_paciente]);
  }

  formatearFecha(fecha: string): string {
    const date = new Date(fecha);
    return date.toLocaleDateString('es-BO', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

    // ✅ Método para obtener el texto del sexo
  obtenerSexoTexto(sexo: string): string {
    return sexo === 'M' ? 'Masculino' : sexo === 'F' ? 'Femenino' : 'No especificado';
  }

  // ✅ Método para obtener el ícono del sexo
  obtenerSexoIcono(sexo: string): string {
    return sexo === 'M' ? 'male' : sexo === 'F' ? 'female' : 'help';
  }

}

