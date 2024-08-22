import { Recording } from './../../recording/entities/recording.entity';
import { BaseModel } from 'src/common/typeorm/BaseModel';
import { Device } from 'src/modules/device/entities/device.entity';
import { Location } from 'src/modules/location/entities/location.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class User extends BaseModel {
  @Column({ unique: true })
  email: string;

  @Column({ name: 'password', nullable: true })
  password: string;

  @Column({ default: false })
  isEmail: boolean;

  @Column({ default: false })
  isGoogle: boolean;

  @Column({
    default: false,
  })
  isVerified: boolean;

  @Column({
    default: false,
  })
  isDeleted: boolean;

  @OneToMany(() => Location, (location) => location.user)
  locations: Location[];

  @OneToMany(() => Device, (device) => device.user)
  devices: Device[];
}
