import { Entity, Column, PrimaryGeneratedColumn, OneToMany, JoinTable, ManyToMany } from 'typeorm';
import Character from '../character/character.entity';

@Entity()
export default class Campaign {
  @PrimaryGeneratedColumn()
  id: string;

  @Column()
  roomId: string;

  @ManyToMany(() => Character)
  @JoinTable()
  characters: Character[];

  @Column()
  dungeon: string;
}
