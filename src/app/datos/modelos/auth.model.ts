// src/app/datos/modelos/auth.model.ts

export interface CredencialesLogin {
  username: string;
  password: string;
  grant_type?: string;
  scope?: string;
  client_id?: string;
  client_secret?: string;
}

export interface RespuestaAuth {
  access_token: string;
  token_type: string;
}

export interface UsuarioAutenticado {
  username: string;
  rol: string;
  token: string;
  exp: number;
}

export interface PayloadToken {
  sub: string;  // username
  rol: string;  // rol del usuario
  exp: number;  // timestamp de expiración
}

// ✅ NUEVO: Modelo para información completa del usuario
export interface InformacionUsuario {
  nombre_completo: string;
  nombre_centro: string;
  nombre_rol: string;
}

// ✅ NUEVO: Modelo extendido con toda la información
export interface UsuarioCompleto extends UsuarioAutenticado {
  informacion?: InformacionUsuario;
}
