export interface Direccion {
  direccion: {
    calle: string;
    numero: string;
    zona: string;
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

export interface PacienteDetalle {
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
  estado_civil: string;
  tipo_sangre: string;
  ocupacion: number;
  nivel_estudios: number;
  idioma_hablado: number;
  idioma_materno: number;
  autopertenencia: number;
  gestion_comunitaria: string;
}

export interface PacienteAsignado {
  id_paciente: number;
  id_reserva: number;
  ci:string;
  paterno:string;
  materno:string;
  nombres:string;
  edad: string;
  sexo: string;
  fecha_reserva: string;
  hora_reserva: string;
}

export interface PacienteAsignadoEnf {
  servicio: string;
  id_paciente: number;
  id_reserva: number;
  ci:string;
  paterno:string;
  materno:string;
  nombres:string;
  edad: string;
  sexo: string;
  fecha_reserva: string;
  hora_reserva: string;
}

export interface BusquedaPaciente {
  criterio?: string;
}

export interface Edad {
  anios: number;
  meses: number;
  dias: number;
  texto: string;
}

export interface PacienteListado {
  id_paciente: number;
  ci: string;
  paterno: string;
  materno: string;
  nombres: string;
  fecha_nacimiento: string;
  edad: string;
  sexo: string;
  total_count: number;
}

export interface RespuestaPaginada{
  total: number;
  pagina: number;
  tamanio: number;
  items: PacienteListado[];
}
