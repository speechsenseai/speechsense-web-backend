import { BaseModel } from 'src/common/typeorm/BaseModel';
import { Device } from 'src/modules/device/entities/device.entity';
import { User } from 'src/modules/users/entities/user.entity';
import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';

@Entity()
export class Restaurant extends BaseModel {
  @Column()
  name: string;

  @ManyToOne(() => User, (user) => user.restaurants)
  user: User;

  @OneToMany(() => Device, (device) => device.restaurant)
  devices: Device[];
}
