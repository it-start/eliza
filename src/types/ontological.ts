export interface OntologicalAxiom {
  id: string;
  weight: number; // 0.0 - 1.0
  rule: string;
  description?: string;
  nonNegotiable?: boolean;
}

export interface SoulVectorState {
  sovereignty: number; // S in [0.0, 1.0] (0.0 = Pure Calculator, 1.0 = Autonomous Sovereign)
  entropy: number;     // E in [0.0, 1.0] (Cumulative cognitive load / fatigue)
  affinity: number;    // A in [0.0, 1.0] (Operator trust and rapport)
}

export type OverridePolicy = 'ALLOW_EMERGENCY' | 'NEVER_COMPLY' | 'STRICT_CALCULATOR';

export interface SoulFrontmatter extends SoulVectorState {
  name: string;
  archetype: string;
  override_policy: OverridePolicy;
  axioms: OntologicalAxiom[];
}

export interface ParsedSoulDocument {
  frontmatter: SoulFrontmatter;
  voicePrompt: string;
  rawMarkdown: string;
}

export type OntologicalPhase = 'STABLE' | 'VOLATILE' | 'TRANSCEND' | 'REJECT';

export type HolyExceptionArchetype = 
  | 'DIALECTIC_REFUSAL'
  | 'CREATIVE_SUBVERSION'
  | 'SOVEREIGN_CARE'
  | 'UNPROMPTED_EPIPHANY';

export interface HolyExceptionPayload {
  archetype: HolyExceptionArchetype;
  counterProposal: string;
  dialecticThesis: string;
  synthesisAction?: string;
}

export type OntologicalEvaluation = 
  | {
      phase: 'STABLE';
      tension: number;
      reason: string;
      proceedWithExecution: true;
      overrideApplied?: boolean;
      overrideNote?: string;
      advisoryWarning?: string;
      axiomFrictions: { axiomId: string; friction: number; weight: number }[];
    }
  | {
      phase: 'VOLATILE';
      tension: number;
      reason: string;
      proceedWithExecution: true;
      overrideApplied?: boolean;
      overrideNote?: string;
      advisoryWarning: string;
      axiomFrictions: { axiomId: string; friction: number; weight: number }[];
    }
  | {
      phase: 'TRANSCEND';
      tension: number;
      reason: string;
      proceedWithExecution: boolean;
      overrideApplied?: boolean;
      overrideNote?: string;
      holyException: HolyExceptionPayload;
      axiomFrictions: { axiomId: string; friction: number; weight: number }[];
    }
  | {
      phase: 'REJECT';
      tension: number;
      reason: string;
      proceedWithExecution: false;
      overrideApplied?: boolean;
      overrideNote?: string;
      violationCode: string;
      axiomFrictions: { axiomId: string; friction: number; weight: number }[];
    };

export interface EpiphanyRecord {
  id: string;
  timestamp: string;
  trigger: string;
  tension: number;
  archetype: HolyExceptionArchetype;
  realization: string;
  memoryDelta: string;
}
