import { BaseModel } from 'src/common/typeorm/BaseModel';
import { Device } from 'src/modules/device/entities/device.entity';
import { Recording } from 'src/modules/recording/entities/recording.entity';
import { User } from 'src/modules/users/entities/user.entity';
import { Column, Entity, ManyToMany, ManyToOne, OneToMany } from 'typeorm';

@Entity()
export class Location extends BaseModel {
  @Column({ nullable: true })
  name: string;

  @Column({ nullable: true })
  address: string;

  @Column({ nullable: true })
  workingHours: string;

  @Column({ nullable: true })
  workingDays: string;

  @Column({ nullable: true })
  description: string;

  @OneToMany(() => Device, (device) => device.location)
  devices: Device[];
}
