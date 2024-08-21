import { Restaurant } from 'src/modules/restaurant/entities/restaurant.entity';
import { BaseModel } from 'src/common/typeorm/BaseModel';
import { Entity, ManyToOne, OneToMany } from 'typeorm';
import { Recording } from 'src/modules/recording/entities/recording.entity';
import { User } from 'src/modules/users/entities/user.entity';

@Entity()
export class Device extends BaseModel {
  @ManyToOne(() => User, (user) => user.devices)
  user: User;

  @ManyToOne(() => Restaurant, (restaurant) => restaurant.devices)
  restaurant: Restaurant;

  @OneToMany(() => Recording, (recording) => recording.device)
  recordings: Recording[];
}
