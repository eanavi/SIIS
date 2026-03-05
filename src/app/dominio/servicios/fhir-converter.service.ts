// src/app/dominio/servicios/fhir-converter.service.ts

import { Injectable } from '@angular/core';
import {
  FHIRBundle,
  FHIRPatient,
  FHIREncounter,
  FHIRObservation,
  FHIRCondition,
  FHIRProcedure,
  FHIRMedicationRequest
} from '../../datos/modelos/fhir.model';
import { PacienteDetalle } from '../../datos/modelos/paciente.model';
import { Consulta } from '../../datos/modelos/consulta.model';
import { count } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class FhirConverterService {

  fechaConOffset(fecha : string): string{
    const fechaconOff = fecha.includes('T') && !/[+-]\d{2}:\d{2}$|Z$/.test(fecha)
    ? fecha + '-04:00'
    : fecha;

    return fechaconOff
  }

  /**
   * Convertir consulta completa a Bundle FHIR
   */
  convertirConsultaAFHIR(
    paciente: PacienteDetalle,
    consulta: Consulta
  ): FHIRBundle {
    const bundle: FHIRBundle = {
      resourceType: 'Bundle',
      type: 'collection',
      entry: []
    };

    // 1. Paciente
    const fhirPatient = this.convertirPaciente(paciente);
    bundle.entry.push({
      fullUrl: `http://127.0.0.1/api/pacientes/${paciente.ci}`,
      resource: fhirPatient
    });

    // 2. Encuentro/Consulta
    const fhirEncounter = this.convertirEncuentro(consulta, paciente.ci);
    bundle.entry.push({
      fullUrl: `http://127.0.0.1/api/consultas/${consulta.id_consulta}`,
      resource: fhirEncounter
    });

    // 3. Signos vitales (múltiples observaciones)
    const signosVitales = this.convertirSignosVitales(consulta, paciente.ci);
    signosVitales.forEach((obs, index) => {
      bundle.entry.push({
        fullUrl: `http://127.0.0.1/Observation/vital-${consulta.id_consulta}-${index}`,
        resource: obs
      });
    });

    // 4. Diagnósticos (Conditions)
    const diagnosticos = this.convertirDiagnosticos(consulta, paciente.ci);
    diagnosticos.forEach((cond, index) => {
      bundle.entry.push({
        fullUrl: `http://127.0.0.1/Condition/${consulta.id_consulta}-${index}`,
        resource: cond
      });
    });

    // 5. Procedimientos de enfermería
    const procedimientos = this.convertirProcedimientos(consulta, paciente.ci);
    procedimientos.forEach((proc, index) => {
      bundle.entry.push({
        fullUrl: `http://127.0.0.1/Procedure/${consulta.id_consulta}-${index}`,
        resource: proc
      });
    });

    // 6. Tratamiento (MedicationRequest)
    if (consulta.tratamiento) {
      const medicacion = this.convertirTratamiento(consulta, paciente.ci);
      bundle.entry.push({
        fullUrl: `http://127.0.0.1/MedicationRequest/${consulta.id_consulta}`,
        resource: medicacion
      });
    }

    return bundle;
  }

  /**
   * Convertir paciente a FHIR Patient
   */
  private convertirPaciente(paciente: PacienteDetalle): FHIRPatient {
    const fhirPatient: FHIRPatient = {
      resourceType: 'Patient',
      id: paciente.ci,
      identifier: [
        {
          system: 'http://www.boliviasalud.gob.bo/identificadores/ci',
          value: paciente.ci
        }
      ],
      name: [
        {
          use: 'official',
          family: `${paciente.paterno} ${paciente.materno}`,
          given: paciente.nombres.split(' ')
        }
      ],
      gender: paciente.sexo === 'M' ? 'male' : 'female',
      birthDate: paciente.fecha_nacimiento
    };

    // Agregar dirección si existe
    if (paciente.direccion && paciente.direccion.length > 0) {
      const dir = paciente.direccion[0];
      fhirPatient.address = [
        {
          use: 'home',
          line: [
            `${dir.direccion.calle} ${dir.direccion.numero}`,
            dir.direccion.zona
          ],
          city: 'La Paz'
        }
      ];
    }

    // Agregar contactos
    if (paciente.telefono) {
      fhirPatient.telecom = [];
      if (paciente.telefono.celular) {
        fhirPatient.telecom.push({
          system: 'phone',
          value: paciente.telefono.celular,
          use: 'mobile'
        });
      }
      if (paciente.correo?.personal) {
        fhirPatient.telecom.push({
          system: 'email',
          value: paciente.correo.personal,
          use: 'home'
        });
      }
    }

    return fhirPatient;
  }

  /**
   * Convertir encuentro a FHIR Encounter
   */
  private convertirEncuentro(consulta: Consulta, pacienteId: string): FHIREncounter {

    return {
      resourceType: 'Encounter',
      id: consulta.id_consulta.toString(),
      status: 'completed',
      class: [
        {
          coding: [
            {
              system: 'http://terminology.hl7.org/CodeSystem/v3-ActCode',
              code: 'AMB',
              display: 'ambulatory'
            }
          ]
        }
      ],
      subject: {
        reference: `http://127.0.0.1/api/pacientes/${pacienteId}`
      },
      participant: [
        {
          type: [
            {
              coding: [
                {
                  system: 'http://terminology.hl7.org/CodeSystem/v3-ParticipationType',
                  code: 'PPRF',

                }
              ]
            }
          ],
          actor: {
            reference: `Practitioner/${consulta.id_medico}`
          }
        }
      ],
      actualPeriod: {
        start: this.fechaConOffset(consulta.fecha),
        end: this.fechaConOffset(consulta.fecha)
      },
      reason: [{
        value: [{
          concept: {
            text: consulta.motivo
          }
        }]
      }]
    };
  }

  /**
   * Convertir signos vitales a FHIR Observations
   */
  private convertirSignosVitales(consulta: Consulta, pacienteId: string): FHIRObservation[] {
    const observations: FHIRObservation[] = [];

    // Peso
    if (consulta.peso) {
      observations.push({
        resourceType: 'Observation',
        status: 'final',
        category: [
          {
            coding: [
              {
                system: 'http://terminology.hl7.org/CodeSystem/observation-category',
                code: 'vital-signs',
                display: 'Vital Signs'
              }
            ]
          }
        ],
        code: {
          coding: [
            {
              system: 'http://loinc.org',
              code: '29463-7',
              display: 'Body Weight'
            }
          ],
          text: 'Peso'
        },
        subject: {
          reference: `http://127.0.0.1/api/pacientes/${pacienteId}`
        },
        effectiveDateTime: this.fechaConOffset(consulta.fecha),
        valueQuantity: {
          value: parseFloat(consulta.peso),
          unit: 'kg',
          system: 'http://unitsofmeasure.org',
          code: 'kg'
        }
      });
    }

    // Talla
    if (consulta.talla) {
      observations.push({
        resourceType: 'Observation',
        status: 'final',
        category: [
          {
            coding: [
              {
                system: 'http://terminology.hl7.org/CodeSystem/observation-category',
                code: 'vital-signs',
                display: 'Vital Signs'
              }
            ]
          }
        ],
        code: {
          coding: [
            {
              system: 'http://loinc.org',
              code: '8302-2',
              display: 'Body Height'
            }
          ],
          text: 'Talla'
        },
        subject: {
          reference: `http://127.0.0.1/api/pacientes/${pacienteId}`
        },
        effectiveDateTime: this.fechaConOffset(consulta.fecha),
        valueQuantity: {
          value: parseFloat(consulta.talla),
          unit: 'm',
          system: 'http://unitsofmeasure.org',
          code: 'm'
        }
      });
    }

    // Temperatura
    if (consulta.temperatura) {
      observations.push({
        resourceType: 'Observation',
        status: 'final',
        category: [
          {
            coding: [
              {
                system: 'http://terminology.hl7.org/CodeSystem/observation-category',
                code: 'vital-signs',
                display: 'Vital Signs'
              }
            ]
          }
        ],
        code: {
          coding: [
            {
              system: 'http://loinc.org',
              code: '8310-5',
              display: 'Body Temperature'
            }
          ],
          text: 'Temperatura'
        },
        subject: {
          reference: `http://127.0.0.1/api/pacientes/${pacienteId}`
        },
        effectiveDateTime: this.fechaConOffset(consulta.fecha),
        valueQuantity: {
          value: parseFloat(consulta.temperatura),
          unit: 'Cel',
          system: 'http://unitsofmeasure.org',
          code: 'Cel'
        }
      });
    }

    // Presión arterial (con componentes sistólica/diastólica)
    if (consulta.presion) {
      const [sistolica, diastolica] = consulta.presion.split('/').map(v => parseFloat(v));

      observations.push({
        resourceType: 'Observation',
        status: 'final',
        category: [
          {
            coding: [
              {
                system: 'http://terminology.hl7.org/CodeSystem/observation-category',
                code: 'vital-signs',
                display: 'Vital Signs'
              }
            ]
          }
        ],
        code: {
          coding: [
            {
              system: 'http://loinc.org',
              code: '85354-9',
              display: 'Blood Pressure'
            }
          ],
          text: 'Presión Arterial'
        },
        subject: {
          reference: `http://127.0.0.1/api/pacientes/${pacienteId}`
        },
        effectiveDateTime: this.fechaConOffset(consulta.fecha),
        component: [
          {
            code: {
              coding: [
                {
                  system: 'http://loinc.org',
                  code: '8480-6'
                }
              ]
            },
            valueQuantity: {
              value: sistolica,
              unit: 'mmHg'
            }
          },
          {
            code: {
              coding: [
                {
                  system: 'http://loinc.org',
                  code: '8462-4'
                }
              ]
            },
            valueQuantity: {
              value: diastolica,
              unit: 'mmHg'
            }
          }
        ]
      });
    }

    // Frecuencia cardíaca
    if (consulta.frecuencia_cardiaca) {
      observations.push({
        resourceType: 'Observation',
        status: 'final',
        category: [
          {
            coding: [
              {
                system: 'http://terminology.hl7.org/CodeSystem/observation-category',
                code: 'vital-signs',
                display: 'Vital Signs'
              }
            ]
          }
        ],
        code: {
          coding: [
            {
              system: 'http://loinc.org',
              code: '8867-4',
              display: 'Heart rate'
            }
          ],
          text: 'Frecuencia Cardíaca'
        },
        subject: {
          reference: `http://127.0.0.1/api/pacientes/${pacienteId}`
        },
        effectiveDateTime: this.fechaConOffset(consulta.fecha),
        valueQuantity: {
          value: consulta.frecuencia_cardiaca,
          unit: '/min',
          system: 'http://unitsofmeasure.org',
          code: '/min'
        }
      });
    }

    // Frecuencia respiratoria
    if (consulta.frecuencia_respiratoria) {
      observations.push({
        resourceType: 'Observation',
        status: 'final',
        category: [
          {
            coding: [
              {
                system: 'http://terminology.hl7.org/CodeSystem/observation-category',
                code: 'vital-signs',
                display: 'Vital Signs'
              }
            ]
          }
        ],
        code: {
          coding: [
            {
              system: 'http://loinc.org',
              code: '9279-1',
              display: 'Respiratory rate'
            }
          ],
          text: 'Frecuencia Respiratoria'
        },
        subject: {
          reference: `http://127.0.0.1/api/pacientes/${pacienteId}`
        },
        effectiveDateTime: this.fechaConOffset(consulta.fecha),
        valueQuantity: {
          value: consulta.frecuencia_respiratoria,
          unit: '/min',
          system: 'http://unitsofmeasure.org',
          code: '/min'
        }
      });
    }

    // Saturación de oxígeno
    if (consulta.saturacion) {
      observations.push({
        resourceType: 'Observation',
        status: 'final',
        category: [
          {
            coding: [
              {
                system: 'http://terminology.hl7.org/CodeSystem/observation-category',
                code: 'vital-signs',
                display: 'Vital Signs'
              }
            ]
          }
        ],
        code: {
          coding: [
            {
              system: 'http://loinc.org',
              code: '2708-6',
              display: 'Oxygen saturation'
            }
          ],
          text: 'Saturación de Oxígeno'
        },
        subject: {
          reference: `http://127.0.0.1/api/pacientes/${pacienteId}`
        },
        effectiveDateTime: this.fechaConOffset(consulta.fecha),
        valueQuantity: {
          value: parseFloat(consulta.saturacion),
          unit: '%',
          system: 'http://unitsofmeasure.org',
          code: '%'
        }
      });
    }

    return observations;
  }

  /**
   * Convertir diagnósticos a FHIR Conditions
   */
  private convertirDiagnosticos(consulta: Consulta, pacienteId: string): FHIRCondition[] {
    const conditions: FHIRCondition[] = [];

    // Convertir códigos CIE-10
    if (consulta.dx_cie10 && consulta.dx_cie10.length > 0) {
      consulta.dx_cie10.forEach(codigo => {
        conditions.push({
          resourceType: 'Condition',
          clinicalStatus: {
            coding: [
              {
                system: 'http://terminology.hl7.org/CodeSystem/condition-clinical',
                code: 'active'
              }
            ]
          },
          code: {
            coding: [
              {
                system: 'http://hl7.org/fhir/sid/icd-10',
                code: codigo
              }
            ],
            text: consulta.diagnostico
          },
          subject: {
            reference: `http://127.0.0.1/api/pacientes/${pacienteId}`
          },
          recordedDate: this.fechaConOffset(consulta.fecha)
        });
      });
    }

    return conditions;
  }

  /**
   * Convertir procedimientos de enfermería a FHIR Procedures
   */
  private convertirProcedimientos(consulta: Consulta, pacienteId: string): FHIRProcedure[] {
    const procedures: FHIRProcedure[] = [];

    if (consulta.inyectables > 0) {
      procedures.push({
        resourceType: 'Procedure',
        status: 'completed',
        code: {
          coding: [
            {
              system: 'http://snomed.info/sct',
              code: '16404004',
              display: 'Injection'
            }
          ]
        },
        subject: {
          reference: `http://127.0.0.1/api/pacientes/${pacienteId}`
        },
        performedDateTime: this.fechaConOffset(consulta.fecha)
      });
    }

    if (consulta.sueros > 0) {
      procedures.push({
        resourceType: 'Procedure',
        status: 'completed',
        code: {
          coding: [
            {
              system: 'http://snomed.info/sct',
              code: '225158009',
              display: 'Intravenous fluid therapy'
            }
          ]
        },
        subject: {
          reference: `http://127.0.0.1/api/pacientes/${pacienteId}`
        },
        performedDateTime: this.fechaConOffset(consulta.fecha)
      });
    }

    if (consulta.curaciones > 0) {
      procedures.push({
        resourceType: 'Procedure',
        status: 'completed',
        code: {
          coding: [
            {
              system: 'http://snomed.info/sct',
              code: '385949008',
              display: 'Dressing of wound'
            }
          ]
        },
        subject: {
          reference: `http://127.0.0.1/api/pacientes/${pacienteId}`
        },
        performedDateTime: this.fechaConOffset(consulta.fecha)
      });
    }

    return procedures;
  }

  /**
   * Convertir tratamiento a FHIR MedicationRequest
   */
  private convertirTratamiento(consulta: Consulta, pacienteId: string): FHIRMedicationRequest {
    return {
      resourceType: 'MedicationRequest',
      status: 'active',
      intent: 'order',
      medicationCodeableConcept: {
        text: consulta.tratamiento
      },
      subject: {
        reference: `http://127.0.0.1/api/pacientes/${pacienteId}`
      },
      authoredOn: this.fechaConOffset(consulta.fecha),
      dosageInstruction: [
        {
          text: consulta.tratamiento
        }
      ]
    };
  }

  /**
   * Exportar Bundle a JSON
   */
  exportarAJSON(bundle: FHIRBundle): string {
    return JSON.stringify(bundle, null, 2);
  }

  /**
   * Descargar Bundle como archivo JSON
   */
  descargarFHIR(bundle: FHIRBundle, nombreArchivo: string = 'consulta-fhir.json'): void {
    const json = this.exportarAJSON(bundle);
    const blob = new Blob([json], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = nombreArchivo;
    link.click();
    window.URL.revokeObjectURL(url);
  }
}
