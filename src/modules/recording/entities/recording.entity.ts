import { BaseModel } from '@/common/typeorm/BaseModel';
import { Device } from '@/modules/device/entities/device.entity';
import { Column, Entity, ManyToOne } from 'typeorm';

@Entity()
export class Recording extends BaseModel {
  @Column()
  recordingS3Link: string;

  @Column({ nullable: true })
  metric_id: string;

  @ManyToOne(() => Device, (device) => device.recordings)
  device: Device;
}
