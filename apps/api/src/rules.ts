import type { Stage } from './opportunity.entity';
const transitions: Record<Stage, Stage[]> = {
  lead: ['qualified', 'lost'],
  qualified: ['proposal', 'lost'],
  proposal: ['won', 'lost'],
  won: [], lost: [],
};
export function canAdvance(from: Stage, to: Stage): boolean { return transitions[from].includes(to); }
export function weightedValue(valueCents: number, probability: number): number {
  return Math.round(valueCents * probability / 100);
}
