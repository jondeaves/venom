import { Entity, Column, PrimaryGeneratedColumn, OneToMany, JoinTable, ManyToMany } from 'typeorm';
import Character from '../character/character.entity';
import Monster from '../character/monster.entity';

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

  @Column()
  dungeon: string;
}
