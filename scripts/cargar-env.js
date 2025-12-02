// scripts/cargar-env.js
const fs = require('fs');
const path = require('path');

class CargadorEntorno {
  constructor() {
    this.errores = [];
    this.advertencias = [];
    this.ENTORNOS_VALIDOS = ['desarrollo', 'testeo', 'produccion'];

    this.colores = {
      rojo: '\x1b[31m',
      amarillo: '\x1b[33m',
      verde: '\x1b[32m',
      azul: '\x1b[36m',
      reset: '\x1b[0m'
    };
  }

  cargar() {
    console.log(`${this.colores.azul}🔧 Cargando configuración de entorno...${this.colores.reset}\n`);

    const rutaEnv = path.resolve(process.cwd(), '.env');
    if (!this.verificarArchivo(rutaEnv)) {
      return this.generarResultadoError();
    }

    const variables = this.parsearArchivo(rutaEnv);
    if (!variables) {
      return this.generarResultadoError();
    }

    if (!this.validarVariables(variables)) {
      return this.generarResultadoError();
    }

    if (!this.generarArchivoConfiguracion(variables)) {
      return this.generarResultadoError();
    }

    if (this.advertencias.length > 0) {
      this.mostrarAdvertencias();
    }

    console.log(`${this.colores.verde}✅ Configuración cargada exitosamente${this.colores.reset}`);
    console.log(`${this.colores.azul}   Entorno: ${variables.ENTORNO}${this.colores.reset}`);
    console.log(`${this.colores.azul}   API URL: ${variables.API_URL}${this.colores.reset}\n`);

    return {
      exito: true,
      variables,
      errores: [],
      advertencias: this.advertencias
    };
  }

  verificarArchivo(ruta) {
    if (!fs.existsSync(ruta)) {
      this.errores.push('No se encuentra el archivo .env');
      console.error(`${this.colores.rojo}❌ ERROR: No se encuentra el archivo .env${this.colores.reset}\n`);
      console.log(`${this.colores.amarillo}📝 Pasos para solucionar:${this.colores.reset}`);
      console.log(`   1. Crea un archivo .env en la raíz del proyecto`);
      console.log(`   2. Agrega las variables requeridas:`);
      console.log(`      API_URL=http://127.0.0.1:8000/API`);
      console.log(`      ENTORNO=desarrollo`);
      console.log(`      CLAVE=tu-clave-aqui\n`);
      return false;
    }
    return true;
  }

  parsearArchivo(ruta) {
    try {
      const contenido = fs.readFileSync(ruta, 'utf-8');
      const variables = {};

      contenido.split('\n').forEach((linea) => {
        linea = linea.trim();
        if (!linea || linea.startsWith('#')) return;

        const [clave, ...valorPartes] = linea.split('=');
        if (clave && valorPartes.length > 0) {
          const valor = valorPartes.join('=').trim();
          variables[clave.trim()] = valor;
        }
      });

      return {
        API_URL: variables.API_URL || '',
        ENTORNO: variables.ENTORNO || 'desarrollo',
        CLAVE: variables.CLAVE || ''
      };
    } catch (error) {
      this.errores.push(`Error al leer el archivo .env: ${error.message}`);
      console.error(`${this.colores.rojo}❌ ERROR al leer .env: ${error.message}${this.colores.reset}\n`);
      return null;
    }
  }

  validarVariables(variables) {
    let valido = true;

    // Validar API_URL
    if (!variables.API_URL) {
      this.errores.push('API_URL es obligatoria');
      valido = false;
    } else if (!this.esUrlValida(variables.API_URL)) {
      this.errores.push('API_URL no tiene un formato válido');
      valido = false;
    }

    // Validar ENTORNO
    if (!variables.ENTORNO) {
      this.errores.push('ENTORNO es obligatorio');
      valido = false;
    } else if (!this.ENTORNOS_VALIDOS.includes(variables.ENTORNO)) {
      this.errores.push(
        `ENTORNO debe ser uno de: ${this.ENTORNOS_VALIDOS.join(', ')}. Valor actual: ${variables.ENTORNO}`
      );
      valido = false;
    }

    // Validar CLAVE
    if (!variables.CLAVE) {
      this.errores.push('CLAVE es obligatoria');
      valido = false;
    } else if (variables.CLAVE.length < 16) {
      this.advertencias.push('⚠️  CLAVE es muy corta (recomendado: mínimo 16 caracteres)');
    }

    // Advertencias adicionales
    if (variables.ENTORNO === 'produccion' && variables.API_URL.includes('localhost')) {
      this.advertencias.push('⚠️  Estás usando localhost en entorno de producción');
    }

    if (variables.ENTORNO === 'produccion' && variables.API_URL.includes('127.0.0.1')) {
      this.advertencias.push('⚠️  Estás usando 127.0.0.1 en entorno de producción');
    }

    if (variables.ENTORNO === 'produccion' && variables.CLAVE === 'PR0GR4M4T1C4D3S4RR0LL0P4R4FUTUR') {
      this.advertencias.push('⚠️  Estás usando la clave de ejemplo en producción');
    }

    if (!valido) {
      this.mostrarErrores();
    }

    return valido;
  }

