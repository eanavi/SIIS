// src/app/app.routes.ts

import { Routes } from '@angular/router';
import { authGuard } from './nucleo/guardias/auth.guard';
import { verificarRolGuard } from './nucleo/guardias/rol-redirect.guard';

export const routes: Routes = [
  // Ruta de login
  {
    path: 'login',
    loadComponent: () => import('./caracteristicas/auth/paginas/login/login')
      .then(m => m.LoginComponent)
  },

  // ========== PERFIL MÉDICO ==========
  {
    path: 'medico',
    loadComponent: () => import('./caracteristicas/perfil/medico/medico')
      .then(m => m.PerfilMedicoComponent),
    canActivate: [authGuard, verificarRolGuard(['Medico'])],
    children: [
      {
        path: 'pacientes',
        loadComponent: () => import('./caracteristicas/perfil/medico/pacientes/pacientes')
          .then(m => m.Pacientes)
      },
      {
        path: 'consultas',
        loadComponent: () => import('./caracteristicas/perfil/medico/consultas/consultas')
          .then(m => m.Consultas)
      },
      {
        path: 'turno',
        loadComponent: () => import('./caracteristicas/perfil/medico/turno/turno')
          .then(m => m.Turno)
      }
    ]
  },

  // ========== PERFIL ENFERMERA ==========
  {
    path: 'enfermera',
    loadComponent: () => import('./caracteristicas/perfil/enfermera/enfermera')
      .then(m => m.PerfilEnfermeraComponent),
    canActivate: [authGuard, verificarRolGuard(['Enfermera'])],
    children: [
      {
        path: 'pacientes',
        loadComponent: () => import('./caracteristicas/perfil/enfermera/pacientes/pacientes')
          .then(m => m.Pacientes)
      },
      {
        path: 'turno',
        loadComponent: () => import('./caracteristicas/perfil/enfermera/turno/turno')
          .then(m => m.Turno)
      }
    ]
  },

  // ========== PERFIL ODONTÓLOGO ==========
  {
    path: 'odontologo',
    loadComponent: () => import('./caracteristicas/perfil/odontologo/odontologo')
      .then(m => m.PerfilOdontologoComponent),
    canActivate: [authGuard, verificarRolGuard(['Odontologo'])],
    children: [
      {
        path: 'pacientes',
        loadComponent: () => import('./caracteristicas/perfil/odontologo/pacientes/pacientes')
          .then(m => m.Pacientes)
      },
      {
        path: 'consultas',
        loadComponent: () => import('./caracteristicas/perfil/odontologo/consultas/consultas')
          .then(m => m.Consultas)
      },
      {
        path: 'turno',
        loadComponent: () => import('./caracteristicas/perfil/odontologo/turno/turno')
          .then(m => m.Turno)
      }
    ]
  },

  // ========== PERFIL OPERADOR ==========
  {
    path: 'operador',
    loadComponent: () => import('./caracteristicas/perfil/operador/operador')
      .then(m => m.PerfilOperadorComponent),
    canActivate: [authGuard, verificarRolGuard(['Operador'])],
    children: [
      {
        path: 'pacientes',
        loadComponent: () => import('./caracteristicas/perfil/operador/pacientes/pacientes')
          .then(m => m.Pacientes)
      },
      {
        path: 'pacientes/nuevo',
        loadComponent: () => import('./caracteristicas/perfil/operador/nuevo-paciente/nuevo-paciente')
          .then(m => m.NuevoPaciente)
      },
      {
        path: 'turno',
        loadComponent: () => import('./caracteristicas/perfil/operador/turno/turno')
          .then(m => m.Turno)
      }
    ]
  },

  // ========== PERFIL ADMINISTRADOR ==========
  {
    path: 'administrador',
    loadComponent: () => import('./caracteristicas/perfil/administrador/administrador')
      .then(m => m.PerfilAdministradorComponent),
    canActivate: [authGuard, verificarRolGuard(['Administrador'])],
    children: [
      {
        path: 'usuarios',
        loadComponent: () => import('./caracteristicas/perfil/administrador/usuarios/usuarios')
          .then(m => m.Usuarios)
      },
      {
        path: 'centros',
        loadComponent: () => import('./caracteristicas/perfil/administrador/centros/centros')
          .then(m => m.Centros)
      },
      {
        path: 'reportes',
        loadComponent: () => import('./caracteristicas/perfil/administrador/reportes/reportes')
          .then(m => m.Reportes)
      },
      {
        path: 'configuracion',
        loadComponent: () => import('./caracteristicas/perfil/administrador/configuracion/configuracion')
          .then(m => m.Configuracion)
      }
    ]
  },

  // Ruta raíz - redirige según el rol
  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full'
  },

  // Cualquier otra ruta - redirige al login
  {
    path: '**',
    redirectTo: '/login'
  }
];
