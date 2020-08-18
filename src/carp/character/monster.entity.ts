import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import Vector2 from '../../core/types/Vector2';

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

  @Column({
    type: 'json',
    transformer: {
      to: (value: string): Vector2 => Vector2.fromJSON(value),
      from: (value: Vector2): string => value.toJSON(),
    },
  })
  position: Vector2;

  @Column()
  graphic: string;
}
