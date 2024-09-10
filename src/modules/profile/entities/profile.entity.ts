import { BaseModel } from '@/common/typeorm/BaseModel';
import { User } from '@/modules/users/entities/user.entity';
import { Column, Entity, OneToOne } from 'typeorm';

@Entity()
export class Profile extends BaseModel {
  @Column({ nullable: true })
  country: string;

  @Column({ nullable: true })
  city: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true, type: 'text' })
  avatarUrl: string | null;

  @Column({ nullable: true })
  name: string;

  @Column({ nullable: true })
  surname: string;

  @Column({ nullable: true })
  organizationName: string;

  @OneToOne(() => User, (user) => user.profile)
  user: User;
}
