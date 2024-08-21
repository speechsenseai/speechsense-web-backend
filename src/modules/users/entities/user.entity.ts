import { Column, Entity, PrimaryGeneratedColumn, Unique } from 'typeorm';

export enum LoginType {
    EMAIL = 'email',
    GOOGLE = 'google',
}
@Entity()
export class User {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ unique: true })
    email: string;

    @Column()
    password: string;

    @Column({
        type: 'enum',
        enum: LoginType,
        nullable: true,
    })
    loginType: LoginType;

    @Column({
        default: false,
    })
    isVerified: boolean;

    @Column({
        default: false,
    })
    isDeleted: boolean;
}
