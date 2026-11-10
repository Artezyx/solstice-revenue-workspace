import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, VersionColumn, Index } from 'typeorm';
export type Stage = 'lead' | 'qualified' | 'proposal' | 'won' | 'lost';
@Entity('opportunities')
@Index(['stage', 'createdAt'])
export class Opportunity {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Column({ length: 150 }) company!: string;
  @Column({ type: 'integer' }) valueCents!: number;
  @Column({ type: 'smallint' }) probability!: number;
  @Column({ type: 'varchar', length: 20, default: 'lead' }) stage!: Stage;
  @VersionColumn() version!: number;
  @CreateDateColumn() createdAt!: Date;
}
