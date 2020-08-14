import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity()
export default class Character {
  @PrimaryColumn({ unique: true })
  uid: string;

  @Column()
  name: string;
}
