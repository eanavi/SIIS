// src/app/caracteristicas/perfil/medico/medico.component.ts

import { Component, inject, OnInit } from '@angular/core';
import { filter } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { HeaderComponent } from '../../../compartido/componentes/header/header';
import { AuthService } from '../../../nucleo/servicios/auth.service';

@Component({
  selector: 'app-perfil-medico',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    HeaderComponent,
    MatCardModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './medico.html',
  styleUrl: './medico.scss'
})
export class PerfilMedicoComponent implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);

  hayRutaActiva = false;

  ngOnInit(): void {
    // ✅ Mejorar la detección de ruta activa
    this.actualizarEstadoRuta();

    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.actualizarEstadoRuta();
    });
  }

    private actualizarEstadoRuta(): void {
    const urlActual = this.router.url;
    this.hayRutaActiva = urlActual !== '/medico' && urlActual.startsWith('/medico');

    console.log('🗺️ Estado de ruta actualizado:', {
      url: urlActual,
      hayRutaActiva: this.hayRutaActiva
    });
  }

  get nombreUsuario(): string {
    const nombreCompleto = this.authService.usuarioActual()?.informacion?.nombre_completo;
    if (nombreCompleto) {
      // Extraer solo el nombre (después de la coma)
      const partes = nombreCompleto.split(',');
      return partes.length > 1 ? partes[1].trim() : nombreCompleto;
    }
    return this.authService.usuarioActual()?.username || 'Doctor';
  }

  get nombreCentro(): string {
    return this.authService.usuarioActual()?.informacion?.nombre_centro || '';
  }

  irAPacientes(): void {
    this.router.navigate(['/medico/pacientes']);
  }

  irAConsultas(): void {
    this.router.navigate(['/medico/consultas']);
  }

  irATurnos(): void {
    this.router.navigate(['/medico/turno']);
  }
}
