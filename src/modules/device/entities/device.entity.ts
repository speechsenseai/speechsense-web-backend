import { Location } from 'src/modules/location/entities/location.entity';
import { BaseModel } from 'src/common/typeorm/BaseModel';
import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';
import { Recording } from 'src/modules/recording/entities/recording.entity';

export enum DeviceType {
  Andriod = 'android',
  RasberryPi = 'rasberryPi',
  Web = 'web',
}
@Entity()
export class Device extends BaseModel {
  @Column({
    type: 'enum',
    enum: DeviceType,
  })
  type: DeviceType;

  @ManyToOne(() => Location, (location) => location.devices)
  location: Location;

  @OneToMany(() => Recording, (recording) => recording.device)
  recordings: Recording[];
}
