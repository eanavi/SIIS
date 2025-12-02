# Estructura del Servicio

Los nombres de las carpetas se mantienen en Español para mayor claridad de
los nombres

```
src/
├── app/
│   ├── nucleo/                        # Servicios singleton y configuración
│   │   ├── configuracion/
│   │   │   ├── entorno.config.ts
│   │   │   └── api.config.ts
│   │   ├── interceptores/
│   │   │   ├── auth.interceptor.ts
│   │   │   └── error.interceptor.ts
│   │   ├── guardias/
│   │   │   └── auth.guard.ts
│   │   └── servicios/
│   │       ├── auth.service.ts
│   │       └── almacenamiento.service.ts
│   │
│   ├── datos/                         # Capa de acceso a datos
│   │   ├── api/                       # Cliente API
│   │   │   ├── base-api.service.ts
│   │   │   ├── usuarios-api.service.ts
│   │   │   └── productos-api.service.ts
│   │   ├── modelos/                   # Interfaces y tipos
│   │   │   ├── usuario.model.ts
│   │   │   ├── producto.model.ts
│   │   │   └── respuesta-api.model.ts
│   │   └── repositorios/              # Patrón repository (opcional)
│   │       ├── usuario.repository.ts
│   │       └── producto.repository.ts
│   │
│   ├── dominio/                       # Lógica de negocio
│   │   ├── servicios/
│   │   │   ├── usuario.service.ts
│   │   │   └── producto.service.ts
│   │   └── casos-uso/                 # Casos de uso complejos
│   │       └── checkout.use-case.ts
│   │
│   ├── compartido/                    # Componentes y utilidades compartidas
│   │   ├── componentes/
│   │   │   ├── boton/
│   │   │   ├── modal/
│   │   │   └── tabla/
│   │   ├── directivas/
│   │   │   └── resaltar.directive.ts
│   │   ├── pipes/
│   │   │   └── formato-fecha.pipe.ts
│   │   └── utilidades/
│   │       └── validadores.util.ts
│   │
│   ├── caracteristicas/               # Módulos por funcionalidad
│   │   ├── usuarios/
│   │   │   ├── paginas/
│   │   │   │   ├── lista-usuarios/
│   │   │   │   │   ├── lista-usuarios.component.ts
│   │   │   │   │   ├── lista-usuarios.component.html
│   │   │   │   │   └── lista-usuarios.component.scss
│   │   │   │   └── detalle-usuario/
│   │   │   ├── componentes/
│   │   │   │   ├── tarjeta-usuario/
│   │   │   │   └── formulario-usuario/
│   │   │   └── usuarios.routes.ts
│   │   │
│   │   └── productos/
│   │       ├── paginas/
│   │       ├── componentes/
│   │       └── productos.routes.ts
│   │
│   ├── diseño/                        # Layouts de la aplicación
│   │   ├── diseño-principal/
│   │   ├── diseño-auth/
│   │   └── diseño-admin/
│   │
│   ├── app.component.ts
│   ├── app.config.ts                  # Configuración de providers
│   └── app.routes.ts
│
└── entornos/
    ├── entorno.ts
    └── entorno.prod.ts

```

##Configuracion

La configuracion se realiza a traves de variables de entorno almacenadas
en el archivo .env del root del archivo,
depediendo de la configuracion de variables se crea el archivo
\src\app\nucleo\config\entorno.config.ts que luego es consumido por el servicio
y puesto a disposicion en los servicios y componentes de la aplicacion
para hacer uso de la configuracion se utiliza

Para esta creacion se hace uso de \scripts\cargar-env.js

## Opcion 1 con Constructor(tradicional)

```
import { Component } from '@angular/core';
import { EntornoService } from './nucleo/config/entorno.service';

@Component({
  selector: 'app-ejemplo',
  standalone: true,
  template: `<h1>{{ titulo }}</h1>`
})
export class EjemploComponent {
  titulo = 'Mi App';

  constructor(private entornoService: EntornoService) {
    console.log('API:', this.entornoService.obtenerApiUrl());
  }
}
```

## Opcion 2 con inject (Angular actualizado - recomendado)

```
import { Component, inject } from '@angular/core';
import { EntornoService } from './nucleo/config/entorno.service';

@Component({
  selector: 'app-ejemplo',
  standalone: true,
  template: `<h1>{{ titulo }}</h1>`
})
export class EjemploComponent {
  private entornoService = inject(EntornoService);
  titulo = 'Mi App';

  apiUrl = this.entornoService.obtenerApiUrl();
}
```

## Emplo de uso en un servicio

```
// src/app/servicios/api.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { EntornoService } from '../nucleo/config/entorno.service';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private http = inject(HttpClient);
  private entorno = inject(EntornoService);
  private baseUrl = this.entorno.obtenerApiUrl();

  obtenerUsuarios() {
    return this.http.get(`${this.baseUrl}/usuarios`);
  }

  obtenerUsuarioPorId(id: number) {
    return this.http.get(`${this.baseUrl}/usuarios/${id}`);
  }
}
```
