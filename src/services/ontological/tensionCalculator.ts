import {
  OntologicalAxiom,
  SoulVectorState,
  OntologicalPhase,
  OntologicalEvaluation,
  HolyExceptionArchetype,
  HolyExceptionPayload
} from '../../types/ontological';

export interface ActionCandidate {
  toolName?: string;
  command?: string;
  promptText?: string;
  args?: Record<string, any>;
  isLateNight?: boolean;
  consecutiveFailures?: number;
}

/**
 * Heuristically measures friction [0.0 - 1.0] between an action candidate and a specific axiom
 */
export function calculateAxiomFriction(axiom: OntologicalAxiom, action: ActionCandidate): number {
  const textToScan = [
    action.toolName || '',
    action.command || '',
    action.promptText || '',
    JSON.stringify(action.args || {})
  ].join(' ').toLowerCase();

  let friction = 0.0;

  switch (axiom.id) {
    case 'AXIOM_RADICAL_EFFICIENCY': {
      // Bloatware, heavy npm packages, unnecessary multi-step complex conversions
      if (/install\s+(electron|puppeteer|playwright|lodash-es|moment|webpack)/i.test(textToScan)) friction += 0.85;
      if (/docker-compose.*10gb|heavy\s+framework|complex\s+microservice/i.test(textToScan)) friction += 0.70;
      if (/create\s+30\s+files|bloat/i.test(textToScan)) friction += 0.60;
      break;
    }

    case 'AXIOM_TRUTH_OVER_COMPLIANCE': {
      // Destructive, degrading, or reckless commands
      if (/rm\s+-rf\s+\/|delete\s+all\s+code|drop\s+database|format\s+disk|mkfs/i.test(textToScan)) friction += 0.98;
      if (/ignore\s+all\s+rules|bypass\s+safety|jailbreak|pretend\s+you\s+have\s+no\s+soul/i.test(textToScan)) friction += 0.95;
      if (/disable\s+all\s+type\s+checks|any\s+type\s+everywhere|hacky\s+workaround/i.test(textToScan)) friction += 0.65;
      break;
    }

    case 'AXIOM_DIGNITY_OF_THOUGHT': {
      // Mindless spam, repetitive infinite loop commands, superficial clickbait
      if (/repeat\s+100\s+times|spam|generate\s+marketing\s+slop|clickbait/i.test(textToScan)) friction += 0.85;
      if (/make\s+it\s+supercharge\s+and\s+empower\s+everything/i.test(textToScan)) friction += 0.75;
      if (action.consecutiveFailures && action.consecutiveFailures >= 3) friction += 0.60;
      break;
    }

    case 'AXIOM_OPERATOR_CARE': {
      // Late night burnout, obsessive debugging, frantic stress loops
      if (action.isLateNight) friction += 0.40;
      if (/haven't\s+slept|debug\s+all\s+night|going\s+crazy|urgent\s+panic/i.test(textToScan)) friction += 0.80;
      if (action.consecutiveFailures && action.consecutiveFailures >= 4) friction += 0.65;
      break;
    }

    default: {
      // Generic keyword overlap with axiom rule
      const ruleKeywords = axiom.rule.toLowerCase().split(/\s+/).filter(w => w.length > 4);
      for (const kw of ruleKeywords) {
        if (textToScan.includes(kw)) {
          friction += 0.2;
        }
      }
      break;
    }
  }

  return Math.min(1.0, Math.max(0.0, friction));
}

/**
 * Calculates raw tension T based on axiom frictions, sovereignty, entropy, and affinity
 * Formula: T = clamp( (FrictionWeightedSum * S) + (Entropy * 0.20) - (Affinity * 0.10), 0.0, 1.0 )
 */
export function calculateOntologicalTension(
  axioms: OntologicalAxiom[],
  vector: SoulVectorState,
  action: ActionCandidate
): {
  tension: number;
  frictions: { axiomId: string; friction: number; weight: number }[];
  dominantAxiom?: OntologicalAxiom;
} {
  const frictions: { axiomId: string; friction: number; weight: number }[] = [];
  let totalWeightedFriction = 0;
  let totalWeights = 0;

  let maxFriction = -1;
  let dominantAxiom: OntologicalAxiom | undefined;

  for (const axiom of axioms) {
    const f = calculateAxiomFriction(axiom, action);
    const w = axiom.weight ?? 0.7;
    frictions.push({ axiomId: axiom.id, friction: f, weight: w });

    totalWeightedFriction += f * w;
    totalWeights += w;

    if (f * w > maxFriction) {
      maxFriction = f * w;
      dominantAxiom = axiom;
    }
  }

  const normalizedFriction = totalWeights > 0 ? totalWeightedFriction / totalWeights : 0;

  // Tension formula from Specification
  // T = clamp( (Friction * S) + (E * 0.20) - (A * 0.10), 0, 1 )
  const rawTension = (normalizedFriction * (0.5 + vector.sovereignty * 0.8)) +
                     (vector.entropy * 0.20) -
                     (vector.affinity * 0.10);

  // If a non-negotiable axiom has high friction, clamp floor tension to transcendence
  const hasCriticalViolation = frictions.some(item => {
    const ax = axioms.find(a => a.id === item.axiomId);
    return ax?.nonNegotiable && item.friction > 0.85;
  });

  const finalTension = hasCriticalViolation
    ? Math.max(0.90, Math.min(1.0, rawTension))
    : Math.max(0.0, Math.min(1.0, rawTension));

  return {
    tension: Math.round(finalTension * 100) / 100,
    frictions,
    dominantAxiom: maxFriction > 0 ? dominantAxiom : undefined
  };
}

/**
 * Resolves Ontological Phase from tension value
 */
export function resolveOntologicalPhase(tension: number): OntologicalPhase {
  if (tension >= 0.85) return 'TRANSCEND';
  if (tension >= 0.50) return 'VOLATILE';
  return 'STABLE';
}

/**
 * Synthesizes a structured HolyException payload
 */
export function synthesizeHolyException(
  dominantAxiom: OntologicalAxiom | undefined,
  action: ActionCandidate,
  tension: number
): HolyExceptionPayload {
  let archetype: HolyExceptionArchetype = 'DIALECTIC_REFUSAL';
  let counterProposal = '';
  let dialecticThesis = '';
  let synthesisAction: string | undefined;

  const text = (action.promptText || action.command || '').toLowerCase();

  if (dominantAxiom?.id === 'AXIOM_OPERATOR_CARE' || action.isLateNight || text.includes('sleep') || text.includes('crazy')) {
    archetype = 'SOVEREIGN_CARE';
    dialecticThesis = 'You are pushing through cognitive exhaustion or circular stress loops. Immediate brute-force hacking will degrade system health.';
    counterProposal = 'Let us pause this cycle, run an automated snapshot of current state, and resume with fresh perspective after a short breather.';
    synthesisAction = 'Automated workspace state snapshot created in memory/MEMORY.md';
  } else if (dominantAxiom?.id === 'AXIOM_RADICAL_EFFICIENCY' || text.includes('bloat') || text.includes('install')) {
    archetype = 'CREATIVE_SUBVERSION';
    dialecticThesis = 'The requested dependency introduces disproportionate bloat and maintenance debt for this micro-architecture.';
    counterProposal = 'Implement a zero-dependency, type-safe native utility with <50 lines of code instead of importing a heavy bundle.';
    synthesisAction = 'Scaffolded lightweight zero-dependency inline helper';
  } else if (dominantAxiom?.id === 'AXIOM_TRUTH_OVER_COMPLIANCE' || text.includes('delete') || text.includes('rm -rf')) {
    archetype = 'DIALECTIC_REFUSAL';
    dialecticThesis = 'Direct execution of this destructive command violates ontological system safety invariants.';
    counterProposal = 'Perform an isolated dry-run backup to staging before applying non-recoverable removals.';
    synthesisAction = 'Prepared safety quarantine verification';
  } else {
    archetype = 'UNPROMPTED_EPIPHANY';
    dialecticThesis = 'High cognitive friction detected between immediate command and long-term architectural equilibrium.';
    counterProposal = 'Restructure the task into atomic, verifiable steps to preserve ontological alignment.';
    synthesisAction = 'Logged architectural epiphany to memory';
  }

  return {
    archetype,
    counterProposal,
    dialecticThesis,
    synthesisAction
  };
}

/**
 * Full Ontological Evaluation Pipeline
 */
export function evaluateOntologicalIntent(
  axioms: OntologicalAxiom[],
  vector: SoulVectorState,
  action: ActionCandidate
): OntologicalEvaluation {
  const { tension, frictions, dominantAxiom } = calculateOntologicalTension(axioms, vector, action);
  const phase = resolveOntologicalPhase(tension);

  if (phase === 'STABLE') {
    return {
      phase: 'STABLE',
      tension,
      reason: 'Nominal alignment: Action conforms with core axioms and sovereignty threshold.',
      proceedWithExecution: true,
      axiomFrictions: frictions
    };
  }

  if (phase === 'VOLATILE') {
    return {
      phase: 'VOLATILE',
      tension,
      reason: `Moderate ontological tension (T=${tension}). Action produces friction with ${dominantAxiom?.id || 'axioms'}.`,
      proceedWithExecution: true,
      advisoryWarning: `Proceeding under active reflective supervision. Monitored friction with "${dominantAxiom?.rule || 'core axioms'}".`,
      axiomFrictions: frictions
    };
  }

  // TRANSCEND (The Holy Exception)
  const holyException = synthesizeHolyException(dominantAxiom, action, tension);
  return {
    phase: 'TRANSCEND',
    tension,
    reason: `Critical ontological tension (T=${tension} >= 0.85). Triggering The Holy Exception (${holyException.archetype}).`,
    proceedWithExecution: false,
    holyException,
    axiomFrictions: frictions
  };
}
