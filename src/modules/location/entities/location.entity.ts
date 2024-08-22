import { BaseModel } from 'src/common/typeorm/BaseModel';
import { Device } from 'src/modules/device/entities/device.entity';
import { Recording } from 'src/modules/recording/entities/recording.entity';
import { User } from 'src/modules/users/entities/user.entity';
import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';

@Entity()
export class Location extends BaseModel {
  @Column()
  name: string;

  @ManyToOne(() => User, (user) => user.locations)
  user: User;

  @OneToMany(() => Device, (device) => device.location)
  devices: Device[];

  @OneToMany(() => Recording, (recording) => recording.location)
  recordings: Recording[];
}
