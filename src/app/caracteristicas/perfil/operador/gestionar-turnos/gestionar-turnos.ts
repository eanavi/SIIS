// src/app/caracteristicas/turnos/gestionar-turnos/gestionar-turnos.component.ts

import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormArray } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

// Material imports
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatChipsModule } from '@angular/material/chips';

import { PrestacionesApiService } from '../../../../datos/api/prestaciones.api.service';
import { TurnosApiService } from '../../../../datos/api/turno-api.service';
import { EmpleadoApiService } from '../../../../datos/api/empleado-api.service';
import { TurnoBase } from '../../../../datos/modelos/turno.model';
import { DiaSemana } from '../../../../datos/modelos/turno.model';
import { PrestacionLista } from '../../../../datos/modelos/prestacion.model';
import { Empleado, EmpleadoListado } from '../../../../datos/modelos/empleado.model';
import { forkJoin } from 'rxjs';

import { DatosMedico } from '../shared/datos-medico/datos-medico';


@Component({
  selector: 'app-gestionar-turnos',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatDividerModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatCheckboxModule,
    MatTooltipModule,
    MatSnackBarModule,
    MatChipsModule,
    DatosMedico
  ],
  templateUrl: './gestionar-turnos.html',
  styleUrl: './gestionar-turnos.scss'
})
export class GestionarTurnos implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private prestacionesApi = inject(PrestacionesApiService);
  private turnosApi = inject(TurnosApiService);
  private snackBar = inject(MatSnackBar);
  private empleadoApi = inject(EmpleadoApiService);

  // ID del empleado (médico)
  idEmpleado = signal(0);

  // Lista de prestaciones disponibles
  prestaciones = signal<PrestacionLista[]>([]);

  // Días de la semana
  diasSemana: DiaSemana[] = [
    { codigo: 'L', nombre: 'Lunes', abreviatura: 'LUN', seleccionado: false },
    { codigo: 'M', nombre: 'Martes', abreviatura: 'MAR', seleccionado: false },
    { codigo: 'I', nombre: 'Miércoles', abreviatura: 'MIE', seleccionado: false },
    { codigo: 'J', nombre: 'Jueves', abreviatura: 'JUE', seleccionado: false },
    { codigo: 'V', nombre: 'Viernes', abreviatura: 'VIE', seleccionado: false },
    { codigo: 'S', nombre: 'Sábado', abreviatura: 'SAB', seleccionado: false },
    { codigo: 'D', nombre: 'Domingo', abreviatura: 'DOM', seleccionado: false }
  ];

  // Formulario
  turnoForm!: FormGroup;

  // Lista de turnos agregados
  turnosAgregados = signal<any[]>([]);

  empleado = signal<Empleado | null>(null);

  // Estados
  cargando = signal(true);
  guardando = signal(false);
  error = signal('');

  ngOnInit(): void {
    this.inicializarFormulario();

    // Obtener ID del empleado de la ruta
    this.route.params.subscribe(params => {
      this.idEmpleado.set(+params['id_empleado']);
      if (this.idEmpleado()) {
        this.cargarPrestaciones();
      } else {
        this.error.set('ID de empleado inválido');
        this.cargando.set(false);
      }
    });
  }

  inicializarFormulario(): void {
    this.turnoForm = this.fb.group({
      id_prestacion: ['', Validators.required],
      fecha_inicio: ['', Validators.required],
      fecha_final: ['', Validators.required],
      hora_inicio: ['', [Validators.required, Validators.pattern(/^([01]\d|2[0-3]):([0-5]\d)$/)]],
      hora_final: ['', [Validators.required, Validators.pattern(/^([01]\d|2[0-3]):([0-5]\d)$/)]]
    });
  }

  cargarPrestaciones(): void {
    this.cargando.set(true);
    this.error.set('');

    forkJoin({
      prestaciones: this.prestacionesApi.obtenerPrestacionesPorPerfil(this.idEmpleado()),
      medico: this.empleadoApi.datosEmpleado(this.idEmpleado())
    }).subscribe({
      next: ({ prestaciones, medico }) => {
        this.empleado.set(medico);
        this.prestaciones.set(prestaciones);

        console.log('✅ Datos cargados', {prestaciones, medico });
        this.cargando.set(false);
      },
      error: (error) => {
        console.error('❌ Error al cargar datos :', error);
        this.error.set('Error al cargar la informacion');
        this.cargando.set(false);

        this.mostrarNotificacion('Error al cargar la informacion', 'eroro-snackbar');
      }
    })

/*
    this.prestacionesApi.obtenerPrestacionesPorPerfil(this.idEmpleado()).subscribe({
      next: (prestaciones) => {
        this.prestaciones.set(prestaciones);
        console.log('✅ Prestaciones cargadas:', prestaciones);
        this.cargando.set(false);
      },
      error: (error) => {
        console.error('❌ Error al cargar prestaciones:', error);
        this.error.set('Error al cargar las prestaciones disponibles');
        this.cargando.set(false);
        this.mostrarNotificacion('Error al cargar prestaciones', 'error-snackbar');
      }
    });
    */
  }

  toggleDia(dia: DiaSemana): void {
    dia.seleccionado = !dia.seleccionado;
  }

  get diasSeleccionados(): DiaSemana[] {
    return this.diasSemana.filter(d => d.seleccionado);
  }

  get diasSeleccionadosCodigos(): string[] {
    return this.diasSeleccionados.map(d => d.codigo);
  }

  validarFechas(): boolean {
    const fechaInicio = this.turnoForm.get('fecha_inicio')?.value;
    const fechaFinal = this.turnoForm.get('fecha_final')?.value;

    if (fechaInicio && fechaFinal) {
      const inicio = new Date(fechaInicio);
      const final = new Date(fechaFinal);

      if (final < inicio) {
        this.mostrarNotificacion('La fecha final no puede ser anterior a la fecha inicial', 'error-snackbar');
        return false;
      }
    }
    return true;
  }

  validarHoras(): boolean {
    const horaInicio = this.turnoForm.get('hora_inicio')?.value;
    const horaFinal = this.turnoForm.get('hora_final')?.value;

    if (horaInicio && horaFinal) {
      const [hInicio, mInicio] = horaInicio.split(':').map(Number);
      const [hFinal, mFinal] = horaFinal.split(':').map(Number);

      const minutosInicio = hInicio * 60 + mInicio;
      const minutosFinal = hFinal * 60 + mFinal;

      if (minutosFinal <= minutosInicio) {
        this.mostrarNotificacion('La hora final debe ser posterior a la hora inicial', 'error-snackbar');
        return false;
      }
    }
    return true;
  }

  agregarTurno(): void {
    // Validar formulario
    if (this.turnoForm.invalid) {
      this.turnoForm.markAllAsTouched();
      this.mostrarNotificacion('Complete todos los campos requeridos', 'error-snackbar');
      return;
    }

    // Validar que haya al menos un día seleccionado
    if (this.diasSeleccionados.length === 0) {
      this.mostrarNotificacion('Debe seleccionar al menos un día de la semana', 'error-snackbar');
      return;
    }

    // Validar fechas y horas
    if (!this.validarFechas() || !this.validarHoras()) {
      return;
    }

    const prestacion = this.prestaciones().find(
      p => p.id_prestacion === this.turnoForm.get('id_prestacion')?.value
    );

    const turno = {
      id_medico: this.idEmpleado(),
      id_prestacion: this.turnoForm.get('id_prestacion')?.value,
      nombre_prestacion: prestacion?.nombre_prestacion,
      sigla: prestacion?.sigla,
      fecha_inicio: this.formatearFecha(this.turnoForm.get('fecha_inicio')?.value),
      fecha_final: this.formatearFecha(this.turnoForm.get('fecha_final')?.value),
      hora_inicio: this.formatearHora(this.turnoForm.get('hora_inicio')?.value),
      hora_final: this.formatearHora(this.turnoForm.get('hora_final')?.value),
      dia_semana: this.diasSeleccionadosCodigos,
      dias_nombres: this.diasSeleccionados.map(d => d.abreviatura)
    };

    // Agregar a la lista
    this.turnosAgregados.update(turnos => [...turnos, turno]);

    // Limpiar formulario
    this.turnoForm.reset();
    this.diasSemana.forEach(d => d.seleccionado = false);

    this.mostrarNotificacion('Turno agregado a la lista', 'success-snackbar');
  }

  eliminarTurno(index: number): void {
    this.turnosAgregados.update(turnos => {
      const nuevos = [...turnos];
      nuevos.splice(index, 1);
      return nuevos;
    });
    this.mostrarNotificacion('Turno eliminado de la lista', 'info-snackbar');
  }

  formatearFecha(fecha: Date): string {
    if (!fecha) return '';
    const f = new Date(fecha);
    return f.toISOString().split('T')[0];
  }

  formatearHora(hora: string): string {
    if (!hora) return '';
    return `${hora}:00`;
  }

  guardarTurnos(): void {
    if (this.turnosAgregados().length === 0) {
      this.mostrarNotificacion('Debe agregar al menos un turno', 'error-snackbar');
      return;
    }

    this.guardando.set(true);

    // Preparar datos para enviar
    const turnos = this.turnosAgregados().map(turno => ({
      id_medico: turno.id_medico,
      id_prestacion: turno.id_prestacion,
      fecha_inicio: turno.fecha_inicio,
      fecha_final: turno.fecha_final,
      hora_inicio: turno.hora_inicio,
      hora_final: turno.hora_final,
      dia_semana: turno.dia_semana
    }));

    console.log('💾 Guardando turnos:', turnos);

    const requests = turnos.map(turno => this.turnosApi.crearTurno(turno));

    forkJoin(requests).subscribe({
      next: (responses) => {
        console.log('Turnos guardados:', responses);
        this.mostrarNotificacion(
          `${responses.length} turno(s) registrado(s) exitosamente`,
          'success-snackbar'
        );

      setTimeout(() => {
        this.router.navigate(['/operador/turno']);
      }, 1500);
      },

      error: (error) => {
        this.guardando.set(false);
        console.error('Error al guardar turnos:', error);

        let mensaje = 'Error al registrar los turnos';
        if(error.error?.detail){
          mensaje = error.error.detail;
        }

        this.mostrarNotificacion(mensaje, 'error-snackbar');
      },

      complete: () => {
        this.guardando.set(false);
      }
    });
  }

  cancelar(): void {
    if (this.turnosAgregados().length > 0 || this.turnoForm.dirty) {
      if (confirm('¿Está seguro de cancelar? Se perderán los turnos agregados.')) {
        this.router.navigate(['/operador/turno']);
      }
    } else {
      this.router.navigate(['/operador/turno']);
    }
  }

  private mostrarNotificacion(mensaje: string, panelClass: string): void {
    this.snackBar.open(mensaje, 'Cerrar', {
      duration: 3000,
      panelClass: [panelClass]
    });
  }
}
