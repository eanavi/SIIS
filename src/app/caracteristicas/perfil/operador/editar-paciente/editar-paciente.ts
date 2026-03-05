import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormArray } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin } from 'rxjs';

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
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatStepperModule } from '@angular/material/stepper';
import { MatChipsModule } from '@angular/material/chips';

import { PacientesApiService } from  '../../../../datos/api/pacientes-api.service';
import { ListasApiService } from '../../../../datos/api/listas-api.service';
import { PacienteDetalle } from '../../../../datos/modelos/paciente.model';
import { ListaOpciones } from '../../../../datos/modelos/consulta.model';
import { SaludService } from '../../../../nucleo/servicios/salud.service';



@Component({
  selector: 'app-editar-paciente',
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
    MatTooltipModule,
    MatSnackBarModule,
    MatStepperModule,
    MatChipsModule
  ],
  templateUrl: './editar-paciente.html',
  styleUrl: './editar-paciente.scss',
})
export class EditarPaciente implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private pacientesApi = inject(PacientesApiService);
  private listasApi = inject(ListasApiService);
  private snackBar = inject(MatSnackBar);
  private saludService = inject(SaludService);

  // ID del paciente
  idPaciente = signal(0);

  // Datos del paciente
  paciente = signal<PacienteDetalle | null>(null);

  // Formularios por pasos
  datosPersonalesForm!: FormGroup;
  contactoForm!: FormGroup;
  datosAdicionalesForm!: FormGroup;

  // Listas de opciones
  estadosCiviles = signal<ListaOpciones[]>([]);
  tiposSangre = signal<ListaOpciones[]>([]);
  ocupaciones = signal<ListaOpciones[]>([]);
  nivelesEstudio = signal<ListaOpciones[]>([]);
  idiomas = signal<ListaOpciones[]>([]);
  idiomasMaternos = signal<ListaOpciones[]>([]);
  autopertenencias = signal<ListaOpciones[]>([]);

  // Estados
  cargando = signal(true);
  guardando = signal(false);
  error = signal('');

  // Fecha máxima (hoy)
  fechaMaxima = new Date();

  ngOnInit(): void {
    this.inicializarFormularios();

    // Obtener ID del paciente de la ruta
    this.route.params.subscribe(params => {
      this.idPaciente.set(+params['id_paciente']);
      if (this.idPaciente()) {
        this.cargarDatos();
      } else {
        this.error.set('ID de paciente inválido');
        this.cargando.set(false);
      }
    });
  }

  inicializarFormularios(): void {
    // Paso 1: Datos personales
    this.datosPersonalesForm = this.fb.group({
      tipo: ['', Validators.required],
      ci: ['', [Validators.required, Validators.pattern(/^\d+$/)]],
      paterno: ['', [Validators.required, Validators.minLength(2)]],
      materno: ['', [Validators.required, Validators.minLength(2)]],
      nombres: ['', [Validators.required, Validators.minLength(2)]],
      fecha_nacimiento: ['', Validators.required],
      sexo: ['', Validators.required],
      estado_civil: ['', Validators.required],
      tipo_sangre: ['', Validators.required]
    });

    // Paso 2: Contacto y dirección
    this.contactoForm = this.fb.group({
      direcciones: this.fb.array([]),
      celular: ['', [Validators.required, Validators.pattern(/^\d{8,10}$/)]],
      fijo: ['', [Validators.pattern(/^\d{7,10}$/)]],
      correo_personal: ['', [Validators.email]],
      correo_domicilio: ['', [Validators.email]]
    });

    // Paso 3: Datos adicionales
    this.datosAdicionalesForm = this.fb.group({
      ocupacion: ['', Validators.required],
      nivel_estudios: ['', Validators.required],
      idioma_hablado: ['', Validators.required],
      idioma_materno: ['', Validators.required],
      autopertenencia: ['', Validators.required],
      gestion_comunitaria: ['']
    });
  }


  crearDireccion(datos?: any): FormGroup {
    return this.fb.group({
      calle: [datos?.calle || '', Validators.required],
      numero: [datos?.numero || '', Validators.required],
      zona: [datos?.zona || '', Validators.required],
      tipo: [datos?.tipo || 'personal', Validators.required]
    });
  }

  get direccionesArray(): FormArray {
    return this.contactoForm.get('direcciones') as FormArray;
  }

  agregarDireccion(): void {
    if (this.direccionesArray.length < 3) {
      this.direccionesArray.push(this.crearDireccion());
    }
  }

  eliminarDireccion(index: number): void {
    if (this.direccionesArray.length > 1) {
      this.direccionesArray.removeAt(index);
    }
  }

  cargarDatos(): void {
    this.cargando.set(true);
    this.error.set('');

    forkJoin({
      paciente: this.pacientesApi.obtenerPaciente(this.idPaciente()),
      estadosCiviles: this.listasApi.obtenerLista('se_estado_civil'),
      tiposSangre: this.listasApi.obtenerLista('tipo_sangre'),
      ocupaciones: this.listasApi.obtenerLista('se_profesion'),
      nivelesEstudio: this.listasApi.obtenerLista('se_nivel_estudio'),
      idiomas: this.listasApi.obtenerLista('se_idioma'),
      idiomasMaternos: this.listasApi.obtenerLista('se_idiomamaterno'),
      autopertenencias: this.listasApi.obtenerLista('se_autopertenencia')
    }).subscribe({
      next: ({ paciente, estadosCiviles, tiposSangre, ocupaciones, nivelesEstudio, idiomas, idiomasMaternos, autopertenencias }) => {
        // Guardar listas
        this.estadosCiviles.set(estadosCiviles);
        this.tiposSangre.set(tiposSangre);
        this.ocupaciones.set(ocupaciones);
        this.nivelesEstudio.set(nivelesEstudio);
        this.idiomas.set(idiomas);
        this.idiomasMaternos.set(idiomasMaternos);
        this.autopertenencias.set(autopertenencias);

        // Guardar y cargar datos del paciente
        this.paciente.set(paciente);
        this.llenarFormularios(paciente);

        console.log('✅ Datos cargados:', paciente);
        this.cargando.set(false);

      },
      error: (error) => {
        console.error('❌ Error al cargar datos:', error);
        this.error.set('Error al cargar la información del paciente');
        this.cargando.set(false);
        this.mostrarNotificacion('Error al cargar datos del paciente', 'error-snackbar');
      }
    });
  }

  llenarFormularios(paciente: PacienteDetalle): void {
    // Datos personales
    this.datosPersonalesForm.patchValue({
      tipo: paciente.tipo ?? '',
      ci: paciente.ci ?? '',
      paterno: paciente.paterno ?? '',
      materno: paciente.materno ?? '',
      nombres: paciente.nombres ?? '',
      fecha_nacimiento: paciente.fecha_nacimiento ? new Date(paciente.fecha_nacimiento) : null,
      sexo: paciente.sexo ?? '',
      estado_civil: paciente.estado_civil?.toString().trim() ?? '',
      tipo_sangre: paciente.tipo_sangre?.toString().trim() ?? ''
    });

    // Contacto
    this.contactoForm.patchValue({
      celular: paciente.telefono?.celular || '',
      fijo: paciente.telefono?.fijo || '',
      correo_personal: paciente.correo?.personal || '',
      correo_domicilio: paciente.correo?.domicilio || ''
    });

    // Direcciones
    this.direccionesArray.clear();
    if (paciente.direccion && paciente.direccion.length > 0) {
      paciente.direccion.forEach((dir: any) => {
        this.direccionesArray.push(this.crearDireccion({
          calle: dir.direccion?.calle,
          numero: dir.direccion?.numero,
          zona: dir.direccion?.zona,
          tipo: dir.tipo,
          ciudad: 'La Paz'
        }));
      });
    } else {
      this.direccionesArray.push(this.crearDireccion());
    }

    // Datos adicionales
    this.datosAdicionalesForm.patchValue({
      ocupacion: paciente.ocupacion?.toString() || '',
      nivel_estudios: paciente.nivel_estudios?.toString() || '',
      idioma_hablado: paciente.idioma_hablado?.toString() || '',
      idioma_materno: paciente.idioma_materno?.toString() || '',
      autopertenencia: paciente.autopertenencia?.toString() || '',
      gestion_comunitaria: paciente.gestion_comunitaria || ''
    });
  }

  get edadPaciente(): string {
    const fechaNac = this.datosPersonalesForm.get('fecha_nacimiento')?.value;
    if (!fechaNac) return '';
    return this.saludService.edad(fechaNac);
  }

  get nombreCompletoPaciente(): string {
    const p = this.paciente();
    if (!p) return '';
    return `${p.paterno} ${p.materno} ${p.nombres}`;
  }

    actualizarPaciente(): void {
    // Validar todos los formularios
    if (this.datosPersonalesForm.invalid ||
        this.contactoForm.invalid ||
        this.datosAdicionalesForm.invalid) {
      this.datosPersonalesForm.markAllAsTouched();
      this.contactoForm.markAllAsTouched();
      this.datosAdicionalesForm.markAllAsTouched();
      this.mostrarNotificacion('Por favor complete todos los campos requeridos', 'error-snackbar');
      return;
    }

    this.guardando.set(true);

    // Preparar datos para enviar
    const direcciones = this.direccionesArray.value.map((dir: any) => ({
      direccion: {
        calle: dir.calle,
        numero: dir.numero,
        zona: dir.zona,
        ciudad: "La Paz"
      },
      tipo: dir.tipo
    }));

    const datos = {
      ...this.datosPersonalesForm.value,
      direccion: direcciones,
      telefono: {
        celular: this.contactoForm.get('celular')?.value,
        fijo: this.contactoForm.get('fijo')?.value || ''
      },
      correo: {
        personal: this.contactoForm.get('correo_personal')?.value || '',
        domicilio: this.contactoForm.get('correo_domicilio')?.value || ''
      },
      ...this.datosAdicionalesForm.value,
      // Convertir a números los IDs
      ocupacion: parseInt(this.datosAdicionalesForm.get('ocupacion')?.value),
      nivel_estudios: parseInt(this.datosAdicionalesForm.get('nivel_estudios')?.value),
      idioma_hablado: parseInt(this.datosAdicionalesForm.get('idioma_hablado')?.value),
      idioma_materno: parseInt(this.datosAdicionalesForm.get('idioma_materno')?.value),
      autopertenencia: parseInt(this.datosAdicionalesForm.get('autopertenencia')?.value)
    };

    // Formatear fecha
    if (datos.fecha_nacimiento) {
      const fecha = new Date(datos.fecha_nacimiento);
      datos.fecha_nacimiento = fecha.toISOString().split('T')[0];
    }

    console.log('💾 Actualizando paciente:', datos);

    this.pacientesApi.actualizarPaciente(this.idPaciente(), datos).subscribe({
      next: (response) => {
        console.log('✅ Paciente actualizado:', response);
        this.mostrarNotificacion('Paciente actualizado exitosamente', 'success-snackbar');

        setTimeout(() => {
          this.router.navigate(['/operador/pacientes']);
        }, 1500);
      },
      error: (error) => {
        this.guardando.set(false);
        console.error('❌ Error al actualizar paciente:', error);

        let mensaje = 'Error al actualizar el paciente';
        if (error.error?.detail) {
          mensaje = error.error.detail;
        }

        this.mostrarNotificacion(mensaje, 'error-snackbar');
      }
    });
  }

  cancelar(): void {
    const formularioModificado =
      this.datosPersonalesForm.dirty ||
      this.contactoForm.dirty ||
      this.datosAdicionalesForm.dirty;

    if (formularioModificado) {
      if (confirm('¿Está seguro de cancelar? Se perderán los cambios no guardados.')) {
        this.router.navigate(['/operador/pacientes']);
      }
    } else {
      this.router.navigate(['/operador/pacientes']);
    }
  }

  private mostrarNotificacion(mensaje: string, panelClass: string): void {
    this.snackBar.open(mensaje, 'Cerrar', {
      duration: 3000,
      panelClass: [panelClass]
    });
  }

}

