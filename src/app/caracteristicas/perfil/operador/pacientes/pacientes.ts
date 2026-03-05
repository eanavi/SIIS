import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { debounceTime, distinctUntilChanged } from 'rxjs';

import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { PacienteListado, RespuestaPaginada } from '../../../../datos/modelos/paciente.model';
import { PacientesApiService } from '../../../../datos/api/pacientes-api.service';
import { SaludService } from '../../../../nucleo/servicios/salud.service';


@Component({
  selector: 'app-pacientes',
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
    MatTableModule,
    MatPaginatorModule,
    MatChipsModule,
    MatTooltipModule,
    MatSnackBarModule
  ],
  templateUrl: './pacientes.html',
  styleUrl: './pacientes.scss',
})
export class Pacientes implements OnInit  {
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private pacientesApi = inject(PacientesApiService);
  private snackBar = inject(MatSnackBar);
  saludService = inject(SaludService);


  busquedaForm!: FormGroup;
  pacientes = signal<PacienteListado[]>([]);
  totalRegistros = signal(0);

  paginaActual = signal(1);
  tamanioPagina = signal(10);
  opcionesTamanio = [5, 10, 25, 50];

  cargando = signal<boolean>(false)
  error = signal('');

  columnasTabla: string[] = ['ci', 'nombre_completo', 'fecha_nacimiento','edad', 'sexo', 'acciones'];

  ngOnInit(): void {
    this.inicializarFormulario();
    this.configurarBusqueda();
    this.cargarPacientes();
  }

  inicializarFormulario(): void {
    this.busquedaForm = this.fb.group({
      criterio: ['']
    });
  }

  configurarBusqueda(): void {
    this.busquedaForm.get('criterio')!.valueChanges
      .pipe(
        debounceTime(500),
        distinctUntilChanged()
      )
      .subscribe(() => {
        this.paginaActual.set(1);
        this.cargarPacientes();
      });
  }

  cargarPacientes(): void {
    this.cargando.set(true);
    this.error.set('');

    const criterio = this.busquedaForm.get('criterio')?.value || '';

    console.log('🔍 Buscando pacientes:', {
      pagina: this.paginaActual(),
      tamanio: this.tamanioPagina(),
      criterio
    });

    this.pacientesApi.listarPacientes(
      this.paginaActual(),
      this.tamanioPagina(),
      criterio
    ).subscribe({
      next: (respuesta: RespuestaPaginada) => {
        this.pacientes.set(respuesta.items);
        this.totalRegistros.set(respuesta.total);

        console.log('Pacientes cargados:', {
          total: respuesta.total,
          items: respuesta.items.length
        });

        this.cargando.set(false);

        if (respuesta.items.length === 0 && criterio){
          this.mostrarNotificacion('No se encontraron pacientes con este criterio', 'info-snackbar');
        }
      },
      error: (error) => {
        console.error('Error al cargar pacientes:', error);
        this.error.set('Error al cargar la lista de pacientes');
        this.cargando.set(false);
        this.mostrarNotificacion('Error al cargar pacientes', 'error-snackbar')
      }
    });
  }

  onPageChange(event: PageEvent): void{
    this.paginaActual.set(event.pageIndex + 1);
    this.tamanioPagina.set(event.pageSize);
    this.cargarPacientes();
  }

  getNombreCompleto(paciente: PacienteListado): string {
    return `${paciente.paterno} ${paciente.materno}, ${paciente.nombres}`;
  }

  limpiarBusqueda():void{
    this.busquedaForm.patchValue({criterio: ''});
    this.paginaActual.set(1);
    this.cargarPacientes();
  }

  editarPaciente(paciente: PacienteListado):void {
    console.log('Editando paciente:', paciente);
    this.router.navigate(['/operador/pacientes/editar', paciente.id_paciente]);
  }


  asignarServicios(paciente: PacienteListado):void {
    console.log('Asignando servicos a paciente:', paciente);
    this.router.navigate(['/operador/pacientes/servicios', paciente.id_paciente]);
  }

  nuevoPaciente(): void {
    console.log('+ crear nuevo paciente');
    this.router.navigate(['/operador/pacientes/nuevo']);
  }

  private mostrarNotificacion(mensaje:string, panelClass: string):void{
    this.snackBar.open(mensaje, 'Cerrar', {
      duration: 3000,
      panelClass: [panelClass]
    });
  }

}
