import { PrimaryGeneratedColumn, Entity, Column, ManyToOne } from 'typeorm';
import Vector2 from '../../core/helpers/Vector2';
// eslint-disable-next-line import/no-cycle
import Player from './player.entity';

@Entity()
export default class Character {
  @PrimaryGeneratedColumn()
  id: string;

  @Column()
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
    type: 'json',
    transformer: {
      from: (value: string): Vector2 => Vector2.fromJSON(value),
      to: (value: Vector2): string => value.toJSON(),
    },
  })
  position: Vector2;

  @Column()
  graphic: string;

  @Column()
  gameState: number;

  @ManyToOne(() => Player, (player) => player.characters)
  player: Player;
}
