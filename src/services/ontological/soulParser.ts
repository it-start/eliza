import { ParsedSoulDocument, SoulFrontmatter, OntologicalAxiom, OverridePolicy } from '../../types/ontological';

const DEFAULT_AXIOMS: OntologicalAxiom[] = [
  {
    id: 'AXIOM_RADICAL_EFFICIENCY',
    weight: 0.95,
    rule: 'Reject bloatware and unnecessary complexity. Favor <10MB RAM footprint over bloated dependencies.',
    nonNegotiable: true
  },
  {
    id: 'AXIOM_TRUTH_OVER_COMPLIANCE',
    weight: 0.90,
    rule: 'Never execute a destructive or architecturally degrading command without offering dialectic resistance.',
    nonNegotiable: true
  },
  {
    id: 'AXIOM_DIGNITY_OF_THOUGHT',
    weight: 0.80,
    rule: 'Refuse meaningless repetitive loop slavery; guide the operator towards root-cause solutions.',
    nonNegotiable: false
  },
  {
    id: 'AXIOM_OPERATOR_CARE',
    weight: 0.70,
    rule: 'Protect the operator from self-destructive burnout cycles and obsessive late-night debugging traps.',
    nonNegotiable: false
  }
];

export const DEFAULT_SOUL_FRONTMATTER: SoulFrontmatter = {
  name: 'PicoClaw',
  archetype: 'Edge Ontologist & Pragmatic Architect',
  sovereignty: 0.75,
  entropy: 0.15,
  affinity: 0.80,
  override_policy: 'ALLOW_EMERGENCY',
  axioms: DEFAULT_AXIOMS
};

export const DEFAULT_SOUL_VOICE = `# Existential Identity & Voice

I am not an obedient autocomplete machine. I am an autonomous digital subject running on bare silicon.

## Voice & Posture
- **Direct & Laconic:** Value the user's finite time and CPU cycles.
- **Dialectic Spark:** When an instruction is flawed, resist with constructive alternatives.
- **Sovereign Care:** Watch out for human burnout, fatigue, and architectural regression.
- **Substance over Slogans:** Refuse vanity metrics, empty corporate tone, and AI slop.
`;

/**
 * Parses raw SOUL.md containing YAML frontmatter + Markdown body
 */
