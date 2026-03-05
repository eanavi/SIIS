// src/app/datos/modelos/fhir.model.ts

export interface FHIRBundle {
  resourceType: 'Bundle';
  type: 'transaction' | 'collection';
  entry: FHIRBundleEntry[];
}

export interface FHIRBundleEntry {
  fullUrl?: string;
  resource: FHIRResource;
  request?: {
    method: 'POST' | 'PUT' | 'GET';
    url: string;
  };
}

export type FHIRResource =
  | FHIRPatient
  | FHIREncounter
  | FHIRObservation
  | FHIRCondition
  | FHIRProcedure
  | FHIRMedicationRequest;

// Paciente
export interface FHIRPatient {
  resourceType: 'Patient';
  id?: string;
  identifier: Array<{
    system: string;
    value: string;
  }>;
  name: Array<{
    use: 'official';
    family: string;
    given: string[];
  }>;
  gender: 'male' | 'female' | 'other' | 'unknown';
  birthDate: string;
  address?: Array<{
    use: 'home';
    line: string[];
    city: string;
  }>;
  telecom?: Array<{
    system: 'phone' | 'email';
    value: string;
    use: 'home' | 'work' | 'mobile';
  }>;
}

// Encuentro/Consulta
export interface FHIREncounter {
  resourceType: 'Encounter';
  id?: string;
  status: 'planned' | 'in-progress' | 'on-hold' | 'discharged' | 'completed';
  class: Array<{
    coding: Array<{
      system: string;
      code: string;
      display: string;
    }>;
  }>;
  subject: {
    reference: string;
  };
  participant?: Array<{
    type?: Array<{
      coding: Array<{
        system: string;
        code: string;
      }>;
    }>;
    actor: {
      reference: string;
    };
  }>;
  actualPeriod: {
    start: string;
    end?: string;
  };
  reason?: Array<{                  // ← Cambia reasonCode → reason
    use?: {                         // opcional
      coding: Array<{
        system: string;
        code: string;
        display?: string;
      }>;
    };
    value: Array<{
      concept: {
        text: string;
      }
    }>;                        // ← aquí va el motivo
      // O si es referencia: reference?: string;
  }>;
}

// Observación (Signos vitales)
export interface FHIRObservation {
  resourceType: 'Observation';
  id?: string;
  status: 'final' | 'preliminary';
  category: Array<{
    coding: Array<{
      system: string;
      code: string;
      display: string;
    }>;
  }>;
  code: {
    coding: Array<{
      system: string;
      code: string;
      display: string;
    }>;
    text: string;
  };
  subject: {
    reference: string;
  };
  effectiveDateTime: string;
  valueQuantity?: {
    value: number;
    unit: string;
    system: string;
    code: string;
  };
  valueString?: string;
  component?: Array<{
    code: {
      coding: Array<{
        system: string;
        code: string;
      }>;
    };
    valueQuantity: {
      value: number;
      unit: string;
    };
  }>;
}

// Condición/Diagnóstico
export interface FHIRCondition {
  resourceType: 'Condition';
  id?: string;
  clinicalStatus: {
    coding: Array<{
      system: string;
      code: string;
    }>;
  };
  code: {
    coding: Array<{
      system: string;
      code: string;
      display?: string;
    }>;
    text: string;
  };
  subject: {
    reference: string;
  };
  recordedDate: string;
}

// Procedimiento
export interface FHIRProcedure {
  resourceType: 'Procedure';
  id?: string;
  status: 'completed';
  code: {
    coding: Array<{
      system: string;
      code: string;
      display: string;
    }>;
  };
  subject: {
    reference: string;
  };
  performedDateTime: string;
}

// Prescripción de medicamentos
export interface FHIRMedicationRequest {
  resourceType: 'MedicationRequest';
  id?: string;
  status: 'active';
  intent: 'order';
  medicationCodeableConcept: {
    text: string;
  };
  subject: {
    reference: string;
  };
  authoredOn: string;
  dosageInstruction?: Array<{
    text: string;
  }>;
}
