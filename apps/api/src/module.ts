import { Module, Controller, Get } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_GUARD } from '@nestjs/core';
import { Opportunity } from './opportunity.entity';
import { StageAudit } from './stage-audit.entity';
import { OpportunityController } from './opportunity.controller';
import { OpportunityService } from './opportunity.service';
import { JwtScopeGuard } from './security.guard';
@Controller()
class HealthController { @Get('health') health() { return { status: 'ok' }; } }
@Module({
  imports: [TypeOrmModule.forRoot({ type: 'postgres', url: process.env.DATABASE_URL,
    entities: [Opportunity, StageAudit], synchronize: process.env.NODE_ENV !== 'production' }),
    TypeOrmModule.forFeature([Opportunity, StageAudit])],
  controllers: [HealthController, OpportunityController],
  providers: [OpportunityService, { provide: APP_GUARD, useClass: JwtScopeGuard }],
})
export class AppModule {}
