import { Entity, Column, PrimaryColumn, OneToMany } from 'typeorm';
// eslint-disable-next-line import/no-cycle
import Character from './character.entity';

@Entity()
export default class Player {
  @PrimaryColumn({ unique: true })
  uid: string;

  @Column()
  ap: number;

  @OneToMany(() => Character, (character) => character.player)
  characters: Character[];
}
