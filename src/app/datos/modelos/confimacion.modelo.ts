export type ConfirmTipo = 'danger' | 'warning' | 'info' | 'success';

export interface ConfirmOptions {
  tipo?: ConfirmTipo;
  titulo?: string;
  mensaje: string;
  textoConfirmar?: string;
  textoCancelar?: string;

  // Opcionales avanzados
  requiereTexto?: boolean;        // requiere escribir texto
  textoValidacion?: string;       // texto que debe escribir (ej: ELIMINAR)
  confirmacionDoble?: boolean;    // requiere segundo clic
}
