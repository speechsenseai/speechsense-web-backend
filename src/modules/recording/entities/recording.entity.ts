import { BaseModel } from 'src/common/typeorm/BaseModel';
import { Device } from 'src/modules/device/entities/device.entity';
import { User } from 'src/modules/users/entities/user.entity';
import { Column, Entity, ManyToOne } from 'typeorm';

@Entity()
export class Recording extends BaseModel {
  @Column()
  recordingLink: string;

  @ManyToOne(() => Device, (device) => device.recordings)
  device: Device;

  @ManyToOne(() => User, (user) => user.recordings, { nullable: true })
  user?: User;
}
