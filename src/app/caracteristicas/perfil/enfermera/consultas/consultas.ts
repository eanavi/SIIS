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
import { PacienteAsignadoEnf } from '../../../../../app/datos/modelos/paciente.model';
import { AuthService } from '../../../../nucleo/servicios/auth.service';
import { single } from 'rxjs';

@Component({
  selector: 'app-consultas-enfermeria',
  standalone:true,
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
export class ConsultasEnf implements OnInit {
  private pacientesApi = inject(PacientesApiService);
  private servicioAuth = inject(AuthService);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  fechaActual = new Date();
  busquedaForm: FormGroup = this.fb.group({
    criterio:['']
  });

  pacientes = signal<PacienteAsignadoEnf[]>([]);
  cargando = signal<boolean>(false);
  mensajeError = signal<string | null>(null);
  sinResultados = signal<boolean>(false);


  columnasDesplegadas: string[] = [
    'prestacion',
    'ci',
    'nombreCompleto',
    'edad',
    'sexo',
    'fecha_reserva',
    'hora_reserva',
    'acciones'
  ];

  ngOnInit(): void {
    this.buscarPacientesEnf();
  }

  get nombreEnfermera(): string{

    const nombreUsuario = this.servicioAuth.usuarioActual()?.informacion?.nombre_completo;
    if(nombreUsuario){
      const partes = nombreUsuario.split(',');
      return partes.length > 1 ? partes[1].trim() : nombreUsuario;
    }

    return 'Enfermera';
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

  buscarPacientesEnf(): void{
    const criterio = this.busquedaForm.get('criterio')?.value || '';
    this.cargando.set(true);
    this.mensajeError.set(null);
    this.sinResultados.set(false);

    this.pacientesApi.buscarPacientesAsignadosEnfermeria(criterio).subscribe({
      next:(pacientes) => {
        this.cargando.set(false);
        this.pacientes.set(pacientes);
        this.sinResultados.set(pacientes.length === 0);
      },
      error:(error) => {
        this.cargando.set(false);
        this.mensajeError.set('Error al buscar pacientes de Enfermeria.');
        console.error('❌ Error al buscar pacientes:', error);
      }
    });
  }

  limpiarBusqueda():void{
    this.busquedaForm.reset();
    this.buscarPacientesEnf();
  }

  obtenerNombreCompleto(paciente: PacienteAsignadoEnf): string {
    return `${paciente.paterno} ${paciente.materno}, ${paciente.nombres}`;
  }

  irAConsulta(paciente:PacienteAsignadoEnf): void {
    console.log('Ir a consulta', {
      id_paciente: paciente.id_paciente,
      id_reserva: paciente.id_reserva
    });

    this.router.navigate(['/enfermera/preConsulta'], {
      queryParams: {
        idPaciente: paciente.id_paciente,
        idReserva: paciente.id_reserva
      }
    });
  }

  verHistorial(paciente: PacienteAsignadoEnf): void {
    console.log('📄 Ver historial del paciente:', paciente.id_paciente);
    this.router.navigate(['/enfermera/consultas/historial', paciente.id_paciente]);
  }

  formatearFecha(fecha: string): string {
    const [year, month, day] = fecha.split('-').map(Number);
    const fechaFormateada = `${day.toString().padStart(2, '0')}/${month.toString().padStart(2, '0')}/${year}`;
    return fechaFormateada;
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
