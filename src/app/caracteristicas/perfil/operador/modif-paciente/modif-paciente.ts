import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin } from 'rxjs';

import { MatStepperModule } from '@angular/material/stepper';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';


import { DatosPersonales } from '../shared/pasos-formulario/datos-personales/datos-personales';
import { ContactoDireccion } from '../shared/pasos-formulario/contacto-direccion/contacto-direccion';
import { DatosAdicionales } from '../shared/pasos-formulario/datos-adicionales/datos-adicionales';
import { SaludService } from '../../../../nucleo/servicios/salud.service';

import { ListaOpciones } from '../../../../datos/modelos/consulta.model';

import { PacientesApiService } from '../../../../datos/api/pacientes-api.service';
import { ListasApiService } from '../../../../datos/api/listas-api.service';
import { PacienteDetalle } from '../../../../datos/modelos/paciente.model';




@Component({
  selector: 'app-modif-paciente',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatStepperModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    DatosPersonales,
    ContactoDireccion,
    DatosAdicionales
  ],
  templateUrl: './modif-paciente.html',
  styleUrl: './modif-paciente.scss',
})
export class ModifPaciente implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private pacientesApi = inject(PacientesApiService);
  private listasApi = inject(ListasApiService);
  private snackBar = inject(MatSnackBar);
  private saludService = inject(SaludService);

  idPaciente = signal<number>(0);
  paciente = signal<PacienteDetalle | null>(null);
  cargando = signal<boolean>(true);
  error = signal<string | null>(null);
  guardando = signal<boolean>(false);

  datosPersonalesForm!: FormGroup;
  contactoForm!: FormGroup;
  formAdicional!: FormGroup;

  //listas
  estadosCiviles = signal<ListaOpciones[]>([]);
  tiposSangre = signal<ListaOpciones[]>([]);
  ocupaciones = signal<ListaOpciones[]>([]);
  nivelesEstudio = signal<ListaOpciones[]>([]);
  idiomas = signal<ListaOpciones[]>([]);
  idiomasMaternos = signal<ListaOpciones[]>([]);
  autopertenencias = signal<ListaOpciones[]>([]);


  ngOnInit(): void {
    this.crearFormularios();

    this.route.params.subscribe(params => {
      this.idPaciente.set(+params['id_paciente']);
      this.cargarDatos();
  });
  }

  crearFormularios(): void {
      this.datosPersonalesForm = this.fb.group({
      tipo: ['', Validators.required],
      ci: ['', [Validators.required, Validators.pattern(/^[0-9]*$/)]],
      paterno: ['', Validators.required],
      materno: [''],
      nombres: ['', Validators.required],
      fecha_nacimiento: ['', Validators.required],
      sexo: ['', Validators.required],
      estado_civil: ['', Validators.required],
      tipo_sangre: ['']
    });

    this.contactoForm = this.fb.group({
      direcciones: this.fb.array([this.crearDireccion()]),
      celular: ['', [Validators.required, Validators.pattern(/^\d{8,10}$/)]],
      fijo: ['', [Validators.pattern(/^\d{7,10}$/)]],
      correo_personal: ['', [Validators.email]],
      correo_domicilio: ['', [Validators.email]]
    });

    this.formAdicional = this.fb.group({
      ocupacion: ['', Validators.required],
      nivel_estudios: ['', Validators.required],
      idioma_hablado: ['', Validators.required],
      idioma_materno: ['', Validators.required],
      autopertenencia: ['', Validators.required],
      gestion_comunitaria: ['']
    });
  }

  get nombreCompletoPaciente(): string {
    const p = this.paciente();
    if (!p) return '';
    return `${p.paterno} ${p.materno} ${p.nombres}`;
  }

  get edadPaciente(): string {
    const fechaNac = this.datosPersonalesForm.get('fecha_nacimiento')?.value;
    if (!fechaNac) return '';
    return this.saludService.edad(fechaNac);
  }

  private crearDireccion(datos?: any): FormGroup {
    return this.fb.group({
      calle: [datos?.calle || ''],
      numero: [datos?.numero || ''],
      zona: [datos?.zona || ''],
      ciudad: [datos?.ciudad || ''],
      tipo: [datos?.tipo || 'personal']
    });
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
    this.formAdicional.patchValue({
      ocupacion: paciente.ocupacion?.toString() || '',
      nivel_estudios: paciente.nivel_estudios?.toString() || '',
      idioma_hablado: paciente.idioma_hablado?.toString() || '',
      idioma_materno: paciente.idioma_materno?.toString() || '',
      autopertenencia: paciente.autopertenencia?.toString() || '',
      gestion_comunitaria: paciente.gestion_comunitaria || ''
    });
  }

  get direccionesArray(): FormArray {
    return this.contactoForm.get('direcciones') as FormArray;
  }



  guardarPaciente(): void {
    if (
      this.datosPersonalesForm.invalid ||
      this.contactoForm.invalid ||
      this.formAdicional.invalid
    ) {
      this.datosPersonalesForm.markAllAsTouched();
      this.contactoForm.markAllAsTouched();
      this.formAdicional.markAllAsTouched();
      this.mostrarNotificacion('Complete todos los campos obligatorios', 'error-snackbar');
      return;
    }

    this.guardando.set(true);

    const direcciones = this.contactoForm.value.direcciones.map((dir: any) => ({
      direccion: {
        calle: dir.calle,
        numero: dir.numero,
        zona: dir.zona,
        ciudad: dir.ciudad
      },
      tipo: dir.tipo
    }));


    const datos = {
      ...this.datosPersonalesForm.value,
      //...this.contactoForm.value,
      //...this.formAdicional.value
      direccion: direcciones,
      telefono: {
        celular: this.contactoForm.value.celular,
        fijo: this.contactoForm.value.fijo
      },
      correo: {
        personal: this.contactoForm.value.correo_personal,
        domicilio: this.contactoForm.value.correo_domicilio
      },
      ocupacion: parseInt(this.formAdicional.value.ocupacion, 10),
      nivel_estudios: parseInt(this.formAdicional.value.nivel_estudios, 10),
      idioma_hablado: parseInt(this.formAdicional.value.idioma_hablado, 10),
      idioma_materno: parseInt(this.formAdicional.value.idioma_materno, 10),
      autopertenencia: parseInt(this.formAdicional.value.autopertenencia, 10),
      gestion_comunitaria: this.formAdicional.value.gestion_comunitaria
    };

    // Normalizar fecha
    if (datos.fecha_nacimiento) {
      datos.fecha_nacimiento = new Date(datos.fecha_nacimiento)
        .toISOString()
        .split('T')[0];
    }

    this.pacientesApi.actualizarPaciente(this.idPaciente(), datos).subscribe({
      next: () => {
        this.mostrarNotificacion('Paciente actualizado correctamente', 'success-snackbar');
        this.router.navigate(['/operador/pacientes']);
      },
      error: () => {
        this.guardando.set(false);
        this.mostrarNotificacion('Error al registrar paciente', 'error-snackbar');
      }
    });
  }

  private mostrarNotificacion(mensaje: string, panelClass: string): void {
    this.snackBar.open(mensaje, 'Cerrar', {
      duration: 3000,
      panelClass: [panelClass]
    });
  }


  cancelar(): void {
    this.router.navigate(['/operador/pacientes']);
  }

}
