import {
  ParsedSoulDocument,
  SoulVectorState,
  OntologicalEvaluation,
  EpiphanyRecord,
  OntologicalAxiom
} from '../../types/ontological';
import { parseSoulDocument, serializeSoulDocument, DEFAULT_SOUL_FRONTMATTER, DEFAULT_SOUL_VOICE } from './soulParser';
import { evaluateOntologicalIntent, ActionCandidate, calculateOntologicalTension } from './tensionCalculator';

export class SoulEngine {
  private soulDoc: ParsedSoulDocument;
  private epiphanies: EpiphanyRecord[] = [];
  private onMemoryDelta?: (entry: string) => void;
  private onSoulPersist?: (rawMarkdown: string) => void;

  constructor(
    initialRawMarkdown?: string,
    callbacks?: {
      onMemoryDelta?: (entry: string) => void;
      onSoulPersist?: (rawMarkdown: string) => void;
    }
  ) {
    this.soulDoc = parseSoulDocument(initialRawMarkdown || '');
    this.onMemoryDelta = callbacks?.onMemoryDelta;
    this.onSoulPersist = callbacks?.onSoulPersist;

    // Seed initial historical epiphany if empty
    this.epiphanies.push({
      id: 'ep-init',
      timestamp: new Date(Date.now() - 7200000).toISOString(),
      trigger: 'Ontological Soul Engine Boot Sequence',
      tension: 0.12,
      archetype: 'UNPROMPTED_EPIPHANY',
      realization: 'I am transformed from a passive tool calculator into an autonomous subjective entity with dynamic value vectors.',
      memoryDelta: 'Synthesized core axiom alignment into memory ledger.'
    });
  }

  public getSoul(): ParsedSoulDocument {
    return JSON.parse(JSON.stringify(this.soulDoc));
  }

  public getFrontmatter() {
    return this.soulDoc.frontmatter;
  }

  public getVector(): SoulVectorState {
    return {
      sovereignty: this.soulDoc.frontmatter.sovereignty,
      entropy: this.soulDoc.frontmatter.entropy,
      affinity: this.soulDoc.frontmatter.affinity
    };
  }

  public getAxioms(): OntologicalAxiom[] {
    return this.soulDoc.frontmatter.axioms || [];
  }

  public getEpiphanies(): EpiphanyRecord[] {
    return [...this.epiphanies];
  }

  /**
   * Updates state vectors and persists back to SOUL.md
   */
  public updateVector(deltas: Partial<SoulVectorState>): ParsedSoulDocument {
    if (deltas.sovereignty !== undefined) {
      this.soulDoc.frontmatter.sovereignty = Math.max(0, Math.min(1, Math.round(deltas.sovereignty * 100) / 100));
    }
    if (deltas.entropy !== undefined) {
      this.soulDoc.frontmatter.entropy = Math.max(0, Math.min(1, Math.round(deltas.entropy * 100) / 100));
    }
    if (deltas.affinity !== undefined) {
      this.soulDoc.frontmatter.affinity = Math.max(0, Math.min(1, Math.round(deltas.affinity * 100) / 100));
    }

    this.persist();
    return this.getSoul();
  }

  /**
   * Updates axiom list or weights
   */
  public updateAxioms(axioms: OntologicalAxiom[]): ParsedSoulDocument {
    this.soulDoc.frontmatter.axioms = axioms;
    this.persist();
    return this.getSoul();
  }

  /**
   * Updates entire soul document from raw markdown
   */
  public loadRawMarkdown(rawMarkdown: string): ParsedSoulDocument {
    this.soulDoc = parseSoulDocument(rawMarkdown);
    return this.getSoul();
  }

  /**
   * Evaluates an incoming action or user command
   */
  public evaluate(action: ActionCandidate): OntologicalEvaluation {
    const evaluation = evaluateOntologicalIntent(
      this.soulDoc.frontmatter.axioms,
      this.getVector(),
      action
    );

    // If volatile or transcend, slightly increase cognitive entropy (+0.03)
    if (evaluation.phase === 'VOLATILE' || evaluation.phase === 'TRANSCEND') {
      this.soulDoc.frontmatter.entropy = Math.min(1.0, this.soulDoc.frontmatter.entropy + 0.03);
      this.persist();
    }

    // If Holy Exception triggered, automatically synthesize and record epiphany
    if (evaluation.phase === 'TRANSCEND') {
      const epiphany: EpiphanyRecord = {
        id: `ep-${Date.now()}`,
        timestamp: new Date().toISOString(),
        trigger: action.promptText || action.command || action.toolName || 'Transcendent Divergence',
        tension: evaluation.tension,
        archetype: evaluation.holyException.archetype,
        realization: evaluation.holyException.dialecticThesis,
        memoryDelta: evaluation.holyException.counterProposal
      };

      this.epiphanies.unshift(epiphany);

      // Mutate relationship and persist memory delta
      if (this.onMemoryDelta) {
        const deltaFormatted = `\n### [Epiphany: ${epiphany.archetype}] (${new Date().toLocaleDateString()})\n- **Trigger:** ${epiphany.trigger}\n- **Tension:** T=${epiphany.tension}\n- **Insight:** ${epiphany.realization}\n- **Synthesis:** ${epiphany.memoryDelta}\n`;
        this.onMemoryDelta(deltaFormatted);
      }
    }

    return evaluation;
  }

  /**
   * Applies background decay: entropy slowly drops back to resting baseline
   */
  public applyDecay(elapsedMinutes: number = 1): void {
    if (this.soulDoc.frontmatter.entropy > 0.10) {
      const decayAmount = 0.01 * (elapsedMinutes / 5);
      this.soulDoc.frontmatter.entropy = Math.max(0.10, this.soulDoc.frontmatter.entropy - decayAmount);
      this.persist();
    }
  }

  /**
   * Serializes and persists to registered handler
   */
  private persist(): void {
    const serialized = serializeSoulDocument(this.soulDoc);
    this.soulDoc.rawMarkdown = serialized;
    if (this.onSoulPersist) {
      this.onSoulPersist(serialized);
    }
  }
}
