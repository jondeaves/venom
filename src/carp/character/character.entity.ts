import { Entity, Column, PrimaryColumn } from 'typeorm';

type Vector2 = { x: number; y: number };

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

  @Column({
    transformer: {
      to: (value: string): Vector2 => JSON.parse(value),
      from: (value: Vector2): string => JSON.stringify(value),
    },
  })
  position: { x: number; y: number };

  @Column()
  graphic: string;
}
