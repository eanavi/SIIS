// src/app/caracteristicas/consultas/nueva-consulta/nueva-consulta.component.ts

import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormArray } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin, switchMap } from 'rxjs';

// Material imports
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { MatSelectModule } from '@angular/material/select';
import { MatRadioModule } from '@angular/material/radio';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatMenuModule } from '@angular/material/menu';

import { PacientesApiService } from '../../../../datos/api/pacientes-api.service';
import { ConsultasApiService } from '../../../../datos/api/consultas-api.service';
import { FhirConverterService } from '../../../../dominio/servicios/fhir-converter.service';
import { PacienteDetalle, Edad } from '../../../../datos/modelos/paciente.model';
import { Consulta } from '../../../../datos/modelos/consulta.model';
import { SaludService } from '../../../../nucleo/servicios/salud.service';

@Component({
  selector: 'app-nueva-consulta',
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
    MatSelectModule,
    MatRadioModule,
    MatTooltipModule,
    MatSnackBarModule,
    MatMenuModule
  ],
  templateUrl: './nueva-consulta.html',
  styleUrl: './nueva-consulta.scss'
})
export class NuevaConsultaComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private pacientesApi = inject(PacientesApiService);
  private consultasApi = inject(ConsultasApiService);
  private fhirConverter = inject(FhirConverterService);
  private snackBar = inject(MatSnackBar);

  private saludService = inject(SaludService);

  // IDs
  idPaciente = signal(0);
  idReserva = signal(0);
  idConsulta = signal(0);



  // Datos cargados
  paciente = signal<PacienteDetalle | null>(null);
  consulta = signal<Consulta | null>(null);

  edad = signal<Edad>({ anios: 0, meses: 0, dias: 0, texto: '' });

  // Estados
  cargando = signal(true);
  guardando = signal(false);
  exportando = signal(false);
  error = signal('');

  // Formulario
  consultaForm!: FormGroup;

  // Opciones para selects
  opcionesReferencia = [
    { valor: 0, etiqueta: 'Sin referencia' },
    { valor: 1, etiqueta: 'Hospital General' },
    { valor: 2, etiqueta: 'Hospital Especializado' },
    { valor: 3, etiqueta: 'Clínica Privada' },
    { valor: 4, etiqueta: 'Otro Centro' }
  ];



  ngOnInit(): void {
    this.inicializarFormulario();

    // Obtener parámetros de la URL
    this.route.queryParams.subscribe(params => {
      this.idPaciente.set(+params['idPaciente']);
      this.idReserva.set(+params['idReserva']);

      if (this.idPaciente() && this.idReserva()) {
        this.cargarDatos();
      } else {
        this.error.set('Parámetros inválidos');
        this.cargando.set(false);
      }
    });
  }

  inicializarFormulario(): void {
    this.consultaForm = this.fb.group({
      motivo: ['', [Validators.required, Validators.minLength(10)]],
      ex_fisico: ['', [Validators.required, Validators.minLength(10)]],
      diagnostico: ['', [Validators.required, Validators.minLength(5)]],
      tratamiento: ['', [Validators.required, Validators.minLength(5)]],
      dx_cie10: this.fb.array([]),
      mortalidad: ['N', Validators.required],
      referencia: [0, Validators.required],
      subsidio: [0],
      observaciones: ['']
    });
  }

  get dx_cie10Array(): FormArray {
    return this.consultaForm.get('dx_cie10') as FormArray;
  }

  cargarDatos(): void {
    this.cargando.set(true);
    this.error.set('');

    console.log('📥 Cargando datos:', {
      idPaciente: this.idPaciente(),
      idReserva: this.idReserva()
    });


    // Cargar ambos datos en paralelo
    forkJoin({
      paciente: this.pacientesApi.obtenerPaciente(this.idPaciente()),
      consulta: this.consultasApi.obtenerConsultaPorReserva(this.idReserva())
      //consulta: this.consultasApi.obtenerConsultaPorReserva(3)
    }).subscribe({
      next: ({ paciente, consulta }) => {
        this.paciente.set(paciente);
        this.consulta.set(consulta);

        console.log('✅ Datos cargados:', { paciente, consulta });

        this.idConsulta.set(consulta.id_consulta);

        // Llenar el formulario con datos existentes
        this.llenarFormulario(consulta);
        this.cargando.set(false);
      },
      error: (error) => {
        console.error('❌ Error al cargar datos:', error);
        this.error.set('Error al cargar la información');
        this.cargando.set(false);
      }
    });
  }

  llenarFormulario(consulta: Consulta): void {
    // Llenar campos del formulario
    this.consultaForm.patchValue({
      motivo: consulta.motivo || '',
      ex_fisico: consulta.ex_fisico || '',
      diagnostico: consulta.diagnostico || '',
      tratamiento: consulta.tratamiento || '',
      mortalidad: consulta.mortalidad || 'N',
      referencia: consulta.referencia || 0,
      subsidio: consulta.subsidio || 0,
      observaciones: consulta.observaciones || ''

    });

    // Llenar códigos CIE-10
    this.dx_cie10Array.clear();
    if (consulta.dx_cie10 && consulta.dx_cie10.length > 0) {
      consulta.dx_cie10.forEach(codigo => {
        this.dx_cie10Array.push(this.fb.control(codigo, Validators.required));
      });
    } else {
      // Agregar al menos un campo vacío
      this.agregarCodigoCie10();
    }
  }

  agregarCodigoCie10(): void {
    this.dx_cie10Array.push(this.fb.control('', Validators.required));
  }

  eliminarCodigoCie10(index: number): void {
    if (this.dx_cie10Array.length > 1) {
      this.dx_cie10Array.removeAt(index);
    }
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
    const c = this.consulta();
    if (!c || !c.peso || !c.talla) return '-';

    const peso = parseFloat(c.peso);
    const talla = parseFloat(c.talla);

    if (talla === 0) return '-';

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



  private mostrarNotificacion(mensaje: string, panelClass: string): void {
    this.snackBar.open(mensaje, 'Cerrar', {
      duration: 3000,
      panelClass: [panelClass]
    });
  }



  guardarConsulta(): void {
    if (this.consultaForm.invalid) {
      this.consultaForm.markAllAsTouched();
      this.snackBar.open('Por favor complete todos los campos requeridos', 'Cerrar', {
        duration: 3000
      });
      return;
    }

    this.guardando.set(true);

    const datos = {
      ...this.consultaForm.value,
      dx_cie10: this.dx_cie10Array.value.filter((c: string) => c.trim() !== '')
    };

    console.log('💾 Guardando consulta:', datos);


    this.consultasApi.actualizarReserva(this.idReserva(), 'M').pipe(
      switchMap(() => this.consultasApi.actualizarConsulta(this.idConsulta(), datos))
    ).subscribe({
      next: (consultaActualizada) => {
        console.log('Reserva y consulta actualizadas:', consultaActualizada);
        this.mostrarNotificacion('Consulta guardada exitosamente', 'success-snackbar');

      setTimeout( () =>{
        this.router.navigate(['/medico/consultas']);
      }, 1500);
      },

      error: (error) => {
        this.guardando.set(false);
        console.error('❌ Error al actualizar reserva y consulta:', error);

        this.snackBar.open('Error al guardar la consulta', 'Cerrar', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
        this.mostrarNotificacion('Error al guardar la consulta', 'error-snackbar');
      },
      complete: () => {
        this.guardando.set(false);
      }

        });
  }

  exportarAFHIR(): void {
    const paciente = this.paciente();
    const consulta = this.consulta();

    if (!paciente || !consulta) {
      this.snackBar.open('No existen datos para exportar', 'Cerrar', {
        duration: 3000
      });
      return;
    }

    this.exportando.set(true);

    try {
      const fhirBundle = this.fhirConverter.convertirConsultaAFHIR(paciente, consulta);
      console.log('Bundle FHIR generado:', fhirBundle);

      const nombreArchivo = `consulta-fhir-${paciente.ci}-${new Date()}.json`;
      this.fhirConverter.descargarFHIR(fhirBundle, nombreArchivo);

      this.snackBar.open('Consulta exporta a FHIR exitosamente', 'Cerrar',{
        duration:3000,
        panelClass: ['success-snackbar']
      });

      this.exportando.set(false);
      } catch (error) {
        console.error('Error al generar el Bundle FHIR:', error);

        this.snackBar.open('Error al exportar a FHIR', 'Cerrar', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });

      this.exportando.set(false);
    }
  }

  verPreviewFHIR(): void {
    const paciente = this.paciente();
    const consulta = this.consulta();
    if (!paciente || !consulta) {
      this.snackBar.open('No hay datos para visualizar', 'Cerrar', {
        duration: 3000
      });
      return;
    }

    try {
      const fhirBundle = this.fhirConverter.convertirConsultaAFHIR(paciente, consulta);
      const json = this.fhirConverter.exportarAJSON(fhirBundle);

      console.group('FHIR bundle R5');
      console.log('Json Completo:', json);
      console.log('Objeto:', fhirBundle);
      console.log('Total de recursos:', fhirBundle.entry.length);
      console.log('Recursos incluidos:');

      fhirBundle.entry.forEach((entry, index) =>{
       console.log(`   ${index + 1}. ${entry.resource.resourceType}`);
      });
      console.groupEnd();

      this.snackBar.open('Bundle FHIR mostrado en consola (F12)', 'Cerrar', {
        duration: 3000,
        panelClass: ['success-snackbar']
      });
    } catch (error) {
      console.error('Error al generar el Bundle FHIR:', error);

      this.snackBar.open('Error al generar el Bundle FHIR', 'Cerrar', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
    }
  }

  copiarFHIRAPortapapeles():void {
    const paciente = this.paciente();
    const consulta = this.consulta();

    if (!paciente || !consulta){
      this.snackBar.open('No hay datos para copiar', 'Cerrar', {
        duration: 3000
      });
      return;
    }
    try {
      const fhirBundle = this.fhirConverter.convertirConsultaAFHIR(paciente, consulta);
      const json = this.fhirConverter.exportarAJSON(fhirBundle);

      navigator.clipboard.writeText(json).then(() => {
        this.snackBar.open('Json FHIR copiado al portapapeles', 'Cerrar',{
          duration: 3000,
          panelClass: ['success-snackbar']
        });
      }).catch(() => {
        this.snackBar.open('Error al copiar al portapapeles', 'Cerrar', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
      });
    } catch(error){
      console.error('Error al generar el Bundle FHIR:', error);

      this.snackBar.open('Error al generar JSON FHIR', 'Cerrar', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
    }

  }

  cancelar(): void {
    if (confirm('¿Está seguro de cancelar? Se perderán los cambios no guardados.')) {
      this.router.navigate(['/medico/consultas']);
    }
  }
}
