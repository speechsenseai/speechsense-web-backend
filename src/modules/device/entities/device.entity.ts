import { Location } from '@/modules/location/entities/location.entity';
import { BaseModel } from '@/common/typeorm/BaseModel';
import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';
import { Recording } from '@/modules/recording/entities/recording.entity';

export enum DeviceType {
  Andriod = 'android',
  RaspberryPi = 'raspberryPi',
  Web = 'web',
}
@Entity()
export class Device extends BaseModel {
  @Column({ nullable: true })
  name: string;

  @Column({
    name: 'type',
    type: 'enum',
    enum: DeviceType,
  })
  type: DeviceType;

  @ManyToOne(() => Location, (location) => location.devices)
  location: Location;

  @OneToMany(() => Recording, (recording) => recording.device)
  recordings: Recording[];
}
