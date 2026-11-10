import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Opportunity } from './opportunity.entity';
import { StageAudit } from './stage-audit.entity';
import { ChangeStageDto, CreateOpportunityDto } from './opportunity.dto';
import { canAdvance, weightedValue } from './rules';
@Injectable()
export class OpportunityService {
 constructor(@InjectRepository(Opportunity) private readonly opportunities: Repository<Opportunity>,
             private readonly db: DataSource) {}
 async create(input: CreateOpportunityDto) {
   const company = input.company.trim();
   if (company.length < 2) throw new BadRequestException('Company is required');
   return this.opportunities.save(this.opportunities.create({...input, company}));
 }
 async page(page = 1, size = 20) {
   const [items, total] = await this.opportunities.findAndCount({ order: {createdAt: 'DESC', id: 'DESC'}, skip: (page-1)*size, take: size });
   return {items,total,page,size};
 }
 async metrics() {
   const opportunities = await this.opportunities.find();
   const open = opportunities.filter(o => o.stage !== 'won' && o.stage !== 'lost');
   return {total: opportunities.length, openCount: open.length,
     openPipelineCents: open.reduce((a,o)=>a+o.valueCents,0),
     weightedForecastCents: open.reduce((a,o)=>a+weightedValue(o.valueCents,o.probability),0),
     wonCents: opportunities.filter(o=>o.stage==='won').reduce((a,o)=>a+o.valueCents,0)};
 }
 async changeStage(id: string, input: ChangeStageDto) {
   return this.db.transaction(async manager => {
     // Compare-and-swap avoids lost updates between concurrent stage changes.
     const item = await manager.findOne(Opportunity,{where:{id}});
     if(!item) throw new NotFoundException('Opportunity not found');
     if(item.version!==input.version) throw new ConflictException('Version conflict; reload the opportunity');
     if(!canAdvance(item.stage,input.stage)) throw new ConflictException('Invalid stage transition');
     const result=await manager.createQueryBuilder().update(Opportunity)
       .set({stage:input.stage,version:()=> 'version + 1'})
       .where('id = :id AND version = :version',{id,version:input.version}).execute();
     if(result.affected !== 1) throw new ConflictException('Concurrent update; reload the opportunity');
     await manager.insert(StageAudit,{opportunityId:id,fromStage:item.stage,toStage:input.stage});
     return manager.findOneByOrFail(Opportunity,{id});
   });
 }
 async history(id: string) {
   if (!await this.opportunities.exist({where:{id}})) throw new NotFoundException();
   return this.db.getRepository(StageAudit).find({where:{opportunityId:id},order:{createdAt:'ASC'}});
 }
}
