import { Location } from 'src/modules/location/entities/location.entity';
import { BaseModel } from 'src/common/typeorm/BaseModel';
import { Entity, ManyToOne, OneToMany } from 'typeorm';
import { Recording } from 'src/modules/recording/entities/recording.entity';
import { User } from 'src/modules/users/entities/user.entity';

@Entity()
export class Device extends BaseModel {
  @ManyToOne(() => User, (user) => user.devices)
  user: User;

  @ManyToOne(() => Location, (location) => location.devices)
  location: Location;

  @OneToMany(() => Recording, (recording) => recording.device)
  recordings: Recording[];
}
