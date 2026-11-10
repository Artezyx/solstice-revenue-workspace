import type { Metrics, Opportunity, Page, Stage } from './types';
const BASE=import.meta.env.VITE_API_URL || 'http://localhost:8093';
// For local portfolio demonstration only. Do not expose real credentials in client bundles.
const KEY=import.meta.env.VITE_DEMO_API_KEY || 'local-development-key';
async function request<T>(path:string, options:RequestInit={}):Promise<T> {
 const response=await fetch(`${BASE}${path}`,{...options,headers:{'Content-Type':'application/json','X-API-Key':KEY,...options.headers}});
 if(!response.ok) throw new Error(`API ${response.status}: ${await response.text()}`);
 return response.json() as Promise<T>;
}
export const api={
 page:()=>request<Page>('/v1/opportunities'),
 metrics:()=>request<Metrics>('/v1/opportunities/metrics'),
 create:(company:string,valueCents:number,probability:number)=>request<Opportunity>('/v1/opportunities',{method:'POST',body:JSON.stringify({company,valueCents,probability})}),
 advance:(opp:Opportunity,stage:Stage)=>request<Opportunity>(`/v1/opportunities/${opp.id}/stage`,{method:'PATCH',body:JSON.stringify({stage,version:opp.version})})
};
