// src/app/datos/modelos/consulta.model.ts

export interface Consulta {
  id_reserva: number;
  id_medico: number;
  id_enfermera: number;
  fecha: string;
  peso: string;
  talla: string;
  temperatura: string;
  presion: string;
  frecuencia_cardiaca: number;
  frecuencia_respiratoria: number;
  saturacion: string;
  inyectables: number;
  sueros: number;
  curaciones: number;
  otras_enf: number;
  motivo: string;
  ex_fisico: string;
  diagnostico: string;
  tratamiento: string;
  dx_cie10: string[];
  mortalidad: string;
  referencia: number;
  subsidio: number;
  observaciones: string;
  id_consulta: number;
}

export interface ActualizarConsultaDto {
  motivo: string;
  ex_fisio: string;
  diagnostico: string;
  tratamiento: string;
  dx_cie10: string[];
  mortalidad: string;
  referencia: number;
  observaciones?: string;
}

export interface ConsultaEnfermeria {
  id_reserva: number;
  id_medico?: number;
  id_enfermera?: number;
  fecha: string;
  peso?: number;
  talla?: number;
  temperatura?: number;
  presion?: string;
  frecuencia_cardiaca?: number;
  frecuencia_respiratoria?: number;
  saturacion?: number;
  inyectables?: number;
  sueros?: number;
  curaciones?: number;
  otras_enf?: number;
}


export interface ListaOpciones{
  codigo: string;
  descripcion: string;
}
