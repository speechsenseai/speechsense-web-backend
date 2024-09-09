import { BaseModel } from '@/common/typeorm/BaseModel';
import { Location } from '@/modules/location/entities/location.entity';
import { Profile } from '@/modules/profile/entities/profile.entity';
import { Column, Entity, JoinTable, ManyToMany, OneToOne } from 'typeorm';

@Entity()
export class User extends BaseModel {
  @Column({ nullable: true })
  name: string; //FIX_ME надо удалить но чтобы миграции норм были

  @Column({ unique: true })
  email: string;

  @Column({ name: 'password', nullable: true })
  password?: string;

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

  @ManyToMany(() => Location, (location) => location.users)
  @JoinTable()
  locations: Location[];

  @OneToOne(() => Profile, (profile) => profile.user)
  profile: Profile;
}