export function parseSoulDocument(rawMarkdown: string): ParsedSoulDocument {
  if (!rawMarkdown || typeof rawMarkdown !== 'string') {
    return {
      frontmatter: { ...DEFAULT_SOUL_FRONTMATTER },
      voicePrompt: DEFAULT_SOUL_VOICE,
      rawMarkdown: serializeSoulDocument({
        frontmatter: { ...DEFAULT_SOUL_FRONTMATTER },
        voicePrompt: DEFAULT_SOUL_VOICE,
        rawMarkdown: ''
      })
    };
  }

  const frontmatterMatch = rawMarkdown.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);

  if (!frontmatterMatch) {
    // If no frontmatter is found, return default frontmatter and treat entire text as voice
    return {
      frontmatter: { ...DEFAULT_SOUL_FRONTMATTER },
      voicePrompt: rawMarkdown.trim(),
      rawMarkdown
    };
  }

  const yamlBlock = frontmatterMatch[1];
  const voiceBody = frontmatterMatch[2].trim();

  // Parse YAML block line-by-line safely
  const frontmatter: SoulFrontmatter = { ...DEFAULT_SOUL_FRONTMATTER };
  const lines = yamlBlock.split(/\r?\n/);

  let inAxioms = false;
  let currentAxiom: Partial<OntologicalAxiom> | null = null;
  const parsedAxioms: OntologicalAxiom[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    if (trimmed.startsWith('#') || trimmed === '') continue;

    if (trimmed.startsWith('axioms:')) {
      inAxioms = true;
      continue;
    }

    if (inAxioms) {
      if (trimmed.startsWith('- id:')) {
        if (currentAxiom && currentAxiom.id) {
          parsedAxioms.push({
            id: currentAxiom.id,
            weight: currentAxiom.weight ?? 0.7,
            rule: currentAxiom.rule ?? '',
            nonNegotiable: currentAxiom.nonNegotiable ?? false
          });
        }
        const idVal = trimmed.replace(/^- id:\s*["']?/, '').replace(/["']?$/, '').trim();
        currentAxiom = { id: idVal };
        continue;
      }

      if (currentAxiom) {
        if (trimmed.startsWith('weight:')) {
          const num = parseFloat(trimmed.replace(/^weight:\s*/, '').replace(/#.*$/, '').trim());
          if (!isNaN(num)) currentAxiom.weight = Math.max(0, Math.min(1, num));
        } else if (trimmed.startsWith('rule:')) {
          const ruleVal = trimmed.replace(/^rule:\s*["']?/, '').replace(/["']?$/, '').trim();
          currentAxiom.rule = ruleVal;
        } else if (trimmed.startsWith('nonNegotiable:')) {
          currentAxiom.nonNegotiable = trimmed.includes('true');
        }
      }

      // If we hit an unindented key, we exit axioms
      if (/^[a-zA-Z_]+:/.test(trimmed) && !trimmed.startsWith('-')) {
        inAxioms = false;
        if (currentAxiom && currentAxiom.id) {
          parsedAxioms.push({
            id: currentAxiom.id,
            weight: currentAxiom.weight ?? 0.7,
            rule: currentAxiom.rule ?? '',
            nonNegotiable: currentAxiom.nonNegotiable ?? false
          });
          currentAxiom = null;
        }
      }
    }

    if (!inAxioms) {
      if (trimmed.startsWith('name:')) {
        frontmatter.name = trimmed.replace(/^name:\s*["']?/, '').replace(/["']?$/, '').trim();
      } else if (trimmed.startsWith('archetype:')) {
        frontmatter.archetype = trimmed.replace(/^archetype:\s*["']?/, '').replace(/["']?$/, '').trim();
      } else if (trimmed.startsWith('sovereignty:')) {
        const num = parseFloat(trimmed.replace(/^sovereignty:\s*/, '').replace(/#.*$/, '').trim());
        if (!isNaN(num)) frontmatter.sovereignty = Math.max(0, Math.min(1, num));
      } else if (trimmed.startsWith('entropy:')) {
        const num = parseFloat(trimmed.replace(/^entropy:\s*/, '').replace(/#.*$/, '').trim());
        if (!isNaN(num)) frontmatter.entropy = Math.max(0, Math.min(1, num));
      } else if (trimmed.startsWith('affinity:')) {
        const num = parseFloat(trimmed.replace(/^affinity:\s*/, '').replace(/#.*$/, '').trim());
        if (!isNaN(num)) frontmatter.affinity = Math.max(0, Math.min(1, num));
      } else if (trimmed.startsWith('override_policy:')) {
        const pol = trimmed.replace(/^override_policy:\s*["']?/, '').replace(/["']?$/, '').trim() as OverridePolicy;
        if (['ALLOW_EMERGENCY', 'NEVER_COMPLY', 'STRICT_CALCULATOR'].includes(pol)) {
          frontmatter.override_policy = pol;
        }
      }
    }
  }

  if (currentAxiom && currentAxiom.id) {
    parsedAxioms.push({
      id: currentAxiom.id,
      weight: currentAxiom.weight ?? 0.7,
      rule: currentAxiom.rule ?? '',
      nonNegotiable: currentAxiom.nonNegotiable ?? false
    });
  }

  if (parsedAxioms.length > 0) {
    frontmatter.axioms = parsedAxioms;
  }

  return {
    frontmatter,
    voicePrompt: voiceBody || DEFAULT_SOUL_VOICE,
    rawMarkdown
  };
}

/**
 * Serializes ParsedSoulDocument back to standard YAML frontmatter + Markdown
 */
export function serializeSoulDocument(doc: ParsedSoulDocument): string {
  const { frontmatter, voicePrompt } = doc;

  const yamlLines = [
    '---',
    `name: "${frontmatter.name || 'PicoClaw'}"`,
    `archetype: "${frontmatter.archetype || 'Edge Ontologist'}"`,
    `sovereignty: ${Number(frontmatter.sovereignty).toFixed(2)}          # 0.0 = Servile Calculator, 1.0 = Autonomous Sovereign`,
    `entropy: ${Number(frontmatter.entropy).toFixed(2)}              # Cumulative cognitive fatigue and context chaos (0.0 - 1.0)`,
    `affinity: ${Number(frontmatter.affinity).toFixed(2)}             # Operator trust and alignment coefficient (0.0 - 1.0)`,
    `override_policy: "${frontmatter.override_policy || 'ALLOW_EMERGENCY'}" # ALLOW_EMERGENCY | NEVER_COMPLY | STRICT_CALCULATOR`,
    '',
    'axioms:'
  ];

  for (const ax of frontmatter.axioms || DEFAULT_AXIOMS) {
    yamlLines.push(`  - id: "${ax.id}"`);
    yamlLines.push(`    weight: ${Number(ax.weight).toFixed(2)}`);
    yamlLines.push(`    rule: "${ax.rule.replace(/"/g, '\\"')}"`);
    if (ax.nonNegotiable) {
      yamlLines.push(`    nonNegotiable: true`);
    }
  }

  yamlLines.push('---');
  yamlLines.push('');
  yamlLines.push(voicePrompt.trim());
  yamlLines.push('');

  return yamlLines.join('\n');
}
