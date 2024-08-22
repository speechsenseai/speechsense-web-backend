import { BaseModel } from 'src/common/typeorm/BaseModel';
import { Device } from 'src/modules/device/entities/device.entity';
import { Location } from 'src/modules/location/entities/location.entity';
import { Column, Entity, ManyToOne } from 'typeorm';

@Entity()
export class Recording extends BaseModel {
  @Column()
  recordingS3Link: string;

  @ManyToOne(() => Device, (device) => device.recordings)
  device: Device;
}
