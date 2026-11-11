import { JwtScopeGuard } from './security.guard';
import { createSecretKey } from 'node:crypto';
import { SignJWT } from 'jose';

const secret = 'local-jwt-testing-secret-of-48-characters-or-more';
const originalSecret = process.env.SOLSTICE_JWT_SECRET;
beforeAll(() => { process.env.SOLSTICE_JWT_SECRET = secret; });
afterAll(() => { if(originalSecret === undefined) delete process.env.SOLSTICE_JWT_SECRET;
  else process.env.SOLSTICE_JWT_SECRET = originalSecret; });

async function token(scope: string, expired = false) {
  return new SignJWT({ scope }).setProtectedHeader({alg:'HS256'})
    .setSubject('security-test').setIssuer('solstice-local').setAudience('solstice-api')
    .setIssuedAt().setExpirationTime(expired ? '1ms' : '5m')
    .sign(createSecretKey(Buffer.from(secret)));
}
function context(method: string, authorization?: string) {
  const req={path:'/v1/opportunities',method,headers:{authorization}};
  const mock={ switchToHttp:()=>({getRequest:()=>req}) };
  return mock as any;
}
describe('JWT authorization',()=>{
  const guard=new JwtScopeGuard();
  it('rejects missing tokens',async()=>{
    await expect(guard.canActivate(context('GET'))).rejects.toMatchObject({status:401});
  });
  it('permits reader GET but refuses writes',async()=>{
    const header='Bearer '+await token('opportunities:read');
    await expect(guard.canActivate(context('GET',header))).resolves.toBe(true);
    await expect(guard.canActivate(context('POST',header))).rejects.toMatchObject({status:403});
  });
  it('permits authorized writes',async()=>{
    await expect(guard.canActivate(context('PATCH','Bearer '+await token('opportunities:write')))).resolves.toBe(true);
  });
  it('rejects modified signatures',async()=>{
    await expect(guard.canActivate(context('GET','Bearer '+await token('opportunities:read')+'tampered'))).rejects.toMatchObject({status:401});
  });
  it('rejects expired tokens',async()=>{
    await expect(guard.canActivate(context('GET','Bearer '+await token('opportunities:read',true)))).rejects.toMatchObject({status:401});
  });
});
