import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Post, Query } from '@nestjs/common';
import { OpportunityService } from './opportunity.service';
import { ChangeStageDto, CreateOpportunityDto, PageQueryDto } from './opportunity.dto';
@Controller('v1/opportunities')
export class OpportunityController {
 constructor(private readonly service:OpportunityService) {}
 @Post() create(@Body() input:CreateOpportunityDto){return this.service.create(input);}
 @Get() page(@Query() q:PageQueryDto){return this.service.page(q.page,q.size);}
 @Get('metrics') metrics(){return this.service.metrics();}
 @Patch(':id/stage') change(@Param('id',new ParseUUIDPipe()) id:string,@Body() body:ChangeStageDto){return this.service.changeStage(id,body);}
 @Get(':id/history') history(@Param('id',new ParseUUIDPipe()) id:string){return this.service.history(id);}
}