  esUrlValida(url) {
    try {
      new URL(url);
      return true;
    } catch {
      try {
        new URL(`http://${url}`);
        this.advertencias.push('⚠️  API_URL no tiene protocolo (http:// o https://)');
        return true;
      } catch {
        return false;
      }
    }
  }

  generarArchivoConfiguracion(variables) {
    const contenido = `// ⚠️  ARCHIVO GENERADO AUTOMÁTICAMENTE - NO EDITAR MANUALMENTE
// Este archivo se genera desde .env al ejecutar npm start o ng serve
// Para modificar la configuración, edita el archivo .env

export interface ConfiguracionEntorno {
  apiUrl: string;
  entorno: 'desarrollo' | 'testeo' | 'produccion';
  clave: string;
  esDesarrollo: boolean;
  esTesteo: boolean;
  esProduccion: boolean;
}

export const configuracionEntorno: ConfiguracionEntorno = {
  apiUrl: '${variables.API_URL}',
  entorno: '${variables.ENTORNO}',
  clave: '${variables.CLAVE}',
  esDesarrollo: ${variables.ENTORNO === 'desarrollo'},
  esTesteo: ${variables.ENTORNO === 'testeo'},
  esProduccion: ${variables.ENTORNO === 'produccion'}
};

// Exportar variables individuales para fácil acceso
export const API_URL = configuracionEntorno.apiUrl;
export const ENTORNO = configuracionEntorno.entorno;
export const CLAVE = configuracionEntorno.clave;
export const ES_DESARROLLO = configuracionEntorno.esDesarrollo;
export const ES_TESTEO = configuracionEntorno.esTesteo;
export const ES_PRODUCCION = configuracionEntorno.esProduccion;
`;

    try {
      const rutaDestino = path.resolve(process.cwd(), 'src/app/nucleo/config/entorno.config.ts');

      // Crear directorio si no existe
      const directorio = path.dirname(rutaDestino);
      if (!fs.existsSync(directorio)) {
        fs.mkdirSync(directorio, { recursive: true });
      }

      fs.writeFileSync(rutaDestino, contenido, 'utf-8');
      return true;
    } catch (error) {
      this.errores.push(`Error al generar archivo de configuración: ${error.message}`);
      console.error(`${this.colores.rojo}❌ ERROR al generar archivo: ${error.message}${this.colores.reset}\n`);
      return false;
    }
  }

  mostrarErrores() {
    console.error(`${this.colores.rojo}\n❌ ERRORES DE VALIDACIÓN:${this.colores.reset}\n`);
    this.errores.forEach(error => {
      console.error(`   ${this.colores.rojo}✗${this.colores.reset} ${error}`);
    });
    console.log(`\n${this.colores.amarillo}📝 Revisa tu archivo .env y corrige los errores${this.colores.reset}\n`);
  }

  mostrarAdvertencias() {
    console.log(`${this.colores.amarillo}\n⚠️  ADVERTENCIAS:${this.colores.reset}`);
    this.advertencias.forEach(adv => {
      console.log(`   ${adv}`);
    });
    console.log('');
  }

  generarResultadoError() {
    return {
      exito: false,
      errores: this.errores,
      advertencias: this.advertencias
    };
  }
}

// Ejecutar cargador
const cargador = new CargadorEntorno();
const resultado = cargador.cargar();

if (!resultado.exito) {
  console.error('❌ La aplicación no puede iniciarse debido a errores de configuración\n');
  process.exit(1);
}

process.exit(0);
