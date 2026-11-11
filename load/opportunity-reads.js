import http from 'k6/http';
import { check, sleep } from 'k6';
export const options={scenarios:{read:{executor:'constant-vus',vus:10,duration:'30s'}},
 thresholds:{http_req_failed:['rate<0.01'],http_req_duration:['p(95)<800']}};
export default function(){
 if(!__ENV.JWT) throw new Error('JWT must contain opportunities:read scope');
 const res=http.get((__ENV.BASE_URL||'http://localhost:8093')+'/v1/opportunities',{
  headers:{Authorization:'Bearer '+__ENV.JWT}});
 check(res,{'authorized list':r=>r.status===200});sleep(0.2);
}
