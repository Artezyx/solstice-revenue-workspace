import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { timingSafeEqual } from 'node:crypto';
@Injectable()
export class ApiKeyGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    if (req.path === '/health') return true;
    const expected = Buffer.from(process.env.DEMO_API_KEY || 'local-development-key');
    const supplied = Buffer.from(typeof req.headers['x-api-key'] === 'string' ? req.headers['x-api-key'] : '');
    return expected.length === supplied.length && timingSafeEqual(expected, supplied);
  }
}
