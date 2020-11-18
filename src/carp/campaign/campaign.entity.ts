import { Entity, Column, PrimaryGeneratedColumn, OneToMany, JoinTable, ManyToMany } from 'typeorm';
import Character from '../character/character.entity';
import Monster from '../character/monster.entity';
import Map from '../helpers/Map';

@Entity()
export default class Campaign {
  @PrimaryGeneratedColumn()
  id: string;

  @Column()
  roomId: string;

  @ManyToMany(() => Character)
  @JoinTable()
  characters: Character[];

  @ManyToMany(() => Monster)
  @JoinTable()
  monsters: Monster[];

  @Column({
    type: 'json',
    transformer: {
      from: (value: string): Map => Map.fromJSON(value),
      to: (value: Map): string => value.toJSON(),
    },
  })
  dungeon: Map;
}
