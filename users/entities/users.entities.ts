import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class UsersEntity {
    @PrimaryGeneratedColumn()
    id!: string;

    @Column({
        length: 100,
    })
    @Column({
        type: 'varchar',
    })
    email!: string;

    @Column({ type: 'varchar' })
    password!: string;

    @Column()
    firstName?: string;

    @Column()
    lastName?: string;

    @Column({
        type: 'int',
    })
    permissionLevel?: number;
}
