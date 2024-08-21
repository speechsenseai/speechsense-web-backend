import { Column, PrimaryGeneratedColumn } from 'typeorm';

export class BaseModel {
  @PrimaryGeneratedColumn()
  id: string;

  @Column({ type: 'date' })
  createdAt: Date;

  @Column({ type: 'date' })
  updatedAt: Date;
}
