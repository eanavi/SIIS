export interface EmpleadoListado {
  id_empleado: number;
  ci: string;
  paterno: string;
  materno: string;
  nombres: string;
  cargo: string;
  fecha_nacimiento: string;
  profesion: string;
}

export interface EmpleadoListadoPaginado {
  total: number;
  pagina: number;
  tamanio: number;
  items: EmpleadoListado[];
}

export interface Direccion {
  direccion: {
    calle: string;
    numero: string;
    zona: string;
    ciudad: string;
  };
  tipo: string;
}

export interface Telefono {
  celular: string;
  fijo: string;
}

export interface Correo {
  domicilio: string;
  personal: string;
}

export interface Empleado{
    tipo: string;
    ci: string;
    paterno: string;
    materno: string;
    nombres: string;
    fecha_nacimiento: string;
    sexo: string;
    direccion: Direccion[];
    telefono: Telefono;
    correo: Correo;
    tipo_empleado: string;
    profesion: string;
    registro_profesional: string;
    cargo: string;
}


export interface EmpleadoViewModel {
  ci : string;
  id_empleado: number;
  nombre_completo: string;
  fecha_nacimiento: string;
  edad: number | null;
  sexo: string;
  cargo: string;
  estado: 'ACTIVO' | 'INACTIVO';

  // UI helpers
  badgeColor: 'primary' | 'accent' | 'warn';
  avatarIcon: string;
}
