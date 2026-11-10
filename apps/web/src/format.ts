import type { Stage } from './types';
export function formatCents(cents:number,locale='en-US',currency='USD') {
 return new Intl.NumberFormat(locale,{style:'currency',currency,maximumFractionDigits:2}).format(cents/100);
}
export const stageLabels:Record<Stage,string>={lead:'Lead',qualified:'Qualified',proposal:'Proposal',won:'Won',lost:'Lost'};
export function nextStage(stage:Stage):Stage|null {
 return ({lead:'qualified',qualified:'proposal',proposal:'won',won:null,lost:null} as const)[stage];
}
