// src/app/compartido/componentes/header/header.component.ts

import { Component, inject, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';

// Material imports
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { AuthService } from '../../../nucleo/servicios/auth.service';
import { MenuService } from '../../../dominio/servicios/menu.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    RouterLinkActive,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatDividerModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './header.html',
  styleUrl: './header.scss'
})
export class HeaderComponent implements OnInit {
  authService = inject(AuthService);
  menuService = inject(MenuService);
  private router = inject(Router);

  // Computed para los menús (se actualiza automáticamente)
  menuItems = computed(() => this.menuService.menus());

  // Computed para saber si está cargando
  cargandoMenus = computed(() => this.menuService.cargando());

  ngOnInit(): void {
  const usuario = this.authService.usuarioActual();

  console.log('🎨 Header inicializado');
  console.log('   Usuario:', usuario?.username);
  console.log('   Rol:', usuario?.informacion?.nombre_rol || usuario?.rol);
  console.log('   Autenticado:', this.authService.estaAutenticado());

  // Si no hay información del usuario, cargarla
  if (usuario && !usuario.informacion) {
    console.log('⏳ Cargando información del usuario en header...');
    this.authService.cargarInformacionUsuario().subscribe({
      next: () => console.log('✅ Información cargada en header'),
      error: (error) => console.error('❌ Error al cargar info en header:', error)
    });
  }

  // Si no hay menús cargados, cargarlos
  if (usuario && this.menuItems().length === 0) {
    const rol = usuario.informacion?.nombre_rol || usuario.rol;
    if (rol) {
      console.log('⏳ Cargando menús en header...');
      this.menuService.cargarMenusPorRol(rol).subscribe({
        next: () => console.log('✅ Menús cargados en header'),
        error: (error) => console.error('❌ Error al cargar menús en header:', error)
      });
    }
  }

}

  get usuario() {
    return this.authService.usuarioActual();
  }

  get nombreUsuario(): string {
    return this.usuario?.informacion?.nombre_completo || this.usuario?.username || 'Usuario';
  }

  get nombreCentro(): string {
    return this.usuario?.informacion?.nombre_centro || 'Sin asignar';
  }

  get nombreRol(): string {
    return this.usuario?.informacion?.nombre_rol || this.usuario?.rol || 'Sin rol';
  }

  cerrarSesion(): void {
    this.authService.logout();
  }
}
