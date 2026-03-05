import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';

// Angular Material
import { MatCardModule } from '@angular/material/card';
import { MatStepperModule } from '@angular/material/stepper';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatNativeDateModule } from '@angular/material/core';

// APIs
import { PacientesApiService } from '../../../../datos/api/pacientes-api.service';
import { ListasApiService } from '../../../../datos/api/listas-api.service';

// Modelos
import { ListaOpciones } from '../../../../datos/modelos/consulta.model';

// Subcomponentes reutilizables
import { DatosPersonales } from '../shared/pasos-formulario/datos-personales/datos-personales';
import { ContactoDireccion } from '../shared/pasos-formulario/contacto-direccion/contacto-direccion';
import { DatosAdicionales } from '../shared/pasos-formulario/datos-adicionales/datos-adicionales';

@Component({
  selector: 'app-nuevo-paciente',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatStepperModule,
    MatButtonModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatNativeDateModule,

    // Subcomponentes
    DatosPersonales,
    ContactoDireccion,
    DatosAdicionales
  ],
  templateUrl: './nuevo-paciente.html',
  styleUrl: './nuevo-paciente.scss'
})
export class NuevoPaciente implements OnInit {

  private fb = inject(FormBuilder);
  private router = inject(Router);
  private pacientesApi = inject(PacientesApiService);
  private listasApi = inject(ListasApiService);
  private snackBar = inject(MatSnackBar);

  // Formularios
  datosPersonalesForm!: FormGroup;
  contactoForm!: FormGroup;
  formAdicional!: FormGroup;

  // Listas
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

  ngOnInit(): void {
    this.inicializarFormularios();
    this.cargarListas();
  }

  private inicializarFormularios(): void {
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

  crearDireccion(datos?: any): FormGroup {
    return this.fb.group({
      calle: [datos?.calle || '', Validators.required],
      numero: [datos?.numero || '', Validators.required],
      zona: [datos?.zona || '', Validators.required],
      ciudad: [datos?.ciudad || '', Validators.required],
      tipo: [datos?.tipo || 'personal', Validators.required]
    });
  }

  private cargarListas(): void {
    forkJoin({
      estadosCiviles: this.listasApi.obtenerLista('se_estado_civil'),
      tiposSangre: this.listasApi.obtenerLista('tipo_sangre'),
      ocupaciones: this.listasApi.obtenerLista('se_profesion'),
      nivelesEstudio: this.listasApi.obtenerLista('se_nivel_estudio'),
      idiomas: this.listasApi.obtenerLista('se_idioma'),
      idiomasMaternos: this.listasApi.obtenerLista('se_idiomamaterno'),
      autopertenencias: this.listasApi.obtenerLista('se_autopertenencia')
    }).subscribe({
      next: res => {
        this.estadosCiviles.set(res.estadosCiviles);
        this.tiposSangre.set(res.tiposSangre);
        this.ocupaciones.set(res.ocupaciones);
        this.nivelesEstudio.set(res.nivelesEstudio);
        this.idiomas.set(res.idiomas);
        this.idiomasMaternos.set(res.idiomasMaternos);
        this.autopertenencias.set(res.autopertenencias);
        this.cargando.set(false);
      },
      error: () => {
        this.mostrarNotificacion('Error al cargar listas', 'error-snackbar');
        this.cargando.set(false);
      }
    });
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

    this.pacientesApi.crearPaciente(datos).subscribe({
      next: () => {
        this.mostrarNotificacion('Paciente registrado correctamente', 'success-snackbar');
        this.router.navigate(['/operador/pacientes']);
      },
      error: () => {
        this.guardando.set(false);
        this.mostrarNotificacion('Error al registrar paciente', 'error-snackbar');
      }
    });
  }

  cancelar(): void {
    this.router.navigate(['/operador/pacientes']);
  }

  private mostrarNotificacion(mensaje: string, panelClass: string): void {
    this.snackBar.open(mensaje, 'Cerrar', {
      duration: 3000,
      panelClass: [panelClass]
    });
  }
}
