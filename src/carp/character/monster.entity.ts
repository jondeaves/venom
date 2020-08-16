import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export default class Monster {
  @PrimaryGeneratedColumn()
  id: string;

  @Column()
  name: string;

  @Column()
  level: number;

  @Column()
  expvalue: number;

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
