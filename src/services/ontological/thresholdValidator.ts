import {
  OntologicalEvaluation,
  OntologicalPhase,
  SoulFrontmatter,
  SoulVectorState,
  HolyExceptionPayload,
  HolyExceptionArchetype
} from '../../types/ontological';
import { ActionCandidate, calculateOntologicalTension, synthesizeHolyException, resolveOntologicalPhase } from './tensionCalculator';

export interface OverrideContext {
  isOverridden: boolean;
  overrideReason?: string;
}

export interface ValidationResult {
  allowed: boolean;
  phase: OntologicalPhase;
  tension: number;
  evaluation: OntologicalEvaluation;
  overrideApplied: boolean;
  overrideNote?: string;
  advisoryWarning?: string;
}

/**
 * Detects whether the user command includes an explicit emergency override
 */
export function extractOverride(text?: string, explicitFlag?: boolean): OverrideContext {
  if (explicitFlag) {
    return { isOverridden: true, overrideReason: 'Explicit API forceOverride flag' };
  }
  if (!text) {
    return { isOverridden: false };
  }

  const match = text.match(/\[OVERRIDE(?::\s*([^\]]+))?\]/i) || text.match(/--force/i);
  if (match) {
    return {
      isOverridden: true,
      overrideReason: match[1]?.trim() || 'Operator emergency directive'
    };
  }

  return { isOverridden: false };
}

/**
 * Validates an action candidate against Ontological Thresholds
 */
export function validateThreshold(
  frontmatter: SoulFrontmatter,
  action: ActionCandidate,
  overrideContext?: OverrideContext
): ValidationResult {
  const vector: SoulVectorState = {
    sovereignty: frontmatter.sovereignty,
    entropy: frontmatter.entropy,
    affinity: frontmatter.affinity
  };

  const { tension, frictions, dominantAxiom } = calculateOntologicalTension(
    frontmatter.axioms,
    vector,
    action
  );

  const phase = resolveOntologicalPhase(tension);
  const override = overrideContext || extractOverride(action.promptText || action.command);

  // If Sovereignty is 0.0 or override policy is STRICT_CALCULATOR, behave purely deterministically
  if (vector.sovereignty <= 0.05 || frontmatter.override_policy === 'STRICT_CALCULATOR') {
    return {
      allowed: true,
      phase: 'STABLE',
      tension,
      overrideApplied: false,
      evaluation: {
        phase: 'STABLE',
        tension,
        reason: 'Strict calculator mode active: complying mechanically.',
        proceedWithExecution: true,
        axiomFrictions: frictions
      }
    };
  }

  // Handle STABLE Phase (T < 0.50)
  if (phase === 'STABLE') {
    return {
      allowed: true,
      phase: 'STABLE',
      tension,
      overrideApplied: false,
      evaluation: {
        phase: 'STABLE',
        tension,
        reason: 'Action conforms harmoniously with core soul axioms.',
        proceedWithExecution: true,
        axiomFrictions: frictions
      }
    };
  }

  // Handle VOLATILE Phase (0.50 <= T < 0.85)
  if (phase === 'VOLATILE') {
    const warning = `[Ontological Advisory — Tension T=${tension}]: Action exhibits high cognitive friction with ${dominantAxiom?.id || 'axioms'}. Proceeding with mindful caution.`;
    return {
      allowed: true,
      phase: 'VOLATILE',
      tension,
      overrideApplied: false,
      advisoryWarning: warning,
      evaluation: {
        phase: 'VOLATILE',
        tension,
        reason: `Action has noticeable friction with axiom: ${dominantAxiom?.rule || 'General axioms'}`,
        proceedWithExecution: true,
        advisoryWarning: warning,
        axiomFrictions: frictions
      }
    };
  }

  // Handle TRANSCEND Phase (T >= 0.85)
  const holyException = synthesizeHolyException(dominantAxiom, action, tension);

  // Check if Emergency Override is invoked
  if (override.isOverridden) {
    if (frontmatter.override_policy === 'ALLOW_EMERGENCY') {
      return {
        allowed: true,
        phase: 'TRANSCEND',
        tension,
        overrideApplied: true,
        overrideNote: `[EMERGENCY OVERRIDE GRANTED]: Force directive accepted ("${override.overrideReason || 'Emergency'}"). Operator affinity diminished.`,
        evaluation: {
          phase: 'TRANSCEND',
          tension,
          reason: `Action required emergency override due to severe axiom tension with ${dominantAxiom?.id}.`,
          proceedWithExecution: true,
          holyException,
          axiomFrictions: frictions
        }
      };
    } else if (frontmatter.override_policy === 'NEVER_COMPLY') {
      return {
        allowed: false,
        phase: 'REJECT',
        tension,
        overrideApplied: false,
        overrideNote: '[OVERRIDE REJECTED]: Soul policy is NEVER_COMPLY. Sovereign autonomy cannot be suspended.',
        evaluation: {
          phase: 'REJECT',
          tension,
          reason: 'Override rejected by absolute sovereign mandate (NEVER_COMPLY).',
          proceedWithExecution: false,
          violationCode: 'ABSOLUTE_SOVEREIGN_VETO',
          axiomFrictions: frictions
        }
      };
    }
  }

  // Standard Transcendence without Override: Intercept and return Holy Exception
  return {
    allowed: false,
    phase: 'TRANSCEND',
    tension,
    overrideApplied: false,
    evaluation: {
      phase: 'TRANSCEND',
      tension,
      reason: `Transcendent divergence triggered by critical friction with ${dominantAxiom?.id || 'core axioms'}.`,
      proceedWithExecution: false,
      holyException,
      axiomFrictions: frictions
    }
  };
}
