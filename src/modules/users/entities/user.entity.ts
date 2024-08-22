import { BaseModel } from 'src/common/typeorm/BaseModel';
import { Location } from 'src/modules/location/entities/location.entity';
import { Column, Entity, JoinTable, ManyToMany } from 'typeorm';

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

  @Column({ nullable: true })
  country: string;

  @ManyToMany(() => Location)
  @JoinTable()
  locations: Location[];
}
