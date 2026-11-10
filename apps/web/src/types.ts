export type Stage = 'lead'|'qualified'|'proposal'|'won'|'lost';
export interface Opportunity {id:string;company:string;valueCents:number;probability:number;stage:Stage;version:number;createdAt:string}
export interface Page {items:Opportunity[];total:number;page:number;size:number}
export interface Metrics {total:number;openCount:number;openPipelineCents:number;weightedForecastCents:number;wonCents:number}
