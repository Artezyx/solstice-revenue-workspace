import { CanActivate, ExecutionContext, Injectable, UnauthorizedException, ForbiddenException, ServiceUnavailableException } from '@nestjs/common';
import { createSecretKey } from 'node:crypto';
import { jwtVerify } from 'jose';

type Claims = { sub: string; scope: string };
@Injectable()
export class JwtScopeGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    if (req.path === '/health') return true;
    const secret = process.env.SOLSTICE_JWT_SECRET || '';
    if (Buffer.byteLength(secret, 'utf8') < 32)
      throw new ServiceUnavailableException('JWT signing key is not configured');
    const header = req.headers.authorization;
    if (typeof header !== 'string' || !header.startsWith('Bearer '))
      throw new UnauthorizedException('Bearer authentication required');
    let claims: Claims;
    try {
      const verified = await jwtVerify(header.substring(7), createSecretKey(Buffer.from(secret)), {
        issuer: process.env.SOLSTICE_JWT_ISSUER || 'solstice-local',
        audience: process.env.SOLSTICE_JWT_AUDIENCE || 'solstice-api',
        algorithms: ['HS256'],
        clockTolerance: 10,
        requiredClaims: ['sub', 'exp', 'iat'],
      });
      if (typeof verified.payload.sub !== 'string' || !verified.payload.sub)
        throw new Error('Missing identity');
      if (typeof verified.payload.scope !== 'string')
        throw new Error('Missing permissions');
      claims = { sub: verified.payload.sub, scope: verified.payload.scope };
    } catch {
      throw new UnauthorizedException('Invalid or expired access token');
    }
    const scopes = new Set(claims.scope.split(' ').filter(Boolean));
    const readOnly = req.method === 'GET';
    if (!(scopes.has('opportunities:write') || (readOnly && scopes.has('opportunities:read'))))
      throw new ForbiddenException('Insufficient opportunity permissions');
    req.principal = claims;
    return true;
  }
}
