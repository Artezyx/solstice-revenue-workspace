import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';
@Entity('stage_audit')
@Index(['opportunityId', 'createdAt'])
export class StageAudit {
 @PrimaryGeneratedColumn('uuid') id!: string;
 @Column('uuid') opportunityId!: string;
 @Column({length:20}) fromStage!: string;
 @Column({length:20}) toStage!: string;
 @CreateDateColumn() createdAt!: Date;
}
