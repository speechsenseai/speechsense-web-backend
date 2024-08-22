import { BaseModel } from 'src/common/typeorm/BaseModel';
import { Device } from 'src/modules/device/entities/device.entity';
import { Location } from 'src/modules/location/entities/location.entity';
import { User } from 'src/modules/users/entities/user.entity';
import { Column, Entity, ManyToOne } from 'typeorm';

@Entity()
export class Recording extends BaseModel {
  @Column()
  recordingLink: string;

  @ManyToOne(() => Device, (device) => device.recordings, {
    nullable: true,
  })
  device?: Device;

  @ManyToOne(() => Location, (location) => location.recordings)
  location: Location;
}
