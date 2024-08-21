import { Recording } from './../../recording/entities/recording.entity';
import { BaseModel } from 'src/common/typeorm/BaseModel';
import { Device } from 'src/modules/device/entities/device.entity';
import { Restaurant } from 'src/modules/restaurant/entities/restaurant.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

export enum LoginType {
  EMAIL = 'email',
  GOOGLE = 'google',
}
@Entity()
export class User extends BaseModel {
  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({
    type: 'enum',
    enum: LoginType,
    nullable: true,
  })
  loginType: LoginType;

  @Column({
    default: false,
  })
  isVerified: boolean;

  @Column({
    default: false,
  })
  isDeleted: boolean;

  @OneToMany(() => Restaurant, (restaurant) => restaurant.user)
  restaurants: Restaurant[];

  @OneToMany(() => Device, (device) => device.user)
  devices: Device[];

  @OneToMany(() => Recording, (recording) => recording.user)
  recordings: Recording[];
}
