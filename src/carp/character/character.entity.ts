import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity()
export default class Character {
  @PrimaryColumn({ unique: true })
  uid: string;

  @Column()
  name: string;

  @Column()
  max_health: number;

  @Column()
  current_health: number;

  @Column()
  power: number;

  @Column()
  defense: number;

  @Column()
  position: string;
}
