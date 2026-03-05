import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

// Material imports
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { PacientesApiService } from '../../../../datos/api/pacientes-api.service';
import { ConsultasApiService } from '../../../../datos/api/consultas-api.service';
import { PacienteDetalle, Edad } from '../../../../datos/modelos/paciente.model';
import { ConsultaEnfermeria } from '../../../../datos/modelos/consulta.model';
import { SaludService } from '../../../../nucleo/servicios/salud.service';


@Component({
  selector: 'app-pre-consulta',
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
    MatChipsModule,
    MatTooltipModule,
    MatSnackBarModule
  ],
  templateUrl: './pre-consulta.html',
  styleUrl: './pre-consulta.scss',
})
export class PreConsulta implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private pacientesApi = inject(PacientesApiService);
  private consultasApi = inject(ConsultasApiService);
  private snackBar = inject(MatSnackBar);
  private saludService = inject(SaludService);

    // IDs
  idPaciente = signal(0);
  idReserva = signal(0);
  idEnfermera = signal(0); // Obtener del servicio de autenticación

    // Datos cargados
  paciente = signal<PacienteDetalle | null>(null);

  // Estados
  cargando = signal(true);
  guardando = signal(false);
  error = signal('');

  fechaActual = new Date();

  // Formulario
  enfermeriaForm!: FormGroup;

  edad = signal<Edad>({ anios: 0, meses: 0, dias: 0, texto: '' });

  ngOnInit(): void {
    this.inicializarFormulario();

    // Obtener parámetros de la URL
    this.route.queryParams.subscribe(params => {
      this.idPaciente.set(+params['idPaciente']);
      this.idReserva.set(+params['idReserva']);

      if (this.idPaciente() && this.idReserva()) {
        this.cargarDatosPaciente();
      } else {
        this.error.set('Parámetros inválidos');
        this.cargando.set(false);
      }
    });
  }

    inicializarFormulario(): void {
    this.enfermeriaForm = this.fb.group({
      // Signos vitales
      peso: ['', [Validators.min(0), Validators.max(300)]],
      talla: ['', [Validators.min(0), Validators.max(3)]],
      temperatura: ['', [Validators.min(30), Validators.max(45)]],
      presion: ['', [Validators.pattern(/^\d{2,3}\/\d{2,3}$/)]],
      frecuencia_cardiaca: ['', [Validators.min(30), Validators.max(220)]],
      frecuencia_respiratoria: ['', [Validators.min(8), Validators.max(60)]],
      saturacion: ['', [Validators.min(0), Validators.max(100)]],

      // Procedimientos de enfermería
      inyectables: [0, [Validators.min(0)]],
      sueros: [0, [Validators.min(0)]],
      curaciones: [0, [Validators.min(0)]],
      otras_enf: [0, [Validators.min(0)]]
    });
  }

    cargarDatosPaciente(): void {
    this.cargando.set(true);
    this.error.set('');

    this.pacientesApi.obtenerPaciente(this.idPaciente()).subscribe({
      next: (paciente) => {
        this.paciente.set(paciente);
        console.log('✅ Paciente cargado:', paciente);
        this.cargando.set(false);
      },
      error: (error) => {
        console.error('❌ Error al cargar paciente:', error);
        this.error.set('Error al cargar la información del paciente');
        this.cargando.set(false);
      }
    });
  }

  get nombreCompletoPaciente(): string {
    const p = this.paciente();
    if (!p) return '';
    return `${p.paterno} ${p.materno} ${p.nombres}`;
  }

  get edadPaciente(): string {
    const p = this.paciente();
    if (!p || !p.fecha_nacimiento) return '';
    return this.saludService.edad(p.fecha_nacimiento);
  }

  calcularIMC(): string {
    const peso = this.enfermeriaForm.get('peso')?.value;
    const talla = this.enfermeriaForm.get('talla')?.value;

    if (!peso || !talla || talla === 0) return '-';

    const imc = peso / (talla * talla);
    return imc.toFixed(2);
  }

  obtenerClasificacionIMC(): string {
    const imc = parseFloat(this.calcularIMC());
    if (isNaN(imc)) return '';

    if (imc < 18.5) return 'Bajo peso';
    if (imc < 25) return 'Normal';
    if (imc < 30) return 'Sobrepeso';
    return 'Obesidad';
  }

  validarPresionArterial(): boolean {
    const presion = this.enfermeriaForm.get('presion')?.value;
    if (!presion) return true;

    const regex = /^(\d{2,3})\/(\d{2,3})$/;
    const match = presion.match(regex);

    if (!match) return false;

    const sistolica = parseInt(match[1]);
    const diastolica = parseInt(match[2]);

    return sistolica > diastolica && sistolica <= 250 && diastolica <= 150;
  }

  private mostrarNotificacion(mensaje: string, panelClass: string): void {
    this.snackBar.open(mensaje, 'Cerrar', {
      duration: 3000,
      panelClass: [panelClass]
    });
  }

  guardarConsulta(): void {
    // Validar presión arterial
    if (this.enfermeriaForm.get('presion')?.value && !this.validarPresionArterial()) {
      this.mostrarNotificacion('Formato de presión arterial inválido (ej: 120/80)', 'error-snackbar');
      return;
    }

    if (this.enfermeriaForm.invalid) {
      this.enfermeriaForm.markAllAsTouched();
      this.mostrarNotificacion('Por favor complete correctamente todos los campos', 'error-snackbar');
      return;
    }

    this.guardando.set(true);

    // Preparar datos para enviar
    const datos: ConsultaEnfermeria = {
      id_reserva: this.idReserva(),
      id_enfermera: this.idEnfermera() || undefined,
      fecha: new Date().toISOString(),
      ...this.enfermeriaForm.value
    };

    // Convertir valores vacíos a null
    Object.keys(datos).forEach(key => {
      if (datos[key as keyof ConsultaEnfermeria] === '') {
        (datos as any)[key] = null;
      }
    });

    console.log('💾 Guardando consulta de enfermería:', datos);

    this.consultasApi.crearConsultaEnfermeria(
      this.idReserva(),
      this.idPaciente(),
      datos
    ).subscribe({
      next: (response) => {

        this.consultasApi.actualizarReserva(this.idReserva(), 'E').subscribe();// Actualizar estado de la reserva a 'E' (Atendida por enfermería)

        console.log('✅ Consulta guardada:', response);
        this.mostrarNotificacion('Consulta de enfermería guardada exitosamente', 'success-snackbar');
        setTimeout(() => {
          this.router.navigate(['/enfermeria/consultas']);
        }, 1500);
      },
      error: (error) => {
        this.guardando.set(false);
        console.error('❌ Error al guardar consulta:', error);
        this.mostrarNotificacion('Error al guardar la consulta de enfermería', 'error-snackbar');
      }
    });
  }


  cancelar(): void {
    if (this.enfermeriaForm.dirty) {
      if (confirm('¿Está seguro de cancelar? Se perderán los datos no guardados.')) {
        this.router.navigate(['/enfermeria/consultas']);
      }
    } else {
      this.router.navigate(['/enfermeria/consultas']);
    }
  }


}
