// src/app/caracteristicas/turno/turno.component.ts

import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';

// Material imports
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';

import { TurnosApiService } from '../../../../datos/api/turno-api.service';
import { Turno, TurnoBaseLectura } from '../../../../datos/modelos/turno.model';
import { AuthService } from '../../../../nucleo/servicios/auth.service';

@Component({
  selector: 'app-turno',
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
    MatDatepickerModule,
    MatNativeDateModule
  ],
  templateUrl: './turno.html',
  styleUrl: './turno.scss'
})
export class TurnoComponent implements OnInit {
  private turnosApi = inject(TurnosApiService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  // Fecha actual
  fechaActual = new Date();

  // Formulario de búsqueda
  busquedaForm: FormGroup = this.fb.group({
    fecha: [new Date()]
  });

  // Señales
  turnos = signal<TurnoBaseLectura[]>([]);
  cargando = signal(false);
  mensajeError = signal('');
  sinResultados = signal(false);
  fechaSeleccionada = signal<Date>(new Date());

  // Columnas de la tabla
  displayedColumns: string[] = [
    'fecha_calendario', // ✅ Cambiado de dia_semana
    'dia_semana',       // ✅ Mantener día de la semana como info adicional
    'hora_inicio',
    'hora_final',
    'acciones'
  ];

  ngOnInit(): void {
    // Cargar turnos del día actual
    this.buscarTurnos();
  }

  get nombreMedico(): string {
    const nombreCompleto = this.authService.usuarioActual()?.informacion?.nombre_completo;
    if (nombreCompleto) {
      const partes = nombreCompleto.split(',');
      return partes.length > 1 ? partes[1].trim() : nombreCompleto;
    }
    return 'Doctor';
  }

  get idMedico(): number {
    const usuario = this.authService.usuarioActual();
    return 2;
  }

  buscarTurnos(): void {
    const fecha = this.busquedaForm.get('fecha')?.value;
    const fechaFormateada = this.formatearFechaParaAPI(fecha);

    this.fechaSeleccionada.set(fecha);
    this.cargando.set(true);
    this.mensajeError.set('');
    this.sinResultados.set(false);

    console.log('🔍 Buscando turnos para fecha:', fechaFormateada);

    this.turnosApi.obtenerTurnoFecha(fechaFormateada).subscribe({
      next: (turnos) => {
        this.cargando.set(false);
        this.turnos.set(turnos);
        this.sinResultados.set(turnos.length === 0);

        console.log('✅ Turnos encontrados:', turnos.length);
        console.log('📋 Datos:', turnos);
      },
      error: (error) => {
        this.cargando.set(false);

        if (error.status === 401) {
          console.error('❌ Error de autenticación. Por favor, inicie sesión nuevamente.');
          return;
        }

        this.mensajeError.set('Error al cargar turnos');
        console.error('❌ Error al buscar turnos:', error);
      }
    });
  }

  buscarHoy(): void {
    this.busquedaForm.patchValue({ fecha: new Date() });
    this.buscarTurnos();
  }

  formatearFechaParaAPI(fecha: Date): string {
    if (!fecha) return '';

    const year = fecha.getFullYear();
    const month = String(fecha.getMonth() + 1).padStart(2, '0');
    const day = String(fecha.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

  formatearFechaParaMostrar(fecha: Date): string {
    return fecha.toLocaleDateString('es-BO', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  // ✅ Nuevo método para formatear fecha del calendario
  formatearFechaCalendario(fechaStr: string): string {
    const fecha = new Date(fechaStr + 'T00:00:00'); // Agregar tiempo para evitar problemas de zona horaria
    return fecha.toLocaleDateString('es-BO', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  }

  // ✅ Nuevo método para obtener fecha completa del calendario
  formatearFechaCalendarioCompleta(fechaStr: string): string {
    const fecha = new Date(fechaStr + 'T00:00:00');
    return fecha.toLocaleDateString('es-BO', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  }

  calcularDuracionTurno(turno: Turno): string {
    const inicio = this.convertirHoraAMinutos(turno.hora_inicio);
    const fin = this.convertirHoraAMinutos(turno.hora_final);
    const duracionMinutos = fin - inicio;
    const horas = Math.floor(duracionMinutos / 60);
    const minutos = duracionMinutos % 60;

    if (minutos === 0) {
      return `${horas}h`;
    }
    return `${horas}h ${minutos}min`;
  }

  private convertirHoraAMinutos(hora: string): number {
    const [h, m] = hora.split(':').map(Number);
    return h * 60 + m;
  }

  formatearHora(hora: string): string {
    return hora.substring(0, 5);
  }

  verEstadoTurno(turno: Turno): void {
    console.log('📊 Ver estado del turno:', {
      id_turno: turno.id_turno,
      fecha_calendario: turno.fecha_calendario
    });

    this.router.navigate(['/medico/turno-detalle', turno.fecha_calendario], {
      queryParams: {
        fecha: turno.fecha_calendario // ✅ Usar fecha del calendario
      }
    });
  }

  // ✅ Actualizado para usar fecha_calendario
  esTurnoActivo(turno: Turno): boolean {
    const ahora = new Date();
    const fechaTurno = new Date(turno.fecha_calendario + 'T00:00:00');

    // Verificar si es el mismo día
    if (
      ahora.getDate() !== fechaTurno.getDate() ||
      ahora.getMonth() !== fechaTurno.getMonth() ||
      ahora.getFullYear() !== fechaTurno.getFullYear()
    ) {
      return false;
    }

    // Verificar si está dentro del horario del turno
    const horaActual = ahora.getHours() * 60 + ahora.getMinutes();
    const horaInicio = this.convertirHoraAMinutos(turno.hora_inicio);
    const horaFin = this.convertirHoraAMinutos(turno.hora_final);

    return horaActual >= horaInicio && horaActual <= horaFin;
  }

  // ✅ Nuevo método para verificar si el turno es hoy
  esTurnoHoy(turno: Turno): boolean {
    const hoy = new Date();
    const fechaTurno = new Date(turno.fecha_calendario + 'T00:00:00');

    return (
      hoy.getDate() === fechaTurno.getDate() &&
      hoy.getMonth() === fechaTurno.getMonth() &&
      hoy.getFullYear() === fechaTurno.getFullYear()
    );
  }

  // ✅ Nuevo método para verificar si el turno es futuro
  esTurnoFuturo(turno: Turno): boolean {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const fechaTurno = new Date(turno.fecha_calendario + 'T00:00:00');

    return fechaTurno > hoy;
  }

  // ✅ Nuevo método para verificar si el turno es pasado
  esTurnoPasado(turno: Turno): boolean {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const fechaTurno = new Date(turno.fecha_calendario + 'T00:00:00');

    return fechaTurno < hoy;
  }
}
